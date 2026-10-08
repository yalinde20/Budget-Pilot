import { Component, computed, inject } from '@angular/core';
import { IncomeInput } from '../income-input/income-input';
import {BudgetService} from '../../services/budget.service';
import {CategoryForm} from '../category-form/category-form';
import {CategoryList} from '../category-list/category-list';
import {AllocationSummary} from '../allocation-summary/allocation-summary';
import { BackupPanel } from '../backup-panel/backup-panel';
import { AllocationChart } from '../allocation-chart/allocation-chart';


@Component({
  selector: 'app-budget-page',
  imports: [IncomeInput, CategoryForm, CategoryList, AllocationSummary, BackupPanel, AllocationChart],
  templateUrl: './budget-page.html',
  styleUrl: './budget-page.css',
})
export class BudgetPage {
  readonly budgetService = inject(BudgetService);
  readonly usedColors = computed(() => this.budgetService.categories().map((c) => c.color));

}
