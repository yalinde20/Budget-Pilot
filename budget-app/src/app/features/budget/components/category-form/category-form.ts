import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { CategoryDraft } from '../../models/category.model';
import { isValidCategoryDraft } from '../../services/category-validator';
import { calculatePercentageFromAmount, formatDecimal, parseDecimal } from '../../services/budget-calculator';
import { Icon } from '../../../../shared/components/icon/icon';
import { CATEGORY_COLORS, suggestCategoryColor } from '../../services/category-colors';

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
  readonly availableColors = CATEGORY_COLORS;

  name = signal<string>('');
  percentage = signal<number>(0);
  icon = signal<string>(this.availableIcons[0].id);
  income = input.required<number>();
  /** Couleurs des catégories existantes, pour en proposer une différente. */
  usedColors = input<readonly (string | undefined)[]>([]);
  /** Couleur proposée automatiquement, que l'utilisateur peut changer. Elle se
   * recalcule après chaque ajout, quand la liste des couleurs utilisées change. */
  color = linkedSignal<string>(() => suggestCategoryColor(this.usedColors()));
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
    this.inputMode.set('percentage');
  }
}
