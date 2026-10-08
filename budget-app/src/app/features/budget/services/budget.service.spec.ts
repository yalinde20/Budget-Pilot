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
