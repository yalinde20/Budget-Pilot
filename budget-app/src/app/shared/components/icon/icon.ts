import { Component, computed, input } from '@angular/core';
import { ICON_PATHS } from './icon-paths';

const FALLBACK_ICON = 'tag';

/**
 * Icône SVG décorative. Accepte le nom Tabler avec ou sans préfixe `ti-`
 * (les catégories déjà enregistrées stockent par exemple `ti-home`).
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
         [attr.width]="size()" [attr.height]="size()">
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
})
export class Icon {
  name = input.required<string>();
  size = input<number>(20);

  paths = computed(() => {
    const key = this.name().replace(/^ti-/, '');
    return ICON_PATHS[key] ?? ICON_PATHS[FALLBACK_ICON];
  });
}
