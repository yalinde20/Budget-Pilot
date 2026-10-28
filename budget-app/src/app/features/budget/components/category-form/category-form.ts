import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { CategoryDraft } from '../../models/category.model';
import { isValidCategoryDraft } from '../../services/category-validator';
import { calculateAmount, calculatePercentageFromAmount, formatDecimal, parseDecimal } from '../../services/budget-calculator';
import { DecimalPipe } from '@angular/common';
import { IconPicker } from '../../../../shared/components/icon-picker/icon-picker';
import { CATEGORY_COLORS, suggestCategoryColor } from '../../services/category-colors';

@Component({
  selector: 'app-category-form',
  imports: [IconPicker, DecimalPipe],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {
  protected readonly formatDecimal = formatDecimal;
  /** Icône proposée par défaut. */
  static readonly DEFAULT_ICON = 'ti-home';
  readonly availableColors = CATEGORY_COLORS;

  name = signal<string>('');
  percentage = signal<number>(0);
  icon = signal<string>(CategoryForm.DEFAULT_ICON);
  income = input.required<number>();
  /** Couleurs des catégories existantes, pour en proposer une différente. */
  usedColors = input<readonly (string | undefined)[]>([]);
  /** Couleur proposée automatiquement, que l'utilisateur peut changer. Elle se
   * recalcule après chaque ajout, quand la liste des couleurs utilisées change. */
  color = linkedSignal<string>(() => suggestCategoryColor(this.usedColors()));
  inputMode = signal<'percentage' | 'amount'>('percentage');
  amount = signal<number>(0);
  /** En mode €, garde ce montant même si le revenu change ensuite. */
  fixed = signal<boolean>(false);
  /** Pourcentage du revenu encore non réparti (fourni par la page). */
  remainingPercentage = input<number>(0);
  /** Catégorie qui prend déjà le reste (elle le perdra si on coche la case). */
  remainderOwner = input<string | null>(null);
  /** La catégorie prendra automatiquement tout ce qui reste. */
  auto = signal<boolean>(false);
  /** Reste disponible pour une nouvelle catégorie (jamais négatif). */
  available = computed(() => Math.max(0, this.remainingPercentage()));
  canUseAmountMode = computed(() => this.income() > 0 );
  effectivePercentage = computed(() =>{
    return this.inputMode() === 'amount' ? calculatePercentageFromAmount(this.amount(), this.income()) : this.percentage();
  });

  isValid = computed(() => {
    if (this.auto()) return isValidCategoryDraft({ name: this.name(), percentage: this.available() });
    return this.inputMode() === 'amount' && !this.canUseAmountMode() ? false : isValidCategoryDraft({ name: this.name(), percentage: this.effectivePercentage() });
  });
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
    const auto = this.auto();
    const fixedAmount = !auto && this.inputMode() === 'amount' && this.fixed() ? this.amount() : undefined;
    this.categoryAdded.emit({
      name: this.name(),
      // En mode automatique, le pourcentage enregistré est le reste actuel
      // (valeur de secours) ; il est ensuite recalculé en continu.
      percentage: auto ? this.available() : this.effectivePercentage(),
      icon: this.icon(),
      color: this.color(),
      ...(fixedAmount !== undefined ? { fixedAmount } : {}),
      ...(auto ? { takesRemainder: true } : {}),
    });
    this.name.set('');
    this.percentage.set(0);
    this.amount.set(0);
    this.icon.set(CategoryForm.DEFAULT_ICON);
    this.inputMode.set('percentage');
    this.fixed.set(false);
    this.auto.set(false);
  }

  /** Remplit une fois le champ avec le reste à répartir (en % ou en €). */
  fillRemainder(): void {
    if (this.inputMode() === 'amount') {
      this.amount.set(calculateAmount(this.income(), this.available()));
    } else {
      this.percentage.set(this.available());
    }
  }
}
