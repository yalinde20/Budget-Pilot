import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { AllocationSummary } from './allocation-summary';

describe('AllocationSummary', () => {
  let component: AllocationSummary;
  let fixture: ComponentFixture<AllocationSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllocationSummary);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('totalPercentage', 0);
    fixture.componentRef.setInput('remainingPercentage', 100);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

registerLocaleData(localeFr);

describe('AllocationSummary (affichage)', () => {
  it('affiche les pourcentages au format français', async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationSummary],
      providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
    }).compileComponents();
    const fixture = TestBed.createComponent(AllocationSummary);
    fixture.componentRef.setInput('totalPercentage', 42.5);
    fixture.componentRef.setInput('remainingPercentage', 57.5);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('42,5 %');
    expect(text).toContain('57,5 %');
  });
});
