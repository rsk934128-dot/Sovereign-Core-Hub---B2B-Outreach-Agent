import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldCheck,
  Server,
  Zap,
  Globe,
  Radio,
  Sliders,
  Send,
  Volume2,
  Calendar,
  Crosshair,
  Compass,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Bell,
  Store,
  Share2,
} from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";

interface HeaderProps {
  activeTab: "leads" | "dispatcher" | "voicesdr" | "automation" | "competitor" | "roadmap" | "diagnostics";
  onTabChange: (tab: "leads" | "dispatcher" | "voicesdr" | "automation" | "competitor" | "roadmap" | "diagnostics") => void;
  leadsCount: number;
  selectedLeadName?: string;
  isWakeLockActive: boolean;
  onToggleWakeLock: () => void;
  onOpenDeployModal: () => void;
  onOpenMobileHub?: () => void;
  onOpenPWABuilderModal?: () => void;
  onOpenSocialConnector?: () => void;
  isLinkedInConnected?: boolean;
  onOpenNotificationCenter?: () => void;
  unreadNotifCount?: number;
  isBn: boolean;
  onToggleLang: () => void;
  hasGeminiKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  leadsCount,
  selectedLeadName,
  isWakeLockActive,
  onToggleWakeLock,
  onOpenDeployModal,
  onOpenMobileHub,
  onOpenPWABuilderModal,
  onOpenSocialConnector,
  isLinkedInConnected = false,
  onOpenNotificationCenter,
  unreadNotifCount = 0,
  isBn,
  onToggleLang,
  hasGeminiKey = true,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  interface NavItem {
    id: "leads" | "dispatcher" | "voicesdr" | "automation" | "competitor" | "roadmap" | "diagnostics";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }

  const navItems: NavItem[] = [
    {
      id: "leads",
      label: isBn ? "লিড ইন্টেলিজেন্স" : "Lead Radar",
      icon: Crosshair,
      badge: leadsCount > 0 ? leadsCount : undefined,
    },
    {
      id: "dispatcher",
      label: isBn ? "মাল্টি-চ্যানেল পিচ" : "Pitch Dispatcher",
      icon: Send,
    },
    {
      id: "voicesdr",
      label: isBn ? "এআই ভয়েস SDR (TTS)" : "Voice SDR (TTS)",
      icon: Volume2,
      badge: "AI Voice",
    },
    {
      id: "automation",
      label: isBn ? "২৪/৭ অটোমেশন ও এ/বি টেস্ট" : "24/7 Automation & A/B",
      icon: Radio,
      badge: "A/B",
    },
    {
      id: "competitor",
      label: isBn ? "কম্পিটিটর স্পাই" : "Competitor Radar",
      icon: Sliders,
    },
    {
      id: "diagnostics",
      label: isBn ? "সিস্টেম ডায়াগনস্টিকস" : "System Diagnostics",
      icon: Activity,
      badge: hasGeminiKey ? "Live" : "Setup",
    },
    {
      id: "roadmap",
      label: isBn ? "ফিউচার রোডম্যাপ" : "Roadmap",
      icon: Compass,
    },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Sovereign Core Hub
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  B2B Outreach Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden md:block">
                {isBn
                  ? "স্বয়ংক্রিয় ২৪/৭ লিড স্ক্র্যাপিং, জেমিনাই এআই পিচ ডিসপ্যাচার ও ভয়েস SDR"
                  : "Autonomous 24/7 lead intelligence, multi-channel pitch dispatcher & voice SDR"}
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Daemon Pulse */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>24/7 Daemon Active</span>
              <span className="text-emerald-600 font-mono text-[11px]">[{currentTime}]</span>
            </div>

            {/* Quick Diagnostics Health Pill */}
            <button
              id="header-diagnostics-pill"
              type="button"
              onClick={() => onTabChange("diagnostics")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeTab === "diagnostics"
                  ? "bg-indigo-50 text-indigo-900 border-indigo-300 shadow-xs font-semibold"
                  : hasGeminiKey
                  ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
              }`}
              title="View API Keys & System Diagnostics"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${hasGeminiKey ? "text-emerald-500" : "text-amber-600"}`} />
              <span className="hidden sm:inline">
                {hasGeminiKey ? "API: Live" : "API: Setup"}
              </span>
            </button>

            {/* Screen WakeLock Button */}
            <button
              id="header-wakelock-toggle"
              type="button"
              onClick={onToggleWakeLock}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isWakeLockActive
                  ? "bg-amber-50 text-amber-900 border-amber-300 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
              title={
                isWakeLockActive
                  ? "Screen WakeLock is ON: Display will not sleep on mobile/desktop"
                  : "Click to prevent device from sleeping"
              }
            >
              <Activity className={`w-3.5 h-3.5 ${isWakeLockActive ? "text-amber-600 animate-spin" : "text-slate-500"}`} />
              <span className="hidden sm:inline">
                {isWakeLockActive ? "Screen Awake" : "Keep Awake"}
              </span>
            </button>

            {/* Notification Center Bell Button */}
            <button
              id="header-notification-center-btn"
              type="button"
              onClick={onOpenNotificationCenter}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-xs ${
                unreadNotifCount > 0
                  ? "bg-indigo-50 border-indigo-300 text-indigo-900 hover:bg-indigo-100"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title={isBn ? "নোটিফিকেশন সেন্টার (লিড ও অ্যাপয়েন্টমেন্ট অ্যালার্ট)" : "Notification Center (Lead Discovery & Appointment Alerts)"}
            >
              <Bell className={`w-3.5 h-3.5 ${unreadNotifCount > 0 ? "text-indigo-600 animate-bounce" : "text-slate-600"}`} />
              <span className="hidden sm:inline">
                {isBn ? "নোটিফিকেশন" : "Notifications"}
              </span>
              {unreadNotifCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white leading-tight">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Mobile 24/7 & Notification Hub */}
            <button
              id="header-mobile-hub-btn"
              type="button"
              onClick={onOpenMobileHub}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shadow-xs"
              title={isBn ? "মোবাইল ২৪/৭ ব্যাকগ্রাউন্ড ও নোটিফিকেশন হাব" : "Mobile 24/7 & Real-time Notifications Hub"}
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">
                {isBn ? "মোবাইল অ্যাক্টিভ" : "Mobile 24/7"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            </button>

            {/* LinkedIn Social Connector Button */}
            {onOpenSocialConnector && (
              <button
                id="header-social-connector-btn"
                type="button"
                onClick={onOpenSocialConnector}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-2xs cursor-pointer ${
                  isLinkedInConnected
                    ? "bg-sky-50 text-sky-950 border-sky-300"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
                title="LinkedIn Social Connector & Real-Time SDR Profile Data"
              >
                <Share2 className="w-3.5 h-3.5 text-[#0a66c2]" />
                <span className="hidden sm:inline">LinkedIn</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLinkedInConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
              </button>
            )}

            {/* PWA Install Button (Chromium / iOS) */}
            <PWAInstallButton isBn={isBn} />

            {/* PWABuilder Store Packaging Studio Button */}
            {onOpenPWABuilderModal && (
              <button
                id="header-pwabuilder-btn"
                type="button"
                onClick={onOpenPWABuilderModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                title="PWABuilder 110/110 Store Packaging Hub"
              >
                <Store className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">PWABuilder</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold font-mono">
                  110
                </span>
              </button>
            )}

            {/* PM2 & VPS Guide Button */}
            <button
              id="header-deploy-modal-btn"
              type="button"
              onClick={onOpenDeployModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Server className="w-3.5 h-3.5 text-slate-300" />
              <span>{isBn ? "২৪/৭ VPS গাইড" : "24/7 VPS Guide"}</span>
            </button>

            {/* Language Switch */}
            <button
              id="header-lang-toggle"
              type="button"
              onClick={onToggleLang}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
              title="Toggle English / বাংলা"
            >
              {isBn ? "EN" : "বাং"}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 text-[11px] font-bold rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
