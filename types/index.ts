export type ProspectStatus = 'new' | 'visited' | 'messaged' | 'replied' | 'connected';

export type ProfileType = 'Founder' | 'CEO' | 'CTO' | 'Investor' | 'Product Manager' | 'Developer';

export interface Prospect {
  id: string;
  name: string;
  avatarInitials: string;
  headline: string;
  company: string;
  location: string;
  profileType: ProfileType;
  status: ProspectStatus;
  intentScore: number; // 0 to 100
  linkedinUrl: string;
  email?: string;
  bio?: string;
  generatedMessage?: string;
  campaignId?: string;
  currentCampaignStep?: number;
  timeline: {
    visitedAt?: string;
    messagedAt?: string;
    repliedAt?: string;
    connectedAt?: string;
  };
}

export interface SequenceStep {
  id: string;
  stepNumber: number;
  type: 'visit' | 'connect' | 'message' | 'followup';
  title: string;
  description: string;
  delayHours: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  channel: 'linkedin' | 'email' | 'multi';
  completedProspects: number;
  totalProspects: number;
  dailyVisitLimit: number;
  dailyMessageLimit: number;
  stepCount: number;
  responseRate: number; // percentage
  steps: SequenceStep[];
  prospects: Prospect[];
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
  geminiApiKey: string;
  aiPersona: string;
  aiTone: 'Professionnel' | 'Amical' | 'Direct' | 'Persuasif';
  linkedinEmail: string;
  linkedinPassword: string;
  appName: string;
  timezone: string;
}
