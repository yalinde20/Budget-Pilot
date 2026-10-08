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

    expect(emitted).toEqual([{ id: 'cat-1', changes: { name: 'Loyer', percentage: 25 } }]);
  });
});
