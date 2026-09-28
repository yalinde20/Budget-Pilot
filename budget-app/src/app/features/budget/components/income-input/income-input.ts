import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-income-input',
  imports: [],
  templateUrl: './income-input.html',
  styleUrl: './income-input.css',
})
export class IncomeInput {

  // Valeur de l'income (signal)
  income = input<number>(0);

  // Valeur renvoyé au parent
  incomeChange = output<number>();

  /**
   * Récupére le revenu saisi par l'utilisateur
   * @param event
   */
  onIncomeInput(event: Event): void {
    const incomeWritten = Number((event.target as HTMLInputElement).value);
    this.incomeChange.emit(incomeWritten);
  }
}
