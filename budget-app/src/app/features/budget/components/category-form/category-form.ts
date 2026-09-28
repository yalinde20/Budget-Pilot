import {Component, computed, input, output, signal} from '@angular/core';
import { CategoryDraft } from '../../models/category.model';
import { isValidCategoryDraft } from '../../services/category-validator';
import {calculatePercentageFromAmount} from '../../services/budget-calculator';

@Component({
  selector: 'app-category-form',
  imports: [],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {
  readonly availableIcons = ['ti-home', 'ti-salad', 'ti-pig-money', 'ti-ball-tennis', 'ti-car', 'ti-heart', 'ti-shopping-cart', 'ti-plane'];
  readonly availableColors = ['#378ADD', '#639922', '#0F6E56', '#D4537E', '#B45AC9', '#E08E45'];

  name = signal<string>('');
  percentage = signal<number>(0);
  icon = signal<string>(this.availableIcons[0]);
  color = signal(this.availableColors[0]);
  income = input.required<number>();
  inputMode = signal<'percentage' | 'amount'>('percentage');
  amount = signal<number>(0);
  canUseAmountMode = computed(() => this.income() > 0 );
  effectivePercentage = computed(() =>{
    return this.inputMode() === 'amount' ? calculatePercentageFromAmount(this.amount(), this.income()) : this.percentage();
  });

  isValid = computed(() =>{
    return this.inputMode() === 'amount' && !this.canUseAmountMode() ? false :  isValidCategoryDraft({ name: this.name(), percentage: this.effectivePercentage() });
  } );
  categoryAdded = output<CategoryDraft>();

  onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  onPercentageInput(event: Event): void {
    this.percentage.set(Number((event.target as HTMLInputElement).value));
  }

  onAmountInput(event: Event): void {
    this.amount.set(Number((event.target as HTMLInputElement).value));
  }

  onSubmit(): void {
    if (!this.isValid()) return;
    this.categoryAdded.emit({ name: this.name(), percentage: this.effectivePercentage(), icon: this.icon(), color: this.color()  });
    this.name.set('');
    this.percentage.set(0);
    this.amount.set(0);
    this.icon.set(this.availableIcons[0]);
    this.color.set(this.availableColors[0]);
    this.inputMode.set('percentage');
  }
}
