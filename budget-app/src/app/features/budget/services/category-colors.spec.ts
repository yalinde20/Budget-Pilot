import { Budget } from '../models/budget.model';
import { CATEGORY_COLORS, migrateLegacyColors, suggestCategoryColor } from './category-colors';

const [BLEU, ROUGE, JAUNE, VERT, VIOLET, TURQUOISE] = CATEGORY_COLORS.map((c) => c.value);

function budgetWith(colors: (string | undefined)[]): Budget {
  return {
    id: 'b',
    name: 'Mon budget',
    income: 2000,
    categories: colors.map((color, i) => ({
      id: `c${i}`,
      name: `Catégorie ${i}`,
      percentage: 10,
      color,
      createdAt: '',
      updatedAt: '',
    })),
    createdAt: '',
    updatedAt: '',
  };
}

describe('suggestCategoryColor', () => {
  it('propose les couleurs dans l’ordre de la palette, en évitant celles déjà prises', () => {
    expect(suggestCategoryColor([])).toBe(BLEU);
    expect(suggestCategoryColor([BLEU])).toBe(ROUGE);
    expect(suggestCategoryColor([BLEU, ROUGE, VERT])).toBe(JAUNE);
  });

  it('reprend la couleur la moins utilisée quand toutes sont prises', () => {
    const all = [BLEU, ROUGE, JAUNE, VERT, VIOLET, TURQUOISE];
    expect(suggestCategoryColor(all)).toBe(BLEU);
    expect(suggestCategoryColor([...all, BLEU])).toBe(ROUGE);
  });

  it('ignore la casse et les catégories sans couleur', () => {
    expect(suggestCategoryColor([BLEU.toUpperCase(), undefined])).toBe(ROUGE);
  });
});

describe('migrateLegacyColors', () => {
  it('remplace chaque ancienne couleur par la plus proche de la nouvelle palette', () => {
    const migrated = migrateLegacyColors(
      budgetWith(['#378ADD', '#639922', '#0F6E56', '#D4537E', '#B45AC9', '#E08E45']),
    );
    expect(migrated.categories.map((c) => c.color)).toEqual([BLEU, VERT, TURQUOISE, ROUGE, VIOLET, JAUNE]);
  });

  it('garde les couleurs actuelles, inconnues ou absentes', () => {
    const migrated = migrateLegacyColors(budgetWith(['#378add', BLEU, '#123456', undefined]));
    expect(migrated.categories.map((c) => c.color)).toEqual([BLEU, BLEU, '#123456', undefined]);
  });

  it('renvoie le même objet quand il n’y a rien à migrer', () => {
    const budget = budgetWith([BLEU, ROUGE]);
    expect(migrateLegacyColors(budget)).toBe(budget);
  });
});
