import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Settings,
  Volume2,
  VolumeX,
  Trash2,
  CheckCheck,
  ExternalLink,
  X,
  AlertCircle,
  Filter,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  UserCheck,
  PlayCircle,
  Plus,
} from "lucide-react";
import { AppNotification, NotificationSettings, NotificationType } from "../types";
import { notificationService } from "../services/notificationService";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLead?: (companyName: string) => void;
  onNavigateTab?: (tab: "leads" | "dispatcher" | "voicesdr" | "automation" | "competitor" | "roadmap" | "diagnostics") => void;
  isBn: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onSelectLead,
  onNavigateTab,
  isBn,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [filterType, setFilterType] = useState<"ALL" | "LEADS" | "APPOINTMENTS" | "UNREAD">("ALL");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [activeSubTab, setActiveSubTab] = useState<"FEED" | "TEST_SIMULATOR" | "SETTINGS">("FEED");

  // Custom simulator states
  const [customLeadCompany, setCustomLeadCompany] = useState("");
  const [customLeadIntent, setCustomLeadIntent] = useState(92);
  const [customLeadSummary, setCustomLeadSummary] = useState("");
  const [customApptCompany, setCustomApptCompany] = useState("");
  const [customApptPerson, setCustomApptPerson] = useState("");
  const [customApptTime, setCustomApptTime] = useState("Tomorrow at 3:00 PM EST");
  const [triggerFeedback, setTriggerFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to notification service
    const unsubscribe = notificationService.subscribe((notifs, curSettings) => {
      setNotifications(notifs);
      setSettings(curSettings);
      setPermission(notificationService.getPermission());
    });

    setPermission(notificationService.getPermission());
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
  };

  const handleTriggerSampleLead = async () => {
    const sampleCompanies = [
      {
        name: "NexSphere Technologies",
        website: "https://nexsphere.io",
        intent: 96,
        summary: "VP of Engineering looking to deploy autonomous SDR outbound scheduler this quarter.",
      },
      {
        name: "Apex Logistics Global",
        website: "https://apexlogistics.com",
        intent: 91,
        summary: "Actively replacing legacy cold outreach sequences with AI-personalized lead triage.",
      },
      {
        name: "HyperScale FinTech",
        website: "https://hyperscalefin.com",
        intent: 88,
        summary: "Scaling enterprise SDR team by 200%; needs Gemini-powered qualification pipeline.",
      },
    ];

    const pick = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
    const leadName = customLeadCompany.trim() || pick.name;
    const intent = customLeadIntent || pick.intent;
    const summary = customLeadSummary.trim() || pick.summary;

    const notif = await notificationService.triggerLeadDiscovered({
      companyName: leadName,
      website: pick.website,
      intentScore: intent,
      summary,
    });

    if (notif) {
      setTriggerFeedback(
        isBn
          ? `🎯 লিড পুশ নোটিফিকেশন সফলভাবে ট্রিগার হয়েছে: ${leadName}`
          : `🎯 Lead push alert triggered for ${leadName} (${intent}% intent)`
      );
      setTimeout(() => setTriggerFeedback(null), 3500);
    }
  };

  const handleTriggerSampleAppointment = async () => {
    const sampleAppointments = [
      {
        company: "Stratos Enterprise AI",
        person: "Jessica Taylor (Chief Revenue Officer)",
        time: "Tomorrow at 2:00 PM EST",
        type: "Executive Pipeline Demo",
      },
      {
        company: "Vanguard Cloud Solutions",
        person: "David Sterling (Director of Sales Ops)",
        time: "Thursday at 11:30 AM EST",
        type: "Autonomous SDR Architecture Review",
      },
      {
        company: "Meridian Financial Systems",
        person: "Elena Rostova (Head of Growth)",
        time: "Friday at 4:00 PM EST",
        type: "High-Intent Lead Inbound Review",
      },
    ];

    const pick = sampleAppointments[Math.floor(Math.random() * sampleAppointments.length)];
    const company = customApptCompany.trim() || pick.company;
    const person = customApptPerson.trim() || pick.person;
    const time = customApptTime.trim() || pick.time;

    const notif = await notificationService.triggerAppointmentSecured({
      companyName: company,
      contactPerson: person,
      appointmentTime: time,
      meetingType: pick.type,
    });

    if (notif) {
      setTriggerFeedback(
        isBn
          ? `🗓️ অ্যাপয়েন্টমেন্ট পুশ অ্যালার্ট সফলভাবে ট্রিগার হয়েছে: ${company}`
          : `🗓️ Appointment push alert secured & triggered for ${company}`
      );
      setTimeout(() => setTriggerFeedback(null), 3500);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "LEADS") return n.type === "LEAD_DISCOVERED";
    if (filterType === "APPOINTMENTS") return n.type === "APPOINTMENT_SECURED";
    if (filterType === "UNREAD") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const leadCount = notifications.filter((n) => n.type === "LEAD_DISCOVERED").length;
  const apptCount = notifications.filter((n) => n.type === "APPOINTMENT_SECURED").length;

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return isBn ? "এইমাত্র" : "Just now";
    if (diffMins < 60) return isBn ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return isBn ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return isBn ? `${diffDays} দিন আগে` : `${diffDays}d ago`;
  };

  return (
    <div
      id="notification-center-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="notification-center-drawer"
        className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  {isBn ? "নোটিফিকেশন সেন্টার" : "Notification Center"}
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    {unreadCount} {isBn ? "নতুন" : "New"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "রিয়েল-টাইম ডেস্কটপ ও মোবাইল পুশ নোটিফিকেশন ইঞ্জিন"
                  : "Browser Notification API & Real-Time Push Alerts"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {unreadCount > 0 && (
              <button
                id="notif-mark-all-read-btn"
                type="button"
                onClick={() => notificationService.markAllAsRead()}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition flex items-center space-x-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">{isBn ? "পড়া হয়েছে" : "Mark Read"}</span>
              </button>
            )}
            <button
              id="notif-close-drawer-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition"
              aria-label="Close notification center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Permission Alert Banner */}
        <div className="px-4 py-3 bg-white border-b border-slate-100">
          {permission === "granted" ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{isBn ? "ব্রাউজার পুশ সক্রিয়" : "Browser Push Active"}:</strong>{" "}
                  {isBn
                    ? "নতুন লিড এবং কনফার্মড অ্যাপয়েন্টমেন্টের পুশ নোটিফিকেশন ডিভাইস স্ক্রিনে দেখা যাবে।"
                    : "Real-time desktop and lock-screen push alerts enabled."}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            </div>
          ) : permission === "denied" ? (
            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {isBn ? "নোটিফিকেশন পারমিশন ব্লকড রয়েছে" : "Notification Permission Denied"}
                </p>
                <p className="text-rose-700 text-[11px] mt-0.5">
                  {isBn
                    ? "আপনার ব্রাউজার অ্যাড্রেস বারের লক (🔒) আইকনে ক্লিক করে Notification 'Allow' করুন।"
                    : "Notifications are blocked in your browser settings. Click the lock/site settings icon in your address bar and select 'Allow'."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isBn
                    ? "রিয়েল-টাইম লিড ও অ্যাপয়েন্টমেন্ট পুশ অ্যালার্ট পেতে অনুমতি প্রয়োজন।"
                    : "Enable browser push to receive instant lead discoveries & meeting alerts."}
                </span>
              </div>
              <button
                id="notif-request-permission-btn"
                type="button"
                onClick={handleRequestPermission}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition shrink-0 ml-2"
              >
                {isBn ? "অনুমোদন দিন" : "Enable Push"}
              </button>
            </div>
          )}
        </div>

        {/* Feedback Message Toast */}
        {triggerFeedback && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-indigo-900 text-white text-xs flex items-center space-x-2 animate-in slide-in-from-top-2 duration-150">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium flex-1">{triggerFeedback}</span>
          </div>
        )}

        {/* Sub-tab Navigation */}
        <div className="px-4 pt-3 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              id="notif-tab-feed"
              type="button"
              onClick={() => setActiveSubTab("FEED")}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                activeSubTab === "FEED"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {isBn ? "নোটিফিকেশন ফিড" : "Notification Feed"} ({notifications.length})
            </button>
            <button
              id="notif-tab-simulator"
              type="button"
              onClick={() => setActiveSubTab("TEST_SIMULATOR")}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
                activeSubTab === "TEST_SIMULATOR"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{isBn ? "লাইভ ট্রিগার ও টেস্ট" : "Live Triggers & Test"}</span>
            </button>
            <button
              id="notif-tab-settings"
              type="button"
              onClick={() => setActiveSubTab("SETTINGS")}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
                activeSubTab === "SETTINGS"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isBn ? "সেটিংস" : "Preferences"}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Notification Feed */}
        {activeSubTab === "FEED" && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
            {/* Filter pills */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 overflow-x-auto">
                <button
                  id="notif-filter-all"
                  type="button"
                  onClick={() => setFilterType("ALL")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    filterType === "ALL"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {isBn ? "সকল" : "All"} ({notifications.length})
                </button>
                <button
                  id="notif-filter-leads"
                  type="button"
                  onClick={() => setFilterType("LEADS")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1 ${
                    filterType === "LEADS"
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>{isBn ? "লিড অ্যালার্ট" : "Leads"} ({leadCount})</span>
                </button>
                <button
                  id="notif-filter-appointments"
                  type="button"
                  onClick={() => setFilterType("APPOINTMENTS")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1 ${
                    filterType === "APPOINTMENTS"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{isBn ? "অ্যাপয়েন্টমেন্ট" : "Appointments"} ({apptCount})</span>
                </button>
                {unreadCount > 0 && (
                  <button
                    id="notif-filter-unread"
                    type="button"
                    onClick={() => setFilterType("UNREAD")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      filterType === "UNREAD"
                        ? "bg-amber-600 text-white"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    {isBn ? "অপঠিত" : "Unread"} ({unreadCount})
                  </button>
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  id="notif-clear-all-btn"
                  type="button"
                  onClick={() => {
                    if (window.confirm(isBn ? "সকল নোটিফিকেশন মুছে ফেলতে চান?" : "Clear all notifications?")) {
                      notificationService.clearAll();
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 transition p-1"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Notification items list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {isBn ? "কোনো নোটিফিকেশন নেই" : "No Notifications"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    {isBn
                      ? "AI এজেন্ট যখনই নতুন কোনো বিটুবি লিড চিহ্নিত করবে অথবা মিটিং শিডিউল করবে, এখানে সাথে সাথে রিয়েল-টাইমে প্রদর্শিত হবে।"
                      : "When the AI SDR discovers high-intent prospects or confirms appointments, push alerts will land here."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("TEST_SIMULATOR")}
                    className="mt-4 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition flex items-center space-x-1.5"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{isBn ? "টেস্ট নোটিফিকেশন ট্রিগার করুন" : "Trigger Test Notification"}</span>
                  </button>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isLead = notif.type === "LEAD_DISCOVERED";
                  const isAppt = notif.type === "APPOINTMENT_SECURED";

                  return (
                    <div
                      key={notif.id}
                      id={`notif-card-${notif.id}`}
                      className={`relative p-4 rounded-xl border transition group ${
                        !notif.read
                          ? isAppt
                            ? "bg-emerald-50/40 border-emerald-200 shadow-xs"
                            : "bg-indigo-50/40 border-indigo-200 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => {
                        if (!notif.read) notificationService.markAsRead(notif.id);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 min-w-0">
                          <div
                            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                              isAppt
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {isAppt ? (
                              <Calendar className="w-4 h-4" />
                            ) : (
                              <TrendingUp className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isAppt
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-indigo-100 text-indigo-800"
                                }`}
                              >
                                {isAppt
                                  ? (isBn ? "অ্যাপয়েন্টমেন্ট কনফার্মড" : "APPOINTMENT SECURED")
                                  : (isBn ? "নতুন লিড আবিষ্কৃত" : "LEAD DISCOVERED")}
                              </span>

                              {notif.meta?.intentScore && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                  {notif.meta.intentScore}% Intent
                                </span>
                              )}

                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                              {notif.title}
                            </h4>

                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {notif.body}
                            </p>

                            {/* Additional metadata tags */}
                            {isAppt && notif.meta && (
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-200/60">
                                <span className="flex items-center space-x-1 font-medium text-emerald-800">
                                  <Clock className="w-3 h-3 text-emerald-600" />
                                  <span>{notif.meta.appointmentTime}</span>
                                </span>
                                {notif.meta.contactPerson && (
                                  <span className="flex items-center space-x-1 text-slate-700">
                                    <UserCheck className="w-3 h-3 text-slate-500" />
                                    <span>{notif.meta.contactPerson}</span>
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Action links */}
                            <div className="mt-3 flex items-center space-x-3 text-xs">
                              {isLead && notif.meta?.companyName && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectLead && notif.meta?.companyName) {
                                      onSelectLead(notif.meta.companyName);
                                    }
                                    if (onNavigateTab) onNavigateTab("leads");
                                    onClose();
                                  }}
                                  className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                                >
                                  <span>{isBn ? "রাডারে দেখুন" : "View in Radar"}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}

                              {isAppt && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onNavigateTab) onNavigateTab("voicesdr");
                                    onClose();
                                  }}
                                  className="font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
                                >
                                  <span>{isBn ? "ভয়েস SDR ও কল লগ" : "Open Voice SDR & Logs"}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}

                              <span className="text-[11px] text-slate-400">
                                {formatTimeAgo(notif.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            notificationService.deleteNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-rose-600"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Live Trigger Station / Simulator */}
        {activeSubTab === "TEST_SIMULATOR" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? "রিয়েল-টাইম পুশ নোটিফিকেশন ট্রিগার স্টেশন" : "Live Push Notification Triggers"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn
                  ? "এখানে ক্লিক করে সরাসরি ব্রাউজার Notification API এবং ডিভাইস সাউন্ড পরীক্ষা করুন।"
                  : "Simulate the autonomous AI agent discovering leads or booking demos to test browser push & lock-screen delivery."}
              </p>
            </div>

            {/* Quick 1-Click Trigger Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trigger 1: Lead Discovery */}
              <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isBn ? "লিড ডিসকভারি" : "Lead Discovery"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {isBn ? "হাই-ইনটেন্ট লিড ট্রিগার" : "Trigger High-Intent Lead"}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {isBn
                      ? "AI রাডার নতুন লিড শনাক্ত করলে যেমন পুশ অ্যালার্ট ও সাইম বাজবে তা টেস্ট করুন।"
                      : "Fires instant push notification with company name, intent score, and summary chime."}
                  </p>
                </div>
                <button
                  id="notif-sim-quick-lead-btn"
                  type="button"
                  onClick={handleTriggerSampleLead}
                  className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>{isBn ? "লিড অ্যালার্ট ফায়ার করুন" : "Simulate Lead Discovery"}</span>
                </button>
              </div>

              {/* Trigger 2: Appointment Secured */}
              <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isBn ? "অ্যাপয়েন্টমেন্ট সিকিউরড" : "Appointment Secured"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {isBn ? "কনফার্মড মিটিং ট্রিগার" : "Trigger Meeting Secured"}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {isBn
                      ? "প্রস্পেক্ট ডেমো বা মিটিং বুক করলে ট্রায়াম্ফ চোরড ও পুশ নোটিফিকেশন বাজবে।"
                      : "Fires calendar push alert with executive contact, confirmed time, and triumph chord."}
                  </p>
                </div>
                <button
                  id="notif-sim-quick-appt-btn"
                  type="button"
                  onClick={handleTriggerSampleAppointment}
                  className="mt-4 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>{isBn ? "অ্যাপয়েন্টমেন্ট ফায়ার করুন" : "Simulate Secured Appointment"}</span>
                </button>
              </div>
            </div>

            {/* Custom Lead Discovery Input Box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isBn ? "কাস্টম লিড নোটিফিকেশন কনফিগার করুন" : "Custom Lead Discovery Payload"}</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {isBn ? "কোম্পানির নাম" : "Company Name"}
                  </label>
                  <input
                    id="notif-input-lead-company"
                    type="text"
                    value={customLeadCompany}
                    onChange={(e) => setCustomLeadCompany(e.target.value)}
                    placeholder="e.g. Acme Corp AI"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isBn ? "ইনটেন্ট স্কোর" : "Intent Score"}: {customLeadIntent}%
                    </label>
                    <input
                      id="notif-input-lead-intent"
                      type="range"
                      min="60"
                      max="99"
                      value={customLeadIntent}
                      onChange={(e) => setCustomLeadIntent(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isBn ? "গুণগত মান" : "Quality Grade"}
                    </label>
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {customLeadIntent >= 85 ? "High Priority" : "Standard Priority"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {isBn ? "সামারি / মূল পর্যবেক্ষণ" : "Summary / Signal"}
                  </label>
                  <input
                    id="notif-input-lead-summary"
                    type="text"
                    value={customLeadSummary}
                    onChange={(e) => setCustomLeadSummary(e.target.value)}
                    placeholder="e.g. Hiring 5 SDRs, budget allocated for autonomous workflow."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  id="notif-btn-custom-lead-trigger"
                  type="button"
                  onClick={handleTriggerSampleLead}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                >
                  {isBn ? "কাস্টম লিড নোটিফিকেশন ফায়ার করুন" : "Fire Custom Lead Alert"}
                </button>
              </div>
            </div>

            {/* Custom Appointment Box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? "কাস্টম অ্যাপয়েন্টমেন্ট কনফিগার করুন" : "Custom Appointment Payload"}</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isBn ? "কোম্পানি" : "Company"}
                    </label>
                    <input
                      id="notif-input-appt-company"
                      type="text"
                      value={customApptCompany}
                      onChange={(e) => setCustomApptCompany(e.target.value)}
                      placeholder="e.g. Apex Global Corp"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isBn ? "যোগাযোগকারী ব্যক্তি" : "Contact Person"}
                    </label>
                    <input
                      id="notif-input-appt-person"
                      type="text"
                      value={customApptPerson}
                      onChange={(e) => setCustomApptPerson(e.target.value)}
                      placeholder="e.g. Rachel Adams, VP Growth"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {isBn ? "মিটিং সময়সূচী" : "Scheduled Time"}
                  </label>
                  <input
                    id="notif-input-appt-time"
                    type="text"
                    value={customApptTime}
                    onChange={(e) => setCustomApptTime(e.target.value)}
                    placeholder="e.g. Tomorrow at 3:00 PM EST"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  id="notif-btn-custom-appt-trigger"
                  type="button"
                  onClick={handleTriggerSampleAppointment}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                >
                  {isBn ? "কাস্টম অ্যাপয়েন্টমেন্ট নোটিফিকেশন ফায়ার করুন" : "Fire Custom Appointment Alert"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notification Settings / Preferences */}
        {activeSubTab === "SETTINGS" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? "নোটিফিকেশন পছন্দ ও ফিল্টারিং" : "Notification Preferences & Rules"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn
                  ? "আপনার সুবিধা অনুযায়ী নোটিফিকেশনের ইনটেন্ট ফিল্টার ও পুশ আচরণ কাস্টমাইজ করুন।"
                  : "Control which events trigger system push notifications and audio synthesizers."}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
              {/* Lead alerts toggle */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    {isBn ? "নতুন লিড ডিসকভারি পুশ নোটিফিকেশন" : "Lead Discovery Push Alerts"}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {isBn
                      ? "AI এজেন্ট নতুন হাই-ইনটেন্ট বিটুবি লিড চিহ্নিত করলে সাথে সাথে ডিভাইস স্ক্রিনে নোটিফিকেশন পাঠাবে।"
                      : "Trigger system notification immediately when high-intent leads are extracted."}
                  </p>
                </div>
                <input
                  id="notif-toggle-lead-alerts"
                  type="checkbox"
                  checked={settings.leadAlertsEnabled}
                  onChange={(e) =>
                    notificationService.updateSettings({ leadAlertsEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Appointment alerts toggle */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    {isBn ? "অ্যাপয়েন্টমেন্ট সিকিউরড পুশ নোটিফিকেশন" : "Appointment Secured Push Alerts"}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {isBn
                      ? "প্রস্পেক্ট মিটিং বা ডেমো কনফার্ম করলে লক-স্ক্রিনে হাই-প্রায়োরিটি ভাইব্রেশন সহ নোটিফাই করবে।"
                      : "Receive instant alert with calendar time when an appointment is booked."}
                  </p>
                </div>
                <input
                  id="notif-toggle-appt-alerts"
                  type="checkbox"
                  checked={settings.appointmentAlertsEnabled}
                  onChange={(e) =>
                    notificationService.updateSettings({ appointmentAlertsEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Sound alerts toggle */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                    {settings.soundAlertsEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{isBn ? "অডিও চাইম ও সিন্থেসাইজার" : "Web Audio Synthesizer Chimes"}</span>
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {isBn
                      ? "নোটিফিকেশন আসার সময় সুমধুর মেলোডি সাউন্ড বাজবে।"
                      : "Play harmonic audio chime on lead discovery and fanfare chord on appointment booking."}
                  </p>
                </div>
                <input
                  id="notif-toggle-sound"
                  type="checkbox"
                  checked={settings.soundAlertsEnabled}
                  onChange={(e) =>
                    notificationService.updateSettings({ soundAlertsEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Minimum intent score threshold */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">
                    {isBn ? "নূন্যতম ইনটেন্ট ফিল্টার" : "Minimum Lead Intent Threshold"}
                  </p>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 text-xs">
                    {settings.minLeadIntentScore}%+
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  {isBn
                    ? "শুধুমাত্র এই স্কোরের বেশি সম্ভাবনাময় লিড শনাক্ত হলেই কেবল নোটিফিকেশন আসবে।"
                    : "Filter out low-scoring prospects; only notify for leads meeting or exceeding this purchasing intent."}
                </p>
                <div className="flex items-center space-x-3 pt-1">
                  <span className="text-[11px] text-slate-400">50%</span>
                  <input
                    id="notif-slider-min-intent"
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={settings.minLeadIntentScore}
                    onChange={(e) =>
                      notificationService.updateSettings({ minLeadIntentScore: Number(e.target.value) })
                    }
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="text-[11px] text-slate-400">95%</span>
                </div>
              </div>
            </div>

            {/* Device Background & PWA note */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>{isBn ? "মোবাইল ও ব্যাকগ্রাউন্ড সাপোর্ট" : "Mobile & Background Daemon Support"}</span>
              </div>
              <p className="text-indigo-800 text-[11px] leading-relaxed">
                {isBn
                  ? "সার্ভিস ওয়ার্কার এবং ইন্ডিপেন্ডেন্ট ব্যাকগ্রাউন্ড ওয়েব ওয়ার্কারের সাহায্যে ব্রাউজার মিনিমাইজ করা থাকলেও আপনার ডিভাইসের লক-স্ক্রিনে নোটিফিকেশন পৌঁছে যাবে।"
                  : "Thanks to the configured Service Worker & Background Web Worker, push notifications are reliably delivered to lock-screens even when the app tab is minimized."}
              </p>
            </div>
          </div>
        )}

        {/* Drawer Bottom Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                permission === "granted" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span>
              {permission === "granted"
                ? (isBn ? "পুশ এপিআই সক্রিয়" : "Notification API Active")
                : (isBn ? "অনুমতি প্রয়োজন" : "Permission Pending")}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition"
          >
            {isBn ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
