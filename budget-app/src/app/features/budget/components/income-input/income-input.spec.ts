import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeInput } from './income-input';

describe('IncomeInput', () => {
  let component: IncomeInput;
  let fixture: ComponentFixture<IncomeInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
