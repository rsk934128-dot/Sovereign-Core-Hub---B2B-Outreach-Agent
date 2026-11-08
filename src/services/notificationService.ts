import { AppNotification, NotificationSettings, Lead } from "../types";
import { backgroundService } from "./backgroundService";

const STORAGE_KEY = "sovereign_notifications_history";
const SETTINGS_KEY = "sovereign_notification_settings";

const DEFAULT_SETTINGS: NotificationSettings = {
  leadAlertsEnabled: true,
  appointmentAlertsEnabled: true,
  soundAlertsEnabled: true,
  minLeadIntentScore: 70,
};

const INITIAL_SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-sample-1",
    type: "APPOINTMENT_SECURED",
    title: "🗓️ Appointment Secured: Demo Call Confirmed",
    body: "Chief Technology Officer at CloudScale Systems confirmed a 20-minute Gemini AI Pipeline demo for tomorrow at 2:30 PM EST.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    meta: {
      companyName: "CloudScale Systems",
      contactPerson: "Marcus Vance, VP Engineering",
      appointmentDate: "Tomorrow",
      appointmentTime: "2:30 PM EST",
      meetingType: "Executive Demo Call",
      channel: "Voice SDR Outbound",
    },
  },
  {
    id: "notif-sample-2",
    type: "LEAD_DISCOVERED",
    title: "🎯 High-Intent Lead Discovered: DataFlow Dynamics (94% Intent)",
    body: "Radar detected recent expansion into enterprise AI ops. Contact identified: Sarah Chen (Head of Revenue Ops).",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    meta: {
      companyName: "DataFlow Dynamics",
      website: "https://dataflowdynamics.io",
      intentScore: 94,
      leadQualityScore: "High",
      summary: "Scaling B2B data analytics team, actively hiring enterprise account executives.",
    },
  },
  {
    id: "notif-sample-3",
    type: "APPOINTMENT_SECURED",
    title: "🗓️ Appointment Secured: Discovery Session",
    body: "Director of Inbound at Apex Logistics accepted calendar invite for Friday at 11:00 AM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: true,
    meta: {
      companyName: "Apex Logistics",
      contactPerson: "David Miller, Director",
      appointmentDate: "Friday",
      appointmentTime: "11:00 AM",
      meetingType: "Discovery Session",
      channel: "Multi-Channel Dispatcher",
    },
  },
];

type NotificationListener = (notifications: AppNotification[], settings: NotificationSettings) => void;

class NotificationServiceManager {
  private notifications: AppNotification[] = [];
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private listeners: Set<NotificationListener> = new Set();
  private audioContext: AudioContext | null = null;

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (typeof window === "undefined") return;

    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }

    try {
      const storedNotifs = localStorage.getItem(STORAGE_KEY);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        this.notifications = INITIAL_SAMPLE_NOTIFICATIONS;
        this.saveNotifications();
      }
    } catch {
      this.notifications = INITIAL_SAMPLE_NOTIFICATIONS;
    }
  }

  private saveNotifications() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn("Failed to persist notifications:", e);
    }
  }

  private saveSettings() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn("Failed to persist notification settings:", e);
    }
  }

  private notify() {
    this.saveNotifications();
    this.saveSettings();
    this.listeners.forEach((l) => l(this.notifications, this.settings));
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.notifications, this.settings);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public updateSettings(partial: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.notify();
  }

  public async requestPermission(): Promise<NotificationPermission | "unsupported"> {
    return await backgroundService.requestNotificationPermission();
  }

  public getPermission(): NotificationPermission | "unsupported" {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  }

  // Multi-tone triumphant chord for securing an appointment
  private playAppointmentTriumphSound() {
    if (!this.settings.soundAlertsEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major triad fanfare)

      notes.forEach((freq, idx) => {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const startTime = now + idx * 0.08;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {
      // Audio might need initial gesture
    }
  }

  // Crisp chime for new lead discovery
  private playLeadChimeSound() {
    if (!this.settings.soundAlertsEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  /**
   * Triggers real-time desktop/mobile push notification when the AI agent
   * successfully discovers a new high-intent lead.
   */
  public async triggerLeadDiscovered(lead: {
    companyName: string;
    website?: string;
    intentScore?: number;
    leadQualityScore?: "High" | "Medium" | "Low";
    summary?: string;
    potentialContactType?: string;
  }): Promise<AppNotification | null> {
    const score = lead.intentScore ?? 85;
    if (this.settings.leadAlertsEnabled && score < this.settings.minLeadIntentScore) {
      console.log(`[NotificationService] Lead below intent threshold (${score} < ${this.settings.minLeadIntentScore}).`);
      return null;
    }

    const title = `🎯 New Lead Discovered: ${lead.companyName} (${score}% Intent)`;
    const body = lead.summary
      ? `${lead.companyName}: ${lead.summary.slice(0, 120)}...`
      : `AI Agent identified high purchasing intent at ${lead.companyName}. Ready for personalized outreach.`;

    const newNotification: AppNotification = {
      id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "LEAD_DISCOVERED",
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      meta: {
        companyName: lead.companyName,
        website: lead.website,
        intentScore: score,
        leadQualityScore: lead.leadQualityScore || (score >= 80 ? "High" : "Medium"),
        summary: lead.summary,
      },
    };

    // Insert at front of notification list
    this.notifications = [newNotification, ...this.notifications.slice(0, 49)];
    this.notify();

    // Trigger Browser Notification API (Desktop & Mobile Push)
    if (this.settings.leadAlertsEnabled) {
      await backgroundService.sendNotification(title, body, {
        tag: `lead-alert-${lead.companyName.toLowerCase().replace(/\s+/g, "-")}`,
        data: { leadId: newNotification.id, company: lead.companyName },
      });
      this.playLeadChimeSound();
    }

    return newNotification;
  }

  /**
   * Triggers real-time desktop/mobile push notification when the AI agent
   * successfully secures an appointment (demo, consultation, meeting).
   */
  public async triggerAppointmentSecured(appointment: {
    companyName: string;
    contactPerson: string;
    appointmentDate?: string;
    appointmentTime?: string;
    meetingType?: string;
    channel?: string;
    notes?: string;
  }): Promise<AppNotification> {
    const timeStr = appointment.appointmentTime || "Tomorrow at 2:00 PM EST";
    const dateStr = appointment.appointmentDate || "Upcoming";
    const meetingType = appointment.meetingType || "Executive Demo Call";

    const title = `🗓️ Appointment Secured: ${appointment.companyName}`;
    const body = `${meetingType} confirmed with ${appointment.contactPerson} (${appointment.companyName}) for ${dateStr} ${timeStr}.`;

    const newNotification: AppNotification = {
      id: `appt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "APPOINTMENT_SECURED",
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      meta: {
        companyName: appointment.companyName,
        contactPerson: appointment.contactPerson,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        meetingType,
        channel: appointment.channel || "AI Voice SDR / Dispatcher",
      },
    };

    // Insert at front
    this.notifications = [newNotification, ...this.notifications.slice(0, 49)];
    this.notify();

    // Trigger Browser Notification API with high priority vibration
    if (this.settings.appointmentAlertsEnabled) {
      await backgroundService.sendNotification(title, body, {
        tag: `appointment-${appointment.companyName.toLowerCase().replace(/\s+/g, "-")}`,
        data: { apptId: newNotification.id, company: appointment.companyName },
      });
      this.playAppointmentTriumphSound();
    }

    return newNotification;
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notify();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notify();
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  public clearAll() {
    this.notifications = [];
    this.notify();
  }
}

export const notificationService = new NotificationServiceManager();
