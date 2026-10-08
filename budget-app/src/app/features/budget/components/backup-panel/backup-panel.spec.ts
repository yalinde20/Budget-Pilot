import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupPanel } from './backup-panel';
import { BudgetService } from '../../services/budget.service';
import { serializeBackup } from '../../services/budget-backup';
import { STORAGE_ADAPTER } from '../../../../core/tokens/storage.token';
import { InMemoryStorageAdapter } from '../../../../core/testing/in-memory-storage-adapter';
import { Budget } from '../../models/budget.model';

const SAVED_BUDGET: Budget = {
  id: 'budget-sauvegarde',
  name: 'Mon budget',
  income: 3000,
  categories: [
    {
      id: 'cat-1',
      name: 'Loyer',
      percentage: 30,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
  ],
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
};

/** Simule le choix d'un fichier dans le sélecteur. */
function fileEvent(content: string): Event {
  const file = new File([content], 'budgetpilot.json', { type: 'application/json' });
  return { target: { files: [file], value: 'C:\\fakepath\\budgetpilot.json' } } as unknown as Event;
}

describe('BackupPanel', () => {
  let component: BackupPanel;
  let fixture: ComponentFixture<BackupPanel>;
  let budgetService: BudgetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackupPanel],
      providers: [{ provide: STORAGE_ADAPTER, useClass: InMemoryStorageAdapter }],
    }).compileComponents();

    fixture = TestBed.createComponent(BackupPanel);
    component = fixture.componentInstance;
    budgetService = TestBed.inject(BudgetService);
    budgetService.updateIncome(1200);
    fixture.detectChanges();
  });

  it('importe une sauvegarde valide après confirmation', async () => {
    spyOn(window, 'confirm').and.returnValue(true);

    await component.onFileSelected(fileEvent(serializeBackup(SAVED_BUDGET, '1.0.0')));

    expect(window.confirm).toHaveBeenCalledWith(jasmine.stringContaining('1 catégorie'));
    expect(budgetService.snapshot()).toEqual(SAVED_BUDGET);
    expect(component.status()).toEqual({ kind: 'success', text: 'Sauvegarde importée.' });
  });

  it("ne change rien si l'utilisateur annule", async () => {
    spyOn(window, 'confirm').and.returnValue(false);

    await component.onFileSelected(fileEvent(serializeBackup(SAVED_BUDGET, '1.0.0')));

    expect(budgetService.income()).toBe(1200);
    expect(component.status()).toBeNull();
  });

  it("affiche une erreur et garde les données pour un fichier invalide", async () => {
    spyOn(window, 'confirm');

    await component.onFileSelected(fileEvent('{"pas": "une sauvegarde"}'));
    fixture.detectChanges();

    expect(window.confirm).not.toHaveBeenCalled();
    expect(budgetService.income()).toBe(1200);
    expect(component.status()?.kind).toBe('error');
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent)
      .toContain('pas une sauvegarde BudgetPilot');
  });

  it('télécharge un fichier JSON contenant le budget actuel', async () => {
    let downloaded: { name: string; href: string } | undefined;
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function (this: HTMLAnchorElement) {
      downloaded = { name: this.download, href: this.href };
    });
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);

    await component.onExport();

    expect(downloaded?.name).toMatch(/^budgetpilot-\d{4}-\d{2}-\d{2}\.json$/);
    expect(downloaded?.href).toMatch(/^blob:/);
    expect(component.status()?.kind).toBe('success');
  });
});
