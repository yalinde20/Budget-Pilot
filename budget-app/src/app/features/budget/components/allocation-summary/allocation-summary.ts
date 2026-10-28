import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-allocation-summary',
  imports: [DecimalPipe],
  templateUrl: './allocation-summary.html',
  styleUrl: './allocation-summary.css',
})
export class AllocationSummary {
  totalPercentage = input.required<number>();
  remainingPercentage = input.required<number>();

  /** Couleurs selon l'état : reste à répartir (ambre), dépassement (rouge), complet (teal). */
  protected readonly toneClasses = computed(() => {
    const remaining = this.remainingPercentage();
    if (remaining > 0) return 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300';
    if (remaining < 0) return 'bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300';
    return 'bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300';
  });
}
