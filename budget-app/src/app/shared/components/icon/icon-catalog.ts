/**
 * Icônes proposées pour les catégories (Tabler, licence MIT), avec un
 * libellé et des mots-clés pour la recherche. L'identifiant `ti-…` est
 * celui enregistré dans les catégories (compatible avec les données existantes).
 */
export interface IconOption {
  id: string;
  label: string;
  keywords: readonly string[];
}

export const ICON_CATALOG: readonly IconOption[] = [
  { id: 'ti-home', label: 'Logement', keywords: ['maison', 'loyer', 'appartement', 'habitation'] },
  { id: 'ti-building', label: 'Immeuble', keywords: ['copropriete', 'charges', 'syndic'] },
  { id: 'ti-bolt', label: 'Électricité', keywords: ['energie', 'courant', 'edf'] },
  { id: 'ti-flame', label: 'Chauffage', keywords: ['gaz', 'chaleur'] },
  { id: 'ti-droplet', label: 'Eau', keywords: ['facture eau'] },
  { id: 'ti-wifi', label: 'Internet', keywords: ['box', 'fibre', 'adsl'] },
  { id: 'ti-device-mobile', label: 'Téléphone', keywords: ['mobile', 'forfait', 'portable', 'smartphone'] },
  { id: 'ti-salad', label: 'Alimentation', keywords: ['nourriture', 'repas', 'manger'] },
  { id: 'ti-shopping-cart', label: 'Courses', keywords: ['supermarche', 'epicerie', 'caddie'] },
  { id: 'ti-basket', label: 'Marché', keywords: ['panier', 'primeur'] },
  { id: 'ti-tools-kitchen-2', label: 'Restaurant', keywords: ['resto', 'sortie', 'repas'] },
  { id: 'ti-coffee', label: 'Café', keywords: ['boulangerie', 'pause'] },
  { id: 'ti-glass-full', label: 'Boissons', keywords: ['bar', 'verre', 'aperitif'] },
  { id: 'ti-car', label: 'Voiture', keywords: ['auto', 'vehicule', 'transport'] },
  { id: 'ti-gas-station', label: 'Carburant', keywords: ['essence', 'diesel', 'plein'] },
  { id: 'ti-bus', label: 'Transports en commun', keywords: ['bus', 'metro', 'navigo', 'transport'] },
  { id: 'ti-train', label: 'Train', keywords: ['sncf', 'tgv', 'transport'] },
  { id: 'ti-bike', label: 'Vélo', keywords: ['velo', 'trottinette', 'mobilite'] },
  { id: 'ti-plane', label: 'Voyages', keywords: ['avion', 'vol'] },
  { id: 'ti-beach', label: 'Vacances', keywords: ['plage', 'conges', 'sejour'] },
  { id: 'ti-heart', label: 'Santé', keywords: ['sante', 'bien-etre'] },
  { id: 'ti-pill', label: 'Pharmacie', keywords: ['medicaments', 'sante'] },
  { id: 'ti-stethoscope', label: 'Médecin', keywords: ['docteur', 'mutuelle', 'sante', 'consultation'] },
  { id: 'ti-dumbbell', label: 'Sport', keywords: ['salle', 'fitness', 'abonnement sport'] },
  { id: 'ti-baby-carriage', label: 'Enfants', keywords: ['bebe', 'creche', 'garde', 'nounou'] },
  { id: 'ti-school', label: 'École', keywords: ['ecole', 'scolarite', 'cantine', 'etudes'] },
  { id: 'ti-book', label: 'Livres', keywords: ['lecture', 'formation'] },
  { id: 'ti-ball-tennis', label: 'Loisirs', keywords: ['sport', 'activites', 'hobby'] },
  { id: 'ti-device-tv', label: 'Streaming', keywords: ['tele', 'netflix', 'abonnement', 'television'] },
  { id: 'ti-movie', label: 'Cinéma', keywords: ['film', 'sortie'] },
  { id: 'ti-music', label: 'Musique', keywords: ['spotify', 'concert'] },
  { id: 'ti-device-gamepad-2', label: 'Jeux vidéo', keywords: ['jeux', 'console', 'gaming'] },
  { id: 'ti-shirt', label: 'Vêtements', keywords: ['habits', 'mode', 'shopping'] },
  { id: 'ti-scissors', label: 'Coiffeur', keywords: ['beaute', 'soins', 'coiffure'] },
  { id: 'ti-paw', label: 'Animaux', keywords: ['chien', 'chat', 'veterinaire'] },
  { id: 'ti-gift', label: 'Cadeaux', keywords: ['anniversaire', 'noel', 'fetes'] },
  { id: 'ti-heart-handshake', label: 'Dons', keywords: ['association', 'charite', 'solidarite'] },
  { id: 'ti-pig-money', label: 'Épargne', keywords: ['economies', 'tirelire', 'livret'] },
  { id: 'ti-chart-line', label: 'Investissements', keywords: ['bourse', 'placement', 'actions'] },
  { id: 'ti-coin', label: 'Argent de poche', keywords: ['pieces', 'monnaie'] },
  { id: 'ti-cash', label: 'Espèces', keywords: ['liquide', 'retrait', 'billets'] },
  { id: 'ti-credit-card', label: 'Carte bancaire', keywords: ['cb', 'paiement'] },
  { id: 'ti-building-bank', label: 'Banque', keywords: ['credit', 'pret', 'frais bancaires', 'emprunt'] },
  { id: 'ti-receipt', label: 'Factures', keywords: ['abonnements', 'charges'] },
  { id: 'ti-shield', label: 'Assurances', keywords: ['assurance', 'protection', 'mutuelle'] },
  { id: 'ti-smoking-no', label: 'Tabac', keywords: ['cigarettes', 'vapoteuse'] },
  { id: 'ti-tag', label: 'Autre', keywords: ['divers', 'autres'] },
];

/** Minuscules sans accents, pour comparer « électricité » et « electricite ». */
export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Icônes dont le libellé ou un mot-clé contient la recherche. */
export function searchIcons(query: string, catalog: readonly IconOption[] = ICON_CATALOG): IconOption[] {
  const q = normalizeSearch(query);
  if (!q) return [...catalog];
  return catalog.filter((icon) =>
    [icon.label, ...icon.keywords].some((text) => normalizeSearch(text).includes(q)),
  );
}

/** Libellé d'une icône enregistrée (« Autre » si elle n'est pas au catalogue). */
export function iconLabel(id: string | undefined): string {
  return ICON_CATALOG.find((icon) => icon.id === id)?.label ?? 'Autre';
}
