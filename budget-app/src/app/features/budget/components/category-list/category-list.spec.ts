import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryList } from './category-list';

describe('CategoryList', () => {
  let component: CategoryList;
  let fixture: ComponentFixture<CategoryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categoryList', []);
    fixture.componentRef.setInput('income', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('CategoryList (réorganisation)', () => {
  function cat(id: string, name: string) {
    return { id, name, percentage: 10, amount: 200, createdAt: '', updatedAt: '' };
  }
  const all = [cat('a', 'Loyer'), cat('b', 'Courses'), cat('c', 'Loisirs')];

  async function setup(count: number) {
    await TestBed.configureTestingModule({ imports: [CategoryList] }).compileComponents();
    const fixture = TestBed.createComponent(CategoryList);
    fixture.componentRef.setInput('income', 2000);
    fixture.componentRef.setInput('categoryList', all.slice(0, count));
    fixture.detectChanges();
    const nudges: unknown[] = [];
    fixture.componentInstance.categoryNudged.subscribe((m) => nudges.push(m));
    const handles = () => (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('[data-drag-handle]');
    return { fixture, nudges, handles };
  }

  it('demande un déplacement avec les flèches, puis annonce la nouvelle position', async () => {
    const { fixture, nudges, handles } = await setup(3);
    expect(handles().length).toBe(3);

    handles()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    expect(nudges).toEqual([{ id: 'a', offset: 1 }]);

    // Le parent applique le déplacement : la liste réaffichée sert à l'annonce.
    fixture.componentRef.setInput('categoryList', [all[1], all[0], all[2]]);
    fixture.detectChanges();
    // L'annonce est écrite après l'affichage : un cycle de plus pour la voir.
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[aria-live]')?.textContent)
      .toContain('Loyer déplacée en position 2 sur 3.');
  });

  it('ignore les autres touches', async () => {
    const { nudges, handles } = await setup(3);
    handles()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(nudges).toEqual([]);
  });

  it('n’affiche pas de poignée avec une seule catégorie', async () => {
    const { handles } = await setup(1);
    expect(handles().length).toBe(0);
  });
});
