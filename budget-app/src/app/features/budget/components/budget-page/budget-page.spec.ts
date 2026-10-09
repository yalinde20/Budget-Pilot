import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { BudgetPage, UNDO_DELAY_MS } from './budget-page';
import { BudgetService } from '../../services/budget.service';
import { STORAGE_ADAPTER } from '../../../../core/tokens/storage.token';
import { InMemoryStorageAdapter } from '../../../../core/testing/in-memory-storage-adapter';

describe('BudgetPage', () => {
  let component: BudgetPage;
  let fixture: ComponentFixture<BudgetPage>;
  let service: BudgetService;

  const toast = () => (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[role="status"].fixed');
  const names = () => service.categories().map((c) => c.name);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetPage],
      providers: [{ provide: STORAGE_ADAPTER, useClass: InMemoryStorageAdapter }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPage);
    component = fixture.componentInstance;
    service = TestBed.inject(BudgetService);
    service.addCategory({ name: 'Loyer', percentage: 30 });
    service.addCategory({ name: 'Courses', percentage: 20 });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('propose d’annuler une suppression, puis remet la catégorie', () => {
    component.onCategoryRemoved(service.categories()[0].id);
    fixture.detectChanges();

    expect(names()).toEqual(['Courses']);
    expect(toast()?.textContent?.replace(/\s+/g, ' ')).toContain('« Loyer » supprimée');

    toast()!.querySelector('button')!.click();
    fixture.detectChanges();

    expect(names()).toEqual(['Loyer', 'Courses']);
    expect(toast()).toBeNull();
  });

  it('retire le bandeau après le délai, sans restaurer', fakeAsync(() => {
    component.onCategoryRemoved(service.categories()[0].id);
    tick(UNDO_DELAY_MS - 1);
    expect(component.lastRemoved()).not.toBeNull();

    tick(1);
    fixture.detectChanges();
    expect(toast()).toBeNull();
    expect(names()).toEqual(['Courses']);
  }));

  it('ne garde annulable que la dernière suppression', () => {
    component.onCategoryRemoved(service.categories()[0].id);
    component.onCategoryRemoved(service.categories()[0].id);
    component.undoRemove();

    expect(names()).toEqual(['Courses']);
  });

  it('annule avec Ctrl+Z, sauf depuis un champ de saisie', () => {
    component.onCategoryRemoved(service.categories()[1].id);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    input.remove();
    expect(names()).toEqual(['Loyer']);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
    expect(names()).toEqual(['Loyer', 'Courses']);
  });
});
