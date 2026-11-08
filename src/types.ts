export interface Lead {
  id: string;
  companyName: string;
  website: string;
  summary: string;
  potentialContactType: string;
  emailOrContact: string;
  leadQualityScore: "High" | "Medium" | "Low";
  intentScore: number;
  keyInsight?: string;
  suggestedAngle?: string;
}

export interface PitchData {
  email: {
    subject: string;
    previewText: string;
    body: string;
    callToAction: string;
    followUpHook: string;
  };
  linkedIn: {
    connectionNote: string;
    inMailSubject: string;
    inMailBody: string;
  };
  whatsApp: {
    messageText: string;
  };
  voiceScript: {
    phonePitchScript: string;
    voicemailDropScript: string;
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: "LEAD_SCANNER" | "DISPATCH_QUEUE" | "REPLY_MONITOR" | "TTS_GENERATOR" | "MANUAL_TRIGGER" | "SYSTEM";
  message: string;
  status: "SUCCESS" | "INFO" | "WARNING" | "ERROR";
  details?: any;
}

export interface CronJobInfo {
  id: string;
  name: string;
  schedule: string;
  status: string;
  description: string;
  lastRun: string;
  nextRun: string;
  totalRuns: number;
  leadsProcessed?: number;
  pitchesDispatched?: number;
  hotLeadsFlagged?: number;
}

export interface CompetitorData {
  competitorName: string;
  coreValueProp: string;
  estimatedTier: string;
  vulnerabilities: string[];
  counterPitchAngle: string;
  winningPunchline: string;
}

export interface DiagnosticsData {
  success: boolean;
  timestamp: string;
  executionTimeMs: number;
  gemini: {
    keyConfigured: boolean;
    maskedKey: string | null;
    status: "VALID" | "MISSING" | "INVALID";
    message: string;
    latencyMs: number;
    models: string[];
    fallbackActive: boolean;
  };
  serper: {
    keyConfigured: boolean;
    maskedKey: string | null;
    status: "VALID" | "OPTIONAL_NOT_CONFIGURED" | "INVALID";
    message: string;
    latencyMs: number;
    isOptional: boolean;
  };
  system: {
    uptimeSeconds: number;
    nodeVersion: string;
    memoryUsageMB: number;
    heapUsedMB: number;
    cronStatus: string;
    activeCronJobs: number;
  };
}

export type NotificationType = "LEAD_DISCOVERED" | "APPOINTMENT_SECURED" | "SYSTEM" | "DISPATCH_SENT";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string; // ISO string
  read: boolean;
  meta?: {
    companyName?: string;
    website?: string;
    intentScore?: number;
    leadQualityScore?: "High" | "Medium" | "Low";
    summary?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    contactPerson?: string;
    meetingType?: string;
    channel?: string;
  };
}

export interface NotificationSettings {
  leadAlertsEnabled: boolean;
  appointmentAlertsEnabled: boolean;
  soundAlertsEnabled: boolean;
  minLeadIntentScore: number; // e.g. 75
}

export interface TemplateABMetric {
  id: string;
  templateId: string;
  templateName: string;
  category: "Executive Cold" | "Founder to Founder" | "Pain-Point Value" | "Follow-up Cadence" | "Curiosity Hook" | "Custom";
  subject: string;
  snippet: string;
  channel: "Email" | "LinkedIn" | "WhatsApp";
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyCount: number;
  meetingCount: number;
  openRate: number; // 0 to 100
  clickThroughRate: number; // 0 to 100
  replyRate: number; // 0 to 100
  meetingRate: number; // 0 to 100
  status: "WINNER" | "CONTENDER" | "UNDERPERFORMING" | "NEEDS_MORE_DATA";
  lastTestedAt: string;
  sampleSizeConfidence: number; // e.g. 96 for 96% confidence
}

export interface LinkedInUserProfile {
  sub: string;
  name: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  email?: string;
  headline?: string;
  company?: string;
  location?: string;
  connectionsCount?: number;
  profileUrl?: string;
  isConnected: boolean;
  connectedAt?: string;
  authMode?: "OAUTH_LIVE" | "SIMULATED_SANDBOX";
}

export interface LinkedInEnrichedLeadData {
  leadId: string;
  companyName: string;
  executiveProfile: {
    name: string;
    headline: string;
    tenure: string;
    location: string;
    avatarUrl: string;
    profileUrl: string;
    mutualConnections: number;
    recentActivity: string;
    keySkills: string[];
  };
  companyInsights: {
    headcountTrend: string;
    activeHiringRoles: string[];
    recentCompanyPost: string;
    growthSignal: string;
  };
  personalizedHooks: {
    connectionNote: string;
    inMailMessage: string;
    conversationStarter: string;
  };
  enrichedAt: string;
}

