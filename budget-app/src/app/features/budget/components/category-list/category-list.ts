import { Component, input, output } from '@angular/core';
import { CategoryItem } from '../category-item/category-item';
import { CategoryWithAmount } from '../../services/budget.service';
import {CategoryDraft} from '../../models/category.model';

@Component({
  selector: 'app-category-list',
  imports: [CategoryItem],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList {

  categoryList = input.required<CategoryWithAmount[]>();
  categoryRemoved = output<string>();
  categoryUpdated = output<{ id: string; changes: Partial<CategoryDraft> }>();
  income = input.required<number>();

}
