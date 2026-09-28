/**
 * Contrat que doit respecter tout mécanisme de stockage local
 * (localStorage aujourd'hui, IndexedDB ou un fichier plus tard).
 * Aucune partie de l'application ne doit dépendre directement de
 * `localStorage` : tout passe par cette interface.
 */
export interface PersistenceAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}
