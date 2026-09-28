import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection, isDevMode
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { STORAGE_ADAPTER } from './core/tokens/storage.token';
import { LocalStorageAdapterService } from './core/services/local-storage-adapter.service';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideServiceWorker } from '@angular/service-worker';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Seul endroit de l'app où l'implémentation concrète du stockage est choisie.
    // Pour basculer vers IndexedDB plus tard : remplacer LocalStorageAdapterService
    // par la nouvelle classe ici, et nulle part ailleurs.
    { provide: STORAGE_ADAPTER, useClass: LocalStorageAdapterService },
    { provide: LOCALE_ID, useValue: 'fr-FR' }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
