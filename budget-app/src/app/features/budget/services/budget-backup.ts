import { Budget } from '../models/budget.model';
import { Category } from '../models/category.model';

/**
 * Format du fichier de sauvegarde. Fonctions pures, comme budget-calculator.ts :
 * aucune dépendance Angular ni DOM.
 *
 * Le numéro de version permet de faire évoluer le format plus tard
 * (multi-budgets, historique…) tout en sachant relire les anciens fichiers.
 */
export const BACKUP_FORMAT = 'budgetpilot-backup';
export const BACKUP_VERSION = 1;

export interface BudgetBackup {
  format: typeof BACKUP_FORMAT;
  version: number;
  appVersion: string;
  exportedAt: string;
  budget: Budget;
}

export type BackupParseResult = { ok: true; backup: BudgetBackup } | { ok: false; error: string };

export function serializeBackup(budget: Budget, appVersion: string, now = new Date()): string {
  const backup: BudgetBackup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    appVersion,
    exportedAt: now.toISOString(),
    budget,
  };
  return JSON.stringify(backup, null, 2);
}

/** Nom du fichier exporté, ex : `budgetpilot-2026-10-08.json` (date locale). */
export function backupFileName(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `budgetpilot-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

/**
 * Lit et valide un fichier de sauvegarde. Un fichier invalide ne doit jamais
 * écraser les données existantes : on renvoie une erreur lisible à la place.
 */
export function parseBackup(text: string): BackupParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "Ce fichier n'est pas un fichier JSON valide." };
  }

  if (!isRecord(data) || data['format'] !== BACKUP_FORMAT) {
    return { ok: false, error: "Ce fichier n'est pas une sauvegarde BudgetPilot." };
  }
  if (typeof data['version'] !== 'number' || data['version'] > BACKUP_VERSION) {
    return {
      ok: false,
      error: 'Cette sauvegarde vient d’une version plus récente de BudgetPilot. Mets l’application à jour puis réessaie.',
    };
  }
  if (!isBudget(data['budget'])) {
    return { ok: false, error: 'La sauvegarde est incomplète ou corrompue.' };
  }

  return {
    ok: true,
    backup: {
      format: BACKUP_FORMAT,
      version: data['version'],
      appVersion: typeof data['appVersion'] === 'string' ? data['appVersion'] : '',
      exportedAt: typeof data['exportedAt'] === 'string' ? data['exportedAt'] : '',
      budget: data['budget'],
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isCategory(value: unknown): value is Category {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['name'] === 'string' &&
    isFiniteNumber(value['percentage']) &&
    isOptionalString(value['icon']) &&
    isOptionalString(value['color']) &&
    (value['fixedAmount'] === undefined || (isFiniteNumber(value['fixedAmount']) && value['fixedAmount'] >= 0)) &&
    typeof value['createdAt'] === 'string' &&
    typeof value['updatedAt'] === 'string'
  );
}

function isBudget(value: unknown): value is Budget {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['name'] === 'string' &&
    isFiniteNumber(value['income']) &&
    value['income'] >= 0 &&
    Array.isArray(value['categories']) &&
    value['categories'].every(isCategory) &&
    typeof value['createdAt'] === 'string' &&
    typeof value['updatedAt'] === 'string'
  );
}
