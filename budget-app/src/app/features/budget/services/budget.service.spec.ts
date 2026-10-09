import { TestBed } from '@angular/core/testing';
import { BudgetService } from './budget.service';
import { STORAGE_ADAPTER } from '../../../core/tokens/storage.token';
import { InMemoryStorageAdapter } from '../../../core/testing/in-memory-storage-adapter';
import { Budget } from '../models/budget.model';

describe('BudgetService', () => {
  it('convertit les couleurs de l’ancienne palette au chargement et les enregistre', () => {
    const storage = new InMemoryStorageAdapter();
    storage.set<Budget>('budget', {
      id: 'b',
      name: 'Mon budget',
      income: 2000,
      categories: [
        { id: 'c1', name: 'Loisirs', percentage: 10, color: '#D4537E', createdAt: '', updatedAt: '' },
      ],
      createdAt: '',
      updatedAt: '',
    });
    TestBed.configureTestingModule({ providers: [{ provide: STORAGE_ADAPTER, useValue: storage }] });

    const service = TestBed.inject(BudgetService);
    expect(service.categories()[0].color).toBe('#e34948');

    TestBed.tick();
    expect(storage.get<Budget>('budget')?.categories[0].color).toBe('#e34948');
  });
});

describe('BudgetService (annulation de suppression)', () => {
  let service: BudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: STORAGE_ADAPTER, useClass: InMemoryStorageAdapter }] });
    service = TestBed.inject(BudgetService);
    for (const name of ['Loyer', 'Courses', 'Loisirs']) {
      service.addCategory({ name, percentage: 10 });
    }
  });

  it('remet la catégorie supprimée à sa place d’origine, avec ses données', () => {
    const before = service.categories();
    const removed = service.removeCategory(before[1].id);

    expect(service.categories().map((c) => c.name)).toEqual(['Loyer', 'Loisirs']);
    expect(removed).toEqual({ category: before[1], index: 1 });

    service.restoreCategory(removed!);
    expect(service.categories()).toEqual(before);
  });

  it('remet la catégorie à la fin si la liste a raccourci entre-temps', () => {
    const last = service.removeCategory(service.categories()[2].id)!;
    service.removeCategory(service.categories()[1].id);

    service.restoreCategory(last);
    expect(service.categories().map((c) => c.name)).toEqual(['Loyer', 'Loisirs']);
  });

  it('ne restaure pas deux fois la même catégorie', () => {
    const removed = service.removeCategory(service.categories()[0].id)!;
    service.restoreCategory(removed);
    service.restoreCategory(removed);
    expect(service.categories().length).toBe(3);
  });

  it('renvoie null pour une catégorie inconnue', () => {
    expect(service.removeCategory('inconnue')).toBeNull();
    expect(service.categories().length).toBe(3);
  });
});
