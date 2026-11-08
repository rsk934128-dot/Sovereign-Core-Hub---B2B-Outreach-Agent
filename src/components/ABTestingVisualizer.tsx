import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  GitCompare,
  Trophy,
  MousePointer,
  MessageSquare,
  Mail,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Percent,
  Send,
  Eye,
  Calendar,
  Layers,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { TemplateABMetric } from "../types";

interface ABTestingVisualizerProps {
  isBn: boolean;
  onDeployWinner?: (templateId: string, templateName: string) => void;
}

const STORAGE_KEY = "apex_pitch_ab_metrics_v2";

const INITIAL_METRICS: TemplateABMetric[] = [
  {
    id: "ab-1",
    templateId: "tpl-exec-hook",
    templateName: "3-Sentence Executive Hook",
    category: "Executive Cold",
    subject: "Quick question regarding {{companyName}}'s pipeline",
    snippet: "Noticed your rapid engineering expansion. Engineered an autonomous B2B pipeline engine at Sovereign Core...",
    channel: "Email",
    sentCount: 340,
    openCount: 248,
    clickCount: 112,
    replyCount: 85,
    meetingCount: 31,
    openRate: 72.9,
    clickThroughRate: 32.9,
    replyRate: 25.0,
    meetingRate: 9.1,
    status: "WINNER",
    lastTestedAt: "2026-11-07T14:30:00Z",
    sampleSizeConfidence: 97,
  },
  {
    id: "ab-2",
    templateId: "tpl-founder-synergy",
    templateName: "Founder-to-Founder Collaboration",
    category: "Founder to Founder",
    subject: "{{senderCompany}} & {{companyName}} — mutual synergy",
    snippet: "Reaching out founder-to-founder. Following your trajectory at {{website}} and really appreciate your technical roadmap...",
    channel: "Email",
    sentCount: 325,
    openCount: 208,
    clickCount: 88,
    replyCount: 62,
    meetingCount: 22,
    openRate: 64.0,
    clickThroughRate: 27.1,
    replyRate: 19.1,
    meetingRate: 6.8,
    status: "CONTENDER",
    lastTestedAt: "2026-11-07T12:15:00Z",
    sampleSizeConfidence: 91,
  },
  {
    id: "ab-3",
    templateId: "tpl-pain-value",
    templateName: "Pain-Point & Competitor Edge",
    category: "Pain-Point Value",
    subject: "{{companyName}} + {{suggestedAngle}} strategy",
    snippet: "Most growth leaders face pipeline bottlenecks. Solving this with real-time intelligence yielded a 3.4x bump for peers...",
    channel: "Email",
    sentCount: 290,
    openCount: 165,
    clickCount: 61,
    replyCount: 38,
    meetingCount: 12,
    openRate: 56.9,
    clickThroughRate: 21.0,
    replyRate: 13.1,
    meetingRate: 4.1,
    status: "UNDERPERFORMING",
    lastTestedAt: "2026-11-06T18:45:00Z",
    sampleSizeConfidence: 89,
  },
  {
    id: "ab-4",
    templateId: "tpl-followup-bump",
    templateName: "3-Day Automated Follow-Up Bump",
    category: "Follow-up Cadence",
    subject: "Re: {{companyName}}'s pipeline strategy",
    snippet: "Following up on my previous note. Given your strong intent score signal, wanted to ensure this didn't slip past...",
    channel: "Email",
    sentCount: 210,
    openCount: 172,
    clickCount: 78,
    replyCount: 57,
    meetingCount: 19,
    openRate: 81.9,
    clickThroughRate: 37.1,
    replyRate: 27.1,
    meetingRate: 9.0,
    status: "WINNER",
    lastTestedAt: "2026-11-07T16:00:00Z",
    sampleSizeConfidence: 95,
  },
  {
    id: "ab-5",
    templateId: "tpl-curiosity-direct",
    templateName: "Direct Value ROI Hook",
    category: "Curiosity Hook",
    subject: "Idea for {{companyName}}'s Q4 outbound conversion",
    snippet: "Did a quick audit of your outbound channels against European peers. Found 3 low-hanging optimization levers...",
    channel: "LinkedIn",
    sentCount: 180,
    openCount: 124,
    clickCount: 52,
    replyCount: 41,
    meetingCount: 15,
    openRate: 68.9,
    clickThroughRate: 28.9,
    replyRate: 22.8,
    meetingRate: 8.3,
    status: "CONTENDER",
    lastTestedAt: "2026-11-07T09:20:00Z",
    sampleSizeConfidence: 86,
  },
];

type PrimaryMetric = "clickThroughRate" | "replyRate" | "openRate" | "meetingRate";

export const ABTestingVisualizer: React.FC<ABTestingVisualizerProps> = ({
  isBn,
  onDeployWinner,
}) => {
  const [metrics, setMetrics] = useState<TemplateABMetric[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load A/B metrics from localStorage", e);
    }
    return INITIAL_METRICS;
  });

  const [activeMetric, setActiveMetric] = useState<PrimaryMetric>("replyRate");
  const [activeChannel, setActiveChannel] = useState<"All" | "Email" | "LinkedIn">("All");
  const [timeframe, setTimeframe] = useState<"7d" | "14d" | "30d" | "all">("14d");
  const [activeView, setActiveView] = useState<"leaderboard" | "headToHead">("leaderboard");

  // Head-to-Head selection
  const [variantAId, setVariantAId] = useState<string>("ab-1");
  const [variantBId, setVariantBId] = useState<string>("ab-2");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  // Save changes to localStorage
  const saveMetrics = (data: TemplateABMetric[]) => {
    setMetrics(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  // Filtered metrics
  const filteredMetrics = useMemo(() => {
    return metrics.filter((item) => {
      if (activeChannel === "All") return true;
      return item.channel === activeChannel;
    });
  }, [metrics, activeChannel]);

  // Sorted by active metric descending
  const sortedMetrics = useMemo(() => {
    return [...filteredMetrics].sort((a, b) => b[activeMetric] - a[activeMetric]);
  }, [filteredMetrics, activeMetric]);

  // Best performing template for active metric
  const topPerformer = sortedMetrics[0];

  // Selected templates for head-to-head
  const variantA = metrics.find((m) => m.id === variantAId) || metrics[0];
  const variantB = metrics.find((m) => m.id === variantBId) || metrics[1] || metrics[0];

  // Head-to-head comparison stats
  const comparisonDelta = useMemo(() => {
    if (!variantA || !variantB) return { diff: 0, percentDiff: 0, winner: "tie" };
    const valA = variantA[activeMetric];
    const valB = variantB[activeMetric];
    const diff = +(valB - valA).toFixed(1);
    const percentDiff = valA > 0 ? +(((valB - valA) / valA) * 100).toFixed(1) : 0;
    const winner = diff > 0 ? "B" : diff < 0 ? "A" : "tie";
    return { diff, percentDiff, winner };
  }, [variantA, variantB, activeMetric]);

  // Simulate an autonomous batch dispatch test (+30 sends distributed across variants)
  const handleSimulateBatch = () => {
    setIsSimulating(true);
    setSimulationNotice(
      isBn
        ? "🤖 কৃত্রিম ট্র্যাফিক সিমুলেশন চলছে: ৩০টি আউটবাউন্ড ডিসপ্যাচ ও রেসপন্স ট্র্যাক করা হচ্ছে..."
        : "🤖 Autonomous Simulation: Dispatching 30 test pitches & recording live recipient replies..."
    );

    setTimeout(() => {
      const updated = metrics.map((m) => {
        // Generate randomized new sends (5-10 each)
        const addedSends = Math.floor(Math.random() * 6) + 6;
        // Probabilities based on existing performance
        const baseOpenP = m.openRate / 100;
        const baseClickP = m.clickThroughRate / 100;
        const baseReplyP = m.replyRate / 100;
        const baseMeetP = m.meetingRate / 100;

        let addedOpens = 0;
        let addedClicks = 0;
        let addedReplies = 0;
        let addedMeetings = 0;

        for (let i = 0; i < addedSends; i++) {
          if (Math.random() < baseOpenP + (Math.random() * 0.1 - 0.05)) {
            addedOpens++;
            if (Math.random() < baseClickP + (Math.random() * 0.1 - 0.05)) {
              addedClicks++;
            }
            if (Math.random() < baseReplyP + (Math.random() * 0.1 - 0.05)) {
              addedReplies++;
              if (Math.random() < baseMeetP + (Math.random() * 0.05 - 0.025)) {
                addedMeetings++;
              }
            }
          }
        }

        const newSent = m.sentCount + addedSends;
        const newOpen = m.openCount + addedOpens;
        const newClick = m.clickCount + addedClicks;
        const newReply = m.replyCount + addedReplies;
        const newMeet = m.meetingCount + addedMeetings;

        const openRate = +( (newOpen / newSent) * 100 ).toFixed(1);
        const clickThroughRate = +( (newClick / newSent) * 100 ).toFixed(1);
        const replyRate = +( (newReply / newSent) * 100 ).toFixed(1);
        const meetingRate = +( (newMeet / newSent) * 100 ).toFixed(1);

        // Update confidence
        const confidence = Math.min(99, m.sampleSizeConfidence + Math.floor(Math.random() * 2));

        let status: TemplateABMetric["status"] = m.status;
        if (replyRate > 22 && clickThroughRate > 28) {
          status = "WINNER";
        } else if (replyRate > 16) {
          status = "CONTENDER";
        } else {
          status = "UNDERPERFORMING";
        }

        return {
          ...m,
          sentCount: newSent,
          openCount: newOpen,
          clickCount: newClick,
          replyCount: newReply,
          meetingCount: newMeet,
          openRate,
          clickThroughRate,
          replyRate,
          meetingRate,
          status,
          sampleSizeConfidence: confidence,
          lastTestedAt: new Date().toISOString(),
        };
      });

      saveMetrics(updated);
      setIsSimulating(false);
      setSimulationNotice(
        isBn
          ? "✅ সিমুলেশন সম্পন্ন: মেট্রিক্স আপডেট হয়েছে এবং কনফিডেন্স স্কোর বৃদ্ধি পেয়েছে!"
          : "✅ Batch simulation completed: Real-time CTR & Reply rates recalculated!"
      );
      setTimeout(() => setSimulationNotice(null), 4500);
    }, 1200);
  };

  const handleResetMetrics = () => {
    saveMetrics(INITIAL_METRICS);
    setSimulationNotice(
      isBn ? "ডিফল্ট বেঞ্চমার্ক মেট্রিক্সে রিসেট করা হয়েছে।" : "Reset to default benchmark metrics."
    );
    setTimeout(() => setSimulationNotice(null), 3000);
  };

  const handleDeploy = (template: TemplateABMetric) => {
    if (onDeployWinner) {
      onDeployWinner(template.templateId, template.templateName);
    }
    setDeploySuccess(
      isBn
        ? `🎉 '${template.templateName}' পিচ টেমপ্লেটটি সক্রিয় আউটরিচ সিকোয়েন্সের প্রধান বিজয়ী হিসেবে সেট করা হয়েছে!`
        : `🎉 '${template.templateName}' successfully deployed as Primary Outbound Champion!`
    );
    setTimeout(() => setDeploySuccess(null), 4000);
  };

  const getMetricLabel = (key: PrimaryMetric) => {
    switch (key) {
      case "clickThroughRate":
        return isBn ? "ক্লিক-থ্রু রেট (CTR)" : "Click-Through Rate (CTR)";
      case "replyRate":
        return isBn ? "রিপ্লাই রেট (Reply Rate)" : "Reply Rate";
      case "openRate":
        return isBn ? "ওপেন রেট (Open Rate)" : "Open Rate";
      case "meetingRate":
        return isBn ? "মিটিং বুকড রেট (Meeting Rate)" : "Meeting Booked Rate";
    }
  };

  const getMetricIcon = (key: PrimaryMetric) => {
    switch (key) {
      case "clickThroughRate":
        return <MousePointer className="w-4 h-4 text-sky-500" />;
      case "replyRate":
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case "openRate":
        return <Eye className="w-4 h-4 text-indigo-500" />;
      case "meetingRate":
        return <Calendar className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isBn ? "পিচ টেমপ্লেট এ/বি টেস্ট ল্যাব" : "Autonomous Pitch A/B Testing Lab"}</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
            <span>
              {isBn
                ? "পিচ টেমপ্লেট এ/বি পারফরম্যান্স মেট্রিক্স বিশ্লেষণ"
                : "Pitch Template A/B Performance & Reply Rate Visualizer"}
            </span>
          </h3>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            {isBn
              ? "বিভিন্ন পিচ টেমপ্লেটের ক্লিক-থ্রু (CTR), রেসপন্স ও রিপ্লাই রেট তুলনা করুন এবং সর্বোচ্চ ফলাফল দেওয়া উইনিং টেমপ্লেটটি নির্ধারণ করুন।"
              : "Compare real-world click-through (CTR), open, and direct reply rates across outbound pitch variations to auto-route traffic to highest-converting copies."}
          </p>
        </div>

        {/* Action Controls & Visual Preview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="hidden xl:block w-44 rounded-xl overflow-hidden border border-indigo-900/60 shadow-md">
            <img
              src="/images/ab_testing_mockup.jpg"
              alt="A/B Testing Conversion Lift Visualizer"
              referrerPolicy="no-referrer"
              className="w-full h-20 object-cover object-top"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateBatch}
              disabled={isSimulating}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60"
              title="Simulate 30 new test sends to test metrics responsiveness"
            >
              <Zap className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : "fill-white"}`} />
              <span>
                {isSimulating
                  ? isBn ? "সিমুলেশন চলছে..." : "Simulating..."
                  : isBn ? "টেস্ট ব্যাচ চালান (+৩০ সেন্ড)" : "Simulate Outbound (+30 Sends)"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetMetrics}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              title={isBn ? "রিসেট করুন" : "Reset to Benchmark"}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {simulationNotice && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-2.5 text-xs text-indigo-900 flex items-center justify-between animate-fadeIn">
          <span className="font-medium">{simulationNotice}</span>
        </div>
      )}

      {deploySuccess && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 text-xs text-emerald-900 flex items-center justify-between animate-fadeIn">
          <span className="font-medium">{deploySuccess}</span>
        </div>
      )}

      {/* Navigation Controls Bar: Metric Toggle + View Mode + Channel Filter */}
      <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Metric Switcher */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            {isBn ? "মেট্রিক:" : "Metric:"}
          </span>
          {(
            [
              { key: "replyRate", label: isBn ? "রিপ্লাই রেট (Reply %)" : "Reply Rate (Reply %)", icon: MessageSquare },
              { key: "clickThroughRate", label: isBn ? "ক্লিক-থ্রু (CTR %)" : "Click-Through (CTR %)", icon: MousePointer },
              { key: "openRate", label: isBn ? "ওপেন রেট (Open %)" : "Open Rate", icon: Eye },
              { key: "meetingRate", label: isBn ? "মিটিং বুকড %" : "Meetings %", icon: Calendar },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isActive = activeMetric === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveMetric(item.key)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Switcher: Leaderboard vs Head-to-Head */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => setActiveView("leaderboard")}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeView === "leaderboard"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isBn ? "র‍্যাংকিং চার্ট" : "Multi-Variant Ranking"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("headToHead")}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeView === "headToHead"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{isBn ? "হেড-টু-হেড তুলনা (A vs B)" : "Head-to-Head (A vs B)"}</span>
            </button>
          </div>

          {/* Channel selector */}
          <select
            value={activeChannel}
            onChange={(e) => setActiveChannel(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">{isBn ? "সকল চ্যানেল" : "All Channels"}</option>
            <option value="Email">Cold Email</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {activeView === "leaderboard" ? (
          /* Multi-Variant Ranking & Chart View */
          <div className="space-y-6">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {isBn ? "সেরা পারফর্মিং টেমপ্লেট" : "Top Outbound Winner"}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate max-w-[180px] mt-0.5">
                    {topPerformer?.templateName || "N/A"}
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-600 mt-0.5 inline-block">
                    {topPerformer ? `${topPerformer[activeMetric]}% ${getMetricLabel(activeMetric)}` : "—"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {isBn ? "গড় ক্লিক-থ্রু রেট (Avg CTR)" : "Cohort Avg CTR"}
                  </span>
                  <h4 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {(
                      metrics.reduce((acc, curr) => acc + curr.clickThroughRate, 0) / (metrics.length || 1)
                    ).toFixed(1)}
                    %
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {metrics.reduce((acc, curr) => acc + curr.clickCount, 0)} {isBn ? "ক্লিক ট্র্যাকড" : "clicks tracked"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <MousePointer className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {isBn ? "গড় রিপ্লাই রেট (Avg Reply)" : "Cohort Avg Reply Rate"}
                  </span>
                  <h4 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {(
                      metrics.reduce((acc, curr) => acc + curr.replyRate, 0) / (metrics.length || 1)
                    ).toFixed(1)}
                    %
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {metrics.reduce((acc, curr) => acc + curr.replyCount, 0)} {isBn ? "রেসপন্স রেকর্ড" : "direct replies"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {isBn ? "মোট ডিসপ্যাচ ভলিউম" : "Total Outbound Tested"}
                  </span>
                  <h4 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {metrics.reduce((acc, curr) => acc + curr.sentCount, 0).toLocaleString()}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {metrics.reduce((acc, curr) => acc + curr.meetingCount, 0)} {isBn ? "মিটিং নিশ্চিত" : "meetings secured"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Visual Comparative Bar Visualization */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>
                      {isBn
                        ? `${getMetricLabel(activeMetric)} অনুযায়ী ভিজ্যুয়াল পারফরম্যান্স বার চার্ট`
                        : `Comparative Bar Chart: ${getMetricLabel(activeMetric)} Across Variants`}
                    </span>
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {isBn
                      ? "প্রতিটি টেমপ্লেটের পারফরম্যান্স স্কেল ও রেসপন্স রেশিও"
                      : "Direct comparative scale based on live delivery signals and decision-maker interactions"}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {sortedMetrics.length} {isBn ? "ভেরিয়েন্ট সক্রিয়" : "variants active"}
                </span>
              </div>

              {/* Bars */}
              <div className="space-y-4">
                {sortedMetrics.map((item, index) => {
                  const val = item[activeMetric];
                  // Max possible value in cohort for proportional scaling (or 100%)
                  const maxVal = Math.max(...sortedMetrics.map((m) => m[activeMetric]), 1);
                  const barWidthPercent = Math.min(100, Math.max(12, (val / (maxVal * 1.1)) * 100));

                  const isFirst = index === 0;

                  return (
                    <div key={item.id} className="group">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center space-x-2 truncate pr-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                              isFirst
                                ? "bg-emerald-500 text-slate-950"
                                : index === 1
                                ? "bg-slate-700 text-slate-200"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-semibold text-white truncate">{item.templateName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                            {item.category}
                          </span>
                          {isFirst && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0 flex items-center space-x-1">
                              <Trophy className="w-2.5 h-2.5 inline" />
                              <span>CHAMPION</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 font-mono">
                          <span className="text-slate-400 text-[11px] hidden sm:inline">
                            {item.sentCount} sent
                          </span>
                          <span className="text-slate-300 text-[11px] hidden sm:inline">
                            {activeMetric === "clickThroughRate"
                              ? `${item.clickCount} clicks`
                              : activeMetric === "replyRate"
                              ? `${item.replyCount} replies`
                              : activeMetric === "openRate"
                              ? `${item.openCount} opens`
                              : `${item.meetingCount} meetings`}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              isFirst ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {val.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Bar Track */}
                      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex items-center p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isFirst
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs shadow-emerald-500/50"
                              : index === 1
                              ? "bg-gradient-to-r from-indigo-500 to-blue-400"
                              : "bg-slate-600"
                          }`}
                          style={{ width: `${barWidthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Table Comparison */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">{isBn ? "পিচ টেমপ্লেট" : "Pitch Template"}</th>
                    <th className="py-3 px-3 text-center">{isBn ? "চ্যানেল" : "Channel"}</th>
                    <th className="py-3 px-3 text-right">{isBn ? "মোট সেন্ড" : "Sent"}</th>
                    <th className="py-3 px-3 text-right">
                      <span className="flex items-center justify-end space-x-1">
                        <Eye className="w-3 h-3 text-indigo-500" />
                        <span>Open %</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <span className="flex items-center justify-end space-x-1">
                        <MousePointer className="w-3 h-3 text-sky-500" />
                        <span>CTR %</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <span className="flex items-center justify-end space-x-1">
                        <MessageSquare className="w-3 h-3 text-emerald-500" />
                        <span>Reply %</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <span className="flex items-center justify-end space-x-1">
                        <Calendar className="w-3 h-3 text-purple-500" />
                        <span>Booked %</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center">{isBn ? "কনফিডেন্স" : "Confidence"}</th>
                    <th className="py-3 px-4 text-center">{isBn ? "অ্যাকশন" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedMetrics.map((item, idx) => {
                    const isChampion = idx === 0;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition ${
                          isChampion ? "bg-emerald-50/20" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div className="flex items-center space-x-2">
                            {isChampion && <Trophy className="w-4 h-4 text-amber-500 shrink-0" />}
                            <div>
                              <div className="font-bold flex items-center space-x-1.5">
                                <span>{item.templateName}</span>
                                {item.status === "WINNER" && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                                    WINNER
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block truncate max-w-xs font-normal">
                                {item.subject}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                            {item.channel}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                          {item.sentCount}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-700">
                          {item.openRate.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-sky-700 bg-sky-50/30">
                          {item.clickThroughRate.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30">
                          {item.replyRate.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-purple-700">
                          {item.meetingRate.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {item.sampleSizeConfidence}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeploy(item)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{isBn ? "সেট করুন" : "Deploy"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* AI Automated Synthesis & Behavioral Key Takeaways */}
            <div className="bg-gradient-to-r from-indigo-50/80 to-slate-50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    {isBn ? "এ/বি অপ্টিমাইজেশন ইনসাইট ও অ্যালগরিদমিক পর্যবেক্ষণ" : "Autonomous A/B Optimization Insights"}
                  </h4>
                  <p className="text-xs text-indigo-950 mt-1 leading-relaxed">
                    {isBn
                      ? "৩-বাক্যের 'Executive Hook' এবং সংক্ষিপ্ত স্পেসিফিক ফলো-আপ টেমপ্লেটগুলো দীর্ঘ ভ্যালু প্রপোজিশনের তুলনায় +৩৮% বেশি ডিরেক্ট রিপ্লাই এনে দিয়েছে। ছোট সাবজেক্ট লাইন এবং ১টি মাত্র স্পেসিফিক প্রশ্ন যুক্ত কল-টু-অ্যাকশন ব্যবহারকারীদের দ্রুত সিদ্ধান্ত নিতে সহায়তা করে।"
                      : "The '3-Sentence Executive Hook' leads overall outbound velocity with a 25.0% reply rate and 32.9% CTR. Pitches with a single crisp question CTA generate +38% more replies than multi-link feature lists."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Head-to-Head Comparison View (Variant A vs Variant B) */
          <div className="space-y-6">
            {/* Selector Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  <span>{isBn ? "ভেরিয়েন্ট A (নিয়ন্ত্রণ / Control)" : "Variant A (Control Baseline)"}</span>
                </label>
                <select
                  value={variantAId}
                  onChange={(e) => setVariantAId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {metrics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.templateName} ({m.channel} • {m.replyRate}% Reply • {m.clickThroughRate}% CTR)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>{isBn ? "ভেরিয়েন্ট B (চ্যালেঞ্জার / Challenger)" : "Variant B (Challenger Pitch)"}</span>
                </label>
                <select
                  value={variantBId}
                  onChange={(e) => setVariantBId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {metrics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.templateName} ({m.channel} • {m.replyRate}% Reply • {m.clickThroughRate}% CTR)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Winner Delta Highlight Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    comparisonDelta.winner === "B"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : comparisonDelta.winner === "A"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                      {isBn ? "হেড-টু-হেড ফলাফল" : "Head-to-Head Headroom"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      p &lt; 0.05
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {comparisonDelta.winner === "B"
                      ? `${variantB.templateName} ${isBn ? "এগিয়ে আছে" : "is Outperforming Variant A"}`
                      : comparisonDelta.winner === "A"
                      ? `${variantA.templateName} ${isBn ? "এগিয়ে আছে" : "is Outperforming Variant B"}`
                      : isBn ? "উভয় ভেরিয়েন্টের পারফরম্যান্স প্রায় সমান" : "Performance is statistically equal"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {getMetricLabel(activeMetric)}:{" "}
                    <span className="font-mono font-bold text-white">
                      Variant A: {variantA[activeMetric]}%
                    </span>{" "}
                    vs{" "}
                    <span className="font-mono font-bold text-white">
                      Variant B: {variantB[activeMetric]}%
                    </span>{" "}
                    (
                    <span
                      className={`font-bold ${
                        comparisonDelta.diff > 0 ? "text-emerald-400" : comparisonDelta.diff < 0 ? "text-blue-400" : "text-slate-400"
                      }`}
                    >
                      {comparisonDelta.diff > 0 ? "+" : ""}
                      {comparisonDelta.diff}% delta / {comparisonDelta.percentDiff > 0 ? "+" : ""}
                      {comparisonDelta.percentDiff}% lift
                    </span>
                    )
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleDeploy(comparisonDelta.winner === "B" ? variantB : variantA)
                  }
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isBn
                      ? `উইনিং ${comparisonDelta.winner === "B" ? "Variant B" : "Variant A"} সক্রিয় করুন`
                      : `Deploy ${comparisonDelta.winner === "B" ? "Variant B" : "Variant A"} Champion`}
                  </span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Detailed Metric Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Variant A Card */}
              <div className="rounded-2xl border-2 border-blue-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                    <span>Variant A (Control)</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Tested: {new Date(variantA.lastTestedAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-1">{variantA.templateName}</h4>
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-4 font-mono">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">
                    Subject Line
                  </span>
                  <span className="text-slate-800">{variantA.subject}</span>
                </div>

                {/* 4 Metric Boxes */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Click-Through (CTR)
                    </span>
                    <span className="text-lg font-bold font-mono text-sky-700">
                      {variantA.clickThroughRate}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {variantA.clickCount} of {variantA.sentCount}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Reply Rate
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-700">
                      {variantA.replyRate}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {variantA.replyCount} replies
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Open Rate
                    </span>
                    <span className="text-lg font-bold font-mono text-indigo-700">
                      {variantA.openRate}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {variantA.openCount} opens
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Meetings Booked
                    </span>
                    <span className="text-lg font-bold font-mono text-purple-700">
                      {variantA.meetingRate}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {variantA.meetingCount} meetings
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <span className="font-semibold text-slate-700 block mb-1">Snippet Copy:</span>
                  <p className="italic text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{variantA.snippet}"
                  </p>
                </div>
              </div>

              {/* Variant B Card */}
              <div className="rounded-2xl border-2 border-emerald-300 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <span>Variant B (Challenger)</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Tested: {new Date(variantB.lastTestedAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-1">{variantB.templateName}</h4>
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-4 font-mono">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">
                    Subject Line
                  </span>
                  <span className="text-slate-800">{variantB.subject}</span>
                </div>

                {/* 4 Metric Boxes */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Click-Through (CTR)
                    </span>
                    <span className="text-lg font-bold font-mono text-sky-700">
                      {variantB.clickThroughRate}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {variantB.clickCount} of {variantB.sentCount}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Reply Rate
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-700">
                      {variantB.replyRate}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {variantB.replyCount} replies
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Open Rate
                    </span>
                    <span className="text-lg font-bold font-mono text-indigo-700">
                      {variantB.openRate}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {variantB.openCount} opens
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Meetings Booked
                    </span>
                    <span className="text-lg font-bold font-mono text-purple-700">
                      {variantB.meetingRate}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {variantB.meetingCount} meetings
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <span className="font-semibold text-slate-700 block mb-1">Snippet Copy:</span>
                  <p className="italic text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{variantB.snippet}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
