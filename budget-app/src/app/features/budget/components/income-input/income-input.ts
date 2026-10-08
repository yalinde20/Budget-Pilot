import { Component, input, output } from '@angular/core';
import { formatDecimal, parseDecimal } from '../../services/budget-calculator';

@Component({
  selector: 'app-income-input',
  imports: [],
  templateUrl: './income-input.html',
  styleUrl: './income-input.css',
})
export class IncomeInput {
  protected readonly formatDecimal = formatDecimal;

  // Valeur de l'income (signal)
  income = input<number>(0);

  // Valeur renvoyé au parent
  incomeChange = output<number>();

  /**
   * Récupére le revenu saisi par l'utilisateur
   * @param event
   */
  onIncomeInput(event: Event): void {
    const incomeWritten = parseDecimal((event.target as HTMLInputElement).value);
    if (Number.isFinite(incomeWritten)) {
      this.incomeChange.emit(incomeWritten);
    }
  }
}
