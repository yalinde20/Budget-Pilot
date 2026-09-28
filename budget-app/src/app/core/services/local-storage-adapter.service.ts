import { Injectable } from '@angular/core';
import { PersistenceAdapter } from '../models/persistence-adapter.interface';

@Injectable({ providedIn: 'root' })
export class LocalStorageAdapterService implements PersistenceAdapter {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Donnée corrompue ou format inattendu : on ignore plutôt que de planter l'app.
      console.warn(`Impossible de lire la clé "${key}" depuis le stockage local.`);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
