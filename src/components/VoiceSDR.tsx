import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Loader2,
  Mic,
  Headphones,
  Sliders,
  CheckCircle,
  Radio,
  FileText,
  Calendar,
  Bell,
  PlayCircle,
} from "lucide-react";
import { synthesizeTTS } from "../services/api";
import { notificationService } from "../services/notificationService";

interface VoiceSDRProps {
  initialScript?: string;
  isBn: boolean;
}

export const VoiceSDR: React.FC<VoiceSDRProps> = ({ initialScript, isBn }) => {
  const [script, setScript] = useState<string>(
    initialScript ||
      "Hi there! This is Alex calling from Sovereign Core. I noticed your team is scaling operations this quarter, and we built an autonomous AI agent system that automates lead enrichment and outbound scheduling. Would you be open to a 5-minute preview this Thursday?"
  );

  useEffect(() => {
    if (initialScript) {
      setScript(initialScript);
    }
  }, [initialScript]);

  const [voice, setVoice] = useState<"Kore" | "Zephyr" | "Puck" | "Charon" | "Fenrir">("Kore");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apptBookedSuccess, setApptBookedSuccess] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSimulateAppointment = async () => {
    try {
      await notificationService.triggerAppointmentSecured({
        companyName: "HyperCloud Infrastructure",
        contactPerson: "Jonathan Briggs, Chief Revenue Officer",
        appointmentDate: "Tomorrow",
        appointmentTime: "3:30 PM EST",
        meetingType: "Executive Pipeline Demo Call",
        channel: "Voice SDR Cold Call Conversion",
      });
      setApptBookedSuccess(
        isBn
          ? "অ্যাপয়েন্টমেন্ট সফলভাবে কনফার্ম হয়েছে ও পুশ নোটিফিকেশন পাঠানো হয়েছে!"
          : "Appointment secured! Push notification and triumphant chord dispatched."
      );
      setTimeout(() => setApptBookedSuccess(null), 4000);
    } catch (err) {
      console.warn(err);
    }
  };

  const voicePresets = [
    { id: "Kore", name: "Kore", tone: "Professional, Warm, Executive Female" },
    { id: "Zephyr", name: "Zephyr", tone: "Crisp, Dynamic, Confident Male" },
    { id: "Puck", name: "Puck", tone: "Engaging, Casual, High Energy" },
    { id: "Charon", name: "Charon", tone: "Deep, Authoritative, Consultative" },
    { id: "Fenrir", name: "Fenrir", tone: "Direct, Strong, Action-Oriented" },
  ] as const;

  const scriptTemplates = [
    {
      label: "Cold Call Opener",
      text: "Hi Sarah, Alex here with Sovereign Core. Saw you are leading growth at your team. We help B2B tech firms automate prospect qualification using Gemini models. Open to seeing a quick 3-minute demo?",
    },
    {
      label: "20-Sec Voicemail Drop",
      text: "Hey Mark, left you a quick note in your inbox regarding pipeline automation for Q3. Give me a ring back or just reply to the email whenever convenient. Talk soon!",
    },
    {
      label: "Objection: Send Info",
      text: "Totally understand! I will send over our 1-page executive brief right away. Before I send it, what is your top priority right now: lead volume or outbound response rates?",
    },
  ];

  const handleGenerateTTS = async () => {
    if (!script.trim()) return;
    setIsSynthesizing(true);
    setErrorMessage(null);
    try {
      const res = await synthesizeTTS(script, voice);
      if (res.audioBase64) {
        // Create audio data URL
        const dataUri = `data:audio/wav;base64,${res.audioBase64}`;
        setAudioUrl(dataUri);
        setIsPlaying(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "TTS synthesis failed");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Studio Visual Mockup */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="max-w-2xl flex-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold mb-3 border border-white/10">
            <Headphones className="w-3.5 h-3.5" />
            <span>gemini-3.1-flash-tts-preview Engine</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            {isBn ? "এআই ভয়েস SDR স্টুডিও (Text to Speech)" : "AI Voice SDR Studio & Pitch Synthesizer"}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-2">
            {isBn
              ? "মডেল gemini-3.1-flash-tts-preview দিয়ে আপনার কোল্ড কল পিচ, ভয়েসমেইল ড্রপ বা ক্লায়েন্ট মিটিং অ্যাপয়েন্টমেন্ট কনফার্মেশনের জন্য বাস্তবসম্মত কণ্ঠস্বর তৈরি করুন।"
              : "Transform cold outreach copy and phone scripts into human-like audio using Gemini 3.1 Flash TTS. Test outbound voice messaging, voicemail drops, and automated call openers."}
          </p>
        </div>

        {/* Studio Artwork Preview */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="relative group rounded-2xl overflow-hidden border border-indigo-900/60 bg-slate-950 shadow-xl">
            <img
              src="/images/voice_sdr_mockup.jpg"
              alt="Neural Voice SDR Soundboard Studio"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover object-center transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px]">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isBn ? "২৪kHz নিউরাল অডিও" : "24kHz Neural Audio"}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold">
                STUDIO PRO
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Script Editor & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            {/* Quick Templates */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isBn ? "স্ক্রিপ্ট টেমপ্লেট:" : "Script Templates:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {scriptTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setScript(tpl.text)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Script Textarea */}
            <div className="relative mb-4">
              <textarea
                id="voice-sdr-script-input"
                rows={5}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                maxLength={600}
                placeholder="Enter phone pitch script or cold call opener..."
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
              />
              <span className="absolute right-3 bottom-3 text-[11px] text-slate-400 font-mono">
                {script.length}/600 chars
              </span>
            </div>

            {/* Voice Persona Selector */}
            <div className="mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Select Gemini Voice Actor
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {voicePresets.map((vp) => {
                  const isSelected = voice === vp.id;
                  return (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => setVoice(vp.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{vp.name}</span>
                        {isSelected && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <span
                        className={`text-[10px] leading-tight line-clamp-2 block ${
                          isSelected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {vp.tone}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Synthesize Button */}
            <button
              id="voice-sdr-synthesize-btn"
              type="button"
              onClick={handleGenerateTTS}
              disabled={isSynthesizing || !script.trim()}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? "কণ্ঠস্বর রূপান্তর করা হচ্ছে..." : "Synthesizing Speech with Gemini..."}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{isBn ? "এআই ভয়েস ট্র্যাক তৈরি করুন" : "Generate AI Voice Track (TTS)"}</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Audio Player Card */}
          {audioUrl && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Voice Actor: {voice} (24kHz Hi-Fi)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Speed buttons */}
                  {[1.0, 1.15, 1.25].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        playbackSpeed === speed
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                  {/* Download */}
                  <a
                    href={audioUrl}
                    download={`voice-pitch-${voice.toLowerCase()}.wav`}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                    title="Download WAV"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Progress Bar & Seek */}
              <div className="mb-4">
                <input
                  type="range"
                  min={0}
                  max={audioDuration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-emerald-400 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>{Math.floor(currentTime)}s</span>
                  <span>{Math.floor(audioDuration)}s</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md transition"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-slate-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Voice SDR Architecture & Telephony Integration */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? "ভয়েস SDR কীভাবে কাজ করে?" : "AI Voice SDR Architecture"}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {isBn
                ? "ইমেইল আউটরিচে সাড়া দেওয়া ইতিবাচক ক্লায়েন্টদের সাথে সরাসরি কথা বলতে এবং ক্যালেন্ডার স্লট বুকিং করতে এই ভয়েস স্ক্রিপ্টগুলো ব্যবহার করা যায়।"
                : "When prospects demonstrate positive intent via email or LinkedIn, your AI Voice SDR can dispatch automated voicemail drops or place inbound confirmation calls."}
            </p>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Low Latency 24kHz Audio</span>
                  <span>Crystal clear natural phrasing generated directly via Gemini Flash.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Telephony Ready</span>
                  <span>Export WAV directly into Twilio, Vapi AI, Retell AI, or Bland.ai.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Personalized Insertion</span>
                  <span>Dynamically injects prospect company name, sector, and custom angle.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Call Outcome & Push Trigger Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 rounded-2xl p-5 border border-emerald-800/60 text-white shadow-xs">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {isBn ? "কল ফলাফল ও পুশ নোটিফিকেশন" : "Call Outcome & Push Delivery"}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white">
              {isBn ? "প্রস্পেক্ট ডেমোতে রাজি হলে অ্যাপয়েন্টমেন্ট কনফার্ম" : "Secure Appointment from SDR Call"}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isBn
                ? "ভয়েস কলে প্রস্পেক্ট মিটিংয়ের সময় নিশ্চিত করলে তাৎক্ষণিক ক্যালেন্ডার কনফার্মেশন ও ডিভাইস পুশ নোটিফিকেশন ফায়ার হয়।"
                : "When an outbound call converts, trigger real-time browser push notifications and lock-screen alerts across your devices."}
            </p>

            {apptBookedSuccess && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold">{apptBookedSuccess}</span>
              </div>
            )}

            <button
              id="voicesdr-secure-appointment-btn"
              type="button"
              onClick={handleSimulateAppointment}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isBn ? "অ্যাপয়েন্টমেন্ট সিকিউর করুন ও পুশ পাঠান" : "Secure Appointment & Push Alert"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
