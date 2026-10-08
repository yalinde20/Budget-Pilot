import { CategoryWithAmount } from './budget.service';
import { buildAllocationChart, DEFAULT_CATEGORY_COLOR, OTHERS_COLOR, OTHERS_ID } from './allocation-chart';

function cat(id: string, percentage: number, income = 2000, color?: string): CategoryWithAmount {
  return {
    id,
    name: id,
    percentage,
    amount: Math.round(income * percentage) / 100,
    color,
    createdAt: '',
    updatedAt: '',
  };
}

describe('buildAllocationChart', () => {
  it("place les parts dans l'ordre de la liste, sur une échelle de 100 %", () => {
    const chart = buildAllocationChart([cat('Loyer', 30, 2000, '#378ADD'), cat('Courses', 20)], 2000);

    expect(chart.segments.map((s) => [s.label, s.start, s.size])).toEqual([
      ['Loyer', 0, 0.3],
      ['Courses', 0.3, 0.2],
    ]);
    expect(chart.segments[0].color).toBe('#378ADD');
    expect(chart.segments[1].color).toBe(DEFAULT_CATEGORY_COLOR);
    expect(chart.unallocated).toEqual({ percentage: 50, amount: 1000 });
    expect(chart.totalPercentage).toBe(50);
    expect(chart.totalAmount).toBe(1000);
    expect(chart.overAllocated).toBeFalse();
  });

  it('ignore les catégories à 0 %', () => {
    const chart = buildAllocationChart([cat('A', 0), cat('B', 40)], 2000);
    expect(chart.segments.map((s) => s.id)).toEqual(['B']);
  });

  it("n'a pas de part non répartie quand tout est réparti", () => {
    expect(buildAllocationChart([cat('A', 60), cat('B', 40)], 2000).unallocated).toBeNull();
  });

  it('en cas de dépassement, l’anneau représente le total réparti', () => {
    const chart = buildAllocationChart([cat('A', 80), cat('B', 40)], 2000);

    expect(chart.overAllocated).toBeTrue();
    expect(chart.unallocated).toBeNull();
    const last = chart.segments[1];
    expect(last.start + last.size).toBeCloseTo(1, 10);
  });

  it('regroupe les plus petites catégories dans « Autres » au-delà de 6 parts', () => {
    const categories = [cat('A', 5), cat('B', 30), cat('C', 2), cat('D', 20), cat('E', 10), cat('F', 15), cat('G', 3)];
    const chart = buildAllocationChart(categories, 2000);

    expect(chart.segments.length).toBe(6);
    // Les 5 plus grandes gardent leur ordre d'origine.
    expect(chart.segments.map((s) => s.id)).toEqual(['A', 'B', 'D', 'E', 'F', OTHERS_ID]);
    const others = chart.segments[5];
    expect(others.label).toBe('Autres (2)');
    expect(others.percentage).toBe(5);
    expect(others.amount).toBe(100);
    expect(others.color).toBe(OTHERS_COLOR);
  });
});
