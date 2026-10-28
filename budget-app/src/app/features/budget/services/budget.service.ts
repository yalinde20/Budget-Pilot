import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_ADAPTER } from '../../../core/tokens/storage.token';
import { Budget, createEmptyBudget } from '../models/budget.model';
import { Category, CategoryDraft } from '../models/category.model';
import {
  calculateRemainingPercentage,
  calculateTotalPercentage,
  isOverAllocated,
  withEffectiveValues,
} from './budget-calculator';
import { migrateLegacyColors } from './category-colors';

const STORAGE_KEY = 'budget';

/** Une catégorie enrichie du montant calculé, prête à être affichée. */
export interface CategoryWithAmount extends Category {
  amount: number;
}

/** Catégorie supprimée, gardée le temps de pouvoir annuler la suppression. */
export interface RemovedCategory {
  category: Category;
  index: number;
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly storage = inject(STORAGE_ADAPTER);

  // État privé : seul ce service peut le modifier. Le reste de l'app
  // ne voit que les signaux exposés en lecture ci-dessous (computed).
  private readonly budget = signal<Budget>(
    migrateLegacyColors(this.storage.get<Budget>(STORAGE_KEY) ?? createEmptyBudget()),
  );

  readonly income = computed(() => this.budget().income);
  readonly categories = computed(() => this.budget().categories);

  /** Chaque catégorie enrichie de son montant, recalculé automatiquement
   * dès que le revenu OU une seule catégorie change — sans code manuel.
   * Pour une catégorie à montant fixe, c'est le pourcentage qui est recalculé. */
  readonly categoriesWithAmounts = computed<CategoryWithAmount[]>(() =>
    withEffectiveValues(this.categories(), this.income()),
  );

  // Totaux calculés sur les pourcentages effectifs (montants fixes compris).
  readonly totalPercentage = computed(() => calculateTotalPercentage(this.categoriesWithAmounts()));
  readonly remainingPercentage = computed(() => calculateRemainingPercentage(this.categoriesWithAmounts()));
  readonly isOverAllocated = computed(() => isOverAllocated(this.categoriesWithAmounts()));
  /** Nom de la catégorie qui prend automatiquement le reste, s'il y en a une. */
  readonly remainderCategoryName = computed(() => this.categories().find((c) => c.takesRemainder)?.name ?? null);

  constructor() {
    // Persistance automatique : à chaque changement d'état, on réécrit
    // dans le stockage. Aucun composant n'a besoin d'appeler "save()".
    effect(() => this.storage.set(STORAGE_KEY, this.budget()));
  }

  /** Copie du budget complet, pour l'export (sauvegarde JSON). */
  snapshot(): Budget {
    return structuredClone(this.budget());
  }

  /** Remplace tout le budget, pour l'import d'une sauvegarde déjà validée. */
  replaceBudget(budget: Budget): void {
    this.budget.set(migrateLegacyColors(structuredClone(budget)));
  }

  updateIncome(income: number): void {
    this.budget.update((current) => ({ ...current, income, updatedAt: new Date().toISOString() }));
  }

  addCategory(draft: CategoryDraft): void {
    const now = new Date().toISOString();
    const category: Category = { ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.budget.update((current) => ({
      ...current,
      categories: [...this.withoutRemainder(current.categories, draft.takesRemainder), category],
      updatedAt: now,
    }));
  }

  updateCategory(id: string, changes: Partial<CategoryDraft>): void {
    this.budget.update((current) => ({
      ...current,
      categories: this.withoutRemainder(current.categories, changes.takesRemainder, id).map((category) =>
        category.id === id
          ? { ...category, ...changes, updatedAt: new Date().toISOString() }
          : category,
      ),
      updatedAt: new Date().toISOString(),
    }));
  }

  /** Déplace une catégorie dans la liste (l'ordre est repris par le graphique). */
  moveCategory(fromIndex: number, toIndex: number): void {
    this.budget.update((current) => {
      const last = current.categories.length - 1;
      const from = Math.min(Math.max(fromIndex, 0), last);
      const to = Math.min(Math.max(toIndex, 0), last);
      if (from === to || last < 0) return current;
      const categories = [...current.categories];
      const [moved] = categories.splice(from, 1);
      categories.splice(to, 0, moved);
      return { ...current, categories, updatedAt: new Date().toISOString() };
    });
  }

  /** Déplace une catégorie d'un ou plusieurs crans (clavier). La position
   * part de l'état courant, pas d'une liste affichée peut-être pas encore à jour :
   * des appuis rapides sur une flèche s'enchaînent donc correctement. */
  nudgeCategory(id: string, offset: number): void {
    const index = this.categories().findIndex((c) => c.id === id);
    if (index === -1) return;
    this.moveCategory(index, index + offset);
  }

  /** Supprime une catégorie et renvoie ce qu'il faut pour l'annuler
   * (la catégorie et sa position), ou null si elle n'existe pas. */
  removeCategory(id: string): RemovedCategory | null {
    const index = this.categories().findIndex((category) => category.id === id);
    if (index === -1) return null;
    const category = this.categories()[index];
    this.budget.update((current) => ({
      ...current,
      categories: current.categories.filter((c) => c.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    return { category, index };
  }

  /** Annule une suppression : remet la catégorie à sa place d'origine. */
  restoreCategory({ category, index }: RemovedCategory): void {
    this.budget.update((current) => {
      if (current.categories.some((c) => c.id === category.id)) return current;
      const categories = [...current.categories];
      // Si une autre catégorie a pris le reste entre-temps, elle le garde.
      const restored = category.takesRemainder && categories.some((c) => c.takesRemainder)
        ? { ...category, takesRemainder: undefined }
        : category;
      categories.splice(Math.min(index, categories.length), 0, restored);
      return { ...current, categories, updatedAt: new Date().toISOString() };
    });
  }

  /** Une seule catégorie prend le reste : quand une catégorie le prend,
   * les autres (sauf `exceptId`) perdent ce mode. */
  private withoutRemainder(categories: Category[], takesRemainder: boolean | undefined, exceptId?: string): Category[] {
    if (!takesRemainder) return categories;
    // L'ancienne catégorie « reste » garde le pourcentage qu'elle avait à cet instant.
    const effective = withEffectiveValues(categories, this.income());
    return categories.map((c, i) =>
      c.takesRemainder && c.id !== exceptId
        ? { ...c, takesRemainder: undefined, percentage: effective[i].percentage }
        : c,
    );
  }
}
