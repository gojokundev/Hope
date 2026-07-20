import React, { useState, useEffect } from "react";
import { THEMES, LanguageCode, SimulatedApp, SpeedDialEntry, VaultFolder, VaultEntry } from "./types";
import { TRANSLATIONS } from "./translations";
import { IntroSequence } from "./components/IntroSequence";
import { Onboarding } from "./components/Onboarding";
import { PhoneSimulator } from "./components/PhoneSimulator";
import {
  Smartphone,
  Palette,
  Sliders,
  Settings,
  ShieldAlert,
  Play,
  Square,
  Globe,
  Star,
  Check,
  ShieldCheck,
  Compass,
  FileText
} from "lucide-react";

// Default initial simulated apps
const INITIAL_APPS: SimulatedApp[] = [
  {
    id: "browser",
    name: "Browser",
    category: "System",
    icon: "🌐",
    launchCount: 0,
    isFavorite: true,
    mockContent: "Orbit decetralized index"
  },
  {
    id: "camera",
    name: "Camera",
    category: "System",
    icon: "📷",
    launchCount: 0,
    isFavorite: false,
    mockContent: "Visual scanner overlay"
  },
  {
    id: "maps",
    name: "Maps",
    category: "System",
    icon: "🗺️",
    launchCount: 0,
    isFavorite: false,
    mockContent: "GPS path route locked"
  },
  {
    id: "music",
    name: "Music Player",
    category: "Media",
    icon: "🎵",
    launchCount: 0,
    isFavorite: true,
    mockContent: "CYBER CONSOLE PLAYER"
  },
  {
    id: "chat",
    name: "Chat Messenger",
    category: "Social",
    icon: "💬",
    launchCount: 0,
    isFavorite: true,
    mockContent: "Welcome to Orbit messenger"
  },
  {
    id: "settings",
    name: "Settings",
    category: "System",
    icon: "⚙️",
    launchCount: 0,
    isFavorite: false,
    mockContent: "System OS configurations"
  }
];

export default function App() {
  // Sequence states
  const [introFinished, setIntroFinished] = useState<boolean>(() => {
    return localStorage.getItem("orbit_intro_finished") === "true";
  });
  const [onboardingFinished, setOnboardingFinished] = useState<boolean>(() => {
    return localStorage.getItem("orbit_onboarding_finished") === "true";
  });

  // Settings states
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem("orbit_language") as LanguageCode) || "en";
  });
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem("orbit_theme_id") || "cyan";
  });
  const [bubbleSize, setBubbleSize] = useState<number>(() => {
    const saved = localStorage.getItem("orbit_bubble_size");
    return saved ? parseInt(saved, 10) : 56;
  });

  // Permissions state
  const [permissions, setPermissions] = useState<{
    displayOverApps: boolean | "skipped";
    usageStats: boolean | "skipped";
    foregroundNotifications: boolean | "skipped";
  }>(() => {
    const saved = localStorage.getItem("orbit_permissions_state");
    return saved
      ? JSON.parse(saved)
      : {
          displayOverApps: false,
          usageStats: false,
          foregroundNotifications: false,
        };
  });

  // Background floating bubble service state
  const [serviceStarted, setServiceStarted] = useState<boolean>(() => {
    return localStorage.getItem("orbit_service_started") === "true";
  });

  // Database core tables (stored in LocalStorage)
  const [apps, setApps] = useState<SimulatedApp[]>(() => {
    const saved = localStorage.getItem("orbit_apps_table");
    return saved ? JSON.parse(saved) : INITIAL_APPS;
  });

  const [speedDialEntries, setSpeedDialEntries] = useState<SpeedDialEntry[]>(() => {
    const saved = localStorage.getItem("orbit_speed_dial");
    if (saved) return JSON.parse(saved);
    return [
      { id: "1", label: "Google", url: "google.com" },
      { id: "2", label: "GitHub", url: "github.com/gojokundev" }
    ];
  });

  const [vaultFolders, setVaultFolders] = useState<VaultFolder[]>(() => {
    const saved = localStorage.getItem("orbit_vault_folders");
    if (saved) return JSON.parse(saved);
    return [
      { id: "f1", name: "Personal Notes", timestamp: new Date().toISOString() },
      { id: "f2", name: "Screen OCR Scans", timestamp: new Date().toISOString() }
    ];
  });

  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>(() => {
    const saved = localStorage.getItem("orbit_vault_entries");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "e1",
        folderId: "f1",
        type: "note",
        title: "Welcome note",
        content: "Orbit runs 100% locally on your browser container, keeping all personal files safe and private.",
        timestamp: new Date().toISOString()
      },
      {
        id: "e2",
        folderId: "f2",
        type: "ocr",
        title: "Example OCR Scan",
        content: "SYSTEM STABLE: PORT 3000 INGRESS LOADED SUCCESS",
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Persists states on edits
  useEffect(() => {
    localStorage.setItem("orbit_intro_finished", String(introFinished));
  }, [introFinished]);

  useEffect(() => {
    localStorage.setItem("orbit_onboarding_finished", String(onboardingFinished));
  }, [onboardingFinished]);

  useEffect(() => {
    localStorage.setItem("orbit_language", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("orbit_theme_id", themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem("orbit_bubble_size", String(bubbleSize));
  }, [bubbleSize]);

  useEffect(() => {
    localStorage.setItem("orbit_permissions_state", JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem("orbit_service_started", String(serviceStarted));
  }, [serviceStarted]);

  useEffect(() => {
    localStorage.setItem("orbit_apps_table", JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem("orbit_speed_dial", JSON.stringify(speedDialEntries));
  }, [speedDialEntries]);

  useEffect(() => {
    localStorage.setItem("orbit_vault_folders", JSON.stringify(vaultFolders));
  }, [vaultFolders]);

  useEffect(() => {
    localStorage.setItem("orbit_vault_entries", JSON.stringify(vaultEntries));
  }, [vaultEntries]);

  const selectedTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const accentColor = selectedTheme.colorHexStr;
  const t = TRANSLATIONS[lang];

  // Check if floating service is allowed to start based on permissions
  const areRequiredPermissionsGranted = () => {
    return (
      (permissions.displayOverApps === true || permissions.displayOverApps === "skipped") &&
      (permissions.usageStats === true || permissions.usageStats === "skipped") &&
      (permissions.foregroundNotifications === true || permissions.foregroundNotifications === "skipped")
    );
  };

  const handleStartService = () => {
    if (!areRequiredPermissionsGranted()) {
      alert(t.activate_permissions_warning);
      return;
    }
    setServiceStarted(true);
  };

  const handleStopService = () => {
    setServiceStarted(false);
  };

  // Star apps helper
  const handleToggleFavoriteApp = (appId: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, isFavorite: !a.isFavorite } : a))
    );
  };

  // Speed Dial database operations
  const handleSaveSpeedDial = (label: string, url: string) => {
    const newEntry: SpeedDialEntry = {
      id: String(Date.now()),
      label,
      url,
    };
    setSpeedDialEntries((prev) => [...prev, newEntry]);
  };

  const handleDeleteSpeedDial = (id: string) => {
    setSpeedDialEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Vault database operations
  const handleAddVaultFolder = (name: string) => {
    const newFolder: VaultFolder = {
      id: `f-${Date.now()}`,
      name,
      timestamp: new Date().toISOString(),
    };
    setVaultFolders((prev) => [...prev, newFolder]);
  };

  const handleAddVaultEntry = (folderId: string, title: string, content: string, type: "note" | "ocr") => {
    const newEntry: VaultEntry = {
      id: `e-${Date.now()}`,
      folderId,
      type,
      title,
      content,
      timestamp: new Date().toISOString(),
    };
    setVaultEntries((prev) => [...prev, newEntry]);
  };

  const handleDeleteVaultFolder = (id: string) => {
    setVaultFolders((prev) => prev.filter((f) => f.id !== id));
    // Cascade delete entries
    setVaultEntries((prev) => prev.filter((e) => e.folderId !== id));
  };

  const handleDeleteVaultEntry = (id: string) => {
    setVaultEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Render onboarding sequences if not seen
  if (!introFinished) {
    return (
      <IntroSequence
        accentColor={accentColor}
        lang={lang}
        onFinished={() => setIntroFinished(true)}
      />
    );
  }

  if (!onboardingFinished) {
    return (
      <Onboarding
        accentColor={accentColor}
        lang={lang}
        onFinished={() => setOnboardingFinished(true)}
      />
    );
  }

  const isRtlLayout = lang === "ar" || lang === "fa";

  return (
    <div className="min-h-screen w-full bg-[#080b13] flex flex-col md:flex-row text-white font-sans overflow-y-auto">
      {/* LEFT SIDE PANEL: Orbit Companion App settings (MainActivity representation) */}
      <div
        id="companion-panel"
        className={`w-full md:w-[50%] lg:w-[45%] p-6 md:p-8 flex flex-col space-y-6 md:border-r border-white/5 ${
          isRtlLayout ? "rtl-layout md:order-2" : "ltr-layout md:order-1"
        }`}
      >
        {/* Header App Brand */}
        <div className="flex items-center gap-3">
          <div
            style={{ borderColor: accentColor }}
            className="h-12 w-12 rounded-2xl border-2 flex items-center justify-center bg-black/40 shadow-md"
          >
            <Smartphone className="h-6 w-6" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight">{t.app_name} Companion</h1>
            <p className="text-xs text-gray-400 font-medium">{t.app_desc}</p>
          </div>
        </div>

        {/* 1. Language Toggle */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400 shrink-0" />
            <h3 className="text-xs font-bold tracking-wider text-gray-300 uppercase">
              {t.select_language}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: "en", label: "English" },
              { code: "fa", label: "زبان فارسی" },
              { code: "ar", label: "اللغة العربية" },
            ].map((lan) => (
              <button
                key={lan.code}
                onClick={() => setLang(lan.code as LanguageCode)}
                style={lang === lan.code ? { borderColor: accentColor, color: accentColor } : {}}
                className={`py-2 text-[10px] font-bold rounded-xl border border-white/10 hover:bg-white/5 transition-all text-center cursor-pointer ${
                  lang === lan.code ? "bg-black/40 border-2" : "text-gray-400"
                }`}
              >
                {lan.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Theme Swatch customizer */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-pink-400 shrink-0" />
            <h3 className="text-xs font-bold tracking-wider text-gray-300 uppercase">
              {t.customize_theme}
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 leading-normal">{t.theme_desc}</p>
          <div className="flex items-center gap-3 py-1">
            {THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => setThemeId(th.id)}
                style={{ backgroundColor: th.colorHexStr }}
                className={`h-7 w-7 rounded-full border-2 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 relative flex items-center justify-center ${
                  themeId === th.id ? "border-white scale-110 shadow-lg shadow-white/20" : "border-transparent"
                }`}
              >
                {themeId === th.id && (
                  <Check className="h-3.5 w-3.5 text-black stroke-[3]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Bubble Slider size */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400 shrink-0" />
            <h3 className="text-xs font-bold tracking-wider text-gray-300 uppercase">
              {t.bubble_size_title}
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 leading-normal">{t.bubble_size_desc}</p>
          <div className="flex items-center gap-4 py-1">
            <input
              id="bubble-size-slider"
              type="range"
              min={30}
              max={80}
              value={bubbleSize}
              onChange={(e) => setBubbleSize(parseInt(e.target.value, 10))}
              className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              style={{ accentColor }}
            />
            <span className="font-mono text-xs text-gray-300 font-bold shrink-0">{bubbleSize}px</span>
          </div>
        </div>

        {/* 4. Permissions Simulation Checklist */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-yellow-400 shrink-0" />
              <h3 className="text-xs font-bold tracking-wider text-gray-300 uppercase">
                {t.settings_permissions}
              </h3>
            </div>
            {areRequiredPermissionsGranted() && (
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5 font-bold">
                <ShieldCheck className="h-3 w-3" /> SECURE_OK
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Display Over Apps Check */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-200">{t.display_over_apps}</p>
                <p className="text-[9px] text-gray-400 leading-normal">{t.display_over_apps_desc}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {permissions.displayOverApps === true ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                    {t.granted}
                  </span>
                ) : permissions.displayOverApps === "skipped" ? (
                  <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                    {t.permission_skipped}
                  </span>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPermissions((p) => ({ ...p, displayOverApps: true }))}
                      style={{ backgroundColor: accentColor }}
                      className="px-2.5 py-1 text-[9px] text-black font-extrabold rounded-lg hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
                    >
                      {t.enable}
                    </button>
                    <button
                      onClick={() => setPermissions((p) => ({ ...p, displayOverApps: "skipped" }))}
                      className="px-2 py-1 text-[9px] text-gray-400 bg-white/5 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {t.permission_skip}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* System Usage Stats Check */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-200">{t.usage_stats}</p>
                <p className="text-[9px] text-gray-400 leading-normal">{t.usage_stats_desc}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {permissions.usageStats === true ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                    {t.granted}
                  </span>
                ) : permissions.usageStats === "skipped" ? (
                  <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                    {t.permission_skipped}
                  </span>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPermissions((p) => ({ ...p, usageStats: true }))}
                      style={{ backgroundColor: accentColor }}
                      className="px-2.5 py-1 text-[9px] text-black font-extrabold rounded-lg hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
                    >
                      {t.enable}
                    </button>
                    <button
                      onClick={() => setPermissions((p) => ({ ...p, usageStats: "skipped" }))}
                      className="px-2 py-1 text-[9px] text-gray-400 bg-white/5 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {t.permission_skip}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Foreground Service check */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-200">{t.foreground_notifications}</p>
                <p className="text-[9px] text-gray-400 leading-normal">{t.foreground_notifications_desc}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {permissions.foregroundNotifications === true ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                    {t.granted}
                  </span>
                ) : permissions.foregroundNotifications === "skipped" ? (
                  <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                    {t.permission_skipped}
                  </span>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPermissions((p) => ({ ...p, foregroundNotifications: true }))}
                      style={{ backgroundColor: accentColor }}
                      className="px-2.5 py-1 text-[9px] text-black font-extrabold rounded-lg hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
                    >
                      {t.enable}
                    </button>
                    <button
                      onClick={() => setPermissions((p) => ({ ...p, foregroundNotifications: "skipped" }))}
                      className="px-2 py-1 text-[9px] text-gray-400 bg-white/5 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {t.permission_skip}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Missing permissions warning banner */}
          {!areRequiredPermissionsGranted() && (
            <div className="flex gap-2 p-2.5 bg-red-950/40 border border-red-500/15 rounded-xl">
              <ShieldAlert className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-[9px] text-red-200 leading-relaxed">
                {t.activate_permissions_warning}
              </p>
            </div>
          )}
        </div>

        {/* 5. Start/Stop Floating Service button */}
        <div className="pt-2">
          {serviceStarted ? (
            <button
              id="service-trigger-btn"
              onClick={handleStopService}
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer hover:shadow-lg hover:shadow-red-500/10 active:scale-98 transition-transform"
            >
              <Square className="h-4 w-4 fill-white shrink-0" />
              {t.stop_service}
            </button>
          ) : (
            <button
              id="service-trigger-btn"
              onClick={handleStartService}
              style={{ backgroundColor: accentColor }}
              className="w-full h-12 text-black rounded-xl flex items-center justify-center gap-2 font-extrabold cursor-pointer hover:opacity-90 hover:shadow-lg active:scale-98 transition-transform shadow-md"
            >
              <Play className="h-4 w-4 fill-black shrink-0" />
              {t.start_service}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT SIDE PANEL: Phone Simulator and Interactive Demo */}
      <div
        id="device-panel"
        className={`flex-1 bg-[#05070a] p-4 flex flex-col items-center justify-center relative md:h-screen overflow-hidden ${
          isRtlLayout ? "md:order-1" : "md:order-2"
        }`}
      >
        {/* Helper visual background dashboard grids */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="z-10 w-full max-w-sm flex flex-col space-y-4">
          <PhoneSimulator
            accentColor={accentColor}
            bubbleSize={bubbleSize}
            lang={lang}
            serviceStarted={serviceStarted}
            onServiceStartedChange={setServiceStarted}
            apps={apps}
            onToggleFavorite={handleToggleFavoriteApp}
            speedDialEntries={speedDialEntries}
            onSaveSpeedDial={handleSaveSpeedDial}
            onDeleteSpeedDial={handleDeleteSpeedDial}
            vaultFolders={vaultFolders}
            vaultEntries={vaultEntries}
            onAddVaultFolder={handleAddVaultFolder}
            onAddVaultEntry={handleAddVaultEntry}
            onDeleteVaultFolder={handleDeleteVaultFolder}
            onDeleteVaultEntry={handleDeleteVaultEntry}
          />
        </div>
      </div>
    </div>
  );
}
