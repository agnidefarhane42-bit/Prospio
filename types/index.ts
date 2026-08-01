// Types alignés sur le schéma Prisma / API réelle

export type ProspectStatus = 'new' | 'visited' | 'messaged' | 'replied' | 'connected' | 'email_sent';

export type ProfileType = 'Founder' | 'CEO' | 'CTO' | 'Investor' | 'Product Manager' | 'Developer';

/**
 * Prospect tel que retourné par l'API (Prisma).
 * Les champs sont en camelCase côté API grâce au map Prisma.
 */
export interface Prospect {
  id: number;
  name: string;
  email?: string | null;
  profileUrl: string;
  profileType: string | null;
  headline: string | null;
  company: string | null;
  location: string | null;
  status: ProspectStatus;
  messageText: string | null;
  messageSent: boolean;
  visitDate: string | null;
  notes: string | null;
  intentScore: number | null;
  signals: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: number;
  prospectId: number;
  subject: string;
  body: string;
  status: string;
  sentAt: string;
  prospect?: Prospect;
}

export interface Campaign {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'completed' | 'draft';
  channel: string;
  dailyVisitLimit: number;
  dailyMessageLimit: number;
  smartDelayMin: number;
  smartDelayMax: number;
  createdAt: string;
  updatedAt: string;
  steps?: Step[];
  prospects?: CampaignProspect[];
}

export interface Step {
  id: number;
  campaignId: number;
  order: number;
  type: string;
  channel: string;
  delayDays: number;
  template: string | null;
  createdAt: string;
}

export interface CampaignProspect {
  id: number;
  campaignId: number;
  prospectId: number;
  currentStep: number;
  status: string;
  addedAt: string;
  prospect?: Prospect;
}

export interface Activity {
  id: number;
  type: string | null;
  prospectId: number | null;
  campaignId: number | null;
  status: string;
  message: string | null;
  screenshot: string | null;
  createdAt: string;
}

export interface AISettings {
  tone: 'Professionnel' | 'Amical' | 'Direct' | 'Persuasif';
  length: 'Court' | 'Moyen' | 'Détaillé';
  persona: string;
}

export interface SettingsState {
  dailyVisitLimit: number;
  dailyMessageLimit: number;
  smartDelayMin: number;
  smartDelayMax: number;
  safeMode: boolean;
  aiPersona: string;
  aiTone: 'Professionnel' | 'Amical' | 'Direct' | 'Persuasif';
  linkedinEmail: string;
  appName: string;
  timezone: string;
}

/** Helper pour obtenir les initiales d'un nom */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';
}
