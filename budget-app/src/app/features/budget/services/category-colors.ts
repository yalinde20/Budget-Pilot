import { Budget } from '../models/budget.model';

/**
 * Palette des catégories, validée pour les daltoniens avec le script du guide
 * de visualisation (`validate_palette.js`), sur toutes les paires puisque
 * l'utilisateur peut associer n'importe quelles couleurs :
 * - vision normale : écart minimal 15,6 (seuil 15) ;
 * - daltonisme : écart minimal 6,9, admis car le graphique ne repose jamais
 *   sur la seule couleur (légende chiffrée, espaces entre les parts) ;
 * - dans l'ordre ci-dessous, deux couleurs voisines (anneau bouclé compris)
 *   sont séparées d'au moins 15,3 : c'est l'ordre des suggestions.
 */
export const CATEGORY_COLORS = [
  { value: '#2a78d6', label: 'Bleu' },
  { value: '#e34948', label: 'Rouge' },
  { value: '#eda100', label: 'Jaune' },
  { value: '#008300', label: 'Vert' },
  { value: '#4a3aa7', label: 'Violet' },
  { value: '#1baf7a', label: 'Turquoise' },
] as const;

/** Anciennes couleurs (jusqu'à la v1.2.0) → couleur la plus proche de la palette actuelle. */
const LEGACY_COLORS: Record<string, string> = {
  '#378add': '#2a78d6', // Bleu
  '#d4537e': '#e34948', // Rose → Rouge
  '#e08e45': '#eda100', // Orange → Jaune
  '#639922': '#008300', // Vert
  '#b45ac9': '#4a3aa7', // Violet
  '#0f6e56': '#1baf7a', // Vert foncé → Turquoise
};

/**
 * Couleur proposée pour une nouvelle catégorie : la première couleur de la
 * palette la moins utilisée, pour que deux catégories voisines diffèrent.
 */
export function suggestCategoryColor(usedColors: readonly (string | undefined)[]): string {
  const usage = (value: string) =>
    usedColors.filter((c) => c?.toLowerCase() === value.toLowerCase()).length;
  const minUsage = Math.min(...CATEGORY_COLORS.map((c) => usage(c.value)));
  return CATEGORY_COLORS.find((c) => usage(c.value) === minUsage)!.value;
}

/**
 * Remplace les anciennes couleurs par celles de la palette actuelle, pour les
 * budgets enregistrés avant la v1.3.0 ou importés depuis une ancienne sauvegarde.
 * Renvoie le même objet si rien ne change.
 */
export function migrateLegacyColors(budget: Budget): Budget {
  const needsMigration = budget.categories.some((c) => c.color && LEGACY_COLORS[c.color.toLowerCase()]);
  if (!needsMigration) return budget;
  return {
    ...budget,
    categories: budget.categories.map((c) => {
      const replacement = c.color ? LEGACY_COLORS[c.color.toLowerCase()] : undefined;
      return replacement ? { ...c, color: replacement } : c;
    }),
  };
}
