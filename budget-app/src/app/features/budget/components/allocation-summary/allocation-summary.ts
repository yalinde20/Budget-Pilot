import { Component, input } from '@angular/core';

@Component({
  selector: 'app-allocation-summary',
  imports: [],
  templateUrl: './allocation-summary.html',
  styleUrl: './allocation-summary.css',
})
export class AllocationSummary {
  totalPercentage = input.required<number>();
  remainingPercentage = input.required<number>();

}
