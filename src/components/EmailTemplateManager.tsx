import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Save,
  Trash2,
  Copy,
  Check,
  Send,
  Volume2,
  Sparkles,
  Edit3,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Eye,
  Sliders,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Download,
  Upload,
} from "lucide-react";
import { Lead } from "../types";

export interface EmailTemplate {
  id: string;
  name: string;
  category: "Executive Cold" | "Founder to Founder" | "Pain-Point Value" | "Follow-up Cadence" | "Custom";
  subject: string;
  body: string;
  previewText?: string;
  isBuiltin?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface EmailTemplateManagerProps {
  selectedLead: Lead | null;
  onApplyTemplate: (filledSubject: string, filledBody: string, filledPreviewText: string) => void;
  onQueueDispatch: (leadName: string, channel: string) => void;
  onSendToVoiceSDR: (scriptText: string) => void;
  isBn: boolean;
  currentEmailPitch?: {
    subject: string;
    body: string;
    previewText?: string;
  } | null;
}

const STORAGE_KEY = "apex_email_templates_v1";

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl-exec-hook",
    name: "3-Sentence Executive Hook",
    category: "Executive Cold",
    subject: "Quick question regarding {{companyName}}'s pipeline",
    previewText: "Exploring autonomous pipeline acceleration for {{companyName}}",
    body: `Hi {{contactPerson}},

I noticed {{companyName}} is actively expanding operations and optimizing {{suggestedAngle}}.

We engineered an autonomous B2B pipeline engine at {{senderCompany}} that identifies high-readiness accounts and converts qualified decision-makers. Based on our real-time radar, {{companyName}} shows an intent signal of {{intentScore}} with strong growth indicators.

Would you be open to a 5-minute executive walkthrough this {{currentDay}} to explore how {{companyName}} could deploy this?

Best regards,
{{senderName}}
{{senderCompany}}`,
    isBuiltin: true,
    createdAt: "2026-01-01",
  },
  {
    id: "tpl-founder-synergy",
    name: "Founder-to-Founder Collaboration",
    category: "Founder to Founder",
    subject: "{{senderCompany}} & {{companyName}} — mutual synergy",
    previewText: "Admiration for {{companyName}}'s trajectory",
    body: `Hi {{contactPerson}},

Reaching out founder-to-founder. I have been following {{companyName}} at {{website}} and really appreciate the technical direction your team is taking.

{{keyInsight}}

We are deploying an autonomous outbound infrastructure at {{senderCompany}} that cuts 80% of repetitive SDR manual prospecting while securing verified executive meetings. Given your current momentum, I believe this could drive immediate pipeline gains for {{companyName}}.

Are you open to a brief 10-minute coffee chat or intro call next week?

Warmly,
{{senderName}}
Founder, {{senderCompany}}`,
    isBuiltin: true,
    createdAt: "2026-01-01",
  },
  {
    id: "tpl-pain-value",
    name: "Pain-Point & Competitor Edge",
    category: "Pain-Point Value",
    subject: "{{companyName}} + {{suggestedAngle}} strategy",
    previewText: "Overcoming pipeline drop-offs at {{companyName}}",
    body: `Hi {{contactPerson}},

Most growth leaders in high-velocity sectors face pipeline bottlenecks when scaling outbound channels.

Specifically regarding {{companyName}}: {{keyInsight}}. By solving this with autonomous real-time intelligence, peer organizations achieved a 3.4x increase in validated qualified calls.

I put together a 2-page implementation brief customized for {{companyName}}. Would it be okay if I forwarded it to your inbox?

Cheers,
{{senderName}}
Growth Director, {{senderCompany}}`,
    isBuiltin: true,
    createdAt: "2026-01-01",
  },
  {
    id: "tpl-followup-bump",
    name: "3-Day Automated Follow-Up Bump",
    category: "Follow-up Cadence",
    subject: "Re: {{companyName}}'s pipeline strategy",
    previewText: "Gentle follow-up regarding {{companyName}}",
    body: `Hi {{contactPerson}},

Following up on my previous note regarding {{companyName}}.

I understand operational priorities shift quickly, but given {{companyName}}'s strong {{intentScore}} buyer readiness signal, I wanted to ensure this did not slip past your radar.

Do you have 5 minutes this Thursday afternoon, or should I reconnect next month?

Best,
{{senderName}}
{{senderCompany}}`,
    isBuiltin: true,
    createdAt: "2026-01-01",
  },
];

const AVAILABLE_PLACEHOLDERS = [
  { tag: "{{companyName}}", desc: "Company / Prospect Name", example: "Acme Corp" },
  { tag: "{{contactPerson}}", desc: "Target Contact / Title", example: "Sarah Jenkins, VP Growth" },
  { tag: "{{website}}", desc: "Target Website Domain", example: "acme.io" },
  { tag: "{{intentScore}}", desc: "Calculated Intent Score", example: "94%" },
  { tag: "{{suggestedAngle}}", desc: "Outreach Value Angle", example: "Autonomous Pipeline" },
  { tag: "{{keyInsight}}", desc: "AI Extracted Key Insight", example: "Hiring 12 SDRs" },
  { tag: "{{senderName}}", desc: "Your Full Name", example: "Alex Mercer" },
  { tag: "{{senderCompany}}", desc: "Your Company Name", example: "Sovereign Core Systems" },
  { tag: "{{currentDay}}", desc: "Next Business Day", example: "Thursday" },
];

export function replacePlaceholders(text: string, variables: Record<string, string>): string {
  if (!text) return "";
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

export const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({
  selectedLead,
  onApplyTemplate,
  onQueueDispatch,
  onSendToVoiceSDR,
  isBn,
  currentEmailPitch,
}) => {
  // Saved templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn("Failed reading saved templates:", err);
    }
    return DEFAULT_TEMPLATES;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    DEFAULT_TEMPLATES[0].id
  );

  // Edit / Create mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate>({
    id: "",
    name: "",
    category: "Custom",
    subject: "",
    previewText: "",
    body: "",
    createdAt: "",
  });

  // User custom sender variables
  const [senderName, setSenderName] = useState<string>(() => {
    return localStorage.getItem("apex_sender_name") || "Alex Mercer";
  });
  const [senderCompany, setSenderCompany] = useState<string>(() => {
    return localStorage.getItem("apex_sender_company") || "Sovereign Core Systems";
  });

  // Overridable lead variables
  const [overrideContactPerson, setOverrideContactPerson] = useState<string>("");
  const [overrideSuggestedAngle, setOverrideSuggestedAngle] = useState<string>("");

  // Feedback notifications
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // References for active input field targeting placeholder insertions
  const subjectInputRef = useRef<HTMLInputElement | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [lastFocusedField, setLastFocusedField] = useState<"subject" | "body">("body");

  // Save templates to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (err) {
      console.warn("Error persisting templates:", err);
    }
  }, [templates]);

  // Persist sender info
  useEffect(() => {
    try {
      localStorage.setItem("apex_sender_name", senderName);
      localStorage.setItem("apex_sender_company", senderCompany);
    } catch (e) {
      console.warn(e);
    }
  }, [senderName, senderCompany]);

  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0] || DEFAULT_TEMPLATES[0];

  // Helper to compute day string
  const getNextBusinessDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const next = new Date(now.setDate(now.getDate() + 1));
    return days[next.getDay()] || "Thursday";
  };

  // Build resolved variable dictionary for current selected lead
  const computedVariables: Record<string, string> = {
    companyName: selectedLead?.companyName || "Target Company",
    contactPerson:
      overrideContactPerson.trim() ||
      selectedLead?.potentialContactType ||
      "Growth Leader",
    website: selectedLead?.website || "company.com",
    intentScore: selectedLead ? `${selectedLead.intentScore}%` : "92%",
    suggestedAngle:
      overrideSuggestedAngle.trim() ||
      selectedLead?.suggestedAngle ||
      "autonomous pipeline acceleration",
    keyInsight:
      selectedLead?.keyInsight ||
      selectedLead?.summary ||
      "Expanding core technology operations and modernizing revenue systems.",
    senderName: senderName.trim() || "Alex Mercer",
    senderCompany: senderCompany.trim() || "Sovereign Core Systems",
    currentDay: getNextBusinessDay(),
  };

  // Rendered subject and body
  const renderedSubject = replacePlaceholders(
    isEditing ? editingTemplate.subject : activeTemplate.subject,
    computedVariables
  );
  const renderedBody = replacePlaceholders(
    isEditing ? editingTemplate.body : activeTemplate.body,
    computedVariables
  );
  const renderedPreview = replacePlaceholders(
    (isEditing ? editingTemplate.previewText : activeTemplate.previewText) || "",
    computedVariables
  );

  // Count unreplaced placeholders
  const detectUnfilledPlaceholders = (text: string) => {
    const matches = text.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const remainingPlaceholders = Array.from(
    new Set([
      ...detectUnfilledPlaceholders(renderedSubject),
      ...detectUnfilledPlaceholders(renderedBody),
    ])
  );

  // Actions
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const showNotification = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Start creating new template
  const handleStartNewTemplate = () => {
    const newTpl: EmailTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name: "New Custom Outreach Template",
      category: "Custom",
      subject: "Partnership inquiry for {{companyName}}",
      previewText: "Customized outreach for {{companyName}}",
      body: `Hi {{contactPerson}},\n\nI came across {{companyName}} and wanted to reach out regarding {{suggestedAngle}}.\n\nBest,\n{{senderName}}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setEditingTemplate(newTpl);
    setIsEditing(true);
  };

  // Start editing existing template
  const handleStartEdit = (tpl: EmailTemplate) => {
    setEditingTemplate({ ...tpl });
    setIsEditing(true);
  };

  // Save current AI generated pitch as a template
  const handleSaveCurrentPitchAsTemplate = () => {
    if (!currentEmailPitch) return;
    const newTpl: EmailTemplate = {
      id: `tpl-ai-${Date.now()}`,
      name: `AI Pitch Snapshot (${selectedLead?.companyName || "Custom"})`,
      category: "Custom",
      subject: currentEmailPitch.subject,
      previewText: currentEmailPitch.previewText || "",
      body: currentEmailPitch.body,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTemplates((prev) => [newTpl, ...prev]);
    setSelectedTemplateId(newTpl.id);
    showNotification(
      isBn ? "বর্তমান এআই পিচ টেমপ্লেট হিসেবে সেভ হয়েছে!" : "Current AI Pitch saved as custom template!"
    );
  };

  // Save editing template
  const handleSaveTemplate = () => {
    if (!editingTemplate.name.trim()) {
      alert("Please give your template a name.");
      return;
    }
    if (!editingTemplate.subject.trim()) {
      alert("Please provide an email subject.");
      return;
    }
    if (!editingTemplate.body.trim()) {
      alert("Please provide email body text.");
      return;
    }

    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === editingTemplate.id);
      if (exists) {
        return prev.map((t) =>
          t.id === editingTemplate.id ? { ...editingTemplate, updatedAt: new Date().toISOString().split("T")[0] } : t
        );
      } else {
        return [editingTemplate, ...prev];
      }
    });

    setSelectedTemplateId(editingTemplate.id);
    setIsEditing(false);
    showNotification(
      isBn ? "টেমপ্লেট সফলভাবে সেভ করা হয়েছে!" : "Outreach template saved successfully!"
    );
  };

  // Delete template
  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setTemplates((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        return filtered.length > 0 ? filtered : DEFAULT_TEMPLATES;
      });
      if (selectedTemplateId === id) {
        const remaining = templates.filter((t) => t.id !== id);
        setSelectedTemplateId(remaining[0]?.id || DEFAULT_TEMPLATES[0].id);
      }
      setIsEditing(false);
      showNotification(isBn ? "টেমপ্লেট ডিলিট করা হয়েছে" : "Template deleted");
    }
  };

  // Reset to default templates
  const handleResetDefaults = () => {
    if (confirm("Reset templates to default library? Custom templates will be overwritten.")) {
      setTemplates(DEFAULT_TEMPLATES);
      setSelectedTemplateId(DEFAULT_TEMPLATES[0].id);
      setIsEditing(false);
      showNotification(isBn ? "ডিফল্ট টেমপ্লেট রিস্টোর হয়েছে" : "Default templates restored");
    }
  };

  // Insert placeholder into active field
  const handleInsertPlaceholder = (tag: string) => {
    if (!isEditing) {
      // If not currently in edit mode, activate edit mode for current template or create new
      setIsEditing(true);
      setEditingTemplate({ ...activeTemplate, id: activeTemplate.isBuiltin ? `tpl-custom-${Date.now()}` : activeTemplate.id });
    }

    if (lastFocusedField === "subject") {
      const input = subjectInputRef.current;
      if (input) {
        const start = input.selectionStart || editingTemplate.subject.length;
        const end = input.selectionEnd || editingTemplate.subject.length;
        const text = editingTemplate.subject;
        const next = text.substring(0, start) + tag + text.substring(end);
        setEditingTemplate((prev) => ({ ...prev, subject: next }));
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + tag.length, start + tag.length);
        }, 50);
        return;
      }
      setEditingTemplate((prev) => ({ ...prev, subject: prev.subject + tag }));
    } else {
      const textarea = bodyTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart || editingTemplate.body.length;
        const end = textarea.selectionEnd || editingTemplate.body.length;
        const text = editingTemplate.body;
        const next = text.substring(0, start) + tag + text.substring(end);
        setEditingTemplate((prev) => ({ ...prev, body: next }));
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 50);
        return;
      }
      setEditingTemplate((prev) => ({ ...prev, body: prev.body + " " + tag }));
    }
  };

  // Apply to Dispatcher active view
  const handleApply = () => {
    onApplyTemplate(renderedSubject, renderedBody, renderedPreview);
    showNotification(
      isBn
        ? "টেমপ্লেট ডিসপ্যাচার ক্যাডেন্সে অ্যাপ্লাই করা হয়েছে!"
        : "Template applied to active Cold Email Cadence!"
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold tracking-tight">
              {isBn ? "ইমেইল টেমপ্লেট ম্যানেজার ও ভ্যারিয়েবল অটো-ফিল" : "Email Template Manager & Dynamic Placeholders"}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {templates.length} {isBn ? "টি টেমপ্লেট" : "Templates"}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {isBn
              ? "কাস্টম আউটরিচ টেমপ্লেট সেভ করুন এবং {{companyName}} বা {{contactPerson}} প্লেসহোল্ডার দিয়ে রিয়েল-টাইম প্রস্পেক্ট ভ্যারিয়েবল অটো-ফিল করুন।"
              : "Save reusable cold email frameworks with variable tags like {{companyName}} and {{contactPerson}} to auto-fill high-converting sequences."}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {currentEmailPitch && (
            <button
              id="template-save-pitch-btn"
              type="button"
              onClick={handleSaveCurrentPitchAsTemplate}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
              title="Save the currently generated AI pitch into your reusable template vault"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? "বর্তমান এআই পিচ সেভ করুন" : "Save Current Pitch"}</span>
            </button>
          )}

          {!isEditing && (
            <button
              id="template-create-new-btn"
              type="button"
              onClick={handleStartNewTemplate}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isBn ? "নতুন টেমপ্লেট তৈরি" : "New Template"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner if active */}
      {statusNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-emerald-900 transition-all">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Template Selector / Editor on Left, Live Auto-Fill Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left Column: Template Library / Form (5 cols on lg) */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-slate-50/50">
          {/* Template Selection Dropdown & Controls */}
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {isBn ? "টেমপ্লেট সিলেক্ট করুন" : "Select Template"}
                </label>
                <div className="space-y-2">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start justify-between gap-3 ${
                        selectedTemplateId === tpl.id
                          ? "bg-white border-slate-900 shadow-xs ring-1 ring-slate-900"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 mb-0.5">
                          <span
                            className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                              tpl.category === "Executive Cold"
                                ? "bg-slate-100 text-slate-800"
                                : tpl.category === "Founder to Founder"
                                ? "bg-purple-100 text-purple-800"
                                : tpl.category === "Pain-Point Value"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {tpl.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {tpl.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {tpl.subject}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          id={`edit-tpl-btn-${tpl.id}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(tpl);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Edit this template"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!tpl.isBuiltin && (
                          <button
                            id={`delete-tpl-btn-${tpl.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(tpl.id, tpl.name);
                            }}
                            className="p-1 rounded-md text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition"
                            title="Delete template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template management footer */}
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="hover:text-slate-800 flex items-center space-x-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isBn ? "ডিফল্ট রিস্টোর করুন" : "Restore Defaults"}</span>
                </button>
                <span>
                  {templates.filter((t) => !t.isBuiltin).length} custom /{" "}
                  {templates.filter((t) => t.isBuiltin).length} system
                </span>
              </div>
            </div>
          ) : (
            /* Editing Template Form */
            <div className="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isBn ? "টেমপ্লেট এডিটর" : "Template Editor"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
              </div>

              {/* Template Name & Category */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. 3-Sentence Hook"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) =>
                      setEditingTemplate((prev) => ({
                        ...prev,
                        category: e.target.value as any,
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Executive Cold">Executive Cold</option>
                    <option value="Founder to Founder">Founder to Founder</option>
                    <option value="Pain-Point Value">Pain-Point Value</option>
                    <option value="Follow-up Cadence">Follow-up Cadence</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Subject Line (Supports Placeholders)
                </label>
                <input
                  ref={subjectInputRef}
                  type="text"
                  onFocus={() => setLastFocusedField("subject")}
                  value={editingTemplate.subject}
                  onChange={(e) =>
                    setEditingTemplate((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder="e.g. Quick question for {{contactPerson}} at {{companyName}}"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Preview Text */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Preview Text (Inbox Snippet)
                </label>
                <input
                  type="text"
                  value={editingTemplate.previewText || ""}
                  onChange={(e) =>
                    setEditingTemplate((prev) => ({ ...prev, previewText: e.target.value }))
                  }
                  placeholder="e.g. Exploring synergy for {{companyName}}"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Email Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    Email Body Content
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Use tags like {"{{companyName}}"}
                  </span>
                </div>
                <textarea
                  ref={bodyTextareaRef}
                  onFocus={() => setLastFocusedField("body")}
                  rows={9}
                  value={editingTemplate.body}
                  onChange={(e) =>
                    setEditingTemplate((prev) => ({ ...prev, body: e.target.value }))
                  }
                  placeholder="Write your email body with {{placeholders}}..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-900 resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  id="save-template-submit-btn"
                  type="button"
                  onClick={handleSaveTemplate}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isBn ? "টেমপ্লেট সেভ করুন" : "Save Template"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {/* Quick Placeholder Injection Chips */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1">
                <Sliders className="w-3 h-3 text-emerald-600" />
                <span>{isBn ? "প্লেসহোল্ডার ইনসার্ট করুন" : "Insert Placeholders"}</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Target: {lastFocusedField === "subject" ? "Subject" : "Body"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_PLACEHOLDERS.map((item) => (
                <button
                  key={item.tag}
                  id={`insert-tag-${item.tag.replace(/[{}]/g, "")}`}
                  type="button"
                  onClick={() => handleInsertPlaceholder(item.tag)}
                  title={`${item.desc} (Example: ${item.example})`}
                  className="px-2 py-1 rounded-md text-[11px] font-mono font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 transition cursor-pointer"
                >
                  + {item.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Sender & Customization Variables Drawer */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
              {isBn ? "প্রেরক ও অ্যাডজাস্টেবল ভ্যারিয়েবল" : "Sender & Variable Adjustments"}
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                  Your Name ({"{{senderName}}"})
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                  Your Company ({"{{senderCompany}}"})
                </label>
                <input
                  type="text"
                  value={senderCompany}
                  onChange={(e) => setSenderCompany(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            {selectedLead && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500">
                    Override Contact Name ({"{{contactPerson}}"})
                  </label>
                  {overrideContactPerson && (
                    <button
                      type="button"
                      onClick={() => setOverrideContactPerson("")}
                      className="text-[10px] text-indigo-600 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={overrideContactPerson}
                  onChange={(e) => setOverrideContactPerson(e.target.value)}
                  placeholder={selectedLead.potentialContactType || "Sarah Jenkins (VP Growth)"}
                  className="w-full px-2 py-1 rounded border border-slate-200 text-xs text-slate-800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Auto-filled Preview for Current Lead (7 cols on lg) */}
        <div className="lg:col-span-7 p-5 space-y-4 bg-white flex flex-col justify-between">
          <div className="space-y-4">
            {/* Prospect Indicator Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-md bg-indigo-50 text-indigo-700">
                  <Eye className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {isBn ? "লাইভ অটো-ফিল প্রিভিউ" : "Live Auto-Filled Preview"}
                </span>
                {selectedLead ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Lead: {selectedLead.companyName}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Previewing with Sample Values
                  </span>
                )}
              </div>

              {/* Unfilled Tag Warning */}
              {remainingPlaceholders.length > 0 ? (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {remainingPlaceholders.length} unfilled tag(s): {remainingPlaceholders.join(", ")}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 flex items-center space-x-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{isBn ? "সব ভ্যারিয়েবল ফিল হয়েছে" : "All variables resolved"}</span>
                </span>
              )}
            </div>

            {/* Resolved Subject */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Subject Line
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy("rendered-subject", renderedSubject)}
                  className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
                >
                  {copiedKey === "rendered-subject" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 select-all">
                {renderedSubject}
              </div>
            </div>

            {/* Resolved Preview Text */}
            {renderedPreview && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Preview Text
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 italic select-all">
                  {renderedPreview}
                </div>
              </div>
            )}

            {/* Resolved Email Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Email Body (Ready for Dispatch)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy("rendered-body", renderedBody)}
                  className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
                >
                  {copiedKey === "rendered-body" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Body</span>
                </button>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans max-h-96 overflow-y-auto select-all">
                {renderedBody}
              </div>
            </div>

            {/* Variable Mapping Pill Summary */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 block mb-1.5">
                Active Variable Mappings for {selectedLead?.companyName || "Current Prospect"}:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="truncate">
                  <span className="text-slate-400 font-mono">{"{{companyName}}"}</span>:{" "}
                  <strong className="text-slate-800">{computedVariables.companyName}</strong>
                </div>
                <div className="truncate">
                  <span className="text-slate-400 font-mono">{"{{contactPerson}}"}</span>:{" "}
                  <strong className="text-slate-800">{computedVariables.contactPerson}</strong>
                </div>
                <div className="truncate">
                  <span className="text-slate-400 font-mono">{"{{intentScore}}"}</span>:{" "}
                  <strong className="text-emerald-700">{computedVariables.intentScore}</strong>
                </div>
                <div className="truncate">
                  <span className="text-slate-400 font-mono">{"{{senderName}}"}</span>:{" "}
                  <strong className="text-slate-800">{computedVariables.senderName}</strong>
                </div>
                <div className="truncate">
                  <span className="text-slate-400 font-mono">{"{{senderCompany}}"}</span>:{" "}
                  <strong className="text-slate-800">{computedVariables.senderCompany}</strong>
                </div>
                <div className="truncate">
                  <span className="text-slate-400 font-mono">{"{{currentDay}}"}</span>:{" "}
                  <strong className="text-slate-800">{computedVariables.currentDay}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action Dispatch Bar */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <button
                id="template-apply-cadence-btn"
                type="button"
                onClick={handleApply}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{isBn ? "ক্যাডেন্সে অ্যাপ্লাই করুন" : "Apply to Email Cadence"}</span>
              </button>

              <button
                id="template-queue-dispatch-btn"
                type="button"
                onClick={() => {
                  onApplyTemplate(renderedSubject, renderedBody, renderedPreview);
                  onQueueDispatch(
                    selectedLead?.companyName || "Prospect",
                    `Email (Template: ${activeTemplate.name})`
                  );
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBn ? "২৪/৭ ডিসপ্যাচ কিউতে পাঠান" : "Queue for Autonomous Dispatch"}</span>
              </button>
            </div>

            <button
              id="template-send-tts-btn"
              type="button"
              onClick={() => onSendToVoiceSDR(renderedBody)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{isBn ? "ভয়েস SDR (TTS) এ শুনুন" : "Listen via AI Voice SDR"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
