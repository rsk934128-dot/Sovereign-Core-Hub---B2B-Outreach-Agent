import React, { useState } from "react";
import {
  Compass,
  X,
  Mic,
  MessageCircle,
  Bot,
  Sliders,
  Briefcase,
  Server,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBn: boolean;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ isOpen, onClose, isBn }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const roadmapItems = [
    {
      num: "১",
      numEn: "1",
      title: isBn ? "ক্লায়েন্ট কলের জন্য এআই ভয়েস এজেন্ট (AI Voice SDR)" : "AI Voice SDR Telephony Agent",
      icon: Mic,
      tag: "Live in Audio Studio",
      desc: isBn
        ? "শুধু ইমেইল আউটরিচেই থেমে না থেকে, Retell AI বা Vapi AI-এর মতো ভয়েস এপিআই ইন্টিগ্রেট করে পজিটিভ ইনটেন্ট ওয়ালা ক্লায়েন্টদের সাথে সরাসরি কথা বলা ও মিটিং অ্যাপয়েন্টমেন্ট কনফার্মেশন।"
        : "Connect Retell AI, Vapi, or Bland.ai telephony pipelines to place warm calls and book meetings automatically with prospects who show positive email intent.",
    },
    {
      num: "২",
      numEn: "2",
      title: isBn ? "হোয়াটসঅ্যাপ ও লিঙ্কডইন অটোমেশন (Multi-Channel Outreach)" : "Multi-Channel WhatsApp & LinkedIn",
      icon: MessageCircle,
      tag: "Built-in Generator",
      desc: isBn
        ? "ইমেলের পাশাপাশি একই লিডের লিঙ্কডইন প্রোফাইল স্ক্র্যাপ করে অটোমেটেড কানেকশন রিকোয়েস্ট বা হোয়াটসঅ্যাপে পার্সোনালাইজড মেসেজ ডিসপ্যাচ, যাতে কনভার্সন রেট ৩ গুণ বেড়ে যায়।"
        : "Automate LinkedIn connection requests under 300 characters, InMail messages, and direct WhatsApp links to multiply reply rates across multiple touchpoints.",
    },
    {
      num: "৩",
      numEn: "3",
      title: isBn ? "এআই সেলস অ্যাসিস্ট্যান্ট চ্যাটবট (Live On-Site Closing Agent)" : "Live On-Site Closing Agent",
      icon: Bot,
      tag: "Agent Widget",
      desc: isBn
        ? "ওয়েবসাইটে লাইভ এআই চ্যাটবট বসিয়ে রাখা যা ভিজিটরদের প্রজেক্টের রিকোয়ারমেন্ট বুঝে নেবে এবং Calendly বা Google Calendar-এ সরাসরি মিটিং বুক করে দেবে।"
        : "Embed an interactive conversational closer on landing pages to qualify inbound traffic, answer pricing objections, and book meetings directly to Google Calendar.",
    },
    {
      num: "৪",
      numEn: "4",
      title: isBn ? "অটোমেটেড কম্পিটিটর স্পাই ও মনিটরিং (Market Intelligence)" : "Competitor Spy & Vulnerability Radar",
      icon: Sliders,
      tag: "Active in Hub",
      desc: isBn
        ? "গিটহাব (GitHub) বা প্রোডাক্ট হান্ট (Product Hunt)-এ নতুন প্রতিযোগী আসলে তাদের কমপ্লিট এনালিসিস করে ফাঁকফোকর খুঁজে বের করা এবং অপটিমাইজড কাউন্টার-পিচ তৈরি করা।"
        : "Analyze rival companies, scrape customer review pain points, and formulate aggressive counter-positioning angles that convince prospects to switch.",
    },
    {
      num: "৫",
      numEn: "5",
      title: isBn ? "এজেন্সি ও হোয়াইট-লেবেল ক্লায়েন্ট পোর্টাল (White-Label Portal)" : "White-Label Agency Portal",
      icon: Briefcase,
      tag: "Commercial SaaS",
      desc: isBn
        ? "অন্যান্য এজেন্সি বা ছোট বিজনেসের কাছে এই হাবটির এক্সেস বিক্রি করে মান্থলি সাবস্ক্রিপশন (SaaS Business) আয় করার মাল্টি-টেন্যান্ট ক্লাউড আর্কিটেকচার।"
        : "License this entire autonomous dispatcher to other agencies and B2B founders with custom domains, client workspaces, and monthly recurring subscription billing.",
    },
  ];

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isBn ? "ভবিষ্যৎ রোডম্যাপ ও স্কেলিং আর্কিটেকচার" : "Sovereign Core Future Roadmap"}
              </h3>
              <p className="text-xs text-slate-500">
                5 Strategic Expansions for B2B Market Dominance
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {roadmapItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition flex items-start space-x-3.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                    {isBn ? item.num : item.numEn}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VPS Deployment Guide Quick Copy Box */}
          <div className="mt-6 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Server className="w-4 h-4" />
              <span>24/7 Cloud VPS Deployment Commands</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Run these commands on any Ubuntu VPS ($3-5/mo) to run Sovereign Core Hub in the background forever:
            </p>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 flex items-center justify-between gap-2 border border-slate-800">
              <div className="overflow-x-auto whitespace-pre">
                npm run build && pm2 start dist/server.cjs --name "sovereign-core-hub" && pm2 save && pm2 startup
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    99,
                    'npm run build && pm2 start dist/server.cjs --name "sovereign-core-hub" && pm2 save && pm2 startup'
                  )
                }
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition shrink-0"
                title="Copy full command"
              >
                {copiedIndex === 99 ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            {isBn ? "বন্ধ করুন" : "Close Roadmap"}
          </button>
        </div>
      </div>
    </div>
  );
};
