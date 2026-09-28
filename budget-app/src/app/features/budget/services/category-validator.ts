import { CategoryDraft } from '../models/category.model';

/**
 * Fonction pure, même principe que budget-calculator.ts : aucune dépendance
 * Angular, réutilisable dans le formulaire d'ajout ET d'édition.
 */
export function isValidCategoryDraft(draft: CategoryDraft): boolean {
  return draft.name.trim() !== '' && draft.percentage >= 0 && draft.percentage <= 100;
}
