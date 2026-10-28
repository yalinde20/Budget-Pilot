import { ComponentFixture, TestBed } from '@angular/core/testing';
import { STORAGE_ADAPTER } from '../../../../core/tokens/storage.token';
import { InMemoryStorageAdapter } from '../../../../core/testing/in-memory-storage-adapter';

import { CategoryForm } from './category-form';

describe('CategoryForm', () => {
  let component: CategoryForm;
  let fixture: ComponentFixture<CategoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryForm],
      providers: [{ provide: STORAGE_ADAPTER, useClass: InMemoryStorageAdapter }],
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
    await TestBed.configureTestingModule({ imports: [CategoryForm], providers: [{ provide: STORAGE_ADAPTER, useClass: InMemoryStorageAdapter }] }).compileComponents();
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

describe('CategoryForm (montant fixe)', () => {
  it('envoie le montant fixe seulement si la case est cochée en mode €', async () => {
    await TestBed.configureTestingModule({ imports: [CategoryForm], providers: [{ provide: STORAGE_ADAPTER, useClass: InMemoryStorageAdapter }] }).compileComponents();
    const fixture = TestBed.createComponent(CategoryForm);
    const form = fixture.componentInstance;
    fixture.componentRef.setInput('income', 2000);
    fixture.detectChanges();
    const emitted: unknown[] = [];
    form.categoryAdded.subscribe((draft) => emitted.push(draft));

    form.name.set('Loyer');
    form.inputMode.set('amount');
    form.amount.set(700);
    form.fixed.set(true);
    form.onSubmit();

    form.name.set('Loisirs');
    form.inputMode.set('amount');
    form.amount.set(200);
    form.onSubmit();

    expect(emitted[0]).toEqual(jasmine.objectContaining({ name: 'Loyer', percentage: 35, fixedAmount: 700 }));
    expect(emitted[1]).toEqual(jasmine.objectContaining({ name: 'Loisirs', percentage: 10 }));
    expect('fixedAmount' in (emitted[1] as object)).toBeFalse();
    expect(form.fixed()).toBeFalse();
  });
});

describe('CategoryForm (attribuer le reste)', () => {
  async function setup(remaining: number) {
    await TestBed.configureTestingModule({ imports: [CategoryForm], providers: [{ provide: STORAGE_ADAPTER, useClass: InMemoryStorageAdapter }] }).compileComponents();
    const fixture = TestBed.createComponent(CategoryForm);
    fixture.componentRef.setInput('income', 2000);
    fixture.componentRef.setInput('remainingPercentage', remaining);
    fixture.detectChanges();
    const emitted: Record<string, unknown>[] = [];
    fixture.componentInstance.categoryAdded.subscribe((d) => emitted.push(d as Record<string, unknown>));
    return { fixture, form: fixture.componentInstance, emitted };
  }

  it('remplit une fois le champ avec le reste, en % ou en €', async () => {
    const { form } = await setup(35);
    form.fillRemainder();
    expect(form.percentage()).toBe(35);

    form.inputMode.set('amount');
    form.fillRemainder();
    expect(form.amount()).toBe(700);
  });

  it('enregistre le mode automatique avec le reste actuel comme valeur de secours', async () => {
    const { form, emitted } = await setup(35);
    form.name.set('Épargne');
    form.auto.set(true);
    form.onSubmit();

    expect(emitted[0]).toEqual(jasmine.objectContaining({ name: 'Épargne', percentage: 35, takesRemainder: true }));
    expect('fixedAmount' in emitted[0]).toBeFalse();
    expect(form.auto()).toBeFalse();
  });

  it('désactive le bouton quand il ne reste rien', async () => {
    const { fixture } = await setup(-5);
    const button = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Le reste'))!;
    expect(button.disabled).toBeTrue();
    expect(button.textContent).toContain('0 %');
  });
});
