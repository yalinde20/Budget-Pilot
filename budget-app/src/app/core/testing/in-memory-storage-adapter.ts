import { PersistenceAdapter } from '../models/persistence-adapter.interface';

/** Stockage en mémoire pour les tests : ils ne touchent jamais au vrai localStorage. */
export class InMemoryStorageAdapter implements PersistenceAdapter {
  private readonly store = new Map<string, unknown>();

  get<T>(key: string): T | null {
    return (this.store.get(key) as T) ?? null;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}
