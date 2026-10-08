import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, fromEvent } from 'rxjs';

/**
 * Détecte les nouvelles versions déployées via le service worker.
 * Le service worker télécharge la nouvelle version en arrière-plan ; ce
 * service expose un signal pour proposer à l'utilisateur de recharger.
 */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly document = inject(DOCUMENT);

  readonly updateAvailable = signal(false);

  constructor() {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.updateAvailable.set(true));

    // Le cache du service worker est dans un état irrécupérable (ex : fichiers
    // supprimés du serveur) : seul un rechargement complet répare l'app.
    this.swUpdate.unrecoverable.pipe(takeUntilDestroyed()).subscribe(() => this.reload());

    // Sur iPhone, une PWA installée reprend là où elle en était sans jamais
    // recharger la page : on vérifie donc à chaque retour au premier plan.
    fromEvent(this.document, 'visibilitychange')
      .pipe(
        filter(() => this.document.visibilityState === 'visible'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.checkForUpdate());
  }

  async applyUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
    } finally {
      this.reload();
    }
  }

  private checkForUpdate(): void {
    // Hors-ligne, la vérification échoue : ce n'est pas une erreur pour l'utilisateur.
    this.swUpdate.checkForUpdate().catch(() => undefined);
  }

  private reload(): void {
    this.document.location.reload();
  }
}
