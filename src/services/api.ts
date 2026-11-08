import {
  Lead,
  PitchData,
  ActivityLog,
  CronJobInfo,
  CompetitorData,
  LinkedInUserProfile,
  LinkedInEnrichedLeadData,
} from "../types";

export async function checkServerHealth() {
  const res = await fetch("/api/health");
  return res.json();
}

export async function searchRawWeb(query: string, count = 10) {
  const res = await fetch("/api/search/raw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, count }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Web search failed");
  }
  return res.json();
}

export async function extractLeads(targetQuery: string, searchResults?: any) {
  const res = await fetch("/api/leads/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetQuery, searchResults }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Lead extraction failed");
  }
  return res.json();
}

export async function generateOutreach(
  lead: Lead,
  senderCompany?: string,
  valueProposition?: string,
  tone?: string
): Promise<{ success: boolean; pitch: PitchData; leadId: string }> {
  const res = await fetch("/api/outreach/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lead, senderCompany, valueProposition, tone }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to generate outreach pitch");
  }
  return res.json();
}

export async function synthesizeTTS(
  text: string,
  voice: "Kore" | "Zephyr" | "Puck" | "Charon" | "Fenrir" = "Kore"
): Promise<{ success: boolean; audioBase64: string; mimeType: string; voice: string }> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Text to speech failed");
  }
  return res.json();
}

export async function analyzeCompetitor(
  competitorNameOrUrl: string,
  targetNiche?: string
): Promise<{ success: boolean; data: CompetitorData }> {
  const res = await fetch("/api/competitor/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ competitorNameOrUrl, targetNiche }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Competitor analysis failed");
  }
  return res.json();
}

export async function getCronStatus(): Promise<{
  success: boolean;
  daemonRunning: boolean;
  uptimeSeconds: number;
  cronJobs: CronJobInfo[];
  recentLogs: ActivityLog[];
}> {
  const res = await fetch("/api/cron/status");
  if (!res.ok) {
    throw new Error("Failed to fetch cron status");
  }
  return res.json();
}

export async function triggerCronJob(jobId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch("/api/cron/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId }),
  });
  if (!res.ok) {
    throw new Error("Failed to trigger job");
  }
  return res.json();
}

export async function getActivityLogs(): Promise<{ success: boolean; logs: ActivityLog[] }> {
  const res = await fetch("/api/logs");
  if (!res.ok) {
    throw new Error("Failed to fetch logs");
  }
  return res.json();
}

export async function fetchDiagnostics() {
  const res = await fetch("/api/diagnostics");
  if (!res.ok) {
    throw new Error("Diagnostics check failed");
  }
  return res.json();
}

export async function probeGeminiKey(): Promise<{
  success: boolean;
  status: "VALID" | "MISSING" | "INVALID";
  latencyMs: number;
  message: string;
  maskedKey?: string;
  resolution?: string;
}> {
  const res = await fetch("/api/diagnostics/probe-gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Gemini probe HTTP ${res.status}`);
  }
  return res.json();
}

export async function probeSerperKey(): Promise<{
  success: boolean;
  status: "VALID" | "OPTIONAL_NOT_CONFIGURED" | "INVALID";
  latencyMs: number;
  message: string;
  maskedKey?: string;
  resolution?: string;
}> {
  const res = await fetch("/api/diagnostics/probe-serper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Serper probe HTTP ${res.status}`);
  }
  return res.json();
}

// ----------------------------------------------------
// LINKEDIN SOCIAL CONNECTOR CLIENT SERVICES
// ----------------------------------------------------

export async function getLinkedInAuthUrl(origin?: string): Promise<{
  success: boolean;
  configured: boolean;
  url: string;
  redirectUri: string;
  devCallbackUrl: string;
  sharedCallbackUrl: string;
}> {
  const query = origin ? `?origin=${encodeURIComponent(origin)}` : "";
  const res = await fetch(`/api/auth/linkedin/url${query}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch LinkedIn auth URL: ${res.statusText}`);
  }
  return res.json();
}

export async function getLinkedInStatus(): Promise<{
  success: boolean;
  isConnected: boolean;
  profile: LinkedInUserProfile | null;
}> {
  const res = await fetch("/api/linkedin/status");
  if (!res.ok) {
    throw new Error("Failed to fetch LinkedIn connection status");
  }
  return res.json();
}

export async function connectLinkedInDemo(): Promise<{
  success: boolean;
  profile: LinkedInUserProfile;
}> {
  const res = await fetch("/api/auth/linkedin/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to connect LinkedIn demo sandbox");
  }
  return res.json();
}

export async function disconnectLinkedIn(): Promise<{ success: boolean; message: string }> {
  const res = await fetch("/api/linkedin/disconnect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to disconnect LinkedIn");
  }
  return res.json();
}

export async function enrichLeadWithLinkedIn(lead: {
  id?: string;
  companyName: string;
  website?: string;
  potentialContactType?: string;
  emailOrContact?: string;
}): Promise<LinkedInEnrichedLeadData> {
  const res = await fetch("/api/linkedin/enrich-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leadId: lead.id,
      companyName: lead.companyName,
      website: lead.website,
      potentialContactType: lead.potentialContactType,
      emailOrContact: lead.emailOrContact,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "LinkedIn enrichment failed");
  }
  return res.json();
}

