import { Category } from '../models/category.model';
import {
  calculateAmount,
  calculateRemainingPercentage,
  calculateTotalPercentage,
  effectiveAmount,
  effectivePercentage,
  formatDecimal,
  isOverAllocated,
  parseDecimal,
} from './budget-calculator';

function makeCategory(percentage: number): Category {
  return {
    id: crypto.randomUUID(),
    name: 'Test',
    percentage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('calculateAmount', () => {
  it("calcule le montant exact de l'exemple du cahier des charges", () => {
    expect(calculateAmount(2500, 35)).toBe(875);
    expect(calculateAmount(2500, 20)).toBe(500);
    expect(calculateAmount(2500, 15)).toBe(375);
    expect(calculateAmount(2500, 10)).toBe(250);
  });

  it('retourne 0 si le revenu est 0', () => {
    expect(calculateAmount(0, 50)).toBe(0);
  });

  it('évite les artefacts de virgule flottante', () => {
    expect(calculateAmount(1000, 33.33)).toBe(333.3);
  });
});

describe('calculateTotalPercentage', () => {
  it('additionne les pourcentages de toutes les catégories', () => {
    const categories = [makeCategory(35), makeCategory(20), makeCategory(15), makeCategory(10)];
    expect(calculateTotalPercentage(categories)).toBe(80);
  });

  it('retourne 0 pour une liste vide', () => {
    expect(calculateTotalPercentage([])).toBe(0);
  });
});

describe('calculateRemainingPercentage', () => {
  it('retourne le pourcentage restant à répartir', () => {
    expect(calculateRemainingPercentage([makeCategory(80)])).toBe(20);
  });

  it('retourne un nombre négatif en cas de dépassement (pour affichage du dépassement)', () => {
    expect(calculateRemainingPercentage([makeCategory(60), makeCategory(60)])).toBe(-20);
  });
});

describe('isOverAllocated', () => {
  it('renvoie false si le total est inférieur ou égal à 100', () => {
    expect(isOverAllocated([makeCategory(100)])).toBe(false);
    expect(isOverAllocated([makeCategory(80)])).toBe(false);
  });

  it('renvoie true si le total dépasse 100', () => {
    expect(isOverAllocated([makeCategory(60), makeCategory(60)])).toBe(true);
  });
});

describe('parseDecimal', () => {
  it('accepte la virgule et le point comme séparateur décimal', () => {
    expect(parseDecimal('12,5')).toBe(12.5);
    expect(parseDecimal('12.5')).toBe(12.5);
  });

  it('ignore les espaces (dont les espaces insécables du format français)', () => {
    expect(parseDecimal(' 2 500 ')).toBe(2500);
    expect(parseDecimal('2\u202f500,50')).toBe(2500.5);
  });

  it('accepte une saisie en cours de frappe', () => {
    expect(parseDecimal('12,')).toBe(12);
    expect(parseDecimal(',5')).toBe(0.5);
  });

  it('renvoie 0 pour une saisie vide et NaN pour une saisie invalide', () => {
    expect(parseDecimal('')).toBe(0);
    expect(parseDecimal('abc')).toBeNaN();
    expect(parseDecimal('1,2,3')).toBeNaN();
  });
});

describe('formatDecimal', () => {
  it('affiche la virgule française', () => {
    expect(formatDecimal(12.5)).toBe('12,5');
    expect(formatDecimal(2500)).toBe('2500');
  });

  it('renvoie une chaîne vide pour 0 ou une valeur invalide', () => {
    expect(formatDecimal(0)).toBe('');
    expect(formatDecimal(NaN)).toBe('');
  });
});

describe('effectivePercentage / effectiveAmount', () => {
  const base = { id: 'c', name: 'Loyer', percentage: 30, createdAt: '', updatedAt: '' };

  it('utilise le pourcentage saisi pour une catégorie classique', () => {
    expect(effectivePercentage(base, 2000)).toBe(30);
    expect(effectiveAmount(base, 2000)).toBe(600);
  });

  it('garde le montant fixe et recalcule le pourcentage quand le revenu change', () => {
    const fixed = { ...base, fixedAmount: 600 };
    expect(effectiveAmount(fixed, 2000)).toBe(600);
    expect(effectivePercentage(fixed, 2000)).toBe(30);
    expect(effectiveAmount(fixed, 3000)).toBe(600);
    expect(effectivePercentage(fixed, 3000)).toBe(20);
  });

  it('vaut 0 % sans revenu, mais garde le montant fixe', () => {
    const fixed = { ...base, fixedAmount: 600 };
    expect(effectivePercentage(fixed, 0)).toBe(0);
    expect(effectiveAmount(fixed, 0)).toBe(600);
  });
});
