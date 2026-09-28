import {Component, inject} from '@angular/core';
import { IncomeInput } from '../income-input/income-input';
import {BudgetService} from '../../services/budget.service';
import {CategoryForm} from '../category-form/category-form';
import {CategoryList} from '../category-list/category-list';
import {AllocationSummary} from '../allocation-summary/allocation-summary';


@Component({
  selector: 'app-budget-page',
  imports: [IncomeInput, CategoryForm, CategoryList, AllocationSummary],
  templateUrl: './budget-page.html',
  styleUrl: './budget-page.css',
})
export class BudgetPage {
  readonly budgetService = inject(BudgetService);

}
