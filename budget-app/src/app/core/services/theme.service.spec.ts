import { TestBed } from '@angular/core/testing';
import { STORAGE_ADAPTER } from '../tokens/storage.token';
import { InMemoryStorageAdapter } from '../testing/in-memory-storage-adapter';
import { THEME_COLORS, THEME_STORAGE_KEY, ThemeService } from './theme.service';

/** Réglage système simulé (prefers-color-scheme), modifiable pendant le test. */
function fakeSystemTheme(dark: boolean) {
  const listeners: ((event: MediaQueryListEvent) => void)[] = [];
  const media = {
    matches: dark,
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.push(listener),
    removeEventListener: () => {},
  };
  spyOn(window, 'matchMedia').and.returnValue(media as unknown as MediaQueryList);
  return (next: boolean) => {
    media.matches = next;
    listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
  };
}

describe('ThemeService', () => {
  let storage: InMemoryStorageAdapter;
  let meta: HTMLMetaElement;

  beforeEach(() => {
    storage = new InMemoryStorageAdapter();
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
    TestBed.configureTestingModule({ providers: [{ provide: STORAGE_ADAPTER, useValue: storage }] });
  });

  afterEach(() => {
    meta.remove();
    document.documentElement.classList.remove('dark');
  });

  function create(): ThemeService {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    return service;
  }

  it('suit le réglage du système par défaut, y compris quand il change', () => {
    const setSystemDark = fakeSystemTheme(false);
    const service = create();
    expect(service.preference()).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(meta.content).toBe(THEME_COLORS.light);

    setSystemDark(true);
    TestBed.tick();
    expect(service.isDark()).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(meta.content).toBe(THEME_COLORS.dark);
  });

  it('un choix forcé l’emporte sur le système et est mémorisé', () => {
    fakeSystemTheme(true);
    const service = create();

    service.setPreference('light');
    TestBed.tick();
    expect(service.isDark()).toBeFalse();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(storage.get(THEME_STORAGE_KEY)).toBe('light');

    service.setPreference('system');
    TestBed.tick();
    expect(service.isDark()).toBeTrue();
    expect(storage.get(THEME_STORAGE_KEY)).toBeNull();
  });

  it('reprend le choix enregistré et ignore une valeur inconnue', () => {
    fakeSystemTheme(false);
    storage.set(THEME_STORAGE_KEY, 'dark');
    expect(create().isDark()).toBeTrue();

    TestBed.resetTestingModule();
    storage.set(THEME_STORAGE_KEY, 'bleu');
    TestBed.configureTestingModule({ providers: [{ provide: STORAGE_ADAPTER, useValue: storage }] });
    expect(create().preference()).toBe('system');
  });
});
