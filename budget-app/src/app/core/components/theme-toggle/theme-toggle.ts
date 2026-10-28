import { Component, inject } from '@angular/core';
import { ThemePreference, ThemeService } from '../../services/theme.service';
import { Icon } from '../../../shared/components/icon/icon';

/** Sélecteur de thème : automatique (comme le système), clair ou sombre. */
@Component({
  selector: 'app-theme-toggle',
  imports: [Icon],
  templateUrl: './theme-toggle.html',
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);

  protected readonly options: readonly { value: ThemePreference; icon: string; label: string }[] = [
    { value: 'system', icon: 'contrast', label: 'Thème automatique (comme le système)' },
    { value: 'light', icon: 'sun', label: 'Thème clair' },
    { value: 'dark', icon: 'moon', label: 'Thème sombre' },
  ];
}
