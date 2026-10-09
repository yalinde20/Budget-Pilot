import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryItem } from './category-item';
import { CategoryWithAmount } from '../../services/budget.service';

function makeCategory(overrides: Partial<CategoryWithAmount> = {}): CategoryWithAmount {
  return {
    id: 'cat-1',
    name: 'Loyer',
    percentage: 30,
    amount: 600,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('CategoryItem', () => {
  let component: CategoryItem;
  let fixture: ComponentFixture<CategoryItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('category', makeCategory());
    fixture.componentRef.setInput('income', 2000);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("pré-remplit le montant en euros de la catégorie à l'ouverture de l'édition", () => {
    component.onEditStart();
    expect(component.draftAmount()).toBe(600);
  });

  it('valide le brouillon à partir du pourcentage calculé en mode €', () => {
    component.onEditStart();
    component.draftInputMode.set('amount');

    // 3000 € sur 2000 € de revenu = 150 % : invalide, même si le pourcentage
    // d'origine (30 %) était valide.
    component.draftAmount.set(3000);
    expect(component.isDraftValid()).toBeFalse();

    component.draftAmount.set(500);
    expect(component.isDraftValid()).toBeTrue();
  });

  it('émet le pourcentage converti depuis le montant à la sauvegarde', () => {
    const emitted: unknown[] = [];
    component.categoryUpdated.subscribe((event) => emitted.push(event));

    component.onEditStart();
    component.draftInputMode.set('amount');
    component.draftAmount.set(500);
    component.onEditSave();

    expect(emitted).toEqual([{ id: 'cat-1', changes: { name: 'Loyer', percentage: 25, fixedAmount: undefined } }]);
  });
});

describe('CategoryItem (montant fixe)', () => {
  function setup(income: number) {
    const fixture = TestBed.createComponent(CategoryItem);
    fixture.componentRef.setInput('category', makeCategory({ fixedAmount: 600, amount: 600, percentage: income ? (600 / income) * 100 : 0 }));
    fixture.componentRef.setInput('income', income);
    fixture.detectChanges();
    const emitted: { id: string; changes: Record<string, unknown> }[] = [];
    fixture.componentInstance.categoryUpdated.subscribe((e) => emitted.push(e as never));
    return { fixture, item: fixture.componentInstance, emitted };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CategoryItem] }).compileComponents();
  });

  it('affiche le cadenas et s’édite en euros, case cochée', () => {
    const { fixture, item } = setup(2000);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Montant fixe');

    item.onEditStart();
    expect(item.draftInputMode()).toBe('amount');
    expect(item.draftFixed()).toBeTrue();
    expect(item.draftAmount()).toBe(600);
  });

  it('garde le montant fixe modifié, ou le retire en repassant en %', () => {
    const { item, emitted } = setup(2000);

    item.onEditStart();
    item.draftAmount.set(650);
    item.onEditSave();
    expect(emitted[0].changes['fixedAmount']).toBe(650);

    item.onEditStart();
    item.draftInputMode.set('percentage');
    item.onEditSave();
    expect(emitted[1].changes['fixedAmount']).toBeUndefined();
  });

  it('sans revenu, garde le montant fixe quand on ne change que le nom', () => {
    const { item, emitted } = setup(0);

    item.onEditStart();
    expect(item.draftInputMode()).toBe('percentage');
    item.draftName.set('Loyer appartement');
    item.onEditSave();

    expect(emitted[0].changes['fixedAmount']).toBe(600);
  });
});
