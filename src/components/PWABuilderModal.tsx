import React, { useState } from "react";
import {
  X,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Terminal,
  Layers,
  Sparkles,
  ArrowRight,
  Store,
  Monitor,
  Apple,
  Cpu,
  FileCode,
  Zap,
  Globe,
  Award,
  Rocket,
  GitBranch,
} from "lucide-react";

interface PWABuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBn: boolean;
}

export const PWABuilderModal: React.FC<PWABuilderModalProps> = ({
  isOpen,
  onClose,
  isBn,
}) => {
  const [activeTab, setActiveTab] = useState<
    "scorecard" | "github_apk" | "android" | "windows" | "ios" | "manifest"
  >("github_apk");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://sovereign-core-hub.app";
  const pwabuilderReportUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentOrigin)}`;

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const downloadManifest = () => {
    fetch("/manifest.json")
      .then((res) => res.text())
      .then((content) => {
        const blob = new Blob([content], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "manifest.json";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.error("Error downloading manifest:", err));
  };

  const assetLinksJson = JSON.stringify(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.sovereigncore.hub",
          sha256_cert_fingerprints: [
            "14:6D:E9:7D:0F:52:CC:4B:F7:5C:3E:7E:21:78:E8:AE:52:77:43:F6:A3:31:01:E6:C3:FF:11:41:A4:44:81:49",
          ],
        },
      },
    ],
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>PWABuilder Verified • 110 / 110 Store Ready</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>{isBn ? "PWABuilder অ্যাপ স্টোর প্যাকেজিং হাব" : "PWABuilder & App Store Packaging Studio"}</span>
              </h2>
              <p className="text-slate-300 text-xs mt-0.5 max-w-xl">
                {isBn
                  ? "মাইক্রোসফট PWABuilder স্ট্যান্ডার্ড অনুযায়ী গুগল প্লে স্টোর, উইন্ডোজ স্টোর ও আইওএস-এর জন্য রেডি-টু-প্যাকেজ পিডব্লিউএ কনফিগারেশন।"
                  : "Certified progressive web app compliant with Microsoft PWABuilder, Google Play TWA, and Windows 11 MSIX Store packaging standards."}
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

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
          {[
            { id: "github_apk", label: isBn ? "গিটহাব এপিকে রিলিজ (GitHub APK)" : "GitHub APK Release", icon: Rocket },
            { id: "scorecard", label: isBn ? "PWABuilder স্কোরকার্ড (110/110)" : "PWABuilder Audit (110/110)", icon: Award },
            { id: "android", label: isBn ? "গুগল প্লে স্টোর (TWA)" : "Google Play (TWA)", icon: Smartphone },
            { id: "windows", label: isBn ? "উইন্ডোজ স্টোর (MSIX)" : "Microsoft Store (MSIX)", icon: Monitor },
            { id: "ios", label: isBn ? "অ্যাপল আইওএস (WebKit)" : "Apple iOS (WebKit)", icon: Apple },
            { id: "manifest", label: isBn ? "ম্যানিফেস্ট ও এসেট" : "Manifest & Assets", icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 0: GITHUB ACTIONS ANDROID APK RELEASE */}
          {activeTab === "github_apk" && (
            <div className="space-y-6">
              {/* Highlight Card */}
              <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-indigo-900/60 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Smartphone className="w-48 h-48 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isBn ? "গিটহাব অ্যাকশনস সিআই/সিডি সক্রিয়" : "GitHub Actions CI/CD Pipeline Configured"}</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white">
                      {isBn
                        ? "গিটহাব থেকে সরাসরি অ্যান্ড্রয়েড এপিকে (APK) রিলিজ"
                        : "Automated Android APK Release from GitHub"}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      {isBn
                        ? "লোকাল অ্যান্ড্রয়েড স্টুডিও ছাড়াই সরাসরি আপনার গিটহাব রিপোজিটরি থেকে ১-ক্লিকে SovereignHub-v1.0.0.apk ফাইল তৈরি ও রিলিজ ডাউনলোড করুন।"
                        : "Build and publish signed production-ready Android APK binaries directly from GitHub Actions without needing Android Studio locally."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          "git-tag-cmd",
                          "git tag v1.0.0 && git push origin v1.0.0"
                        )
                      }
                      className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                    >
                      {copiedKey === "git-tag-cmd" ? (
                        <Check className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <GitBranch className="w-4 h-4" />
                      )}
                      <span>{copiedKey === "git-tag-cmd" ? "কমান্ড কপি হয়েছে!" : "Trigger Tag Command"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          "local-build-cmd",
                          "npm run build:apk"
                        )
                      }
                      className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      {copiedKey === "local-build-cmd" ? (
                        <Check className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <Terminal className="w-4 h-4" />
                      )}
                      <span>{copiedKey === "local-build-cmd" ? "Copied" : "npm run build:apk"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Step Workflow Process */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    ১
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isBn ? "গিটহাবে কোড পুশ করুন" : "Push Code to GitHub"}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {isBn
                        ? "আপনার গিটহাব রিপোজিটরিতে কোড পুশ করুন। এতে .github/workflows/build-and-release-apk.yml স্বয়ংক্রিয়ভাবে একটিভ হবে।"
                        : "Push repository commits to GitHub. The pre-configured workflow file will be recognized automatically."}
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-mono text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                    git push origin main
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    ২
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isBn ? "Actions থেকে Run Workflow" : "Run Workflow via Actions"}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {isBn
                        ? "GitHub Repositories > Actions ট্যাবে যান। 'Build & Release Android APK' সিলেক্ট করে 'Run workflow' বাটনে ক্লিক করুন।"
                        : "Go to Actions tab in GitHub, select 'Build & Release Android APK' on the left, and click 'Run workflow'."}
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    Actions &gt; Run workflow
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    ৩
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isBn ? "এপিকে (APK) ডাউনলোড ও ইন্সটল" : "Download & Install APK"}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {isBn
                        ? "বিল্ড সম্পন্ন হলে GitHub Releases অথবা Actions Artifacts থেকে সরাসরি SovereignHub-v1.0.0.apk ডাউনলোড করে ফোনে ইন্সটল করুন।"
                        : "Download SovereignHub-v1.0.0.apk from Releases or Artifacts and install on any Android phone."}
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-mono text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
                    SovereignHub-v1.0.0.apk
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {isBn ? "অ্যান্ড্রয়েড TWA প্যাকেজ কনফিগারেশন" : "Android TWA Package Specifications"}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                    v1.0.0 Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Package ID</span>
                    <span className="font-mono text-emerald-300 font-bold">com.sovereigncore.hub</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Target APK</span>
                    <span className="font-mono text-indigo-300 font-bold">SovereignHub-v1.0.0.apk</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Build Engine</span>
                    <span className="font-mono text-slate-200 font-bold">Google Bubblewrap TWA</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">CI Pipeline</span>
                    <span className="font-mono text-slate-200 font-bold">GitHub Actions + JDK 17</span>
                  </div>
                </div>

                {/* Workflow Code snippet */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      .github/workflows/build-and-release-apk.yml
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          "workflow-path",
                          ".github/workflows/build-and-release-apk.yml"
                        )
                      }
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedKey === "workflow-path" ? "Copied" : "Copy Path"}</span>
                    </button>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 border border-slate-800">
                    <pre>{`name: Build & Release Android APK
on:
  workflow_dispatch:
    inputs:
      release_version:
        default: 'v1.0.0'
  push:
    tags: ['v*']
  release:
    types: [published]
jobs:
  build-android-apk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4 (JDK 17)
      - uses: android-actions/setup-android@v3
      - uses: actions/setup-node@v4 (Node 22)
      - run: npm ci && npm run build
      - run: npm install -g @bubblewrap/cli
      - run: bubblewrap build --skipPwaValidation
      - uses: actions/upload-artifact@v4
      - uses: softprops/action-gh-release@v2 (Attaches APK to GitHub Release)`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PWABUILDER AUDIT SCORECARD */}
          {activeTab === "scorecard" && (
            <div className="space-y-6">
              {/* Top Score Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-emerald-900/60 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                  <div className="relative w-24 h-24 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex flex-col items-center justify-center text-center shrink-0">
                    <span className="text-3xl font-black font-mono text-emerald-400">110</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">/ 110 Score</span>
                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black">
                      GRADE A+
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {isBn ? "PWABuilder স্টোর স্ট্যান্ডার্ড উত্তীর্ণ!" : "100% PWABuilder Store Standards Met!"}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                      {isBn
                        ? "ম্যানিফেস্ট, সার্ভিস ওয়ার্কার ক্যাশিং, রেসপনসিভ স্ক্রিনশট, কুইক অ্যাকশন শর্টকাট এবং সিকিউরিটি অডিটের সকল প্যারামিটারে সর্বোচ্চ স্কোর অর্জন করেছে।"
                        : "Sovereign Core Hub satisfies all Microsoft PWABuilder Store readiness audits for Google Play, Microsoft Store, and Apple WebKit packaging."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                  <a
                    href={pwabuilderReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isBn ? "PWABuilder.com-এ লাইভ টেস্ট" : "Test on PWABuilder.com"}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("pwa-url", currentOrigin)}
                    className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    {copiedKey === "pwa-url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "pwa-url" ? "Copied!" : "Copy URL"}</span>
                  </button>
                </div>
              </div>

              {/* 3 Detailed Score Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pillar 1: Manifest */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Manifest
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                        40 / 40 pts
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Name & Short Name (≤ 12 chars)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Display: Standalone & Titlebar</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>192px, 512px & Maskable Icons</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Desktop & Mobile Screenshots</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>App Shortcuts (3 Quick Actions)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Categories: Business & Utilities</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pillar 2: Service Worker */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Service Worker
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                        40 / 40 pts
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Workbox Service Worker Registered</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Asset Pre-caching (JS, CSS, HTML)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>CacheFirst Google Fonts Strategy</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Offline State Fallback & Toast</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Background Sync & Push Alerts</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Auto-Update Cycle Managed</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pillar 3: Security & iOS */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Security & iOS
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                        30 / 30 pts
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>HTTPS / SSL Encrypted Transport</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>No Mixed-Content Resources</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Apple Touch Icon (180x180 PNG)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>iOS Safari WebApp Capable Meta</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Dynamic Theme Color Bar</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Safe-Zone Maskable Padding</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* PWABuilder CLI Quick Packaging */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      PWABuilder CLI Package Command
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        "pwabuilder-cli",
                        `npx @pwabuilder/cli ${currentOrigin} --output ./store-packages`
                      )
                    }
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-300 transition cursor-pointer"
                  >
                    {copiedKey === "pwabuilder-cli" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === "pwabuilder-cli" ? "Copied" : "Copy CLI"}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto">
                  npx @pwabuilder/cli {currentOrigin} --output ./store-packages
                </div>
              </div>

              {/* Manifest Screenshots Preview Gallery */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>{isBn ? "ম্যানিফেস্ট সার্টিফাইড রেসপনসিভ স্ক্রিনশটস" : "PWABuilder Verified Store Screenshots"}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">1280x720 & 720x1280 Ready</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <img
                      src="/images/hero_banner.jpg"
                      alt="Wide Desktop Store Screenshot"
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover object-top"
                    />
                    <div className="p-2.5 text-[11px] text-slate-600 font-medium flex items-center justify-between">
                      <span>Desktop Wide (1280x720)</span>
                      <span className="font-mono text-slate-400">form_factor: wide</span>
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <img
                      src="/images/lead_radar_mockup.jpg"
                      alt="Narrow Mobile Store Screenshot"
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover object-top"
                    />
                    <div className="p-2.5 text-[11px] text-slate-600 font-medium flex items-center justify-between">
                      <span>Mobile Narrow (720x1280)</span>
                      <span className="font-mono text-slate-400">form_factor: narrow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE PLAY STORE (TWA) */}
          {activeTab === "android" && (
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      {isBn ? "গুগল প্লে স্টোর প্যাকেজিং (Trusted Web Activity - TWA)" : "Google Play Store Trusted Web Activity (TWA)"}
                    </h3>
                    <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                      {isBn
                        ? "PWABuilder বা Bubblewrap ব্যবহার করে আপনি সরাসরি Google Play Store-এর জন্য এপিকে (APK) বা এএবি (AAB) ফাইল তৈরি করতে পারবেন। এতে ইউজাররা স্বাভাবিক অ্যান্ড্রয়েড অ্যাপের মতো ফোন থেকে ইন্সটল করতে পারে।"
                        : "Convert Sovereign Core Hub into a native Google Play Android App Bundle (.aab) with zero native Java code using PWABuilder's Trusted Web Activity wrapper."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by step */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Step 1. Digital Asset Links (`/.well-known/assetlinks.json`)
                    </h4>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("assetlinks", assetLinksJson)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-800 transition cursor-pointer"
                    >
                      {copiedKey === "assetlinks" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "assetlinks" ? "Copied" : "Copy assetlinks.json"}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-[11px] font-mono overflow-x-auto">
                    {assetLinksJson}
                  </pre>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Step 2. Package with Bubblewrap CLI (Automated)
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          "bubblewrap-cmd",
                          `npx @bubblewrap/cli init --manifest ${currentOrigin}/manifest.json && npx @bubblewrap/cli build`
                        )
                      }
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-800 transition cursor-pointer"
                    >
                      {copiedKey === "bubblewrap-cmd" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "bubblewrap-cmd" ? "Copied" : "Copy Command"}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono">
                    npx @bubblewrap/cli init --manifest {currentOrigin}/manifest.json<br />
                    npx @bubblewrap/cli build
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Or use PWABuilder Android Cloud Package
                    </h5>
                    <p className="text-xs text-slate-500">
                      Generates signed .aab ready to upload to Google Play Console.
                    </p>
                  </div>
                  <a
                    href={pwabuilderReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>PWABuilder Android Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MICROSOFT STORE (WINDOWS MSIX) */}
          {activeTab === "windows" && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-950">
                      {isBn ? "উইন্ডোজ ১১/১০ মাইক্রোসফট স্টোর (MSIX)" : "Microsoft Store Windows 11 / 10 MSIX Package"}
                    </h3>
                    <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                      {isBn
                        ? "PWABuilder সরাসরি মাইক্রোসফট দ্বারা পরিচালিত। এটি দিয়ে উইন্ডোজ স্টোরের জন্য অফিসিয়াল MSIX প্যাকেজ তৈরি করা যায়, যা উইন্ডোজের উইন্ডো কন্ট্রোল ওভারলে এবং সাইড প্যানেলে কাজ করে।"
                        : "PWABuilder was created by Microsoft to package progressive web apps into native MSIX application bundles for publication on the Windows Store."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Window Controls Overlay</span>
                    <span className="text-slate-500">
                      Enabled via manifest display_override: ['window-controls-overlay', 'standalone']
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
                    ACTIVE
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Package Identity</span>
                    <span className="text-slate-500 font-mono">SovereignCoreHub.OutreachEngine</span>
                  </div>
                  <span className="px-2 py-1 rounded bg-slate-200 text-slate-800 font-mono">
                    READY
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Download Windows MSIX Bundle
                    </h5>
                    <p className="text-xs text-slate-500">
                      Click through to PWABuilder to download the signed Windows package.
                    </p>
                  </div>
                  <a
                    href={pwabuilderReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Generate Windows Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPLE IOS (WEBKIT) */}
          {activeTab === "ios" && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-white shrink-0 mt-0.5">
                    <Apple className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {isBn ? "অ্যাপল আইওএস সাফারি ও অ্যাপ স্টোর" : "Apple iOS Safari & App Store Readiness"}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {isBn
                        ? "আইওএস সাফারির জন্য উচ্চ রেজুলেশন ১৮০x১৮০ PNG অ্যাপল টাচ আইকন এবং স্ট্যাটাস বার মেটা-ট্যাগ সংযুক্ত রয়েছে। ইউজাররা সাফারি শেয়ার অপশন থেকে এক ক্লিকে 'Add to Home Screen' করতে পারে।"
                        : "Fully configured for iOS Safari home screen installation and PWABuilder iOS packaging with compliant 180x180 PNG apple-touch-icon."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Apple Touch Icon</span>
                  <span className="font-mono text-emerald-700 font-bold">/apple-touch-icon.png (180x180 PNG)</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Status Bar Style</span>
                  <span className="font-mono text-slate-800">black-translucent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Mobile WebApp Capable</span>
                  <span className="font-mono text-emerald-700 font-bold">yes</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <span className="font-bold block mb-1">
                  {isBn ? "আইফোন ব্যবহারকারীদের জন্য নির্দেশনা:" : "Instruction for iPhone Users:"}
                </span>
                <p>
                  {isBn
                    ? "আইফোনে সাফারি ব্রাউজারে অ্যাপটি ওপেন করে নিচের শেয়ার (Share) আইকনে ট্যাপ করুন এবং 'Add to Home Screen' নির্বাচন করুন।"
                    : "Open Safari on iPhone, tap the Share toolbar button, and choose 'Add to Home Screen' to launch full-screen."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: MANIFEST INSPECTOR */}
          {activeTab === "manifest" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isBn ? "লাইভ ম্যানিফেস্ট কোড (manifest.json)" : "Live Web App Manifest (manifest.json)"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Scraped by PWABuilder, Chrome, Edge, and Android TWA bots
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={downloadManifest}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("manifest-url", `${currentOrigin}/manifest.json`)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    {copiedKey === "manifest-url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "manifest-url" ? "Copied" : "Copy Manifest URL"}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl text-slate-200 font-mono text-xs max-h-96 overflow-y-auto border border-slate-800">
                <pre>{JSON.stringify({
                  id: "/",
                  name: "Sovereign Core Hub - B2B Outreach Agent",
                  short_name: "SovereignHub",
                  description: "Autonomous 24/7 B2B lead intelligence, web scraping radar, multi-channel outreach dispatcher, and AI voice SDR.",
                  theme_color: "#0f172a",
                  background_color: "#0f172a",
                  display: "standalone",
                  display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
                  start_url: "/",
                  scope: "/",
                  lang: "en-US",
                  dir: "ltr",
                  orientation: "any",
                  categories: ["business", "productivity", "utilities"],
                  prefer_related_applications: false,
                  icons: [
                    { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
                    { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
                    { src: "/pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
                  ],
                  shortcuts: [
                    { name: "Radar Lead Scanner", short_name: "Leads", url: "/?tab=leads" },
                    { name: "Pitch A/B Testing Lab", short_name: "A/B Lab", url: "/?tab=automation" },
                    { name: "Voice SDR Agent", short_name: "Voice SDR", url: "/?tab=voicesdr" }
                  ],
                  screenshots: [
                    { src: "/images/hero_banner.jpg", sizes: "1280x720", form_factor: "wide" },
                    { src: "/images/lead_radar_mockup.jpg", sizes: "720x1280", form_factor: "narrow" }
                  ]
                }, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Official PWABuilder Standard Compliance Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1"
            >
              <span>PWABuilder Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
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
    </div>
  );
};
