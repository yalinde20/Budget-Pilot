# BudgetPilot

Application (PWA) pour répartir son revenu mensuel en catégories, en pourcentage ou en euros.
Elle s'installe sur iPhone comme sur ordinateur et fonctionne hors-ligne. Les données restent
sur l'appareil (`localStorage`).

Stack : Angular 20 (composants standalone, signals), Tailwind CSS 4, `@angular/service-worker`,
hébergement Firebase Hosting (projet `budgetpilot-244fb`).

## Développement

```bash
npm ci
npm start          # http://localhost:4200 (le service worker est désactivé en dev)
npm test           # tests unitaires (Karma, navigateur Chrome)
npm run test:ci    # tests unitaires sans interface, comme en CI
npm run build      # build de production dans dist/budget-app/browser
```

Pour tester la PWA (service worker, hors-ligne, installation), il faut le build de production :

```bash
npm run build && npx http-server dist/budget-app/browser -p 8080
```

## Installer l'application

- **iPhone / iPad** : ouvrir l'URL dans **Safari** → bouton **Partager** → **« Sur l'écran d'accueil »**.
  L'app s'ouvre ensuite en plein écran, sans barre Safari.
  ⚠️ Les données de l'app installée sont séparées de celles de Safari.
- **Ordinateur** (Chrome, Edge) : icône d'installation dans la barre d'adresse, ou menu → « Installer BudgetPilot ».
  Sur Safari macOS : Fichier → « Ajouter au Dock ».

Quand une nouvelle version est déployée, un bandeau « Une nouvelle version est disponible » propose
de mettre à jour. La version installée est affichée en bas de page.

## Versions et releases (release-please)

Les versions sont gérées automatiquement par [release-please](https://github.com/googleapis/release-please)
à partir des messages de commit, qui doivent suivre les
[Conventional Commits](https://www.conventionalcommits.org/fr/) :

| Préfixe                         | Effet sur la version (avant 1.0.0) | Exemple                                       |
| ------------------------------- | ---------------------------------- | --------------------------------------------- |
| `fix:`                          | patch (0.1.0 → 0.1.1)              | `fix: corrige l'arrondi des montants`         |
| `feat:`                         | mineure (0.1.0 → 0.2.0)            | `feat: ajoute l'export JSON`                  |
| `feat!:` ou `BREAKING CHANGE:`  | mineure tant qu'on est en 0.x      | `feat!: nouveau format de stockage`           |
| `docs:`, `chore:`, `ci:`, `test:`, `refactor:` | aucune release      | `docs: met à jour le README`                  |

Fonctionnement :

1. À chaque push sur `master`, release-please ouvre (ou met à jour) une PR **« chore(master): release x.y.z »**
   avec le `CHANGELOG.md` et la nouvelle version (`package.json`, `src/app/core/version.ts`).
2. Quand cette PR est mergée, release-please crée le tag `vx.y.z` et la release GitHub.
3. La release déclenche automatiquement le déploiement sur Firebase Hosting.

Si tu merges des PR, utilise le « Squash and merge » avec un titre de PR au format conventionnel.

La configuration est à la racine du dépôt : `release-please-config.json` et `.release-please-manifest.json`.

### Configuration GitHub à faire une fois

1. **Autoriser release-please à ouvrir des PR** : *Settings → Actions → General → Workflow permissions* →
   cocher **« Allow GitHub Actions to create and approve pull requests »**.
2. **Secret Firebase** pour le déploiement : créer le secret `FIREBASE_SERVICE_ACCOUNT`
   (*Settings → Secrets and variables → Actions*). Le plus simple :
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase init hosting:github   # crée le compte de service et le secret automatiquement
   ```
   (`firebase init` propose aussi de générer des workflows : ils ne sont pas nécessaires, ceux du dépôt suffisent.)
3. *(Optionnel)* Les PR créées par release-please avec le `GITHUB_TOKEN` ne déclenchent pas la CI.
   Pour la lancer dessus, utiliser un token personnel (secret passé en `token:` dans
   `.github/workflows/release-please.yml`).

## Intégration continue

- `.github/workflows/ci.yml` : build + tests unitaires sur chaque PR et chaque push sur `master`.
- `.github/workflows/release-please.yml` : PR de release, tag, puis déploiement Firebase (canal `live`).

## Organisation du code

```
src/app/
  core/                 # transverse : stockage, version, mises à jour PWA
  shared/components/    # composants réutilisables (icônes SVG)
  features/budget/      # fonctionnalité budget (composants, services, modèles)
```

Les calculs (`budget-calculator.ts`) et validations (`category-validator.ts`) sont des fonctions
pures, sans dépendance Angular, testées unitairement.
