import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Bell,
  Wifi,
  WifiOff,
  Power,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  X,
  Radio,
  Download,
  Info,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { backgroundService, BackgroundServiceState } from "../services/backgroundService";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface MobileHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBn: boolean;
}

export const MobileHubModal: React.FC<MobileHubModalProps> = ({
  isOpen,
  onClose,
  isBn,
}) => {
  const [serviceState, setServiceState] = useState<BackgroundServiceState>(backgroundService.state);
  const [testSent, setTestSent] = useState<boolean>(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  useEffect(() => {
    const unsubscribe = backgroundService.subscribe((state) => {
      setServiceState({ ...state });
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleRequestNotification = async () => {
    const res = await backgroundService.requestNotificationPermission();
    if (res === "granted") {
      setTestMessage(
        isBn
          ? "সফল! নোটিফিকেশন অনুমোদন হয়েছে।"
          : "Success! Push notification permissions granted."
      );
    } else if (res === "denied") {
      setTestMessage(
        isBn
          ? "অনুরোধ বাতিল হয়েছে। অনুগ্রহ করে ব্রাউজার সেটিংস থেকে নোটিফিকেশন পারমিশন দিন।"
          : "Permission denied. Please allow notifications in browser site settings."
      );
    }
    setTimeout(() => setTestMessage(null), 5000);
  };

  const handleSendTestNotification = () => {
    if (serviceState.notificationPermission !== "granted") {
      handleRequestNotification();
      return;
    }

    backgroundService.sendNotification(
      isBn ? "🎯 Sovereign Core: রিয়েল-টাইম লিড অ্যালার্ট" : "🎯 Sovereign Core: High-Intent B2B Lead Found",
      isBn
        ? "Acme SaaS Solutions - অটোনোমাস রোবট নতুন হাই-স্কোর লিড খুঁজে পেয়েছে! (মিনিমাইজড মোডে টেস্ট সম্পন্ন)"
        : "Acme SaaS Solutions - Autonomous radar detected a 94/100 intent lead while background active!",
      { tag: "test-alert" }
    );

    setTestSent(true);
    setTestMessage(
      isBn
        ? "টেস্ট পুশ নোটিফিকেশন পাঠানো হয়েছে! মোবাইল নোটিফিকেশন ট্রে চেক করুন।"
        : "Test push notification sent! Check your phone's notification tray."
    );
    setTimeout(() => {
      setTestSent(false);
      setTestMessage(null), 6000;
    }, 6000);
  };

  const handleToggleWakeLock = async () => {
    await backgroundService.toggleWakeLock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-md shadow-indigo-600/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {isBn
                    ? "মোবাইল ২৪/৭ ব্যাকগ্রাউন্ড ও নোটিফিকেশন হাব"
                    : "Mobile 24/7 Background & Notification Hub"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {serviceState.isOnline ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn
                  ? "ইন্টারনেট থাকা অবস্থায় মিনিমাইজ করলেও অ্যাপ সার্বক্ষণিক সচল রাখা ও রিয়েল-টাইম নোটিফিকেশন প্রদান"
                  : "Keep active when minimized, reconnect on internet access, and deliver instant push alerts"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message banner */}
        {testMessage && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{testMessage}</span>
            </div>
            <button
              onClick={() => setTestMessage(null)}
              className="text-indigo-500 hover:text-indigo-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 4 Core Mobile Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Network Connectivity */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{isBn ? "ইন্টারনেট" : "Internet"}</span>
              {serviceState.isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              )}
            </div>
            <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  serviceState.isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              ></span>
              <span>{serviceState.isOnline ? (isBn ? "কানেক্টেড" : "Connected") : (isBn ? "ডিসকানেক্টেড" : "Disconnected")}</span>
            </div>
          </div>

          {/* 2. Notification Permission */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{isBn ? "নোটিফিকেশন" : "Push Alert"}</span>
              <Bell className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  serviceState.notificationPermission === "granted"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              ></span>
              <span className="capitalize text-xs">
                {serviceState.notificationPermission === "granted"
                  ? (isBn ? "অনুমোদিত" : "Active")
                  : serviceState.notificationPermission === "denied"
                  ? (isBn ? "বন্ধ" : "Denied")
                  : (isBn ? "অনুরোধ আবশ্যক" : "Prompt")}
              </span>
            </div>
          </div>

          {/* 3. Minimized / Foreground State */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{isBn ? "অ্যাপ স্টেট" : "App State"}</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-sm font-bold text-slate-900 text-xs">
              {serviceState.isMinimized ? (
                <span className="text-amber-600 font-semibold">{isBn ? "মিনিমাইজড (সচল)" : "Minimized (Active)"}</span>
              ) : (
                <span className="text-emerald-600 font-semibold">{isBn ? "স্ক্রিন ওপেন" : "Foreground"}</span>
              )}
            </div>
          </div>

          {/* 4. Web Worker Heartbeat */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{isBn ? "ব্যাকগ্রাউন্ড টিক" : "Daemon Tick"}</span>
              <Radio className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-sm font-bold font-mono text-slate-900">
              #{serviceState.heartbeatCounter}
            </div>
          </div>
        </div>

        {/* Section 1: Real-time Notification Controller */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border border-indigo-200/80 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isBn ? "১. রিয়েল-টাইম পুশ নোটিফিকেশন ইঞ্জিন" : "1. Real-time Push Notification Engine"}
                </h3>
                <p className="text-xs text-slate-600">
                  {isBn
                    ? "অ্যাপটি মিনিমাইজ বা ব্যাকগ্রাউন্ডে রাখলেও নতুন বিটুবি লিড পাওয়া মাত্র আপনার মোবাইলে রিয়েল-টাইম নোটিফিকেশন আসবে।"
                    : "Receive instant native alerts on your phone lock screen & notification tray whenever new B2B leads are detected."}
                </p>
              </div>
            </div>

            {serviceState.notificationPermission === "granted" ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? "অনুমোদিত" : "Active"}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestNotification}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
              >
                {isBn ? "অনুমতি দিন" : "Enable Alerts"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-indigo-200/60">
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {testSent
                  ? (isBn ? "পাঠানো হয়েছে..." : "Notification Sent!")
                  : (isBn ? "টেস্ট নোটিফিকেশন পাঠান" : "Send Test Alert to Mobile")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => backgroundService.playAlertSound()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isBn ? "অ্যালার্ট সাউন্ড টেস্ট" : "Test Sound"}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Stay Active When Minimized & Internet Reconnect */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? "২. মিনিমাইজড মোডে সচল থাকা ও অটো-রিকানেক্ট" : "2. Background Persistence & Auto-Reconnect"}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "মোবাইল ব্রাউজার স্লিপ রোধ ও সার্বক্ষণিক ব্যাকগ্রাউন্ড ডাটা এক্সচেঞ্জ মেকানিজম"
                  : "Independent Web Worker heartbeat to prevent mobile browser timer suspension"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? "ইন্টারনেট অটো-ডিটেক্ট:" : "Network Auto-Resume:"}</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {isBn
                  ? "ওয়াইফাই বা মোবাইল ডাটা বন্ধ হয়ে পুনরায় চালু হলে স্বয়ংক্রিয়ভাবে অটোনোমাস এজেন্ট আবার সচল হবে এবং নোটিফিকেশন দেবে।"
                  : "Automatically detects network drop and seamlessly resumes scraping daemon once internet is restored."}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                  <Power className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isBn ? "স্ক্রিন ওয়েক-লক (Keep Awake):" : "Screen WakeLock:"}</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleWakeLock}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                    serviceState.isWakeLockActive
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {serviceState.isWakeLockActive ? (isBn ? "অন" : "ACTIVE") : (isBn ? "অফ" : "OFF")}
                </button>
              </div>
              <p className="text-slate-500 text-[11px]">
                {isBn
                  ? "চালু রাখলে মোবাইল ফোনের স্ক্রিন অটো-লক বা স্লিপ হবে না, ফলে নিরবচ্ছিন্ন মনিটরিং নিশ্চিত থাকে।"
                  : "Prevents your mobile screen from sleeping or dimming during critical outbound monitoring."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Progressive Web App (PWA) Mobile Install */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isBn ? "৩. মোবাইল হোমস্ক্রিন অ্যাপ হিসেবে ইনস্টল (PWA)" : "3. Install as Mobile App (PWA)"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? "হোমস্ক্রিনে ইনস্টল করলে ব্রাউজার ইউআরএল বার ছাড়াই ফুলস্ক্রিন নেটিভ অ্যাপ হিসেবে ব্যাকগ্রাউন্ডে কাজ করবে।"
                    : "Install on mobile home screen to run in standalone native mode with enhanced background persistence."}
                </p>
              </div>
            </div>

            {isInstalled ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? "ইনস্টল্ড" : "Installed"}</span>
              </span>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={install}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isBn ? "ইনস্টল করুন" : "Install App"}</span>
              </button>
            ) : null}
          </div>
          {/* Visual Mobile Preview Mockup */}
          <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-20 h-28 rounded-lg overflow-hidden border border-slate-300 shadow-xs shrink-0">
              <img
                src="/images/lead_radar_mockup.jpg"
                alt="Mobile PWA Display Mockup"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {isBn ? "ফুলস্ক্রিন মোবাইল স্ট্যান্ডঅ্যালোন মোড" : "Fullscreen Mobile Standalone PWA"}
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                {isBn
                  ? "হোমস্ক্রিনে ইন্সটল করলে কোনো ব্রাউজার ইউআরএল বার বা অ্যাড্রেস বার থাকবে না। ফোন স্লিপ বা লক করলেও নোটিফিকেশন পাবেন।"
                  : "Zero browser address bar clutter, instant touch response, and real-time push audio chimes on new lead discovery."}
              </p>
            </div>
          </div>

          {/* iOS Guidance */}
          {isIOS && !isInstalled && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                <span>{isBn ? "আইফোন / আইপ্যাডে ইনস্টল করার নিয়ম:" : "iOS Safari Installation Instructions:"}</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-amber-800 text-[11px] pl-1">
                <li>{isBn ? "সাফারি ব্রাউজারের নিচে শেয়ার (Share) বাটনে ট্যাপ করুন।" : "Tap the Share button at the bottom of Safari toolbar."}</li>
                <li>{isBn ? "নিচে স্ক্রল করে 'Add to Home Screen' নির্বাচন করুন।" : "Scroll down and select 'Add to Home Screen'."}</li>
                <li>{isBn ? "'Add' বাটনে চাপলে অ্যাপটি হোমস্ক্রিনে চলে আসবে।" : "Tap 'Add' in the top right to launch Sovereign Core as a standalone native app."}</li>
              </ol>
            </div>
          )}

          {/* Android Guidance */}
          {!isIOS && !isInstalled && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isBn ? "অ্যান্ড্রয়েড ক্রোমে ইনস্টলেশন:" : "Android Chrome Installation:"}</span>
              </div>
              <p className="text-[11px]">
                {isBn
                  ? "উপরের 'ইনস্টল করুন' বাটনে চাপ দিন অথবা ক্রোম মেনু (৩ ডট) থেকে 'Install app' বা 'Add to Home screen' চাপুন।"
                  : "Tap 'Install App' above or open Chrome menu (3 dots) and select 'Install app' for background alerts."}
              </p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? "২৪/৭ ক্লাউড অ্যান্ড মোবাইল সিঙ্ক সক্রিয়" : "24/7 Cloud & Mobile Synchronization Active"}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            {isBn ? "ঠিক আছে, বন্ধ করুন" : "Close Hub"}
          </button>
        </div>
      </div>
    </div>
  );
};
