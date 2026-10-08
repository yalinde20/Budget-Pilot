import {Component, computed, input, output, signal} from '@angular/core';
import { CategoryDraft } from '../../models/category.model';
import { isValidCategoryDraft } from '../../services/category-validator';
import { calculatePercentageFromAmount, formatDecimal, parseDecimal } from '../../services/budget-calculator';
import { Icon } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-category-form',
  imports: [Icon],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {
  protected readonly formatDecimal = formatDecimal;
  readonly availableIcons = [
    { id: 'ti-home', label: 'Logement' },
    { id: 'ti-salad', label: 'Alimentation' },
    { id: 'ti-pig-money', label: 'Épargne' },
    { id: 'ti-ball-tennis', label: 'Loisirs' },
    { id: 'ti-car', label: 'Transport' },
    { id: 'ti-heart', label: 'Santé' },
    { id: 'ti-shopping-cart', label: 'Courses' },
    { id: 'ti-plane', label: 'Voyages' },
  ];
  readonly availableColors = [
    { value: '#378ADD', label: 'Bleu' },
    { value: '#639922', label: 'Vert' },
    { value: '#0F6E56', label: 'Vert foncé' },
    { value: '#D4537E', label: 'Rose' },
    { value: '#B45AC9', label: 'Violet' },
    { value: '#E08E45', label: 'Orange' },
  ];

  name = signal<string>('');
  percentage = signal<number>(0);
  icon = signal<string>(this.availableIcons[0].id);
  color = signal(this.availableColors[0].value);
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
    this.percentage.set(parseDecimal((event.target as HTMLInputElement).value));
  }

  onAmountInput(event: Event): void {
    this.amount.set(parseDecimal((event.target as HTMLInputElement).value));
  }

  onSubmit(event?: Event): void {
    // Formulaire HTML natif : on empêche le rechargement de la page. La touche
    // Entrée (ordinateur) ou « OK » (clavier iOS) soumet le formulaire.
    event?.preventDefault();
    if (!this.isValid()) return;
    this.categoryAdded.emit({ name: this.name(), percentage: this.effectivePercentage(), icon: this.icon(), color: this.color()  });
    this.name.set('');
    this.percentage.set(0);
    this.amount.set(0);
    this.icon.set(this.availableIcons[0].id);
    this.color.set(this.availableColors[0].value);
    this.inputMode.set('percentage');
  }
}
