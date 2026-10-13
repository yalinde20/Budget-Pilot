import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconPicker } from './icon-picker';

@Component({
  imports: [IconPicker],
  template: `<div (keydown.escape)="parentEscapes = parentEscapes + 1"><app-icon-picker [(value)]="icon" /></div>`,
})
class Host {
  icon = signal('ti-home');
  parentEscapes = 0;
}

describe('IconPicker', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = () => el.querySelector<HTMLButtonElement>('button[aria-expanded]')!;
    const options = () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="group"] button'));
    return { fixture, el, toggle, options };
  }

  it('affiche l’icône choisie et ouvre la grille au clic', () => {
    const { fixture, toggle, options } = setup();
    expect(toggle().textContent).toContain('Logement');
    expect(toggle().getAttribute('aria-expanded')).toBe('false');

    toggle().click();
    fixture.detectChanges();

    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(options().length).toBeGreaterThan(40);
  });

  it('filtre avec la recherche puis met à jour la valeur et se referme', () => {
    const { fixture, el, toggle, options } = setup();
    toggle().click();
    fixture.detectChanges();

    const search = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = 'voiture';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(options().map((b) => b.getAttribute('aria-label'))).toContain('Voiture');

    options().find((b) => b.getAttribute('aria-label') === 'Voiture')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.icon()).toBe('ti-car');
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().textContent).toContain('Voiture');
  });

  it('indique quand aucune icône ne correspond', () => {
    const { fixture, el, toggle } = setup();
    toggle().click();
    fixture.detectChanges();
    const search = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = 'xyzabc';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.textContent).toContain('Aucune icône pour « xyzabc »');
  });

  it('se referme avec Échap sans fermer le formulaire parent', () => {
    const { fixture, el, toggle } = setup();
    toggle().click();
    fixture.detectChanges();

    el.querySelector('input[type="search"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.parentEscapes).toBe(0);
  });
});
