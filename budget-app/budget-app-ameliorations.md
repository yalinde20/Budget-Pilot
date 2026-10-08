# Budget App — Suivi des améliorations

## ✅ MVP (terminé)
- Saisie du revenu
- Ajout / modification / suppression de catégories
- Calcul automatique des montants par catégorie
- Bandeau d'alerte de répartition (non bloquant si le total ≠ 100 %)
- Persistance locale (localStorage)
- Habillage visuel Tailwind

## ✅ Améliorations réalisées
- Formatage monétaire (locale fr-FR, pipe `currency`)
- Validation des formulaires (nom obligatoire, pourcentage entre 0 et 100)
- Icônes et couleurs par catégorie (palette fixe)
- Saisie d'une catégorie par somme fixe en euros, convertie automatiquement en pourcentage, à l'ajout (`CategoryForm`) et à l'édition (`CategoryItem`)

## ✅ PWA iPhone + ordinateur
- Icônes embarquées en SVG (plus de CDN) : fonctionne entièrement hors-ligne
- Clavier décimal iOS, virgule acceptée dans les montants
- Pas de zoom automatique sur les champs (police 16px sur mobile)
- Zones sûres (encoche, barre d'accueil), icône d'écran d'accueil iOS, manifest complet
- Bandeau « nouvelle version disponible » et numéro de version affiché
- Mise en page deux colonnes sur ordinateur, validation au clavier (Entrée / Échap)
- Versions automatiques avec release-please, CI et déploiement Firebase à chaque release

## ✅ Graphique de répartition
- Anneau (camembert) des catégories avec légende chiffrée, détail au survol / toucher, regroupement « Autres » au-delà de 6 parts, part non répartie visible

## ✅ Sauvegarde
- Export / import des données en fichier JSON (partage iOS ou téléchargement, validation et confirmation avant import)

## 💡 Idées reportées à plus tard
- Un vrai sélecteur d'icônes : bouton qui ouvre un panneau avec recherche, plus de choix qu'une simple liste fixe
- Case à cocher pour rendre le montant d'une catégorie réellement fixe (indépendant des changements de revenu futurs), plutôt que juste au moment de la saisie

## 📋 Autres idées non commencées
- Demander un stockage persistant (`navigator.storage.persist()`)
- Annuler une suppression (undo)
- Historique des revenus (suivi mois par mois)
- Palette de couleurs des catégories plus lisible pour les daltoniens (le rose et le violet actuels sont trop proches, le vert foncé trop terne)
- Objectifs d'épargne (montant cible + barre de progression)
- Mode sombre
- Passage à IndexedDB (via `STORAGE_ADAPTER`, un seul endroit à changer)
- Plusieurs budgets, puis plusieurs profils
- Authentification + synchronisation cloud
