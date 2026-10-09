import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { IncomeInput } from '../income-input/income-input';
import { BudgetService, RemovedCategory } from '../../services/budget.service';
import { CategoryForm } from '../category-form/category-form';
import { CategoryList } from '../category-list/category-list';
import { AllocationSummary } from '../allocation-summary/allocation-summary';
import { BackupPanel } from '../backup-panel/backup-panel';
import { AllocationChart } from '../allocation-chart/allocation-chart';
import { Icon } from '../../../../shared/components/icon/icon';

/** Durée pendant laquelle une suppression peut être annulée. */
export const UNDO_DELAY_MS = 8000;

@Component({
  selector: 'app-budget-page',
  imports: [IncomeInput, CategoryForm, CategoryList, AllocationSummary, BackupPanel, AllocationChart, Icon],
  templateUrl: './budget-page.html',
  styleUrl: './budget-page.css',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class BudgetPage {
  readonly budgetService = inject(BudgetService);
  readonly usedColors = computed(() => this.budgetService.categories().map((c) => c.color));

  /** Dernière catégorie supprimée, tant que la suppression peut être annulée. */
  readonly lastRemoved = signal<RemovedCategory | null>(null);
  private undoTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopUndoTimer());
  }

  onCategoryRemoved(id: string): void {
    const removed = this.budgetService.removeCategory(id);
    if (!removed) return;
    // Seule la dernière suppression est annulable.
    this.lastRemoved.set(removed);
    this.startUndoTimer();
  }

  undoRemove(): void {
    const removed = this.lastRemoved();
    if (!removed) return;
    this.budgetService.restoreCategory(removed);
    this.dismissUndo();
  }

  dismissUndo(): void {
    this.stopUndoTimer();
    this.lastRemoved.set(null);
  }

  /** Le délai repart de zéro, par exemple quand le bandeau perd le survol ou le focus. */
  startUndoTimer(): void {
    this.stopUndoTimer();
    this.undoTimer = setTimeout(() => this.lastRemoved.set(null), UNDO_DELAY_MS);
  }

  /** Le bandeau reste affiché tant qu'il est survolé ou qu'il a le focus. */
  stopUndoTimer(): void {
    clearTimeout(this.undoTimer);
  }

  /** Ctrl+Z / ⌘+Z annule la suppression, sauf dans un champ de saisie
   * (où le raccourci garde son rôle habituel). */
  onKeydown(event: KeyboardEvent): void {
    if (!this.lastRemoved()) return;
    const isUndo = (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z';
    const inField = (event.target as HTMLElement | null)?.closest?.('input, textarea, [contenteditable="true"]');
    if (!isUndo || inField) return;
    event.preventDefault();
    this.undoRemove();
  }
}
