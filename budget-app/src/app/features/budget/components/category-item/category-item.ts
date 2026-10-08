import {Component, computed, input, output, signal} from '@angular/core';
import { CategoryWithAmount } from '../../services/budget.service';
import { CategoryDraft } from '../../models/category.model';
import {CurrencyPipe} from '@angular/common';
import {isValidCategoryDraft} from '../../services/category-validator';
import {calculatePercentageFromAmount} from '../../services/budget-calculator';

@Component({
  selector: 'app-category-item',
  imports: [
    CurrencyPipe
  ],
  templateUrl: './category-item.html',
  styleUrl: './category-item.css',
})
export class CategoryItem {
  category = input.required<CategoryWithAmount>();
  categoryRemoved = output<string>();
  categoryUpdated = output<{ id: string; changes: Partial<CategoryDraft> }>();
  isEditing = signal<boolean>(false);
  draftName = signal<string>('');
  draftPercentage = signal<number>(0);
  income = input.required<number>();
  draftInputMode = signal<'percentage' | 'amount'>('percentage');
  draftAmount = signal<number>(0);
  canUseAmountMode = computed(() => this.income() > 0 );
  effectiveDraftPercentage = computed(() =>{
    return this.draftInputMode() === 'amount' ? calculatePercentageFromAmount(this.draftAmount(), this.income()) : this.draftPercentage();
  });

  isDraftValid = computed(() => {
    return this.draftInputMode() === 'amount' && !this.canUseAmountMode() ? false : isValidCategoryDraft({ name: this.draftName(), percentage: this.effectiveDraftPercentage() })
  } );


  onRemove(): void {
    this.categoryRemoved.emit(this.category().id);
  }

  onEditStart(): void {
    this.draftName.set(this.category().name);
    this.draftPercentage.set(this.category().percentage);
    this.draftInputMode.set('percentage');
    this.draftAmount.set(this.category().amount);
    this.isEditing.set(true);
  }

  onEditCancel(): void {
    this.isEditing.set(false);
  }

  onEditSave(): void {
    if (!this.isDraftValid()) return;
    this.categoryUpdated.emit({id :this.category().id, changes: { name: this.draftName(), percentage: this.effectiveDraftPercentage() }});
    this.isEditing.set(false);
  }

  onDraftNameInput(event: Event): void {
    this.draftName.set((event.target as HTMLInputElement).value);
  }

  onDraftPercentageInput(event: Event): void {
    this.draftPercentage.set(Number((event.target as HTMLInputElement).value));
  }

  onDraftAmountInput(event: Event): void {
    this.draftAmount.set(Number((event.target as HTMLInputElement).value));
  }

}
