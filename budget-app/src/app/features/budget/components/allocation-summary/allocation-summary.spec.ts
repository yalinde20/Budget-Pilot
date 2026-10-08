import { ComponentFixture, TestBed } from '@angular/core/testing';

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
