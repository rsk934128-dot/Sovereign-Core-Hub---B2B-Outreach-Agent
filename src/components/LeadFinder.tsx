import React, { useState } from "react";
import {
  Search,
  Sparkles,
  ExternalLink,
  Mail,
  CheckCircle,
  Copy,
  SlidersHorizontal,
  TrendingUp,
  Send,
  Volume2,
  Building2,
  Globe,
  Loader2,
  Target,
  ArrowRight,
} from "lucide-react";
import { Lead } from "../types";

interface LeadFinderProps {
  leads: Lead[];
  onSelectLeadForPitch: (lead: Lead) => void;
  onSelectLeadForVoice: (lead: Lead) => void;
  onEnrichLeadWithLinkedIn?: (lead: Lead) => void;
  isLoading: boolean;
  onSearch: (query: string) => Promise<void>;
  isBn: boolean;
}

export const LeadFinder: React.FC<LeadFinderProps> = ({
  leads,
  onSelectLeadForPitch,
  onSelectLeadForVoice,
  onEnrichLeadWithLinkedIn,
  isLoading,
  onSearch,
  isBn,
}) => {
  const [query, setQuery] = useState(
    "Top B2B SaaS startups in USA CEO email contact"
  );
  const [filterScore, setFilterScore] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const presetQueries = [
    "Top B2B SaaS startups in USA CEO email contact",
    "Fintech startups in London decision makers email",
    "AI workflow automation agencies in Germany founders",
    "E-commerce brands in Austin VP Growth marketing contact",
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLeads = leads.filter((lead) => {
    if (filterScore === "All") return true;
    return lead.leadQualityScore === filterScore;
  });

  return (
    <div className="space-y-6">
      {/* Search Header Banner with Visual Mockup */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="max-w-2xl flex-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? "রিয়েল-টাইম ওয়েব ইন্টেলিজেন্স ও গুগলিং" : "Real-time Web Intelligence & Google Radar"}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            {isBn ? "বিটুবি (B2B) লিড ফাইন্ডার ও এআই এক্সট্রাক্টর" : "Autonomous B2B Lead Radar & Extraction Engine"}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-5">
            {isBn
              ? "গুগল ওয়েব সার্চ থেকে সরাসরি ডিসিশন মেকার, কোম্পানির ডোমেইন, ইমেইল প্যাটার্ন এবং পার্সোনালাইজড পিচিং সুযোগ খুঁজে বের করুন।"
              : "Search live web indexes for high-intent companies, decision-maker contact formulas, company value propositions, and ready-to-pitch intelligence."}
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) onSearch(query);
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="lead-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isBn ? "টার্গেট কুয়েরি লিখুন (যেমন: 'Top B2B SaaS startups in USA')" : "Enter target query (e.g. 'Fintech startups in London')"}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium transition"
              />
            </div>
            <button
              id="lead-search-submit-btn"
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? "অনুসন্ধান চলছে..." : "Scanning Web..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isBn ? "লিড এক্সট্র্যাক্ট করুন" : "Extract B2B Leads"}</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Prompts */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isBn ? "জনপ্রিয় কুয়েরি:" : "Quick Queries:"}
            </span>
            {presetQueries.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(preset);
                  onSearch(preset);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-slate-300 transition border border-white/10"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Radar Card Preview */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl">
            <img
              src="/images/lead_radar_mockup.jpg"
              alt="Autonomous B2B Lead Radar Preview"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover object-top transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px]">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? "লাইভ রাডার ভিজ্যুয়াল" : "Live Radar Scanning"}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                24/7 ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Count Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-slate-900">
            {isBn ? `মোট প্রাপ্ত লিড: ${filteredLeads.length} টি` : `Discovered Leads: ${filteredLeads.length}`}
          </span>
          {leads.length > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              ({leads.filter((l) => l.leadQualityScore === "High").length} High Priority)
            </span>
          )}
        </div>

        {/* Quality Filters */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-slate-500 font-medium mr-2">{isBn ? "ফিল্টার:" : "Quality:"}</span>
          {(["All", "High", "Medium", "Low"] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setFilterScore(tier)}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                filterScore === tier
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            {isBn ? "জেমিনাই এআই দিয়ে রিয়েল-টাইম গুগলিং ও লিড ফিল্টারিং চলছে..." : "Querying Live Web & Processing with Gemini 3.8 Flash..."}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {isBn
              ? "অর্গানিক সার্চ ডেটা থেকে কোম্পানির ডোমেইন, ডিসিশন মেকার প্রোফাইল ও ইনটেন্ট স্কোর এক্সট্র্যাক্ট করা হচ্ছে।"
              : "Analyzing live SERP pages, filtering commercial signals, contact points, and scoring intent."}
          </p>
        </div>
      )}

      {/* Leads Grid */}
      {!isLoading && filteredLeads.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {isBn ? "কোনো লিড পাওয়া যায়নি" : "No Leads in Current View"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isBn
              ? "উপরে সার্চ বারে যেকোনো ইন্ডাস্ট্রি বা কোম্পানির নাম লিখে 'লিড এক্সট্র্যাক্ট করুন' বাটনে চাপুন।"
              : "Enter a search query above or click one of the quick presets to discover fresh B2B leads."}
          </p>
        </div>
      )}

      {!isLoading && filteredLeads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeads.map((lead) => {
            const isHigh = lead.leadQualityScore === "High";
            const isMedium = lead.leadQualityScore === "Medium";
            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {lead.companyName}
                        </h3>
                        {lead.website && (
                          <a
                            href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-700 transition"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {lead.website ? lead.website.replace(/https?:\/\//, "").replace(/\/$/, "") : "Domain N/A"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isHigh
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isMedium
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {lead.leadQualityScore} Quality
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {lead.intentScore || 85}% Intent
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {lead.summary}
                  </p>

                  {/* Key Insight & Angle */}
                  {lead.suggestedAngle && (
                    <div className="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800 block mb-0.5">
                        {isBn ? "পিচিং সুযোগ (Angle):" : "Recommended Outreach Hook:"}
                      </span>
                      <span className="text-slate-600">{lead.suggestedAngle}</span>
                    </div>
                  )}

                  {/* Contact Info Pill */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 mb-4 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate max-w-[200px] sm:max-w-[240px]">
                        {lead.emailOrContact || lead.potentialContactType}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(lead.id, lead.emailOrContact || lead.website)}
                      className="p-1 text-slate-500 hover:text-slate-900 transition"
                      title="Copy Contact Info"
                    >
                      {copiedId === lead.id ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectLeadForPitch(lead)}
                    className="inline-flex items-center justify-center space-x-1 px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isBn ? "পিচ তৈরি" : "Pitch"}</span>
                  </button>

                  {onEnrichLeadWithLinkedIn && (
                    <button
                      type="button"
                      onClick={() => onEnrichLeadWithLinkedIn(lead)}
                      className="inline-flex items-center justify-center space-x-1 px-2.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0a66c2] border border-sky-200 text-[11px] font-bold transition cursor-pointer"
                      title="Enrich Lead with LinkedIn Live Profile Data"
                    >
                      <span className="font-bold text-xs">in</span>
                      <span>{isBn ? "এনরিচ করুন" : "LinkedIn"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectLeadForVoice(lead)}
                    className="inline-flex items-center justify-center space-x-1 px-2.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3 text-emerald-600" />
                    <span>{isBn ? "ভয়েস SDR" : "Voice SDR"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
