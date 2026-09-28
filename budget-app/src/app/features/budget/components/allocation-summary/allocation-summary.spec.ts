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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
