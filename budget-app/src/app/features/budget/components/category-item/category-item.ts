import {Component, computed, input, output, signal} from '@angular/core';
import { CategoryWithAmount } from '../../services/budget.service';
import { CategoryDraft } from '../../models/category.model';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {isValidCategoryDraft} from '../../services/category-validator';
import { calculatePercentageFromAmount, formatDecimal, parseDecimal } from '../../services/budget-calculator';
import { Icon } from '../../../../shared/components/icon/icon';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-category-item',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    Icon,
    CdkDragHandle,
  ],
  templateUrl: './category-item.html',
  styleUrl: './category-item.css',
})
export class CategoryItem {
  protected readonly formatDecimal = formatDecimal;
  category = input.required<CategoryWithAmount>();
  categoryRemoved = output<string>();
  /** Affiche la poignée de déplacement (au moins deux catégories). */
  reorderable = input<boolean>(false);
  /** Déplacement au clavier : -1 vers le haut, +1 vers le bas. */
  moveBy = output<number>();
  categoryUpdated = output<{ id: string; changes: Partial<CategoryDraft> }>();
  isEditing = signal<boolean>(false);
  draftName = signal<string>('');
  draftPercentage = signal<number>(0);
  income = input.required<number>();
  draftInputMode = signal<'percentage' | 'amount'>('percentage');
  draftAmount = signal<number>(0);
  draftFixed = signal<boolean>(false);
  canUseAmountMode = computed(() => this.income() > 0 );
  effectiveDraftPercentage = computed(() =>{
    return this.draftInputMode() === 'amount' ? calculatePercentageFromAmount(this.draftAmount(), this.income()) : this.draftPercentage();
  });

  isDraftValid = computed(() => {
    return this.draftInputMode() === 'amount' && !this.canUseAmountMode() ? false : isValidCategoryDraft({ name: this.draftName(), percentage: this.effectiveDraftPercentage() })
  } );


  onHandleKeydown(event: KeyboardEvent): void {
    const offset = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (!offset) return;
    event.preventDefault();
    this.moveBy.emit(offset);
  }

  onRemove(): void {
    this.categoryRemoved.emit(this.category().id);
  }

  onEditStart(): void {
    const category = this.category();
    const isFixed = category.fixedAmount !== undefined;
    this.draftName.set(category.name);
    this.draftPercentage.set(category.percentage);
    // Une catégorie à montant fixe s'édite directement en euros.
    this.draftInputMode.set(isFixed && this.canUseAmountMode() ? 'amount' : 'percentage');
    this.draftAmount.set(category.amount);
    this.draftFixed.set(isFixed);
    this.isEditing.set(true);
  }

  onEditCancel(): void {
    this.isEditing.set(false);
  }

  onEditSave(event?: Event): void {
    event?.preventDefault();
    if (!this.isDraftValid()) return;
    this.categoryUpdated.emit({
      id: this.category().id,
      changes: { name: this.draftName(), percentage: this.effectiveDraftPercentage(), fixedAmount: this.draftFixedAmount() },
    });
    this.isEditing.set(false);
  }

  /** Montant fixe à enregistrer ; undefined le retire (retour au pourcentage). */
  private draftFixedAmount(): number | undefined {
    if (!this.draftFixed()) return undefined;
    if (this.draftInputMode() === 'amount') return this.draftAmount();
    // Sans revenu, le mode € est indisponible : on garde le montant fixe
    // existant plutôt que de le perdre en modifiant seulement le nom.
    return this.canUseAmountMode() ? undefined : this.category().fixedAmount;
  }

  onDraftNameInput(event: Event): void {
    this.draftName.set((event.target as HTMLInputElement).value);
  }

  onDraftPercentageInput(event: Event): void {
    this.draftPercentage.set(parseDecimal((event.target as HTMLInputElement).value));
  }

  onDraftAmountInput(event: Event): void {
    this.draftAmount.set(parseDecimal((event.target as HTMLInputElement).value));
  }

}
