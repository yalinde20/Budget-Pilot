import { calculateAmount } from './budget-calculator';
import { CategoryWithAmount } from './budget.service';

/**
 * Données du graphique de répartition (camembert / anneau). Fonction pure :
 * le composant ne fait que dessiner ce qui est calculé ici.
 *
 * Règles de lisibilité :
 * - au plus MAX_SEGMENTS parts : au-delà, les plus petites sont regroupées
 *   dans « Autres » ;
 * - l'ordre des parts suit l'ordre de la liste des catégories, et chaque part
 *   garde la couleur de sa catégorie (la couleur suit la catégorie, pas son rang) ;
 * - l'anneau représente 100 % du revenu : la part non répartie reste vide.
 *   En cas de dépassement, l'anneau représente le total réparti.
 */
export const MAX_SEGMENTS = 6;
export const OTHERS_ID = '__autres__';
export const OTHERS_COLOR = '#9ca3af';
export const DEFAULT_CATEGORY_COLOR = '#94a3b8';

export interface ChartSegment {
  id: string;
  label: string;
  color: string;
  percentage: number;
  amount: number;
  /** Début de la part sur l'anneau, entre 0 et 1. */
  start: number;
  /** Taille de la part sur l'anneau, entre 0 et 1. */
  size: number;
}

export interface AllocationChart {
  segments: ChartSegment[];
  /** Part du revenu non répartie (null si tout est réparti ou dépassé). */
  unallocated: { percentage: number; amount: number } | null;
  totalPercentage: number;
  totalAmount: number;
  overAllocated: boolean;
}

export function buildAllocationChart(
  categories: CategoryWithAmount[],
  income: number,
): AllocationChart {
  const visible = categories.filter((c) => c.percentage > 0);
  const kept = keepLargest(visible, MAX_SEGMENTS);
  const folded = visible.filter((c) => !kept.includes(c));

  const parts = kept.map((c) => ({
    id: c.id,
    label: c.name,
    color: c.color || DEFAULT_CATEGORY_COLOR,
    percentage: c.percentage,
    amount: c.amount,
  }));
  if (folded.length > 0) {
    parts.push({
      id: OTHERS_ID,
      label: `Autres (${folded.length})`,
      color: OTHERS_COLOR,
      percentage: round2(folded.reduce((sum, c) => sum + c.percentage, 0)),
      amount: round2(folded.reduce((sum, c) => sum + c.amount, 0)),
    });
  }

  const totalPercentage = round2(parts.reduce((sum, p) => sum + p.percentage, 0));
  const scale = Math.max(100, totalPercentage);

  let start = 0;
  const segments = parts.map((part) => {
    const size = part.percentage / scale;
    const segment = { ...part, start, size };
    start += size;
    return segment;
  });

  const remaining = round2(100 - totalPercentage);
  return {
    segments,
    unallocated: remaining > 0 ? { percentage: remaining, amount: calculateAmount(income, remaining) } : null,
    totalPercentage,
    totalAmount: round2(parts.reduce((sum, p) => sum + p.amount, 0)),
    overAllocated: totalPercentage > 100,
  };
}

/** Garde les `max` plus grandes catégories (une place est réservée à
 * « Autres » s'il faut regrouper), dans leur ordre d'origine. */
function keepLargest(categories: CategoryWithAmount[], max: number): CategoryWithAmount[] {
  if (categories.length <= max) return categories;
  const largest = new Set(
    [...categories].sort((a, b) => b.percentage - a.percentage).slice(0, max - 1),
  );
  return categories.filter((c) => largest.has(c));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
