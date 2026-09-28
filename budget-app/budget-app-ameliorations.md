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
- Saisie d'une catégorie par somme fixe en euros, convertie automatiquement en pourcentage — fait côté ajout (`CategoryForm`)

## 🔧 En cours
- La même bascule %/€ à ajouter au formulaire d'édition d'une catégorie existante (`CategoryItem`)

## 💡 Idées reportées à plus tard
- Un vrai sélecteur d'icônes : bouton qui ouvre un panneau avec recherche, plus de choix qu'une simple liste fixe
- Case à cocher pour rendre le montant d'une catégorie réellement fixe (indépendant des changements de revenu futurs), plutôt que juste au moment de la saisie

## 📋 Autres idées non commencées
- Annuler une suppression (undo)
- Historique des revenus (suivi mois par mois)
- Graphiques de répartition (camembert)
- Objectifs d'épargne (montant cible + barre de progression)
- Export / import des données (JSON), utile comme filet de sécurité pour le localStorage
- Plusieurs budgets, puis plusieurs profils
- Authentification + synchronisation cloud
