import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  LogOut,
  UserCheck,
  Building,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Send,
  Shield,
  Layers,
  ChevronRight,
  ArrowRight,
  Target,
  Zap,
} from "lucide-react";
import { Lead, LinkedInUserProfile, LinkedInEnrichedLeadData } from "../types";
import {
  getLinkedInAuthUrl,
  getLinkedInStatus,
  connectLinkedInDemo,
  disconnectLinkedIn,
  enrichLeadWithLinkedIn,
} from "../services/api";

interface SocialConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onApplyEnrichedPitch?: (companyName: string, inMailText: string, connectionNote: string) => void;
  isBn: boolean;
}

export const SocialConnectorModal: React.FC<SocialConnectorModalProps> = ({
  isOpen,
  onClose,
  leads,
  onApplyEnrichedPitch,
  isBn,
}) => {
  const [profile, setProfile] = useState<LinkedInUserProfile | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || "");
  const [isEnriching, setIsEnriching] = useState<boolean>(false);
  const [enrichedData, setEnrichedData] = useState<LinkedInEnrichedLeadData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sync" | "setup" | "history">("sync");

  const devCallbackUrl = "https://ais-dev-ax3kyguh5bapv4jocftvhn-181599595241.asia-east1.run.app/auth/linkedin/callback";
  const sharedCallbackUrl = "https://ais-pre-ax3kyguh5bapv4jocftvhn-181599595241.asia-east1.run.app/auth/linkedin/callback";

  // Check connection status on open
  const refreshStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await getLinkedInStatus();
      setIsConnected(data.isConnected);
      setProfile(data.profile);
    } catch (err) {
      console.warn("Could not check LinkedIn status:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
      if (!selectedLeadId && leads.length > 0) {
        setSelectedLeadId(leads[0].id);
      }
    }
  }, [isOpen, leads]);

  // Listen for popup OAuth postMessage
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // Validate origin format
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }

      if (event.data?.type === "LINKEDIN_AUTH_SUCCESS") {
        if (event.data.profile) {
          setProfile(event.data.profile);
          setIsConnected(true);
          setStatusMessage(
            isBn
              ? `অভিনন্দন! ${event.data.profile.name}-এর লিঙ্কডইন অ্যাকাউন্ট সফলভাবে সংযুক্ত হয়েছে।`
              : `Successfully connected ${event.data.profile.name}'s LinkedIn profile!`
          );
          setTimeout(() => setStatusMessage(null), 4000);
        } else {
          refreshStatus();
        }
      } else if (event.data?.type === "LINKEDIN_AUTH_ERROR") {
        setStatusMessage(
          isBn
            ? `লিঙ্কডইন অথেন্টিকেশন ব্যর্থ হয়েছে: ${event.data.error || "Unknown"}`
            : `LinkedIn authentication error: ${event.data.error || "Unknown"}`
        );
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [isBn]);

  if (!isOpen) return null;

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Launch popup OAuth flow
  const handleConnectOAuth = async () => {
    setIsConnecting(true);
    try {
      const origin = window.location.origin;
      const res = await getLinkedInAuthUrl(origin);

      if (res.configured && res.url) {
        // Open provider's URL directly in popup
        const authWindow = window.open(
          res.url,
          "linkedin_oauth_popup",
          "width=600,height=720,scrollbars=yes,status=1"
        );
        if (!authWindow) {
          alert(
            isBn
              ? "অনুগ্রহ করে আপনার ব্রাউজারের পপ-আপ অনুমোদন করুন।"
              : "Please allow popups for this site to complete LinkedIn login."
          );
        }
      } else {
        // Fallback to Sandbox Developer Connect
        handleConnectDemo();
      }
    } catch (err: any) {
      console.warn("OAuth fetch failed, launching demo mode:", err);
      handleConnectDemo();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectDemo = async () => {
    setIsConnecting(true);
    try {
      const res = await connectLinkedInDemo();
      if (res.profile) {
        setProfile(res.profile);
        setIsConnected(true);
        setStatusMessage(
          isBn
            ? "স্যান্ডবক্স মোড: Alex Mercer (VP Strategic Accounts) লিঙ্কডইন প্রোফাইল সক্রিয় হয়েছে।"
            : "Sandbox Connected: Alex Mercer (VP Strategic Accounts) LinkedIn profile activated for testing."
        );
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectLinkedIn();
      setIsConnected(false);
      setProfile(null);
      setEnrichedData(null);
      setStatusMessage(isBn ? "লিঙ্কডইন সংযোগ বিচ্ছিন্ন করা হয়েছে।" : "LinkedIn disconnected.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Run Real-Time Lead Enrichment
  const handleEnrichLead = async () => {
    const targetLead = leads.find((l) => l.id === selectedLeadId) || leads[0];
    if (!targetLead) return;

    setIsEnriching(true);
    try {
      const result = await enrichLeadWithLinkedIn(targetLead);
      setEnrichedData(result);
      setStatusMessage(
        isBn
          ? `সফল! ${targetLead.companyName}-এর এক্সিকিউটিভ লিঙ্কডইন ডাটা সিঙ্ক সম্পন্ন হয়েছে।`
          : `Success! Synchronized live LinkedIn intelligence for ${targetLead.companyName}.`
      );
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error("Enrichment error:", err);
      setStatusMessage(`Enrichment failed: ${err.message}`);
    } finally {
      setIsEnriching(false);
    }
  };

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0a66c2]/20 border border-[#0a66c2]/40 flex items-center justify-center text-[#0a66c2] text-2xl font-bold font-sans shrink-0">
              in
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold border border-sky-500/30 mb-1">
                <Share2 className="w-3 h-3 text-sky-400" />
                <span>{isBn ? "সোশ্যাল কানেক্টর সার্ভিস" : "Social Connector Service"}</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>
                  {isBn
                    ? "লিঙ্কডইন সোশ্যাল কানেক্টর ও রিয়েল-টাইম লিড এনরিচমেন্ট"
                    : "LinkedIn Social Connector & Real-Time Lead Enrichment"}
                </span>
              </h2>
              <p className="text-slate-300 text-xs mt-0.5 max-w-xl">
                {isBn
                  ? "লিঙ্কডইন অথেন্টিকেশন ব্যবহার করে টার্গেট ডিসিশন-মেকারদের লাইভ প্রোফাইল, রিসেন্ট পোস্ট ও হায়ারিং ট্রেন্ড এনে একিউরেট বিটুবি এসডিআর আউটরিচ করুন।"
                  : "Authenticate with LinkedIn to pull verified executive profile signals, recent posts, and headcount insights for hyper-personalized SDR outreach."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="bg-sky-50 border-b border-sky-100 px-6 py-2.5 text-xs text-sky-950 font-medium flex items-center justify-between animate-fadeIn">
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Sub Tabs */}
        <div className="flex items-center space-x-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
          {[
            { id: "sync", label: isBn ? "লাইভ লিড সিঙ্ক ও এনরিচমেন্ট" : "Live Lead Sync & Profile Data", icon: Target },
            { id: "setup", label: isBn ? "OAuth ২.০ সেটআপ গাইড" : "OAuth 2.0 Setup Guide", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#0a66c2]" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* LinkedIn Account Connection Status Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profile?.picture ? (
                  <img
                    src={profile.picture}
                    alt={profile.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#0a66c2] text-white flex items-center justify-center font-bold text-xl">
                    in
                  </div>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    isConnected ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {isConnected ? profile?.name : isBn ? "লিঙ্কডইন সোশ্যাল কানেক্টর সংযুক্ত নেই" : "LinkedIn Account Not Connected"}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isConnected
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isConnected
                      ? profile?.authMode === "SIMULATED_SANDBOX"
                        ? "SANDBOX ACTIVE"
                        : "LIVE OAUTH"
                      : "DISCONNECTED"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isConnected
                    ? `${profile?.headline || "B2B Outbound SDR Specialist"} • ${profile?.connectionsCount || "3,000+"} connections`
                    : isBn
                    ? "রিয়েল-টাইম প্রোফাইল ডাটা ও কোম্পানি সিঙ্ক করতে আপনার লিঙ্কডইন একাউন্টটি সংযুক্ত করুন।"
                    : "Connect your LinkedIn profile to pull real-time verified executive data and company signals."}
                </p>
                {isConnected && profile?.email && (
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                    {profile.email} • Connected at {new Date(profile.connectedAt || "").toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              {isConnected ? (
                <>
                  <button
                    type="button"
                    onClick={refreshStatus}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                    title="Refresh Status"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isBn ? "সংযোগ বিচ্ছিন্ন" : "Disconnect"}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleConnectOAuth}
                    disabled={isConnecting}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span className="font-bold text-sm">in</span>
                    <span>{isConnecting ? "Connecting..." : isBn ? "লিঙ্কডইন দিয়ে লগইন" : "Sign In with LinkedIn"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConnectDemo}
                    disabled={isConnecting}
                    className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                    title="Instant sandbox demo connection"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBn ? "স্যান্ডবক্স টেস্ট" : "Demo Sandbox"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* TAB 1: REAL-TIME LEAD SYNC & ENRICHMENT */}
          {activeTab === "sync" && (
            <div className="space-y-6">
              {/* Lead Selector Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <Target className="w-4 h-4 text-[#0a66c2]" />
                      <span>{isBn ? "এনরিচ করার জন্য টার্গেট লিড নির্বাচন করুন" : "Select Discovered Lead to Enrich"}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isBn
                        ? "টার্গেট কোম্পানির এক্সিকিউটিভ প্রোফাইল ও লিঙ্কডইন অ্যাক্টিভিটি স্ক্যান করুন"
                        : "Query LinkedIn's live graph to extract executive decision-makers, hiring velocity, and hooks"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleEnrichLead}
                    disabled={isEnriching}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isEnriching ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    )}
                    <span>
                      {isEnriching
                        ? isBn ? "লিঙ্কডইন ডাটা স্ক্যান হচ্ছে..." : "Pulling Live Profile..."
                        : isBn ? "লিঙ্কডইন প্রোফাইল সিঙ্ক করুন" : "Sync Live LinkedIn Data"}
                    </span>
                  </button>
                </div>

                {/* Lead Dropdown / Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {leads.map((l) => {
                    const isSelected = l.id === selectedLeadId;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setSelectedLeadId(l.id);
                          setEnrichedData(null);
                        }}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? "bg-sky-50 border-[#0a66c2] text-slate-900 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs truncate max-w-[140px]">{l.companyName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {l.intentScore}%
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {l.potentialContactType || "VP Growth / Founder"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enriched Result Card */}
              {enrichedData ? (
                <div className="bg-white rounded-2xl border-2 border-sky-300 shadow-xs overflow-hidden animate-fadeIn">
                  {/* Top Enriched Header */}
                  <div className="p-4 bg-gradient-to-r from-sky-900 to-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {isBn ? "লিঙ্কডইন ভেরিফাইড প্রোফাইল ও অ্যাক্টিভিটি রিপোর্ট" : "LinkedIn Verified Profile & Activity Signals"}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300">
                      Synced {new Date(enrichedData.enrichedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Executive Profile Card */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-100">
                      <div className="flex items-start space-x-4">
                        <img
                          src={enrichedData.executiveProfile.avatarUrl}
                          alt={enrichedData.executiveProfile.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-100 shadow-xs shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base font-bold text-slate-900">
                              {enrichedData.executiveProfile.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0a66c2]/10 text-[#0a66c2]">
                              1st / 2nd Degree Network
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            {enrichedData.executiveProfile.headline}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                            <span>📍 {enrichedData.executiveProfile.location}</span>
                            <span>⏳ {enrichedData.executiveProfile.tenure}</span>
                            <span>🤝 {enrichedData.executiveProfile.mutualConnections} Mutual Connections</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 shrink-0">
                        {enrichedData.executiveProfile.keySkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Company Intelligence from LinkedIn Graph */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Headcount Velocity (LinkedIn Insights)</span>
                        </span>
                        <p className="text-xs font-semibold text-slate-800">
                          {enrichedData.companyInsights.headcountTrend}
                        </p>
                        <div className="mt-2 text-[11px] text-slate-600">
                          <span className="font-semibold block mb-0.5">Actively Hiring On LinkedIn:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {enrichedData.companyInsights.activeHiringRoles.map((role, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px] font-medium"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#0a66c2]" />
                          <span>Recent Executive Activity & Post</span>
                        </span>
                        <p className="text-xs italic text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                          {enrichedData.executiveProfile.recentActivity}
                        </p>
                        <span className="text-[11px] text-emerald-700 font-semibold mt-2 inline-block">
                          ✓ Growth Signal: {enrichedData.companyInsights.growthSignal}
                        </span>
                      </div>
                    </div>

                    {/* Auto-Crafted LinkedIn InMail & Connection Note */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-[#0a66c2]" />
                          <span>Personalized LinkedIn InMail & Connection Note</span>
                        </h5>
                        {onApplyEnrichedPitch && (
                          <button
                            type="button"
                            onClick={() => {
                              onApplyEnrichedPitch(
                                enrichedData.companyName,
                                enrichedData.personalizedHooks.inMailMessage,
                                enrichedData.personalizedHooks.connectionNote
                              );
                              setStatusMessage(
                                isBn
                                  ? "পিচ ডিসপ্যাচারে লিঙ্কডইন কপি সফলভাবে স্থানান্তরিত হয়েছে!"
                                  : "Applied personalized LinkedIn copy to Pitch Dispatcher!"
                              );
                              setTimeout(() => setStatusMessage(null), 3000);
                            }}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isBn ? "ডিসপ্যাচারে পাঠান" : "Send to Pitch Dispatcher"}</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Connection Note (300 char limit)</span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard("note", enrichedData.personalizedHooks.connectionNote)
                              }
                              className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 text-[11px] cursor-pointer"
                            >
                              {copiedKey === "note" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === "note" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <p className="p-3 bg-white rounded-xl text-xs text-slate-800 border border-sky-100 font-sans">
                            {enrichedData.personalizedHooks.connectionNote}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Direct InMail Message</span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard("inmail", enrichedData.personalizedHooks.inMailMessage)
                              }
                              className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 text-[11px] cursor-pointer"
                            >
                              {copiedKey === "inmail" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === "inmail" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <pre className="p-3 bg-white rounded-xl text-xs text-slate-800 border border-sky-100 font-sans whitespace-pre-wrap">
                            {enrichedData.personalizedHooks.inMailMessage}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state with visual mockup */
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 mb-4 max-w-md mx-auto shadow-sm">
                    <img
                      src="/images/social_connector_mockup.jpg"
                      alt="LinkedIn Social Connector Intelligence Mockup"
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover object-top transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-3 right-3 text-left text-white flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center space-x-1.5">
                        <Share2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>{isBn ? "লাইভ লিঙ্কডইন এনরিচমেন্ট ইঞ্জিন" : "Live Executive Intelligence"}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                        VERIFIED HOOKS
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {isBn ? "এক্সিকিউটিভ প্রোফাইল সিঙ্ক করার জন্য রেডি" : "Ready to Pull Verified Executive Signals"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    {isBn
                      ? "উপরের 'লিঙ্কডইন প্রোফাইল সিঙ্ক করুন' বাটনে ক্লিক করুন। এটি লাইভ ডাটা এনে ডিসিশন মেকারের সাম্প্রতিক অ্যাক্টিভিটি অনুযায়ী পার্সোনালাইজড ইনমেইল তৈরি করবে।"
                      : `Click "Sync Live LinkedIn Data" above to fetch verified profile signals, hiring trends, and custom InMail copy for ${selectedLead?.companyName}.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OAUTH SETUP GUIDE */}
          {activeTab === "setup" && (
            <div className="space-y-6">
              <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
                <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider mb-2 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#0a66c2]" />
                  <span>LinkedIn Developer Portal Registration Steps</span>
                </h4>
                <p className="text-xs text-sky-900 leading-relaxed">
                  To connect your custom LinkedIn Developer application for production API quotas, add the following callback URLs to your LinkedIn app settings under <strong>Auth &gt; OAuth 2.0 settings &gt; Authorized redirect URLs for your app</strong>:
                </p>
              </div>

              {/* Exact Callback URLs */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block mb-1">
                      Development Callback URL:
                    </span>
                    <span className="text-slate-900 font-bold break-all">{devCallbackUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("dev-cb", devCallbackUrl)}
                    className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer shrink-0"
                    title="Copy URL"
                  >
                    {copiedKey === "dev-cb" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block mb-1">
                      Shared / Production Callback URL:
                    </span>
                    <span className="text-slate-900 font-bold break-all">{sharedCallbackUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("shared-cb", sharedCallbackUrl)}
                    className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer shrink-0"
                    title="Copy URL"
                  >
                    {copiedKey === "shared-cb" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Environment Variables */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                  AI Studio Secrets & Environment Variables:
                </span>
                <p className="text-slate-300 text-xs">
                  Add these in the AI Studio Settings &gt; Secrets panel to activate live OAuth:
                </p>
                <div className="p-3 bg-slate-950 rounded-lg font-mono text-sky-400 text-xs space-y-1">
                  <div>LINKEDIN_CLIENT_ID=your_client_id_here</div>
                  <div>LINKEDIN_CLIENT_SECRET=your_client_secret_here</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://www.linkedin.com/developers/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0a66c2] hover:underline"
                >
                  <span>Open LinkedIn Developer Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            <span>
              {isConnected
                ? `Social Connector Active: ${profile?.name || "Connected"}`
                : "Social Connector Standby"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer"
          >
            {isBn ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
