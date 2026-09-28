import { Category } from '../models/category.model';

/**
 * Fonctions pures : aucune dépendance à Angular, à localStorage ou au DOM.
 * Elles prennent des données en entrée et retournent un résultat, sans
 * effet de bord. C'est ce qui les rend faciles à tester et réutilisables
 * hors du contexte web (ex : logique de référence pour une réécriture
 * native iOS).
 */

/** Arrondit au centime pour éviter les artefacts de virgule flottante
 * (ex : 0.1 + 0.2 = 0.30000000000000004 en JavaScript). */
export function calculateAmount(income: number, percentage: number): number {
  return Math.round(income * (percentage / 100) * 100) / 100;
}

export function calculateTotalPercentage(categories: Category[]): number {
  const total = categories.reduce((sum, c) => sum + c.percentage, 0);
  return Math.round(total * 100) / 100;
}

export function calculateRemainingPercentage(categories: Category[]): number {
  return Math.round((100 - calculateTotalPercentage(categories)) * 100) / 100;
}

export function isOverAllocated(categories: Category[]): boolean {
  return calculateTotalPercentage(categories) > 100;
}

export function calculatePercentageFromAmount(amount: number, income: number): number {
  if (income <= 0) {
    return 0;
  }
  return Math.round((amount / income) * 1000000) / 10000;
}
