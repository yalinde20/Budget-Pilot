import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_ADAPTER } from '../../../core/tokens/storage.token';
import { Budget, createEmptyBudget } from '../models/budget.model';
import { Category, CategoryDraft } from '../models/category.model';
import {
  calculateAmount,
  calculateRemainingPercentage,
  calculateTotalPercentage,
  isOverAllocated,
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
   * dès que le revenu OU une seule catégorie change — sans code manuel. */
  readonly categoriesWithAmounts = computed<CategoryWithAmount[]>(() =>
    this.categories().map((category) => ({
      ...category,
      amount: calculateAmount(this.income(), category.percentage),
    })),
  );

  readonly totalPercentage = computed(() => calculateTotalPercentage(this.categories()));
  readonly remainingPercentage = computed(() => calculateRemainingPercentage(this.categories()));
  readonly isOverAllocated = computed(() => isOverAllocated(this.categories()));

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
      categories: [...current.categories, category],
      updatedAt: now,
    }));
  }

  updateCategory(id: string, changes: Partial<CategoryDraft>): void {
    this.budget.update((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === id
          ? { ...category, ...changes, updatedAt: new Date().toISOString() }
          : category,
      ),
      updatedAt: new Date().toISOString(),
    }));
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
      categories.splice(Math.min(index, categories.length), 0, category);
      return { ...current, categories, updatedAt: new Date().toISOString() };
    });
  }
}
