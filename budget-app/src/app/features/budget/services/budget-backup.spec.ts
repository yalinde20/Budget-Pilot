import { Budget } from '../models/budget.model';
import { BACKUP_FORMAT, BACKUP_VERSION, backupFileName, parseBackup, serializeBackup } from './budget-backup';

function makeBudget(): Budget {
  return {
    id: 'budget-1',
    name: 'Mon budget',
    income: 2500.5,
    categories: [
      {
        id: 'cat-1',
        name: 'Loyer',
        percentage: 30,
        icon: 'ti-home',
        color: '#378ADD',
        createdAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-01T10:00:00.000Z',
      },
    ],
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  };
}

describe('serializeBackup / parseBackup', () => {
  it('relit exactement le budget exporté', () => {
    const text = serializeBackup(makeBudget(), '1.0.0', new Date('2026-10-08T09:00:00Z'));
    const result = parseBackup(text);

    expect(result.ok).toBeTrue();
    if (result.ok) {
      expect(result.backup.budget).toEqual(makeBudget());
      expect(result.backup.appVersion).toBe('1.0.0');
      expect(result.backup.exportedAt).toBe('2026-10-08T09:00:00.000Z');
    }
  });

  it('accepte une catégorie sans icône ni couleur', () => {
    const budget = makeBudget();
    delete budget.categories[0].icon;
    delete budget.categories[0].color;
    expect(parseBackup(serializeBackup(budget, '1.0.0')).ok).toBeTrue();
  });

  it('refuse un fichier qui n’est pas du JSON', () => {
    expect(parseBackup('pas du json')).toEqual({ ok: false, error: jasmine.stringContaining('JSON') });
  });

  it('refuse un JSON qui n’est pas une sauvegarde BudgetPilot', () => {
    expect(parseBackup('{"income": 2000}').ok).toBeFalse();
    expect(parseBackup('[]').ok).toBeFalse();
    expect(parseBackup('null').ok).toBeFalse();
  });

  it('refuse une sauvegarde d’une version plus récente du format', () => {
    const text = JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION + 1, budget: makeBudget() });
    expect(parseBackup(text)).toEqual({ ok: false, error: jasmine.stringContaining('plus récente') });
  });

  it('refuse un budget corrompu', () => {
    const wrap = (budget: unknown) => JSON.stringify({ format: BACKUP_FORMAT, version: 1, budget });

    expect(parseBackup(wrap({ ...makeBudget(), income: -10 })).ok).toBeFalse();
    expect(parseBackup(wrap({ ...makeBudget(), income: '2500' })).ok).toBeFalse();
    expect(parseBackup(wrap({ ...makeBudget(), categories: 'aucune' })).ok).toBeFalse();
    expect(
      parseBackup(wrap({ ...makeBudget(), categories: [{ ...makeBudget().categories[0], percentage: null }] })).ok,
    ).toBeFalse();
  });
});

describe('backupFileName', () => {
  it('contient la date du jour', () => {
    expect(backupFileName(new Date(2026, 9, 8))).toBe('budgetpilot-2026-10-08.json');
  });
});
