import {Component, inject} from '@angular/core';
import { IncomeInput } from '../income-input/income-input';
import {BudgetService} from '../../services/budget.service';
import {CategoryForm} from '../category-form/category-form';
import {CategoryList} from '../category-list/category-list';
import {AllocationSummary} from '../allocation-summary/allocation-summary';
import { BackupPanel } from '../backup-panel/backup-panel';


@Component({
  selector: 'app-budget-page',
  imports: [IncomeInput, CategoryForm, CategoryList, AllocationSummary, BackupPanel],
  templateUrl: './budget-page.html',
  styleUrl: './budget-page.css',
})
export class BudgetPage {
  readonly budgetService = inject(BudgetService);

}
