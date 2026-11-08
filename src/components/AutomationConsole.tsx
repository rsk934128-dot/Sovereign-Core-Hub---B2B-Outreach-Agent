import React, { useState, useEffect } from "react";
import {
  Radio,
  Server,
  Play,
  RotateCw,
  Copy,
  Check,
  Activity,
  Terminal,
  Clock,
  Zap,
  ShieldCheck,
  Smartphone,
  Cpu,
  ArrowUpRight,
  Sparkles,
  Bell,
  GitCompare,
  BarChart3,
} from "lucide-react";
import { CronJobInfo, ActivityLog } from "../types";
import { getCronStatus, triggerCronJob, getActivityLogs } from "../services/api";
import { ABTestingVisualizer } from "./ABTestingVisualizer";

interface AutomationConsoleProps {
  isWakeLockActive: boolean;
  onToggleWakeLock: () => void;
  onOpenMobileHub?: () => void;
  isBn: boolean;
  onDeployWinnerTemplate?: (templateId: string, templateName: string) => void;
}

export const AutomationConsole: React.FC<AutomationConsoleProps> = ({
  isWakeLockActive,
  onToggleWakeLock,
  onOpenMobileHub,
  isBn,
  onDeployWinnerTemplate,
}) => {
  const [cronJobs, setCronJobs] = useState<CronJobInfo[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "abTesting" | "daemons">("overview");

  const pm2Commands = [
    { label: "1. Build Production App", cmd: "npm run build" },
    { label: "2. Start with PM2 24/7", cmd: 'pm2 start dist/server.cjs --name "sovereign-core-hub"' },
    { label: "3. Auto-Restart on Reboot", cmd: "pm2 save && pm2 startup" },
  ];

  const fetchStatus = async () => {
    setIsRefreshing(true);
    try {
      const data = await getCronStatus();
      setCronJobs(data.cronJobs || []);
      setLogs(data.recentLogs || []);
    } catch (err) {
      console.error("Error fetching cron status:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = async (jobId: string) => {
    setTriggeringJob(jobId);
    try {
      await triggerCronJob(jobId);
      await fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringJob(null);
    }
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Architecture Visual */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="max-w-2xl flex-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/20">
            <Radio className="w-3.5 h-3.5" />
            <span>Autonomous Server Daemon</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            {isBn ? "২৪/৭ ব্যাকগ্রাউন্ড অটোমেশন ও ক্রন অর্কেস্ট্রেশন" : "24/7 Autonomous Scheduler & Daemon Console"}
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-2xl mb-4">
            {isBn
              ? "ব্রাউজার বা ফোন বন্ধ থাকলেও ব্যাকএন্ড এক্সপ্রেস সার্ভার node-cron দিয়ে স্বয়ংক্রিয়ভাবে লিড খোঁজে, আউটরিচ ইমেইল ডিসপ্যাচ করে এবং ইনকামিং রেসপন্স স্ক্যান করে।"
              : "Server-side node-cron tasks run uninterrupted in the background even if you close this browser tab, shut down your computer, or lock your mobile device."}
          </p>

          <button
            type="button"
            onClick={fetchStatus}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shrink-0 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isBn ? "মেট্রিক্স রিফ্রেশ করুন" : "Refresh Metrics"}</span>
          </button>
        </div>

        {/* Daemon Visual Mockup */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl">
            <img
              src="/images/hero_banner.jpg"
              alt="Autonomous Pipeline Architecture"
              referrerPolicy="no-referrer"
              className="w-full h-40 object-cover object-center transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px]">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? "২৪/৭ ব্যাকগ্রাউন্ড ইঞ্জিন" : "24/7 Background Core"}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                DAEMON
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === "overview"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBn ? "সার্বিক ওভারভিউ (Console Overview)" : "All Automations"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("abTesting")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === "abTesting"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isBn ? "পিচ এ/বি টেস্টিং ভিজ্যুয়ালাইজার" : "Pitch Template A/B Testing"}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 font-bold ml-1">
              NEW
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("daemons")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === "daemons"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{isBn ? "ক্রন ডেমন্স ও সার্ভার (Cron Daemons)" : "Cron Tasks & PM2"}</span>
          </button>
        </div>
      </div>

      {/* When in dedicated A/B Testing subtab */}
      {activeSubTab === "abTesting" && (
        <div className="space-y-6">
          <ABTestingVisualizer
            isBn={isBn}
            onDeployWinner={onDeployWinnerTemplate}
          />
        </div>
      )}

      {/* When in Overview or Daemons */}
      {activeSubTab !== "abTesting" && (
        <>
          {/* 3 Pillars of 24/7 Operations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1: VPS / PM2 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3">
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {isBn ? "১. ক্লাউড VPS ডিপ্লয়মেন্ট" : "1. Cloud VPS & PM2"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Hetzner, DigitalOcean, Linode বা AWS-এ ৩-৫ ডলারের লিনাক্স সার্ভারে PM2 দিয়ে চালালে অ্যাপটি কখনো বন্ধ হবে না।
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start">
                Best Practice: 99.99% Uptime
              </span>
            </div>

            {/* Pillar 2: Server Cron Jobs */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {isBn ? "২. সার্ভার ক্রন-জব (node-cron)" : "2. Server-side Cron Jobs"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  React UI ছাড়াই ব্যাকএন্ড এক্সপ্রেস ক্রন-জব স্বাধীনভাবে লিড খুঁজবে এবং নির্ধারিত সময়ের ইন্টারভালে ডিসপ্যাচ সম্পন্ন করবে।
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start">
                Integrated in server.ts
              </span>
            </div>

            {/* Pillar 3: WakeLock / Mobile Saver */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {isBn ? "৩. মোবাইল সেভার (WakeLock)" : "3. Mobile Keep-Awake"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  মোবাইল বা ট্যাবলেটে মনিটর হিসেবে রাখলে স্ক্রিন লক প্রতিরোধ করে এবং লাইভ ব্যাকগ্রাউন্ড সিঙ্ক চালু রাখে।
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleWakeLock}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition self-start cursor-pointer ${
                  isWakeLockActive
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {isWakeLockActive ? "WakeLock Active (Screen ON)" : "Enable WakeLock"}
              </button>
            </div>
          </div>

          {/* Mobile 24/7 Background & Real-Time Push Notification Engine Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-900/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">
                    {isBn ? "মোবাইল ডিভাইসে সার্বক্ষণিক সচল ও রিয়েল-টাইম নোটিফিকেশন" : "Mobile 24/7 Background Active & Push Alerts"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    DAEMON READY
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {isBn
                    ? "মোবাইল ডিভাইসে ইন্টারনেট কানেক্ট হলে অ্যাপ মিনিমাইজ করে রাখলেও ইন্ডিপেন্ডেন্ট ব্যাকগ্রাউন্ড টিক ও সার্ভিস ওয়ার্কারের মাধ্যমে সার্বক্ষণিক সচল থাকে এবং নতুন বিটুবি লিড পাওয়া মাত্র তাৎক্ষণিক পুশ নোটিফিকেশন পাঠায়।"
                    : "Continuous Web Worker daemon keeps radar active when minimized. When mobile reconnects to internet, background sync automatically resumes and triggers real-time lock-screen alerts."}
                </p>
              </div>
            </div>
            {onOpenMobileHub && (
              <button
                type="button"
                onClick={onOpenMobileHub}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-2 shrink-0 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isBn ? "মোবাইল হাব ও নোটিফিকেশন টেস্ট" : "Open Mobile Hub & Test"}</span>
              </button>
            )}
          </div>

          {/* In Overview mode, render the A/B Testing Visualization right here as well */}
          {activeSubTab === "overview" && (
            <ABTestingVisualizer
              isBn={isBn}
              onDeployWinner={onDeployWinnerTemplate}
            />
          )}

          {/* Active Server-Side Cron Jobs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? "সক্রিয় সার্ভার ক্রন জবস (Active Cron Jobs)" : "Autonomous Cron Tasks in server.ts"}</span>
            </h3>

        <div className="space-y-3">
          {cronJobs.map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-sm font-bold text-slate-900">{job.name}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                    {job.schedule}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{job.description}</p>
                <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-mono">
                  <span>Last Executed: {new Date(job.lastRun).toLocaleTimeString()}</span>
                  <span>Next Run: {new Date(job.nextRun).toLocaleTimeString()}</span>
                  <span>Completed Runs: {job.totalRuns}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTrigger(job.id)}
                disabled={triggeringJob === job.id}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {triggeringJob === job.id ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
                <span>{isBn ? "এখনই চালান (Test Trigger)" : "Trigger Now"}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PM2 Commands Cheat Sheet */}
      <div className="bg-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight text-white">
              {isBn ? "PM2 দিয়ে সার্ভারে ২৪/৭ রান করার ৩টি সহজ কমান্ড" : "Run 24/7 on Ubuntu VPS with PM2"}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Process Manager</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {pm2Commands.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
            >
              <div className="overflow-x-auto">
                <span className="text-slate-400 text-[11px] block mb-0.5 font-sans">
                  {item.label}
                </span>
                <span className="text-emerald-400 font-bold">{item.cmd}</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`pm2-${idx}`, item.cmd)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
                title="Copy Command"
              >
                {copiedCmd === `pm2-${idx}` ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity Log Stream */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? "লাইভ সার্ভার অ্যাক্টিভিটি লগ (Daemon Feed)" : "Live Daemon Event Log"}</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Ring Buffer (100 events)</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between text-xs font-mono"
            >
              <div className="flex items-start space-x-2.5">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    log.status === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-800"
                      : log.status === "ERROR"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-200 text-slate-800"
                  }`}
                >
                  {log.category}
                </span>
                <span className="text-slate-800 font-sans text-xs">{log.message}</span>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
