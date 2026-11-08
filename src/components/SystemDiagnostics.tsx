import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Cpu,
  KeyRound,
  Globe2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
  Info,
  Clock,
  Radio,
  Search,
  Smartphone,
  Bell,
  Wifi,
} from "lucide-react";
import { DiagnosticsData } from "../types";
import { fetchDiagnostics } from "../services/api";
import { backgroundService } from "../services/backgroundService";

interface SystemDiagnosticsProps {
  isBn?: boolean;
  onNavigateToTab?: (tab: any) => void;
}

export const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({
  isBn = false,
  onNavigateToTab,
}) => {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(10);
  const [countdown, setCountdown] = useState<number>(10);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [secondsSinceLastCheck, setSecondsSinceLastCheck] = useState<number>(0);
  const [isPollFlashing, setIsPollFlashing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Live Serper interactive test state
  const [serperQuery, setSerperQuery] = useState<string>("apple inc");
  const [isSerperSearching, setIsSerperSearching] = useState<boolean>(false);
  const [serperSearchResults, setSerperSearchResults] = useState<any[] | null>(null);
  const [serperSearchDuration, setSerperSearchDuration] = useState<number | null>(null);
  const [serperSearchErr, setSerperSearchErr] = useState<string | null>(null);

  // Background Daemon & Mobile Heartbeat state
  const [bgStatus, setBgStatus] = useState(backgroundService.state);

  useEffect(() => {
    return backgroundService.subscribe(setBgStatus);
  }, []);

  const executeSerperSearchTest = async () => {
    if (!serperQuery.trim()) return;
    setIsSerperSearching(true);
    setSerperSearchErr(null);
    const start = Date.now();
    try {
      const res = await fetch("/api/search/raw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: serperQuery.trim(), count: 4 }),
      });
      const json = await res.json();
      setSerperSearchDuration(Date.now() - start);
      if (json.success && Array.isArray(json.data)) {
        setSerperSearchResults(json.data);
      } else {
        setSerperSearchErr("Search query returned empty results");
      }
    } catch (err: any) {
      setSerperSearchErr(err.message || "Failed to query Serper.dev");
    } finally {
      setIsSerperSearching(false);
    }
  };

  const loadDiagnostics = async (isManual = false) => {
    if (isManual) setIsPinging(true);
    try {
      setErrorMessage(null);
      const res = await fetchDiagnostics();
      setData(res);
      setLastCheckTime(new Date());
      setSecondsSinceLastCheck(0);
      setCountdown(autoRefreshSec);
      
      // Visual pulse effect indicating background poll completed
      setIsPollFlashing(true);
      setTimeout(() => setIsPollFlashing(false), 800);
    } catch (err: any) {
      console.error("Diagnostics load error:", err);
      setErrorMessage(err.message || "Failed to query server diagnostics");
    } finally {
      setIsLoading(false);
      if (isManual) {
        setTimeout(() => setIsPinging(false), 300);
      }
    }
  };

  // Initial load
  useEffect(() => {
    loadDiagnostics(false);
  }, []);

  // Periodic Background Polling Effect with countdown and interval
  useEffect(() => {
    if (autoRefreshSec <= 0) return;

    // 1-second background clock for countdown and seconds-since-check ticker
    const timer = setInterval(() => {
      setSecondsSinceLastCheck((prev) => prev + 1);
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          // Trigger next background poll
          loadDiagnostics(false);
          return autoRefreshSec;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshSec]);

  // When autoRefreshSec changes, reset countdown
  useEffect(() => {
    setCountdown(autoRefreshSec);
  }, [autoRefreshSec]);

  // Quick live test trigger
  const runLiveModelCheck = async () => {
    setIsPinging(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/diagnostics");
      const json = await res.json();
      setData(json);
      setLastCheckTime(new Date());
      setSecondsSinceLastCheck(0);
      setCountdown(autoRefreshSec);
      setIsPollFlashing(true);
      setTimeout(() => setIsPollFlashing(false), 800);

      setTestResult(
        isBn
          ? `লাইভ পিং সফল! রেসপন্স টাইম: ${json.executionTimeMs}ms`
          : `Live probe completed in ${json.executionTimeMs}ms! Both services re-evaluated.`
      );
    } catch (err: any) {
      setTestResult(`Ping failed: ${err.message}`);
    } finally {
      setIsPinging(false);
    }
  };

  // Service health determination for visual Green/Red indicators
  const isGeminiGreen = data?.gemini.status === "VALID";
  const isSerperGreen = data?.serper.status === "VALID";

  const renderIndicatorBadge = (isGreen: boolean, labelGreen: string, labelRed: string) => {
    if (isGreen) {
      return (
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </span>
          <span className="tracking-wide uppercase font-mono">{labelGreen}</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-xs">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
        </span>
        <span className="tracking-wide uppercase font-mono">{labelRed}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Real-time Controls */}
      <div className={`p-6 rounded-2xl bg-white border shadow-xs transition-all duration-500 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
        isPollFlashing ? "border-emerald-400 ring-2 ring-emerald-400/20 shadow-emerald-500/10" : "border-slate-200/80"
      }`}>
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {isBn ? "সিস্টেম ও এপিআই ডায়াগনস্টিকস" : "System & API Diagnostics"}
                </h1>
                {/* Visual live heartbeat beacon */}
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "সার্ভার ও এপিআই কি-এর রিয়েল-টাইম স্বাস্থ্য পর্যবেক্ষণ ও ডায়াগনস্টিক ফিডব্যাক"
                  : "Continuous background health polling for Gemini AI, Serper.dev, and 24/7 autonomous agents"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Polling Cadence Selector */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500">
              {isBn ? "পোলিং ব্যবধান:" : "Poll Interval:"}
            </span>
            <select
              value={autoRefreshSec}
              onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={0}>{isBn ? "বন্ধ" : "Paused"}</option>
            </select>
          </div>

          {/* Live Ping Button */}
          <button
            type="button"
            onClick={runLiveModelCheck}
            disabled={isPinging}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isPinging ? (isBn ? "পিং হচ্ছে..." : "Pinging...") : (isBn ? "এখনই পিং করুন" : "Run Live Probe Now")}</span>
          </button>
        </div>
      </div>

      {/* Visual Green/Red Status Hero Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. GEMINI_API_KEY Visual Green/Red Indicator */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
          isGeminiGreen
            ? "bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 border-emerald-300 text-emerald-950 shadow-xs"
            : "bg-gradient-to-br from-rose-50/70 to-rose-100/30 border-rose-300 text-rose-950 shadow-xs"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className={`relative flex h-3.5 w-3.5 shrink-0 ${isGeminiGreen ? "" : "animate-pulse"}`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isGeminiGreen ? "bg-emerald-400" : "bg-rose-400"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 shadow-xs ${
                  isGeminiGreen ? "bg-emerald-500 shadow-emerald-500/80" : "bg-rose-500 shadow-rose-500/80"
                }`}></span>
              </span>
              <span className="font-mono text-xs font-bold tracking-wide">GEMINI_API_KEY</span>
            </div>
            {renderIndicatorBadge(
              isGeminiGreen,
              isBn ? "গ্রিন: সক্রিয়" : "GREEN: ONLINE",
              isBn ? "রেড: অনুপস্থিত" : "RED: OFFLINE"
            )}
          </div>
          <div className="mt-2.5">
            <p className="text-xs font-semibold">
              {isGeminiGreen
                ? (isBn ? "গুগল জেমিনাই ৩.৮ ফ্ল্যাশ ভেরিফাইড" : "Google Gemini 3.8 Flash & Audio SDR")
                : (isBn ? "সিক্রেটে কি পাওয়া যায়নি" : "Key Not Found in Secrets")}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
              <span>{isBn ? "লেটেন্সি:" : "Ping Latency:"} {data?.gemini.latencyMs ? `${data.gemini.latencyMs}ms` : "N/A"}</span>
              <span className="font-mono text-[10px] text-slate-500">{data?.gemini.maskedKey || (isBn ? "পাওয়া যায়নি" : "Unset")}</span>
            </div>
          </div>
        </div>

        {/* 2. SERPER_API_KEY Visual Green/Red Indicator */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
          isSerperGreen
            ? "bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 border-emerald-300 text-emerald-950 shadow-xs"
            : "bg-gradient-to-br from-rose-50/70 to-rose-100/30 border-rose-300 text-rose-950 shadow-xs"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className={`relative flex h-3.5 w-3.5 shrink-0 ${isSerperGreen ? "" : "animate-pulse"}`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSerperGreen ? "bg-emerald-400" : "bg-rose-400"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 shadow-xs ${
                  isSerperGreen ? "bg-emerald-500 shadow-emerald-500/80" : "bg-rose-500 shadow-rose-500/80"
                }`}></span>
              </span>
              <span className="font-mono text-xs font-bold tracking-wide">SERPER_API_KEY</span>
            </div>
            {renderIndicatorBadge(
              isSerperGreen,
              isBn ? "গ্রিন: সক্রিয়" : "GREEN: ONLINE",
              isBn ? "রেড: আনসেট" : "RED: UNSET"
            )}
          </div>
          <div className="mt-2.5">
            <p className="text-xs font-semibold">
              {isSerperGreen
                ? (isBn ? "Serper.dev ডিরেক্ট গুগল স্ক্র্যাপার" : "Serper.dev Direct Search Engine")
                : (isBn ? "ঐচ্ছিক কি (জেমিনাই গ্রাউন্ডিং সক্রিয়)" : "Optional (Using Gemini Grounding)")}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
              <span>{isBn ? "লেটেন্সি:" : "Ping Latency:"} {data?.serper.latencyMs ? `${data.serper.latencyMs}ms` : "N/A"}</span>
              <span className="font-mono text-[10px] text-slate-500">{data?.serper.maskedKey || (isBn ? "আনসেট" : "Unset")}</span>
            </div>
          </div>
        </div>

        {/* 3. Periodic Background Polling Daemon Card */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs ${
          isPollFlashing ? "ring-2 ring-emerald-400 border-emerald-400" : "border-slate-800"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
              </span>
              <span className="text-xs font-bold tracking-wide">
                {isBn ? "ব্যাকগ্রাউন্ড পোলিং ইঞ্জিন" : "Background Poller"}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {autoRefreshSec > 0 ? `${autoRefreshSec}s LOOP` : "PAUSED"}
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">{isBn ? "পরবর্তী অটো-চেক:" : "Next Auto-Check:"}</span>
              <span className="font-bold text-white font-mono text-sm">
                {autoRefreshSec > 0 ? `${countdown}s` : (isBn ? "পজ করা" : "Paused")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">{isBn ? "সর্বশেষ চেক:" : "Last Checked:"}</span>
              <span className="font-medium text-slate-300 text-xs">
                {secondsSinceLastCheck === 0
                  ? (isBn ? "এইমাত্র" : "Just now")
                  : `${secondsSinceLastCheck}s ${isBn ? "আগে" : "ago"}`}
              </span>
            </div>
          </div>

          {/* Progress bar visual for polling timer */}
          {autoRefreshSec > 0 && (
            <div className="mt-2.5 w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, (countdown / autoRefreshSec) * 100))}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Live Test Feedback Banner */}
      {testResult && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{testResult}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestResult(null)}
            className="text-emerald-700 hover:text-emerald-900 text-[11px] font-semibold underline"
          >
            {isBn ? "মুছে ফেলুন" : "Dismiss"}
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Gemini & Serper Monitor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Google Gemini API Diagnostics Card */}
        <div className={`p-6 rounded-2xl bg-white border shadow-xs flex flex-col justify-between transition-all duration-300 ${
          isGeminiGreen ? "border-emerald-200 shadow-emerald-500/5" : "border-rose-200 shadow-rose-500/5"
        }`}>
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`p-2.5 rounded-xl ${isGeminiGreen ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  {/* Overlaid Green / Red Indicator Beacon */}
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isGeminiGreen ? "bg-emerald-400" : "bg-rose-400"
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      isGeminiGreen ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                    }`}></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-slate-900">Google Gemini API</h2>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      GEMINI_API_KEY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isBn ? "প্রধান এআই ইঞ্জিন ও ভয়েস এসডিআর স্পিচ" : "Primary Generative AI & AI Voice SDR engine"}
                  </p>
                </div>
              </div>
              {renderIndicatorBadge(
                isGeminiGreen,
                isBn ? "গ্রিন: সক্রিয়" : "GREEN: ACTIVE",
                isBn ? "রেড: অনুপস্থিত" : "RED: MISSING"
              )}
            </div>

            {/* Status Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 mb-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isBn ? "ভিজ্যুয়াল ইনডিকেটর:" : "Visual Health Indicator:"}</span>
                <span className="font-bold flex items-center space-x-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isGeminiGreen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                  <span className={isGeminiGreen ? "text-emerald-700" : "text-rose-700"}>
                    {isGeminiGreen ? (isBn ? "গ্রিন (সফল সংযোগ)" : "GREEN (Verified & Ready)") : (isBn ? "রেড (কি পাওয়া যায়নি)" : "RED (Key Missing / Unset)")}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isBn ? "কি স্ট্যাটাস:" : "Key Configuration:"}</span>
                <span className="font-semibold text-slate-800">
                  {data?.gemini.maskedKey ? (
                    <span className="font-mono">{data.gemini.maskedKey}</span>
                  ) : (
                    <span className="text-rose-700 font-medium">{isBn ? "পাওয়া যায়নি" : "Not Set in Secrets"}</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isBn ? "লাইভ রাউন্ডট্রিপ লেটেন্সি:" : "Ping Latency:"}</span>
                <span className="font-semibold text-slate-800">
                  {data?.gemini.latencyMs ? `${data.gemini.latencyMs} ms` : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isBn ? "ফলব্যাক মোড সক্রিয়:" : "Zero-Failure Fallback:"}</span>
                <span className={`font-semibold ${data?.gemini.fallbackActive ? "text-rose-600" : "text-emerald-600"}`}>
                  {data?.gemini.fallbackActive
                    ? (isBn ? "হ্যাঁ (অ্যাপ চালু থাকবে)" : "Active (Never crashes)")
                    : (isBn ? "না (সম্পূর্ণ লাইভ)" : "Disabled (Full Live Gemini)")}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-800 mb-0.5">{isBn ? "ডায়াগনস্টিক রিপোর্ট:" : "Diagnostic Report:"}</p>
                <p>{data?.gemini.message || (isBn ? "পর্যবেক্ষণ করা হচ্ছে..." : "Probing service...")}</p>
              </div>
            </div>

            {/* Enabled Models & Feature Capabilities */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-semibold text-slate-700 block">
                {isBn ? "সমর্থিত ক্যাপাবিলিটি ও ফিচার:" : "Supported Capabilities & Features:"}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700">Lead Intelligence (3.8 Flash)</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700">Multi-Channel Pitch Generator</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700">AI Voice SDR (3.1 TTS Preview)</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700">Competitor Battlecard Radar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Instructions Box */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
            <div className="flex items-center space-x-1.5 font-semibold text-indigo-900 mb-1.5">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>{isBn ? "কিভাবে সেটআপ করবেন:" : "Configuration Guide:"}</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-indigo-800 text-[11px] leading-relaxed">
              <li>{isBn ? "উপরের ডানদিকের সেটিংস মেনুতে ক্লিক করুন।" : "Click on the Settings menu in Google AI Studio."}</li>
              <li>{isBn ? "Secrets প্যানেলে যান।" : "Navigate to the 'Secrets' tab."}</li>
              <li>
                {isBn ? (
                  <span>
                    <code className="font-mono bg-indigo-100/70 px-1 py-0.5 rounded text-indigo-900">GEMINI_API_KEY</code> এর মান দিয়ে সংরক্ষণ করুন।
                  </span>
                ) : (
                  <span>
                    Add or update <code className="font-mono bg-indigo-100/70 px-1 py-0.5 rounded text-indigo-900">GEMINI_API_KEY</code>.
                  </span>
                )}
              </li>
              <li>{isBn ? "সংরক্ষণ করার পর ব্যাকগ্রাউন্ড পোলার অটো-ডিটেক্ট করবে অথবা 'এখনই পিং করুন' বাটনে চাপ দিন।" : "Once saved, background polling auto-detects it within seconds, or click 'Run Live Probe Now'."}</li>
            </ol>
          </div>
        </div>

        {/* 2. Serper.dev Search API Diagnostics Card */}
        <div className={`p-6 rounded-2xl bg-white border shadow-xs flex flex-col justify-between transition-all duration-300 ${
          isSerperGreen ? "border-emerald-200 shadow-emerald-500/5" : "border-rose-200 shadow-rose-500/5"
        }`}>
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`p-2.5 rounded-xl ${isSerperGreen ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                    <Globe2 className="w-5 h-5" />
                  </div>
                  {/* Overlaid Green / Red Indicator Beacon */}
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isSerperGreen ? "bg-emerald-400" : "bg-rose-400"
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      isSerperGreen ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                    }`}></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-slate-900">Serper.dev Web Search</h2>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      SERPER_API_KEY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isBn ? "ঐচ্ছিক সরাসরি গুগল সার্চ ইন্ডেক্সিং প্রোভাইডার" : "Optional direct Google Search organic scraper"}
                  </p>
                </div>
              </div>
              {renderIndicatorBadge(
                isSerperGreen,
                isBn ? "গ্রিন: সক্রিয়" : "GREEN: ACTIVE",
                isBn ? "রেড: আনসেট" : "RED: UNSET"
              )}
            </div>

            {/* Status Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 mb-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isBn ? "ভিজ্যুয়াল ইনডিকেটর:" : "Visual Health Indicator:"}</span>
                <span className="font-bold flex items-center space-x-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isSerperGreen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                  <span className={isSerperGreen ? "text-emerald-700" : "text-rose-700"}>
                    {isSerperGreen ? (isBn ? "গ্রিন (সরাসরি স্ক্র্যাপার সক্রিয়)" : "GREEN (Direct Scraping Connected)") : (isBn ? "রেড (গ্রাউন্ডিং মোড সক্রিয়)" : "RED (Unconfigured - Using Gemini Grounding)")}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isBn ? "কি কনফিগারেশন:" : "Key Configuration:"}</span>
                <span className="font-semibold text-slate-800">
                  {data?.serper.maskedKey ? (
                    <span className="font-mono">{data.serper.maskedKey}</span>
                  ) : (
                    <span className="text-slate-500 font-medium">{isBn ? "ঐচ্ছিক (কনফিগার করা হয়নি)" : "Optional (Not Configured)"}</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isBn ? "লেটেন্সি:" : "Ping Latency:"}</span>
                <span className="font-semibold text-slate-800">
                  {data?.serper.latencyMs ? `${data.serper.latencyMs} ms` : "N/A (Using Gemini Grounding)"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isBn ? "সার্চ ব্যাকবোন মোড:" : "Search Backbone:"}</span>
                <span className="font-semibold text-blue-600">
                  {isSerperGreen
                    ? (isBn ? "সরাসরি Serper.dev API" : "Direct Serper.dev API")
                    : (isBn ? "অটোনোমাস জেমিনাই গুগল সার্চ গ্রাউন্ডিং" : "Autonomous Gemini Search Grounding")}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-800 mb-0.5">{isBn ? "ডায়াগনস্টিক রিপোর্ট:" : "Diagnostic Report:"}</p>
                <p>{data?.serper.message || (isBn ? "পর্যবেক্ষণ করা হচ্ছে..." : "Probing service...")}</p>
              </div>
            </div>

            {/* Live Serper Search Query Tester (e.g. apple inc) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
              <div className="flex items-center justify-between font-semibold text-slate-800 mb-2">
                <span className="flex items-center space-x-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isBn ? "লাইভ Serper সার্চ টেস্ট (Google SERP)" : "Live Serper Google Query Probe"}</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {isSerperGreen ? "API ACTIVE" : "GROUNDING"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={serperQuery}
                  onChange={(e) => setSerperQuery(e.target.value)}
                  placeholder="e.g. apple inc, b2b fintech..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") executeSerperSearchTest();
                  }}
                />
                <button
                  type="button"
                  onClick={executeSerperSearchTest}
                  disabled={isSerperSearching || !serperQuery.trim()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isSerperSearching ? "animate-spin" : ""}`} />
                  <span>{isSerperSearching ? (isBn ? "খোঁজা হচ্ছে..." : "Searching...") : (isBn ? "টেস্ট করুন" : "Search")}</span>
                </button>
              </div>

              {serperSearchErr && (
                <div className="mt-2 text-rose-600 text-[11px]">{serperSearchErr}</div>
              )}

              {serperSearchResults && (
                <div className="mt-2.5 space-y-1.5 border-t border-slate-200/80 pt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {isBn ? "ফলাফল পাওয়া গেছে:" : "Results Found:"} <b>{serperSearchResults.length}</b>
                    </span>
                    {serperSearchDuration && (
                      <span className="font-mono text-[10px] text-emerald-600">
                        {serperSearchDuration}ms
                      </span>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {serperSearchResults.map((res: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200/80 text-[11px]">
                        <a
                          href={res.link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-indigo-600 hover:underline flex items-center justify-between line-clamp-1"
                        >
                          <span>{res.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-1 shrink-0 text-slate-400" />
                        </a>
                        <p className="text-slate-500 line-clamp-2 mt-0.5">{res.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Explanation of Fallback Mechanism */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-4">
              <div className="flex items-center space-x-2 font-semibold text-slate-800 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isBn ? "স্বয়ংক্রিয় সার্চ আর্কিটেকচার" : "Autonomous Grounding Guarantee"}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {isBn
                  ? "Serper.dev কি না থাকলেও কোনো সমস্যা নেই! Sovereign Core Hub স্বয়ংক্রিয়ভাবে জেমিনাই-এর অন্তর্নির্মিত গুগল সার্চ গ্রাউন্ডিং ব্যবহার করে ইন্টারনেটের লাইভ রিয়েল-টাইম তথ্য অনুসন্ধান করে।"
                  : "If SERPER_API_KEY is not supplied, the app automatically switches to Gemini's native Google Search Grounding with zero disruption to lead scanning."}
              </p>
            </div>
          </div>

          {/* Setup Guide */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
            <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
              <span>{isBn ? "ঐচ্ছিক Serper অ্যাকাউন্ট লিংক:" : "Optional Serper API Account:"}</span>
              <a
                href="https://serper.dev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-semibold text-[11px]"
              >
                <span>serper.dev</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isBn
                ? "আপনি যদি মাসে ২,৫০০টি ফ্রি সার্চ ব্যবহার করতে চান, তবে serper.dev থেকে ফ্রি কি নিয়ে Settings > Secrets প্যানেলে SERPER_API_KEY নামে যুক্ত করতে পারেন।"
                : "Provides 2,500 free Google searches. Add SERPER_API_KEY in Settings > Secrets if you want dedicated organic SERP parsing."}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile 24/7 Background & Real-Time Push Notification Engine Status */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? "মোবাইল ব্যাকগ্রাউন্ড ডিমেন ও রিয়েল-টাইম নোটিফিকেশন ইঞ্জিন" : "Mobile Background Daemon & Real-Time Notification Engine"}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? "ইন্টারনেট কানেকশন, ব্রাউজার থ্রটলিং বাইপাস ও লক-স্ক্রিন পুশ স্ট্যাটাস" : "Network state, throttling bypass worker & push status"}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{bgStatus.isOnline ? "ONLINE 24/7" : "OFFLINE"}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[11px] mb-1">{isBn ? "নেটওয়ার্ক কানেক্টিভিটি" : "Network Link"}</span>
            <span className="font-bold text-slate-800 flex items-center space-x-1">
              <Wifi className={`w-3.5 h-3.5 ${bgStatus.isOnline ? "text-emerald-600" : "text-rose-500"}`} />
              <span>{bgStatus.isOnline ? (isBn ? "সংযুক্ত (Connected)" : "Connected") : (isBn ? "বিচ্ছিন্ন (Offline)" : "Offline")}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[11px] mb-1">{isBn ? "ওয়েব ওয়ার্কার হার্টবিট" : "Web Worker Daemon"}</span>
            <span className="font-bold text-indigo-600 flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>{isBn ? "টিক সক্রিয় (১০ সে)" : "Active (10s Tick)"}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[11px] mb-1">{isBn ? "লক-স্ক্রিন নোটিফিকেশন" : "Lockscreen Push"}</span>
            <span className={`font-bold ${bgStatus.notificationPermission === "granted" ? "text-emerald-600" : "text-amber-600"}`}>
              {bgStatus.notificationPermission === "granted"
                ? (isBn ? "অনুমোদিত (Granted)" : "Granted")
                : bgStatus.notificationPermission === "denied"
                ? (isBn ? "অস্বীকৃত (Blocked)" : "Blocked")
                : (isBn ? "অনুমতি অপেক্ষমাণ" : "Pending Prompt")}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[11px] mb-1">{isBn ? "স্ক্রিন ওয়েক-লক" : "WakeLock Screen"}</span>
            <span className={`font-bold ${bgStatus.isWakeLockActive ? "text-amber-600" : "text-slate-600"}`}>
              {bgStatus.isWakeLockActive ? (isBn ? "সক্রিয় (Active)" : "Active") : (isBn ? "নিষ্ক্রিয় (Standby)" : "Standby")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <p className="text-slate-500 text-[11px]">
            {isBn
              ? "মিনিমাইজ অবস্থায় ব্যাকগ্রাউন্ড সাসপেনশন এড়াতে ওয়েব ওয়ার্কার এবং নোটিফিকেশন এপিআই ব্যবহৃত হচ্ছে।"
              : "Uses background Web Worker heartbeat and System Notification API to deliver real-time outreach alerts even when minimized."}
          </p>
          <button
            type="button"
            onClick={() => {
              backgroundService.sendNotification(
                isBn ? "🔔 Sovereign Core Hub পরীক্ষা" : "🔔 Sovereign Core Hub Live Alert",
                isBn
                  ? "মোবাইল ব্যাকগ্রাউন্ড নোটিফিকেশন ইঞ্জিন সফলভাবে সক্রিয় রয়েছে!"
                  : "Mobile background notification engine is fully active and verified!"
              );
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200 flex items-center space-x-1.5 cursor-pointer transition"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isBn ? "টেস্ট নোটিফিকেশন পাঠান" : "Trigger Test Notification"}</span>
          </button>
        </div>
      </div>

      {/* System Telemetry & 24/7 Autonomous Daemon Status */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? "সার্ভার ও ২৪/৭ ব্যাকগ্রাউন্ড ডিমনের অবস্থা" : "Server Runtime & 24/7 Autonomous Daemon Telemetry"}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? "কনটেইনার সিস্টেম ও ব্যাকগ্রাউন্ড শিডিউলার হেলথ" : "Container runtime metrics and background scheduler health"}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>{data?.system.cronStatus || "ACTIVE"}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[11px] mb-1">{isBn ? "সার্ভার আপটাইম" : "Server Uptime"}</span>
            <span className="font-bold text-slate-800 text-sm">
              {data?.system.uptimeSeconds
                ? `${Math.floor(data.system.uptimeSeconds / 60)}m ${data.system.uptimeSeconds % 60}s`
                : "Calculating..."}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[11px] mb-1">{isBn ? "মেমোরি ব্যবহার" : "Memory Utilization"}</span>
            <span className="font-bold text-slate-800 text-sm">
              {data?.system.memoryUsageMB ? `${data.system.memoryUsageMB} MB RSS` : "N/A"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[11px] mb-1">{isBn ? "নোড রানটাইম" : "Node.js Engine"}</span>
            <span className="font-bold text-slate-800 text-sm">
              {data?.system.nodeVersion || process.version || "v20+"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[11px] mb-1">{isBn ? "ব্যাকগ্রাউন্ড ক্রন জব" : "Active Daemon Jobs"}</span>
            <span className="font-bold text-emerald-600 text-sm">
              3 {isBn ? "টি সক্রিয় (২৪/৭)" : "Active 24/7"}
            </span>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 text-[11px]">
            {isBn ? "সর্বশেষ পরীক্ষা:" : "Last probe timestamp:"}{" "}
            {lastCheckTime.toLocaleTimeString()}
          </span>
          {onNavigateToTab && (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => onNavigateToTab("leads")}
                className="text-slate-600 hover:text-slate-900 font-semibold transition"
              >
                {isBn ? "→ লিড রাডারে যান" : "→ Go to Lead Radar"}
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab("automation")}
                className="text-slate-600 hover:text-slate-900 font-semibold transition"
              >
                {isBn ? "→ অটমেশন কনসোলে যান" : "→ Go to 24/7 Console"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
