import { TestBed } from '@angular/core/testing';
import { ThemeToggle } from './theme-toggle';
import { STORAGE_ADAPTER } from '../../tokens/storage.token';
import { InMemoryStorageAdapter } from '../../testing/in-memory-storage-adapter';
import { ThemeService } from '../../services/theme.service';

describe('ThemeToggle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ThemeToggle],
      providers: [{ provide: STORAGE_ADAPTER, useValue: new InMemoryStorageAdapter() }],
    });
  });

  afterEach(() => document.documentElement.classList.remove('dark'));

  it('indique le thème choisi et le change au clic', () => {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    const pressed = () => buttons.map((b) => b.getAttribute('aria-pressed'));

    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Thème automatique (comme le système)',
      'Thème clair',
      'Thème sombre',
    ]);
    expect(pressed()).toEqual(['true', 'false', 'false']);

    buttons[2].click();
    fixture.detectChanges();
    expect(pressed()).toEqual(['false', 'false', 'true']);
    expect(TestBed.inject(ThemeService).isDark()).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
  });
});
