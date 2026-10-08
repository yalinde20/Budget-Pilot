import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { AllocationChart } from './allocation-chart';
import { CategoryWithAmount } from '../../services/budget.service';

registerLocaleData(localeFr);

function cat(id: string, name: string, percentage: number, amount: number, color: string): CategoryWithAmount {
  return { id, name, percentage, amount, color, createdAt: '', updatedAt: '' };
}

describe('AllocationChart', () => {
  let fixture: ComponentFixture<AllocationChart>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationChart],
      providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
    }).compileComponents();

    fixture = TestBed.createComponent(AllocationChart);
    fixture.componentRef.setInput('income', 2000);
    fixture.componentRef.setInput('categories', [
      cat('1', 'Loyer', 30, 600, '#378ADD'),
      cat('2', 'Courses', 12.5, 250, '#639922'),
    ]);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('dessine une part par catégorie, avec sa couleur', () => {
    const segments = element.querySelectorAll('circle.segment');
    expect(segments.length).toBe(2);
    expect(segments[0].getAttribute('stroke')).toBe('#378ADD');
  });

  it('liste chaque catégorie et la part non répartie dans la légende', () => {
    const legend = element.querySelector('ul')?.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(legend).toContain('Loyer');
    expect(legend).toContain('12,5 %');
    expect(legend).toContain('Non réparti');
    expect(legend).toContain('57,5 %');
  });

  it('décrit le graphique pour les lecteurs d’écran', () => {
    expect(element.querySelector('svg')?.getAttribute('aria-label'))
      .toBe('Répartition du revenu : Loyer 30 %, Courses 12,5 %, non réparti 57,5 %.');
  });

  it('affiche le total au centre, puis le détail de la part survolée', () => {
    const center = () => element.querySelector('[aria-hidden="true"]')?.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(center()).toContain('42,5 %');

    element.querySelectorAll('circle.segment')[1].dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(center()).toContain('Courses');
    expect(center()).toContain('250,00');
    expect(element.querySelectorAll('circle.segment.dimmed').length).toBe(1);
  });
});

describe('AllocationChart (toucher)', () => {
  it('garde la part sélectionnée après un appui (survol puis clic)', async () => {
    await TestBed.configureTestingModule({ imports: [AllocationChart] }).compileComponents();
    const fixture = TestBed.createComponent(AllocationChart);
    fixture.componentRef.setInput('income', 2000);
    fixture.componentRef.setInput('categories', [
      cat('1', 'Loyer', 30, 600, '#378ADD'),
      cat('2', 'Courses', 20, 400, '#639922'),
    ]);
    fixture.detectChanges();

    const segment = (fixture.nativeElement as HTMLElement).querySelectorAll('circle.segment')[0];
    segment.dispatchEvent(new MouseEvent('mouseenter'));
    segment.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    const center = (fixture.nativeElement as HTMLElement).querySelector('[aria-hidden="true"]')?.textContent ?? '';
    expect(center).toContain('Loyer');
  });
});
