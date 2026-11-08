import React, { useState } from "react";
import {
  Send,
  Mail,
  Linkedin,
  MessageSquare,
  Volume2,
  Copy,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Building,
  Check,
  FileText,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { Lead, PitchData } from "../types";
import { EmailTemplateManager } from "./EmailTemplateManager";

interface PitchDispatcherProps {
  selectedLead: Lead | null;
  pitch: PitchData | null;
  isGenerating: boolean;
  onGeneratePitch: (lead: Lead, tone: string) => Promise<void>;
  onSendToVoiceSDR: (scriptText: string) => void;
  onQueueDispatch: (leadName: string, channel: string) => void;
  isBn: boolean;
}

export const PitchDispatcher: React.FC<PitchDispatcherProps> = ({
  selectedLead,
  pitch,
  isGenerating,
  onGeneratePitch,
  onSendToVoiceSDR,
  onQueueDispatch,
  isBn,
}) => {
  const [activeChannel, setActiveChannel] = useState<
    "email" | "linkedin" | "whatsapp" | "phone" | "templates"
  >("email");
  const [tone, setTone] = useState<string>("High-Impact Direct & Consultative");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customEmailOverride, setCustomEmailOverride] = useState<{
    subject: string;
    body: string;
    previewText?: string;
    templateName?: string;
  } | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!selectedLead) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto my-6">
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 mb-6 shadow-md max-w-lg mx-auto">
          <img
            src="/images/hero_banner.jpg"
            alt="Multi-channel B2B Outreach Engine"
            referrerPolicy="no-referrer"
            className="w-full h-48 object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-left text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
              Autonomous Outbound Pipeline
            </span>
            <span className="text-sm font-bold text-white">
              {isBn ? "মাল্টি-চ্যানেল এআই আউটরিচ ইঞ্জিন" : "Cold Email • LinkedIn InMail • WhatsApp • Voice SDR"}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1.5">
          {isBn ? "কোনো প্রস্পেক্ট সিলেক্ট করা হয়নি" : "No Lead Selected for Outreach"}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-2 leading-relaxed">
          {isBn
            ? "লিড ইন্টেলিজেন্স রাডার ট্যাব থেকে যেকোনো কোম্পানি সিলেক্ট করে 'পিচ তৈরি করুন' বাটনে ক্লিক করুন।"
            : "Select any company from the Lead Radar tab and click 'Generate Pitch' to create custom cold outreach sequences across all channels."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Prospect Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex items-center justify-center font-black text-lg shadow-sm border border-slate-800 shrink-0">
            {selectedLead.companyName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                Target Prospect
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedLead.companyName}
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              {selectedLead.summary}
            </p>
          </div>
        </div>

        {/* Tone, Re-generate, and Template Manager buttons */}
        <div className="flex items-center flex-wrap space-x-2 shrink-0">
          <button
            id="dispatcher-top-template-mgr-btn"
            type="button"
            onClick={() => setActiveChannel("templates")}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              activeChannel === "templates"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900"
            }`}
            title={isBn ? "ইমেইল টেমপ্লেট ম্যানেজার ও প্লেসহোল্ডার" : "Email Template Manager & Dynamic Placeholders"}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isBn ? "টেমপ্লেট ম্যানেজার" : "Email Templates"}</span>
          </button>

          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="High-Impact Direct & Consultative">High-Impact Direct</option>
            <option value="Warm Founder-to-Founder">Founder-to-Founder</option>
            <option value="Executive Problem Solver">Executive Problem Solver</option>
            <option value="Value First Soft Pitch">Value-First Soft Pitch</option>
          </select>

          <button
            type="button"
            onClick={() => onGeneratePitch(selectedLead, tone)}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isBn ? "জেনারেট হচ্ছে..." : "Crafting..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBn ? "পিচ রি-জেনারেট করুন" : "Re-generate Pitch"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900">
            {isBn ? "জেমিনাই এআই দিয়ে ডিপলি পার্সোনালাইজড পিচ তৈরি হচ্ছে..." : "Gemini 3.8 Flash is crafting personalized multi-channel copy..."}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing company value proposition, contact formula, and writing email, LinkedIn, and WhatsApp sequences.
          </p>
        </div>
      )}

      {/* Pitch Content Display or Template Manager */}
      {!isGenerating && (pitch || activeChannel === "templates" || customEmailOverride) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Channel Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 p-2 gap-1 overflow-x-auto">
            <button
              id="tab-channel-email"
              type="button"
              onClick={() => setActiveChannel("email")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeChannel === "email"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Cold Email Cadence</span>
              {customEmailOverride && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  Custom
                </span>
              )}
            </button>

            {pitch && (
              <>
                <button
                  id="tab-channel-linkedin"
                  type="button"
                  onClick={() => setActiveChannel("linkedin")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeChannel === "linkedin"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  <span>LinkedIn Note & InMail</span>
                </button>

                <button
                  id="tab-channel-whatsapp"
                  type="button"
                  onClick={() => setActiveChannel("whatsapp")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeChannel === "whatsapp"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Direct</span>
                </button>

                <button
                  id="tab-channel-phone"
                  type="button"
                  onClick={() => setActiveChannel("phone")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeChannel === "phone"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Voice Call Script</span>
                </button>
              </>
            )}

            <button
              id="tab-channel-templates"
              type="button"
              onClick={() => setActiveChannel("templates")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ml-auto ${
                activeChannel === "templates"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isBn ? "ইমেইল টেমপ্লেট ম্যানেজার" : "Email Template Manager"}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-white/25">
                {"{{vars}}"}
              </span>
            </button>
          </div>

          {/* Tab 1: Cold Email */}
          {activeChannel === "email" && (
            <div className="p-6 space-y-4">
              {/* Template Override Alert if applied */}
              {customEmailOverride && (
                <div className="p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-950">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      <strong>{isBn ? "কাস্টম টেমপ্লেট অ্যাপ্লাইড:" : "Custom Template Active:"}</strong>{" "}
                      {customEmailOverride.templateName || "Custom Framework"}
                      <span className="text-indigo-600 ml-1">
                        (Variables auto-filled for {selectedLead.companyName})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveChannel("templates")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      {isBn ? "টেমপ্লেট এডিট করুন" : "Open in Template Manager"}
                    </button>
                    {pitch && (
                      <button
                        type="button"
                        onClick={() => setCustomEmailOverride(null)}
                        className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{isBn ? "এআই পিচে ফিরুন" : "Revert to AI"}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Subject Line */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subject Line
                    </span>
                    {customEmailOverride && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        Template Applied
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveChannel("templates")}
                      className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isBn ? "টেমপ্লেট নির্বাচন" : "Use Template"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          "email-subject",
                          customEmailOverride?.subject || pitch?.email.subject || ""
                        )
                      }
                      className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium ml-2"
                    >
                      {copiedKey === "email-subject" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900">
                  {customEmailOverride?.subject || pitch?.email.subject || "No subject set"}
                </div>
              </div>

              {/* Preview Text */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Preview Text (Inbox Snippet)
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 italic">
                  {customEmailOverride?.previewText || pitch?.email.previewText || "Inbox preview will appear here"}
                </div>
              </div>

              {/* Email Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email Body
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        "email-body",
                        customEmailOverride?.body || pitch?.email.body || ""
                      )
                    }
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    {copiedKey === "email-body" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy Body</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                  {customEmailOverride?.body || pitch?.email.body || "No email body written"}
                </div>
              </div>

              {/* Follow-up Hook */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  3-Day Automated Follow-up Trigger
                </span>
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">Follow-up Bump:</span>
                  {pitch?.email.followUpHook ||
                    `Hi ${selectedLead.contactPerson || "there"}, circling back on my earlier note regarding ${selectedLead.companyName}'s pipeline acceleration.`}
                </div>
              </div>

              {/* Bottom Quick Dispatch Action */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onQueueDispatch(
                      selectedLead.companyName,
                      customEmailOverride ? "Email (Custom Template)" : "Email"
                    )
                  }
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBn ? "২৪/৭ ডিসপ্যাচ কিউতে যোগ করুন" : "Queue for 24/7 Autonomous Dispatch"}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSendToVoiceSDR(
                      customEmailOverride?.body || pitch?.email.body || ""
                    )
                  }
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>{isBn ? "এআই ভয়েস স্পিচ শুনুন (TTS)" : "Listen via AI Voice SDR (TTS)"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Email Template Manager */}
          {activeChannel === "templates" && (
            <div className="p-4 sm:p-6 bg-slate-50/30">
              <EmailTemplateManager
                selectedLead={selectedLead}
                onApplyTemplate={(sub, bdy, prev) => {
                  setCustomEmailOverride({
                    subject: sub,
                    body: bdy,
                    previewText: prev,
                    templateName: "Saved Template",
                  });
                  setActiveChannel("email");
                }}
                onQueueDispatch={onQueueDispatch}
                onSendToVoiceSDR={onSendToVoiceSDR}
                isBn={isBn}
                currentEmailPitch={pitch ? pitch.email : undefined}
              />
            </div>
          )}

          {/* Tab 2: LinkedIn */}
          {activeChannel === "linkedin" && (
            <div className="p-6 space-y-4">
              {/* Connection Note */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    LinkedIn Connection Request Note (Under 300 Chars)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("linkedin-note", pitch.linkedIn.connectionNote)}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    {copiedKey === "linkedin-note" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy Note</span>
                  </button>
                </div>
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl text-sm text-slate-800">
                  {pitch.linkedIn.connectionNote}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Length: {pitch.linkedIn.connectionNote.length} characters (Max 300)
                </span>
              </div>

              {/* InMail Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Direct InMail Message
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("linkedin-inmail", pitch.linkedIn.inMailBody)}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    {copiedKey === "linkedin-inmail" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy InMail</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  <span className="font-bold text-slate-900 block mb-2">
                    Subject: {pitch.linkedIn.inMailSubject}
                  </span>
                  {pitch.linkedIn.inMailBody}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onQueueDispatch(selectedLead.companyName, "LinkedIn")}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Queue for Automated LinkedIn Dispatch</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: WhatsApp */}
          {activeChannel === "whatsapp" && (
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Conversational WhatsApp Direct Message
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("whatsapp-msg", pitch.whatsApp.messageText)}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    {copiedKey === "whatsapp-msg" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy Text</span>
                  </button>
                </div>
                <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                  {pitch.whatsApp.messageText}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(pitch.whatsApp.messageText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isBn ? "হোয়াটসঅ্যাপে ওপেন করুন" : "Open in WhatsApp Web"}</span>
                </a>
              </div>
            </div>
          )}

          {/* Tab 4: Cold Call / Voicemail */}
          {activeChannel === "phone" && (
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    45-Second Cold Call Script
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("coldcall-script", pitch.voiceScript.phonePitchScript)}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    {copiedKey === "coldcall-script" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy Script</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {pitch.voiceScript.phonePitchScript}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  20-Second High-Conversion Voicemail Drop
                </span>
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  {pitch.voiceScript.voicemailDropScript}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onSendToVoiceSDR(pitch.voiceScript.phonePitchScript)}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? "ভয়েস SDR এ পাঠাতে ক্লিক করুন (TTS)" : "Load Script in AI Voice SDR (TTS Studio)"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Pitch & No Template Applied State Card */}
      {!isGenerating && !pitch && activeChannel !== "templates" && !customEmailOverride && (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-base font-bold text-slate-900">
              {isBn
                ? `${selectedLead.companyName}-এর জন্য আউটরিচ শুরু করুন`
                : `Ready to Launch Outreach for ${selectedLead.companyName}`}
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isBn
                ? "জেমিনাই ৩.৮ ফ্ল্যাশ দিয়ে মাল্টি-চ্যানেল সিকোয়েন্স তৈরি করুন অথবা আপনার নিজস্ব কাস্টম ইমেইল টেমপ্লেট ও ভ্যারিয়েবল (যেমন {{companyName}}, {{contactPerson}}) দিয়ে আউটরিচ প্রস্তুত করুন।"
                : "Craft tailored multi-channel sequences using Gemini 3.8 Flash, or use your custom Email Templates with automated variable placeholders."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onGeneratePitch(selectedLead, tone)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isBn ? "জেমিনাই এআই পিচ তৈরি করুন" : "Generate with Gemini AI"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel("templates")}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isBn ? "ইমেইল টেমপ্লেট ম্যানেজার ওপেন করুন" : "Open Email Template Manager"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
