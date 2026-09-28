export interface Category {
  id: string;
  name: string;
  /** Pourcentage attribué à la catégorie, de 0 à 100. La somme de toutes
   * les catégories n'est pas contrainte à 100 : l'utilisateur est averti
   * visuellement mais jamais bloqué (choix produit validé). */
  percentage: number;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

/** Champs fournis par l'utilisateur lors de la création d'une catégorie.
 * Les métadonnées (id, dates) sont générées par le service. */
export type CategoryDraft = Pick<Category, 'name' | 'percentage' | 'icon' | 'color'>;
