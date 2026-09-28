import { Category } from './category.model';

export interface Budget {
  /** Non utilisé aujourd'hui (un seul budget géré), mais présent dès le
   * départ pour éviter un refactoring de migration quand le multi-budget
   * sera ajouté : chaque enregistrement stocké aura toujours besoin d'un
   * identifiant unique. */
  id: string;
  name: string;
  income: number;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export function createEmptyBudget(name = 'Mon budget'): Budget {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), name, income: 0, categories: [], createdAt: now, updatedAt: now };
}
