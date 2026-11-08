import React, { useState } from "react";
import {
  Sliders,
  Search,
  Sparkles,
  ShieldAlert,
  Target,
  ArrowRight,
  Zap,
  Loader2,
  Copy,
  Check,
  TrendingDown,
  Award,
} from "lucide-react";
import { CompetitorData } from "../types";
import { analyzeCompetitor } from "../services/api";

interface CompetitorRadarProps {
  isBn: boolean;
}

export const CompetitorRadar: React.FC<CompetitorRadarProps> = ({ isBn }) => {
  const [competitorInput, setCompetitorInput] = useState("Apollo.io");
  const [nicheInput, setNicheInput] = useState("B2B Sales Intelligence & Email Outreach");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompetitorData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const presets = [
    { name: "Apollo.io", niche: "B2B Contact Database & Sequences" },
    { name: "Lemlist", niche: "Cold Email Outreach & Deliverability" },
    { name: "ZoomInfo", niche: "Enterprise Sales Intelligence" },
    { name: "Instantly.ai", niche: "High-Volume Cold Email Automation" },
  ];

  const handleAnalyze = async (comp = competitorInput, niche = nicheInput) => {
    if (!comp.trim()) return;
    setIsLoading(true);
    try {
      const res = await analyzeCompetitor(comp, niche);
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold mb-3 border border-white/10">
            <Sliders className="w-3.5 h-3.5" />
            <span>Market Intelligence & Competitor Spy</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            {isBn ? "অটোমেটেড কম্পিটিটর স্পাই ও মনিটরিং" : "Automated Competitor Spy & Positioning Radar"}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {isBn
              ? "যেকোনো প্রতিযোগী ব্র্যান্ডের ওয়েবসাইট বা পণ্যের দুর্বলতা (Gaps) খুঁজে বের করুন এবং ক্লায়েন্টের কাছে তাদের বদলে আপনাকে বেছে নেওয়ার অকাট্য কাউন্টার-পিচ তৈরি করুন।"
              : "Discover gaps, customer complaints, and market vulnerabilities in rival products, and craft high-converting counter-pitches that win deals away from incumbents."}
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 font-semibold self-center">
              Quick Competitors:
            </span>
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setCompetitorInput(p.name);
                  setNicheInput(p.niche);
                  handleAnalyze(p.name, p.niche);
                }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 border border-white/10 transition cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Competitor Name or URL
            </label>
            <input
              id="competitor-name-input"
              type="text"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              placeholder="e.g. Apollo.io, Lemlist, or Company URL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Industry or Market Niche
            </label>
            <input
              id="competitor-niche-input"
              type="text"
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              placeholder="e.g. B2B Sales Automation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1 flex items-end">
            <button
              id="competitor-analyze-btn"
              type="submit"
              disabled={isLoading || !competitorInput.trim()}
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? "এনালিসিস চলছে..." : "Analyzing..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isBn ? "স্পাই এনালিসিস চালান" : "Run Competitor Spy"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900">
            Scanning Competitor Footprint with Gemini 3.8 Flash...
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing customer reviews, positioning claims, pricing tiers, and finding market attack angles.
          </p>
        </div>
      )}

      {/* Result View */}
      {!isLoading && result && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  Rival Target
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {result.competitorName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Primary Claim: {result.coreValueProp}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700 self-start">
              Tier: {result.estimatedTier}
            </span>
          </div>

          {/* 3 Critical Vulnerabilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2.5 flex items-center space-x-1.5">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>3 Critical Vulnerabilities & Customer Loopholes</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.vulnerabilities.map((vuln, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-slate-800 leading-relaxed"
                >
                  <span className="font-bold text-rose-900 block mb-1">
                    Gap #{i + 1}
                  </span>
                  {vuln}
                </div>
              ))}
            </div>
          </div>

          {/* Counter-Pitch Angle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Recommended Counter-Pitch Hook</span>
              </h4>
              <button
                type="button"
                onClick={() => handleCopy("counter-pitch", result.counterPitchAngle)}
                className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                {copiedKey === "counter-pitch" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy Angle</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 text-sm text-slate-900 leading-relaxed font-sans">
              {result.counterPitchAngle}
            </div>
          </div>

          {/* Winning Punchline */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold mb-1">
                <Award className="w-4 h-4" />
                <span>Winning 1-Line Closer Punchline</span>
              </div>
              <p className="text-sm font-semibold text-slate-100">
                "{result.winningPunchline}"
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy("punchline", result.winningPunchline)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition shrink-0 cursor-pointer"
            >
              {copiedKey === "punchline" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
