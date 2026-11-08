import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineIndicator: React.FC<{ isBn?: boolean }> = ({ isBn = false }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  if (showRestored) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
        <Wifi className="w-4 h-4" />
        <span>{isBn ? "ইন্টারনেট পুনঃসংযোগ হয়েছে - এজেন্ট সক্রিয়!" : "Internet Restored — 24/7 Agent Resumed!"}</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-2 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>{isBn ? "অফলাইন মোড - সংযোগ ফিরে এলে স্বয়ংক্রিয়ভাবে পুনরায় চালু হবে।" : "Offline Mode — Will auto-resume once connection restores."}</span>
    </div>
  );
};
