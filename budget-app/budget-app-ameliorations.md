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

## ✅ Palette de couleurs
- Palette validée pour les daltoniens (bleu, rouge, jaune, vert, violet, turquoise), couleur libre proposée automatiquement à chaque ajout, anciennes couleurs converties automatiquement

## ✅ Annulation d'une suppression
- Bandeau « … supprimée — Annuler » pendant 8 s (pause au survol / focus), raccourci Ctrl/⌘+Z sur ordinateur, catégorie remise à sa place

## ✅ Sauvegarde
- Export / import des données en fichier JSON (partage iOS ou téléchargement, validation et confirmation avant import)

## ✅ Montant fixe
- Case « Montant fixe » en mode € (ajout et modification) : la catégorie garde son montant quand le revenu change, son pourcentage est recalculé ; cadenas affiché dans la liste

## ✅ Réorganisation des catégories
- Poignée ⠿ : glisser-déposer à la souris ou au doigt (appui bref), flèches ↑ ↓ au clavier avec annonce pour les lecteurs d'écran ; ordre repris dans le graphique

## 🗺️ Feuille de route (ordre choisi, une PR par étape)
1. ~~Montant fixe pour une catégorie~~ ✅
2. ~~Réordonner les catégories~~ ✅
3. Vrai sélecteur d'icônes : une quarantaine d'icônes avec recherche
4. Mode sombre : suit le réglage du système, couleurs du graphique revalidées sur fond sombre
5. Sauvegarde protégée : `navigator.storage.persist()` + « dernière sauvegarde il y a N jours » avec rappel
6. Aperçu avant import : revenu et catégories du fichier avant de remplacer le budget
7. Récapitulatif imprimable / PDF du budget
8. Compte et synchronisation iPhone ↔ ordinateur (Firebase)
9. Dépenses réelles vs prévues par catégorie, sur le mois
10. Historique mois par mois (copie du mois précédent, évolution du revenu)
11. Objectifs d'épargne (montant cible, barre de progression, mois restants)
12. Plusieurs budgets (« Perso », « Couple »…)

## 📋 Idées techniques
- Passage à IndexedDB (via `STORAGE_ADAPTER`, un seul endroit à changer)
