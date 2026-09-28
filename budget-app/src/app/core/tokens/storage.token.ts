import { InjectionToken } from '@angular/core';
import { PersistenceAdapter } from '../models/persistence-adapter.interface';

/**
 * Jeton d'injection : les services consomment ce jeton, jamais une classe
 * concrète. Le choix de l'implémentation (localStorage, IndexedDB, ...)
 * se fait à un seul endroit : `app.config.ts`.
 */
export const STORAGE_ADAPTER = new InjectionToken<PersistenceAdapter>('STORAGE_ADAPTER');
