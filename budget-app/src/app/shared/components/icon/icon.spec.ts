import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';
import { ICON_PATHS } from './icon-paths';

describe('Icon', () => {
  function render(name: string): HTMLElement {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('accepte le nom avec le préfixe ti- utilisé par les catégories enregistrées', () => {
    expect(render('ti-home').querySelectorAll('path').length).toBe(ICON_PATHS['home'].length);
  });

  it("affiche l'icône par défaut pour un nom inconnu", () => {
    expect(render('ti-inconnue').querySelectorAll('path').length).toBe(ICON_PATHS['tag'].length);
  });
});
