import { DOCUMENT, DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_ADAPTER } from '../tokens/storage.token';

/** Choix de l'utilisateur : suivre le système, ou forcer clair / sombre. */
export type ThemePreference = 'system' | 'light' | 'dark';

/** Clé partagée avec le script de `index.html`, qui applique le thème avant
 * le démarrage d'Angular (sinon l'écran clignote en clair). */
export const THEME_STORAGE_KEY = 'theme';

/** Couleur de la barre d'état (meta theme-color) : fond de page de chaque thème,
 * gray-50 et gray-950 de Tailwind. À garder identique dans `index.html`. */
export const THEME_COLORS = { light: '#f9fafb', dark: '#030712' } as const;

const DARK_QUERY = '(prefers-color-scheme: dark)';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(STORAGE_ADAPTER);
  private readonly document = inject(DOCUMENT);

  readonly preference = signal<ThemePreference>(readPreference(this.storage.get<unknown>(THEME_STORAGE_KEY)));

  private readonly systemDark = signal(false);

  /** Thème réellement affiché. */
  readonly isDark = computed(
    () => this.preference() === 'dark' || (this.preference() === 'system' && this.systemDark()),
  );

  constructor() {
    const media = this.document.defaultView?.matchMedia?.(DARK_QUERY);
    if (media) {
      this.systemDark.set(media.matches);
      // Suit le réglage du système en direct (ex. passage auto au mode sombre le soir).
      const onChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
      media.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => media.removeEventListener('change', onChange));
    }

    effect(() => {
      const dark = this.isDark();
      this.document.documentElement.classList.toggle('dark', dark);
      this.document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light);
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    if (preference === 'system') {
      this.storage.remove(THEME_STORAGE_KEY);
    } else {
      this.storage.set(THEME_STORAGE_KEY, preference);
    }
  }
}

function readPreference(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}
