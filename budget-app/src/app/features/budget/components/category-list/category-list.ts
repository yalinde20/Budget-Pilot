import { Component, ElementRef, Injector, afterNextRender, inject, input, output, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { CategoryItem } from '../category-item/category-item';
import { CategoryWithAmount } from '../../services/budget.service';
import { CategoryDraft } from '../../models/category.model';

@Component({
  selector: 'app-category-list',
  imports: [CategoryItem, CdkDropList, CdkDrag],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  categoryList = input.required<CategoryWithAmount[]>();
  categoryRemoved = output<string>();
  categoryUpdated = output<{ id: string; changes: Partial<CategoryDraft> }>();
  /** Glisser-déposer : positions de départ et d'arrivée. */
  categoryMoved = output<{ fromIndex: number; toIndex: number }>();
  /** Clavier : déplacer cette catégorie d'un cran (-1 haut, +1 bas). */
  categoryNudged = output<{ id: string; offset: number }>();
  income = input.required<number>();

  /** Message lu par les lecteurs d'écran après un déplacement. */
  readonly moveAnnouncement = signal('');

  onDrop(event: CdkDragDrop<CategoryWithAmount[]>): void {
    const list = this.categoryList();
    const moved = list[event.previousIndex];
    if (!moved || event.previousIndex === event.currentIndex) return;
    this.categoryMoved.emit({ fromIndex: event.previousIndex, toIndex: event.currentIndex });
    this.announceAfterRender(moved.id, false);
  }

  /** Déplacement au clavier (flèches sur la poignée). */
  onMoveBy(id: string, offset: number): void {
    this.categoryNudged.emit({ id, offset });
    this.announceAfterRender(id, true);
  }

  /** Une fois la liste réaffichée : annonce la nouvelle position aux lecteurs
   * d'écran et, au clavier, remet le focus sur la poignée déplacée (le
   * réordonnancement du DOM le fait perdre). */
  private announceAfterRender(id: string, keepFocus: boolean): void {
    afterNextRender(
      () => {
        const list = this.categoryList();
        const index = list.findIndex((c) => c.id === id);
        if (index === -1) return;
        this.moveAnnouncement.set(`${list[index].name} déplacée en position ${index + 1} sur ${list.length}.`);
        if (keepFocus) {
          this.host.nativeElement.querySelector<HTMLElement>(`[data-drag-handle="${id}"]`)?.focus();
        }
      },
      { injector: this.injector },
    );
  }
}
