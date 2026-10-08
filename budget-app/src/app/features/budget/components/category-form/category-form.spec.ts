import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryForm } from './category-form';

describe('CategoryForm', () => {
  let component: CategoryForm;
  let fixture: ComponentFixture<CategoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('income', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('CategoryForm (couleur proposée)', () => {
  it('propose une couleur pas encore utilisée, puis la suivante après un ajout', async () => {
    await TestBed.configureTestingModule({ imports: [CategoryForm] }).compileComponents();
    const fixture = TestBed.createComponent(CategoryForm);
    const form = fixture.componentInstance;
    fixture.componentRef.setInput('income', 2000);
    fixture.componentRef.setInput('usedColors', ['#2a78d6']);
    fixture.detectChanges();

    expect(form.color()).toBe('#e34948');

    // L'utilisateur peut choisir une autre couleur…
    form.color.set('#008300');
    expect(form.color()).toBe('#008300');

    // …et après l'ajout, une nouvelle couleur libre est proposée.
    fixture.componentRef.setInput('usedColors', ['#2a78d6', '#008300']);
    fixture.detectChanges();
    expect(form.color()).toBe('#e34948');
  });
});
