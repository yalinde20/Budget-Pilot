import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-allocation-summary',
  imports: [DecimalPipe],
  templateUrl: './allocation-summary.html',
  styleUrl: './allocation-summary.css',
})
export class AllocationSummary {
  totalPercentage = input.required<number>();
  remainingPercentage = input.required<number>();

}
