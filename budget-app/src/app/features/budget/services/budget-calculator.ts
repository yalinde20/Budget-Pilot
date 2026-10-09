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

/**
 * Convertit une saisie utilisateur en nombre. Accepte la virgule comme
 * séparateur décimal (clavier iOS en français) et ignore les espaces.
 * Une saisie vide vaut 0 ; une saisie invalide renvoie NaN.
 */
export function parseDecimal(raw: string): number {
  const normalized = raw.replace(/[\s  ]/g, '').replace(',', '.');
  if (normalized === '') {
    return 0;
  }
  return /^-?(\d+\.?\d*|\.\d+)$/.test(normalized) ? Number(normalized) : NaN;
}

/** Affiche un nombre dans un champ de saisie, avec la virgule française.
 * 0 donne un champ vide pour laisser apparaître le placeholder. */
export function formatDecimal(value: number): string {
  return value === 0 || !Number.isFinite(value) ? '' : String(value).replace('.', ',');
}

/** Pourcentage effectif d'une catégorie : déduit de son montant fixe s'il y
 * en a un, sinon le pourcentage saisi. */
export function effectivePercentage(category: Category, income: number): number {
  return category.fixedAmount !== undefined
    ? calculatePercentageFromAmount(category.fixedAmount, income)
    : category.percentage;
}

/** Montant effectif d'une catégorie : son montant fixe s'il y en a un,
 * sinon la part du revenu correspondant à son pourcentage. */
export function effectiveAmount(category: Category, income: number): number {
  return category.fixedAmount ?? calculateAmount(income, category.percentage);
}
