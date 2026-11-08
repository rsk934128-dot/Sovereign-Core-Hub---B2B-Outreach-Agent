import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Download, X } from "lucide-react";

interface PWAInstallButtonProps {
  isBn?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ isBn = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on standalone mobile screen, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        type="button"
        onClick={install}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
        title={isBn ? "মোবাইলে অ্যাপ হিসেবে ইনস্টল করুন" : "Install as Mobile App"}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isBn ? "অ্যাপ ইনস্টল" : "Install App"}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>{isBn ? "iOS ইনস্টল" : "Install on iOS"}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {isBn ? "আইফোনে অ্যাপ ইনস্টল করুন" : "Install on iPhone / iPad"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 space-y-2">
                <span>1. {isBn ? "সাফারির নিচে শেয়ার (Share) বাটনে ট্যাপ করুন।" : "Tap the Share button in Safari toolbar."}</span><br />
                <span>2. {isBn ? "স্ক্রোল করে 'Add to Home Screen' চাপুন।" : "Scroll down and select 'Add to Home Screen'."}</span>
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                {isBn ? "বুঝেছি" : "Got it"}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
