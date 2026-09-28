import { Category } from '../models/category.model';
import {
  calculateAmount,
  calculateRemainingPercentage,
  calculateTotalPercentage,
  isOverAllocated,
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
