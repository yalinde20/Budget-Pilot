import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPage } from './budget-page';
import { STORAGE_ADAPTER } from '../../../../core/tokens/storage.token';
import { PersistenceAdapter } from '../../../../core/models/persistence-adapter.interface';

/** Stockage en mémoire : les tests ne touchent jamais au vrai localStorage. */
class InMemoryStorageAdapter implements PersistenceAdapter {
  private readonly store = new Map<string, unknown>();
  get<T>(key: string): T | null {
    return (this.store.get(key) as T) ?? null;
  }
  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }
  remove(key: string): void {
    this.store.delete(key);
  }
}

describe('BudgetPage', () => {
  let component: BudgetPage;
  let fixture: ComponentFixture<BudgetPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetPage],
      providers: [{ provide: STORAGE_ADAPTER, useClass: InMemoryStorageAdapter }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
