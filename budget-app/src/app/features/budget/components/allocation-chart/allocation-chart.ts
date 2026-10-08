import { Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { CategoryWithAmount } from '../../services/budget.service';
import { buildAllocationChart, ChartSegment } from '../../services/allocation-chart';

/** Rayon et épaisseur de l'anneau, dans le repère SVG 200×200. */
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Espace (couleur du fond) entre deux parts, en unités SVG. */
const GAP = 2;

@Component({
  selector: 'app-allocation-chart',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './allocation-chart.html',
  styleUrl: './allocation-chart.css',
})
export class AllocationChart {
  categories = input.required<CategoryWithAmount[]>();
  income = input.required<number>();

  protected readonly radius = RADIUS;
  protected readonly chart = computed(() => buildAllocationChart(this.categories(), this.income()));

  /** Part survolée ou touchée : son détail s'affiche au centre de l'anneau. */
  protected readonly activeId = signal<string | null>(null);
  protected readonly active = computed(
    () => this.chart().segments.find((s) => s.id === this.activeId()) ?? null,
  );

  protected readonly ariaLabel = computed(() => {
    const parts = this.chart().segments.map((s) => `${s.label} ${formatPercent(s.percentage)} %`);
    const unallocated = this.chart().unallocated;
    if (unallocated) parts.push(`non réparti ${formatPercent(unallocated.percentage)} %`);
    return `Répartition du revenu : ${parts.join(', ')}.`;
  });

  /** Tracé d'une part : un arc de cercle obtenu avec stroke-dasharray. */
  protected dash(segment: ChartSegment): { array: string; offset: number } {
    const needsGap = this.chart().segments.length > 1 || this.chart().unallocated !== null;
    const length = Math.max(segment.size * CIRCUMFERENCE - (needsGap ? GAP : 0), 0.5);
    return { array: `${length} ${CIRCUMFERENCE}`, offset: -segment.start * CIRCUMFERENCE };
  }

  /** Survol, focus clavier ou toucher. Au toucher, le navigateur envoie un
   * survol puis un clic : les deux doivent sélectionner (et non alterner). */
  protected setActive(id: string | null): void {
    this.activeId.set(id);
  }
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}
