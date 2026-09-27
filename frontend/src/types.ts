export interface HuntingZone {
  id: string;
  name: string;
  commune: string;
  description: string;
  coordinates: [number, number][]; // Polygone [lat, lng]
}

export type HuntStatus = 'ACTIVE' | 'PLANNED' | 'COMPLETED' | 'EXPIRED';

export interface HuntingSession {
  id: string;
  zoneId: string;
  zoneName: string;
  commune: string;
  societyName: string;
  status: HuntStatus;
  startTime: string; // ISO
  endTime?: string;
  autoTimeoutAt: string; // ISO
  coordinates: [number, number][]; // Polygone effectif
  notes?: string;
  leadHunterContact?: string;
}

export type ReportType = 'DOG_SIGHTING' | 'HUNTERS_PRESENT' | 'SHOTS_HEARD' | 'SIGN_POSTED';

export interface PublicReport {
  id: string;
  reportType: ReportType;
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  reportedAt: string; // ISO
  expiresAt: string; // ISO
  authorType: 'PROMENEUR' | 'CHASSEUR' | 'GARDE';
}
