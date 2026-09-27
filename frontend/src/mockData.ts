import type { HuntingZone, HuntingSession, PublicReport } from './types';

// Zones de référence (ex. Forêt domaniale de Grésigne / Massifs du Tarn & Aveyron)
export const INITIAL_ZONES: HuntingZone[] = [
  {
    id: 'zone-gresigne-nord',
    name: 'Massif Nord Grésigne - Combe Longue',
    commune: 'Puycelsi',
    description: 'Zone boisée dense, vallons rocheux et sentiers de randonnée.',
    coordinates: [
      [43.998, 1.705],
      [44.015, 1.725],
      [44.012, 1.765],
      [43.985, 1.755],
      [43.980, 1.715]
    ]
  },
  {
    id: 'zone-cantaranne-vallee',
    name: 'Vallée du Rieupeyroux / Cantaranne',
    commune: 'Privezac',
    description: 'Bocages, lisières et chemins ruraux partagés.',
    coordinates: [
      [44.405, 2.185],
      [44.425, 2.195],
      [44.420, 2.235],
      [44.395, 2.225],
      [44.398, 2.190]
    ]
  },
  {
    id: 'zone-gaillac-coteaux',
    name: 'Coteaux & Forêt de Sivens',
    commune: 'Castelnau-de-Montmiral',
    description: 'Parcours VTT et sentiers équestres.',
    coordinates: [
      [43.955, 1.815],
      [43.975, 1.835],
      [43.968, 1.875],
      [43.945, 1.860],
      [43.948, 1.820]
    ]
  }
];

// Sessions de battues initiales (1 Active, 1 Planifiée)
const now = new Date();
const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const tomorrowEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000);

export const INITIAL_SESSIONS: HuntingSession[] = [
  {
    id: 'session-live-01',
    zoneId: 'zone-gresigne-nord',
    zoneName: 'Massif Nord Grésigne - Combe Longue',
    commune: 'Puycelsi',
    societyName: 'ACCA Puycelsi & Environs',
    status: 'ACTIVE',
    startTime: now.toISOString(),
    autoTimeoutAt: fourHoursLater.toISOString(),
    coordinates: INITIAL_ZONES[0].coordinates,
    notes: 'Battue au grand gibier (sangliers). Chiens courants au travail. Éviter le sentier des crêtes.',
    leadHunterContact: '06.12.34.56.78'
  },
  {
    id: 'session-plan-02',
    zoneId: 'zone-cantaranne-vallee',
    zoneName: 'Vallée du Rieupeyroux / Cantaranne',
    commune: 'Privezac',
    societyName: 'Société de Chasse Cantaranne',
    status: 'PLANNED',
    startTime: tomorrow.toISOString(),
    endTime: tomorrowEnd.toISOString(),
    autoTimeoutAt: tomorrowEnd.toISOString(),
    coordinates: INITIAL_ZONES[1].coordinates,
    notes: 'Battue chevreuils programmée pour demain matin de 08h00 à 13h00.',
    leadHunterContact: '06.98.76.54.32'
  }
];

export const INITIAL_REPORTS: PublicReport[] = [
  {
    id: 'rep-01',
    reportType: 'DOG_SIGHTING',
    description: 'Chien de chasse de type Beagle avec collier fluo orange aperçu seul sur le chemin communal.',
    latitude: 44.002,
    longitude: 1.730,
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
    reportedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
    authorType: 'PROMENEUR'
  },
  {
    id: 'rep-02',
    reportType: 'SIGN_POSTED',
    description: 'Panneau "Chasse en cours" déployé à l\'intersection du sentier balisé PR jaune.',
    latitude: 43.991,
    longitude: 1.722,
    reportedAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
    authorType: 'PROMENEUR'
  }
];
