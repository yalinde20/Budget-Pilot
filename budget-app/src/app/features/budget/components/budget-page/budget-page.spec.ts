import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPage } from './budget-page';
import { STORAGE_ADAPTER } from '../../../../core/tokens/storage.token';
import { InMemoryStorageAdapter } from '../../../../core/testing/in-memory-storage-adapter';

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
