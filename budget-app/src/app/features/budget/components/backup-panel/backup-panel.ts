import { DOCUMENT, Component, inject, signal } from '@angular/core';
import { BudgetService } from '../../services/budget.service';
import { backupFileName, parseBackup, serializeBackup } from '../../services/budget-backup';
import { APP_VERSION } from '../../../../core/version';
import { Icon } from '../../../../shared/components/icon/icon';

type BackupStatus = { kind: 'success' | 'error'; text: string };

@Component({
  selector: 'app-backup-panel',
  imports: [Icon],
  templateUrl: './backup-panel.html',
  styleUrl: './backup-panel.css',
})
export class BackupPanel {
  private readonly budgetService = inject(BudgetService);
  private readonly document = inject(DOCUMENT);

  readonly status = signal<BackupStatus | null>(null);

  async onExport(): Promise<void> {
    const fileName = backupFileName();
    const json = serializeBackup(this.budgetService.snapshot(), APP_VERSION);
    const file = new File([json], fileName, { type: 'application/json' });

    // Sur iPhone, la feuille de partage permet « Enregistrer dans Fichiers »,
    // AirDrop, Mail… Sur ordinateur, on télécharge directement le fichier.
    if (this.canUseShareSheet(file)) {
      try {
        await navigator.share({ files: [file], title: 'Sauvegarde BudgetPilot' });
        this.status.set({ kind: 'success', text: 'Sauvegarde exportée.' });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        // Partage refusé par le système : on se rabat sur le téléchargement.
      }
    }

    this.download(file);
    this.status.set({ kind: 'success', text: `Sauvegarde téléchargée : ${fileName}` });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Permet de re-choisir le même fichier ensuite.
    input.value = '';
    if (!file) return;

    const result = parseBackup(await file.text());
    if (!result.ok) {
      this.status.set({ kind: 'error', text: result.error });
      return;
    }

    const { budget, exportedAt } = result.backup;
    const count = budget.categories.length;
    const details = [
      exportedAt ? `du ${formatDate(exportedAt)}` : '',
      `${count} catégorie${count > 1 ? 's' : ''}`,
    ].filter(Boolean).join(', ');
    const confirmed = this.document.defaultView?.confirm(
      `Remplacer ton budget actuel par cette sauvegarde (${details}) ?\n\nLes données actuelles seront écrasées.`,
    );
    if (!confirmed) return;

    this.budgetService.replaceBudget(budget);
    this.status.set({ kind: 'success', text: 'Sauvegarde importée.' });
  }

  private canUseShareSheet(file: File): boolean {
    const view = this.document.defaultView;
    return (
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] }) &&
      !!view?.matchMedia('(pointer: coarse)').matches
    );
  }

  private download(file: File): void {
    const url = URL.createObjectURL(file);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = file.name;
    this.document.body.appendChild(link);
    link.click();
    link.remove();
    // Laisse au navigateur le temps de démarrer le téléchargement.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(date);
}
