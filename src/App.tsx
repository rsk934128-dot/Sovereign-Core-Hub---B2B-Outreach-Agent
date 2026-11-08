import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { LeadFinder } from "./components/LeadFinder";
import { PitchDispatcher } from "./components/PitchDispatcher";
import { VoiceSDR } from "./components/VoiceSDR";
import { AutomationConsole } from "./components/AutomationConsole";
import { CompetitorRadar } from "./components/CompetitorRadar";
import { RoadmapModal } from "./components/RoadmapModal";
import { SystemDiagnostics } from "./components/SystemDiagnostics";
import { MobileHubModal } from "./components/MobileHubModal";
import { PWABuilderModal } from "./components/PWABuilderModal";
import { SocialConnectorModal } from "./components/SocialConnectorModal";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { NotificationCenter } from "./components/NotificationCenter";
import { backgroundService } from "./services/backgroundService";
import { notificationService } from "./services/notificationService";
import { Lead, PitchData } from "./types";
import { extractLeads, generateOutreach, getLinkedInStatus } from "./services/api";
import { CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react";

// Default starter leads so the app displays rich actionable intelligence immediately on load
const INITIAL_LEADS: Lead[] = [
  {
    id: "lead-init-1",
    companyName: "Acme SaaS Orchestration",
    website: "https://acmesaas.io",
    summary: "Cloud workflow automation engine for DevOps and multi-cloud engineering teams.",
    potentialContactType: "Founder & Head of Engineering",
    emailOrContact: "alex@acmesaas.io",
    leadQualityScore: "High",
    intentScore: 94,
    keyInsight: "Recently announced Series A expansion and currently hiring 12+ cloud architects.",
    suggestedAngle: "Offer automated onboarding workflows to accelerate their post-funding engineering ramp-up.",
  },
  {
    id: "lead-init-2",
    companyName: "FinPulse UK Payments",
    website: "https://finpulsepay.co.uk",
    summary: "Cross-border B2B settlement infrastructure with automated FX hedging.",
    potentialContactType: "VP Growth & Partnerships",
    emailOrContact: "partnerships@finpulsepay.co.uk",
    leadQualityScore: "High",
    intentScore: 91,
    keyInsight: "Active expansion across European e-commerce corridors seeking merchant distribution.",
    suggestedAngle: "Introduce high-converting automated merchant outreach sequences to shorten their sales cycle.",
  },
  {
    id: "lead-init-3",
    companyName: "HyperMetrics Data Labs",
    website: "https://hypermetricslabs.com",
    summary: "Real-time user behavior analytics platform for enterprise B2B mobile applications.",
    potentialContactType: "Chief Commercial Officer",
    emailOrContact: "sarah.chen@hypermetricslabs.com",
    leadQualityScore: "Medium",
    intentScore: 82,
    keyInsight: "Transitioning from product-led growth to enterprise outbound sales motions.",
    suggestedAngle: "Pitch autonomous SDR agents to book demos with Enterprise VP Product prospects.",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "leads" | "dispatcher" | "voicesdr" | "automation" | "competitor" | "roadmap" | "diagnostics"
  >("leads");

  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(INITIAL_LEADS[0]);
  const [pitch, setPitch] = useState<PitchData | null>(null);
  const [voiceInitialScript, setVoiceInitialScript] = useState<string>("");
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(false);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState<boolean>(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState<boolean>(false);
  const [isMobileHubOpen, setIsMobileHubOpen] = useState<boolean>(false);
  const [isPWABuilderModalOpen, setIsPWABuilderModalOpen] = useState<boolean>(false);
  const [isSocialConnectorOpen, setIsSocialConnectorOpen] = useState<boolean>(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(notificationService.getUnreadCount());
  const [isBn, setIsBn] = useState<boolean>(false); // English by default, toggleable to Bengali
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);

  const wakeLockRef = useRef<any>(null);

  const checkLinkedInStatus = () => {
    getLinkedInStatus()
      .then((data) => {
        if (data && typeof data.isConnected === "boolean") {
          setIsLinkedInConnected(data.isConnected);
        }
      })
      .catch((err) => console.warn("LinkedIn status error:", err));
  };

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasGeminiKey === "boolean") {
          setHasGeminiKey(data.hasGeminiKey);
        }
      })
      .catch((err) => console.warn("Health check error:", err));

    checkLinkedInStatus();

    // Subscribe to background service updates
    const unsubscribeBg = backgroundService.subscribe((state) => {
      setIsWakeLockActive(state.isWakeLockActive);
    });

    // Subscribe to real-time notification updates
    const unsubscribeNotif = notificationService.subscribe((notifs) => {
      setUnreadNotifCount(notifs.filter((n) => !n.read).length);
    });

    return () => {
      unsubscribeBg();
      unsubscribeNotif();
    };
  }, []);

  // Initialize Screen WakeLock if supported
  const handleToggleWakeLock = async () => {
    await backgroundService.toggleWakeLock();
    showToast(
      backgroundService.state.isWakeLockActive
        ? (isBn ? "স্ক্রিন ওয়েক-লক চালু: ডিভাইস স্লিপ হবে না" : "Screen WakeLock enabled: Device will stay awake")
        : (isBn ? "স্ক্রিন লক স্বাভাবিক করা হয়েছে" : "Screen WakeLock disabled")
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Search and extract leads from web
  const handleSearchLeads = async (query: string) => {
    setIsLoadingLeads(true);
    try {
      const res = await extractLeads(query);
      if (res.data?.leads && Array.isArray(res.data.leads)) {
        setLeads(res.data.leads);
        if (res.data.leads.length > 0) {
          setSelectedLead(res.data.leads[0]);

          // Trigger real-time browser push and audio notification for top prospect
          const topLead = res.data.leads.reduce(
            (prev: Lead, curr: Lead) => (curr.intentScore > prev.intentScore ? curr : prev),
            res.data.leads[0]
          );
          if (topLead) {
            notificationService.triggerLeadDiscovered({
              companyName: topLead.companyName,
              website: topLead.website,
              intentScore: topLead.intentScore,
              leadQualityScore: topLead.leadQualityScore,
              summary: topLead.summary,
            });
          }
        }
        showToast(
          isBn
            ? `${res.data.leads.length} টি নতুন বিটুবি লিড সফলভাবে এক্সট্র্যাক্ট করা হয়েছে!`
            : `Successfully extracted ${res.data.leads.length} high-intent B2B leads!`
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Search error: ${err.message}`);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // Generate outreach pitches for a lead
  const handleGeneratePitchForLead = async (lead: Lead, tone: string) => {
    setIsGeneratingPitch(true);
    try {
      const res = await generateOutreach(
        lead,
        "Sovereign Core Systems",
        "Autonomous AI Pipeline Acceleration & B2B Lead Conversion",
        tone
      );
      if (res.pitch) {
        setPitch(res.pitch);
        showToast(
          isBn
            ? `${lead.companyName}-এর জন্য পার্সোনালাইজড পিচ তৈরি সম্পন্ন!`
            : `Personalized outreach sequence generated for ${lead.companyName}!`
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Pitch generation error: ${err.message}`);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // Quick action: Select for pitch
  const handleSelectLeadForPitch = (lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab("dispatcher");
    if (!pitch || pitch.email.subject.indexOf(lead.companyName) === -1) {
      handleGeneratePitchForLead(lead, "High-Impact Direct & Consultative");
    }
  };

  // Quick action: Select for Voice SDR
  const handleSelectLeadForVoice = (lead: Lead) => {
    setSelectedLead(lead);
    const script = `Hi ${lead.potentialContactType || "there"}! This is Sovereign Core calling regarding ${lead.companyName}. I saw you're expanding operations and we built an autonomous AI outreach engine that automates prospect qualification. Would you have 5 minutes this Thursday for a brief walkthrough?`;
    setVoiceInitialScript(script);
    setActiveTab("voicesdr");
  };

  // Send script from Dispatcher to Voice SDR
  const handleSendToVoiceSDR = (scriptText: string) => {
    setVoiceInitialScript(scriptText);
    setActiveTab("voicesdr");
    showToast(isBn ? "স্ক্রিপ্ট ভয়েস SDR স্টুডিওতে লোড করা হয়েছে" : "Script loaded into AI Voice SDR Studio");
  };

  // Queue dispatch handler
  const handleQueueDispatch = (leadName: string, channel: string) => {
    showToast(
      isBn
        ? `${leadName}-এর জন্য ${channel} পিচ ২৪/৭ অটোমেশন কিউতে যুক্ত হয়েছে!`
        : `Queued ${channel} pitch for ${leadName} into 24/7 Autonomous Dispatcher!`
    );
  };

  // Apply enriched LinkedIn pitch to Dispatcher
  const handleApplyEnrichedPitch = (companyName: string, inMailText: string, connectionNote: string) => {
    if (selectedLead) {
      setPitch({
        email: {
          subject: `${companyName} pipeline acceleration`,
          previewText: `Synergy brief for ${companyName}`,
          body: inMailText,
          callToAction: "Open to a 5-minute executive walkthrough?",
          followUpHook: "Following up regarding our mutual growth synergy",
        },
        linkedIn: {
          connectionNote,
          inMailSubject: `${companyName} + Sovereign Core Synergy`,
          inMailBody: inMailText,
        },
        whatsApp: {
          messageText: `Hi from Sovereign Core! Noticed ${companyName}'s rapid growth.`,
        },
        voiceScript: {
          phonePitchScript: inMailText,
          voicemailDropScript: connectionNote,
        },
      });
      setActiveTab("dispatcher");
      showToast(
        isBn
          ? `লিঙ্কডইন ডাটা দিয়ে ${companyName}-এর পিচ আপডেট হয়েছে!`
          : `Updated Pitch Dispatcher with live LinkedIn intelligence for ${companyName}!`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "roadmap") {
            setIsRoadmapModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        leadsCount={leads.length}
        selectedLeadName={selectedLead?.companyName}
        isWakeLockActive={isWakeLockActive}
        onToggleWakeLock={handleToggleWakeLock}
        onOpenDeployModal={() => setIsRoadmapModalOpen(true)}
        onOpenMobileHub={() => setIsMobileHubOpen(true)}
        onOpenPWABuilderModal={() => setIsPWABuilderModalOpen(true)}
        onOpenSocialConnector={() => setIsSocialConnectorOpen(true)}
        isLinkedInConnected={isLinkedInConnected}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
        unreadNotifCount={unreadNotifCount}
        isBn={isBn}
        onToggleLang={() => setIsBn(!isBn)}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!hasGeminiKey && activeTab !== "diagnostics" && (
          <div className="mb-4 p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between border border-slate-800 shadow-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isBn
                  ? "স্মার্ট টিপ: রিয়েল-টাইম জেমিনাই এআই এবং লাইভ গুগল সার্চ গ্রাউন্ডিংয়ের জন্য Settings > Secrets প্যানেলে আপনার GEMINI_API_KEY যুক্ত করুন।"
                  : "Setup Tip: Real-time Gemini 3.8 Flash and live Google Search grounding can be activated via Settings > Secrets."}
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => setActiveTab("diagnostics")}
                className="px-2.5 py-1 rounded text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                {isBn ? "ডায়াগনস্টিকস দেখুন" : "View Diagnostics"}
              </button>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden md:inline-block">
                Zero-Failure Mode Active
              </span>
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <LeadFinder
            leads={leads}
            onSelectLeadForPitch={handleSelectLeadForPitch}
            onSelectLeadForVoice={handleSelectLeadForVoice}
            onEnrichLeadWithLinkedIn={(lead) => {
              setSelectedLead(lead);
              setIsSocialConnectorOpen(true);
            }}
            isLoading={isLoadingLeads}
            onSearch={handleSearchLeads}
            isBn={isBn}
          />
        )}

        {activeTab === "dispatcher" && (
          <PitchDispatcher
            selectedLead={selectedLead}
            pitch={pitch}
            isGenerating={isGeneratingPitch}
            onGeneratePitch={handleGeneratePitchForLead}
            onSendToVoiceSDR={handleSendToVoiceSDR}
            onQueueDispatch={handleQueueDispatch}
            isBn={isBn}
          />
        )}

        {activeTab === "voicesdr" && (
          <VoiceSDR initialScript={voiceInitialScript} isBn={isBn} />
        )}

        {activeTab === "automation" && (
          <AutomationConsole
            isWakeLockActive={isWakeLockActive}
            onToggleWakeLock={handleToggleWakeLock}
            onOpenMobileHub={() => setIsMobileHubOpen(true)}
            isBn={isBn}
            onDeployWinnerTemplate={(templateId, templateName) => {
              showToast(
                isBn
                  ? `উইনিং টেমপ্লেট '${templateName}' আউটবাউন্ড পাইপলাইনে সক্রিয় করা হয়েছে!`
                  : `Winning template '${templateName}' deployed to active outbound pipeline!`
              );
            }}
          />
        )}

        {activeTab === "competitor" && <CompetitorRadar isBn={isBn} />}

        {activeTab === "diagnostics" && (
          <SystemDiagnostics isBn={isBn} onNavigateToTab={setActiveTab} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">Sovereign Core Hub</span>
            <span>•</span>
            <span>24/7 Autonomous B2B Outreach & Telephony Daemon</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsPWABuilderModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <span>PWABuilder (110/110)</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsRoadmapModalOpen(true)}
              className="hover:text-slate-900 font-semibold transition cursor-pointer"
            >
              {isBn ? "ফিউচার রোডম্যাপ ও VPS গাইড" : "Future Roadmap & VPS Guide"}
            </button>
            <span>•</span>
            <span className="font-mono text-[11px] text-emerald-600 font-bold">
              Gemini 3.8 Flash & 3.1 Flash TTS
            </span>
          </div>
        </div>
      </footer>

      {/* Roadmap & VPS Guide Modal */}
      <RoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
        isBn={isBn}
      />

      {/* PWABuilder App Store Packaging Hub Modal */}
      <PWABuilderModal
        isOpen={isPWABuilderModalOpen}
        onClose={() => setIsPWABuilderModalOpen(false)}
        isBn={isBn}
      />

      {/* LinkedIn Social Connector & Real-time SDR Lead Enrichment Modal */}
      <SocialConnectorModal
        isOpen={isSocialConnectorOpen}
        onClose={() => {
          setIsSocialConnectorOpen(false);
          checkLinkedInStatus();
        }}
        leads={leads}
        onApplyEnrichedPitch={handleApplyEnrichedPitch}
        isBn={isBn}
      />

      {/* Mobile 24/7 Background & Notification Hub Modal */}
      <MobileHubModal
        isOpen={isMobileHubOpen}
        onClose={() => setIsMobileHubOpen(false)}
        isBn={isBn}
      />

      {/* Real-time Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        isBn={isBn}
        onSelectLead={(companyName) => {
          const matched = leads.find((l) =>
            l.companyName.toLowerCase().includes(companyName.toLowerCase())
          );
          if (matched) {
            setSelectedLead(matched);
            setActiveTab("leads");
          }
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Offline / Online Network State Indicator */}
      <OfflineIndicator isBn={isBn} />
    </div>
  );
}
