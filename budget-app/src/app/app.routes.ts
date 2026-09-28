import { Routes } from '@angular/router';
import { BudgetPage } from './features/budget/components/budget-page/budget-page';

export const routes: Routes = [
  { path: '', redirectTo: 'budget', pathMatch: 'full' },
  { path: 'budget', component: BudgetPage },
];
