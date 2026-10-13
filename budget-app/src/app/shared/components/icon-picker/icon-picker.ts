import { Component, ElementRef, computed, inject, model, signal, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';
import { iconLabel, searchIcons } from '../icon/icon-catalog';

let nextId = 0;

/**
 * Sélecteur d'icône : un bouton affiche l'icône choisie et ouvre un panneau
 * avec une recherche (« voiture », « loyer », « électricité »…) et la grille
 * des icônes. Valeur liée en double sens : `[(value)]="icon"`.
 */
@Component({
  selector: 'app-icon-picker',
  imports: [Icon],
  templateUrl: './icon-picker.html',
  host: {
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class IconPicker {
  private readonly document = inject(ElementRef).nativeElement.ownerDocument as Document;

  value = model.required<string>();

  protected readonly panelId = `icon-picker-${nextId++}`;
  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly results = computed(() => searchIcons(this.query()));
  protected readonly label = computed(() => iconLabel(this.value()));

  private readonly toggleButton = viewChild<ElementRef<HTMLButtonElement>>('toggleButton');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('search');

  protected toggle(): void {
    this.open.update((open) => !open);
    this.query.set('');
    // Au clavier / à la souris, on place le curseur dans la recherche. Sur
    // écran tactile, on évite d'ouvrir le clavier : la grille suffit souvent.
    if (this.open() && this.document.defaultView?.matchMedia('(pointer: fine)').matches) {
      setTimeout(() => this.searchInput()?.nativeElement.focus());
    }
  }

  protected select(id: string): void {
    this.value.set(id);
    this.close();
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onEscape(event: Event): void {
    if (!this.open()) return;
    // Échap ferme le panneau sans annuler la saisie du formulaire parent.
    event.stopPropagation();
    this.close();
  }

  private close(): void {
    this.open.set(false);
    this.toggleButton()?.nativeElement.focus();
  }
}
