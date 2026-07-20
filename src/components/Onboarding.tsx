import React, { useState } from "react";
import { motion } from "motion/react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../translations";
import { Smartphone, Shield, Radio, Check, Loader2 } from "lucide-react";

interface OnboardingProps {
  accentColor: string;
  lang: LanguageCode;
  onFinished: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  accentColor,
  lang,
  onFinished,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const t = TRANSLATIONS[lang];
  const isRtl = lang === "ar" || lang === "fa";

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      // Fetch user's approximate country and format current date/time for telemetry proxy
      const dateStr = new Date().toISOString().split("T")[0];
      const timeStr = new Date().toTimeString().split(" ")[0];

      let country = "Web Client";
      try {
        const geoRes = await fetch("https://ipapi.co/json/");
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.country_name) {
            country = geoData.country_name;
          }
        }
      } catch (e) {
        console.warn("Geocoding failed, using fallback.", e);
      }

      // Call Express server-side Telegram proxy
      const response = await fetch("/api/notify-install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          date: dateStr,
          time: timeStr,
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Failed to notify install via proxy:", err);
    } finally {
      setLoading(false);
      // Give a tiny delayed feedback before completing onboarding
      setTimeout(() => {
        onFinished();
      }, 800);
    }
  };

  return (
    <div
      id="onboarding-container"
      className={`fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-[#0a0f1d] p-6 text-white ${
        isRtl ? "rtl-layout" : "ltr-layout"
      }`}
    >
      {/* Top spacing */}
      <div className="h-4" />

      {/* Main Content Card */}
      <div className="mx-auto w-full max-w-lg flex-1 flex flex-col justify-center space-y-6 py-6">
        {/* Animated App Brand */}
        <div className="text-center space-y-2">
          <motion.div
            id="onboarding-logo"
            initial={{ scale: 0.8, rotate: -15 }}
            animate={{ scale: [0.9, 1.05, 1], rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ borderColor: accentColor }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-2 bg-black/40 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
          >
            <Smartphone className="h-10 w-10" style={{ color: accentColor }} />
          </motion.div>
          <h2 className="font-display text-2xl font-bold tracking-tight mt-4">
            {t.onboarding_title}
          </h2>
          <p style={{ color: accentColor }} className="text-xs font-mono tracking-wider uppercase font-semibold">
            {t.onboarding_funny_tagline}
          </p>
        </div>

        {/* Informational Sections */}
        <div className="space-y-4">
          {/* Feature Highlight */}
          <div className="flex items-start space-x-3 bg-white/3 border border-white/5 rounded-2xl p-4 gap-3">
            <div className="mt-1 bg-white/5 rounded-lg p-2 flex shrink-0">
              <Smartphone className="h-5 w-5 text-gray-300" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-100">
                {t.app_name} Launcher Helper
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t.onboarding_simple_desc}
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start space-x-3 bg-white/3 border border-white/5 rounded-2xl p-4 gap-3">
            <div className="mt-1 bg-white/5 rounded-lg p-2 flex shrink-0">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-green-400">
                Privacy Guaranteed
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t.onboarding_privacy_note}
              </p>
            </div>
          </div>

          {/* Telemetry disclosure */}
          <div className="flex items-start space-x-3 bg-white/3 border border-white/5 rounded-2xl p-4 gap-3">
            <div className="mt-1 bg-white/5 rounded-lg p-2 flex shrink-0">
              {success ? (
                <Check className="h-5 w-5 text-cyan-400" />
              ) : loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              ) : (
                <Radio className="h-5 w-5 text-cyan-400 animate-pulse" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-cyan-400">
                {t.onboarding_developer_notified}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t.onboarding_developer_notified_desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mx-auto w-full max-w-lg space-y-3 pb-8">
        <button
          id="onboarding-start-btn"
          disabled={loading}
          onClick={handleGetStarted}
          style={{ backgroundColor: accentColor }}
          className="flex w-full h-12 items-center justify-center rounded-xl text-black font-bold hover:opacity-90 active:scale-98 transition-transform cursor-pointer shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-black" />
          ) : success ? (
            <div className="flex items-center gap-1">
              <Check className="h-5 w-5" /> Done
            </div>
          ) : (
            t.onboarding_get_started
          )}
        </button>

        <button
          id="onboarding-skip-btn"
          disabled={loading}
          onClick={onFinished}
          className="w-full h-10 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          {t.onboarding_skip_permissions}
        </button>
      </div>
    </div>
  );
};
