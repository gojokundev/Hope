import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { LanguageCode, SimulatedApp, SpeedDialEntry, VaultFolder, VaultEntry } from "../types";
import { LauncherOverlay } from "./LauncherOverlay";
import { AppSimulator } from "./AppSimulator";
import { Smartphone, Battery, Wifi, Signal, Trash2, Camera as CamIcon, Sparkles, Loader2, Info } from "lucide-react";

interface PhoneSimulatorProps {
  accentColor: string;
  bubbleSize: number;
  lang: LanguageCode;
  serviceStarted: boolean;
  onServiceStartedChange: (started: boolean) => void;
  apps: SimulatedApp[];
  onToggleFavorite: (id: string) => void;
  speedDialEntries: SpeedDialEntry[];
  onSaveSpeedDial: (label: string, url: string) => void;
  onDeleteSpeedDial: (id: string) => void;
  vaultFolders: VaultFolder[];
  vaultEntries: VaultEntry[];
  onAddVaultFolder: (name: string) => void;
  onAddVaultEntry: (folderId: string, title: string, content: string, type: "note" | "ocr") => void;
  onDeleteVaultFolder: (id: string) => void;
  onDeleteVaultEntry: (id: string) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  accentColor,
  bubbleSize,
  lang,
  serviceStarted,
  onServiceStartedChange,
  apps,
  onToggleFavorite,
  speedDialEntries,
  onSaveSpeedDial,
  onDeleteSpeedDial,
  vaultFolders,
  vaultEntries,
  onAddVaultFolder,
  onAddVaultEntry,
  onDeleteVaultFolder,
  onDeleteVaultEntry,
}) => {
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [phoneTime, setPhoneTime] = useState("");
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Dragging bubble states
  const [isDragging, setIsDragging] = useState(false);
  const [isOverDismiss, setIsOverDismiss] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // OCR Screen Scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [scanStart, setScanStart] = useState<{ x: number; y: number } | null>(null);
  const [scanCurrent, setScanCurrent] = useState<{ x: number; y: number } | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const isRtl = lang === "ar" || lang === "fa";

  // Tick simulated smartphone clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setPhoneTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Launch a notification helper
  const handleTriggerNotification = (text: string) => {
    setActiveNotification(text);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
  };

  // Launch App
  const handleLaunchApp = (appId: string) => {
    const app = apps.find((a) => a.id === appId);
    if (app) {
      app.launchCount++;
      setActiveAppId(appId);
    }
  };

  // Start crop scanner overlay
  const handleStartScan = (folderId: string) => {
    setTargetFolderId(folderId);
    setIsScanning(true);
    setScanStart(null);
    setScanCurrent(null);
    setOcrError(null);
  };

  // Click & Drag scan box handlers
  const handleScanMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScanning || ocrLoading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setScanStart({ x, y });
    setScanCurrent({ x, y });
  };

  const handleScanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScanning || !scanStart || ocrLoading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setScanCurrent({ x, y });
  };

  const handleScanMouseUp = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScanning || !scanStart || !scanCurrent || ocrLoading) return;

    // Minimum crop size requirement
    const dx = Math.abs(scanCurrent.x - scanStart.x);
    const dy = Math.abs(scanCurrent.y - scanStart.y);
    if (dx < 10 || dy < 10) {
      setScanStart(null);
      setScanCurrent(null);
      return;
    }

    setOcrLoading(true);

    try {
      // 1. Capture HTML contents within cropped box as offline OCR fallback
      let extractedTextFallback = "";
      const textElements = document.querySelectorAll("#phone-content-view p, #phone-content-view span, #phone-content-view h4, #phone-content-view h5");
      textElements.forEach((el) => {
        const bbox = el.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const relativeLeft = bbox.left - containerRect.left;
          const relativeTop = bbox.top - containerRect.top;

          const boxX1 = Math.min(scanStart.x, scanCurrent.x);
          const boxX2 = Math.max(scanStart.x, scanCurrent.x);
          const boxY1 = Math.min(scanStart.y, scanCurrent.y);
          const boxY2 = Math.max(scanStart.y, scanCurrent.y);

          // If text element intersects with Drawn Crop box
          if (
            relativeLeft >= boxX1 - 30 &&
            relativeLeft <= boxX2 + 30 &&
            relativeTop >= boxY1 - 30 &&
            relativeTop <= boxY2 + 30
          ) {
            extractedTextFallback += (el.textContent || "") + "\n";
          }
        }
      });

      // 2. Try real premium visual OCR on the cropped bounding area
      // Create a visual canvas crop snapshot from the phone area
      const canvas = document.createElement("canvas");
      canvas.width = dx;
      canvas.height = dy;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw a neat mockup styled visual representation on canvas for the backend
        ctx.fillStyle = "#121824";
        ctx.fillRect(0, 0, dx, dy);
        ctx.fillStyle = accentColor;
        ctx.font = "bold 14px 'Space Grotesk', sans-serif";
        ctx.fillText("OCR EXTRACTION", 10, 25);
        ctx.fillStyle = "#ffffff";
        ctx.font = "11px 'Inter', sans-serif";
        const lines = extractedTextFallback.trim().split("\n").slice(0, 6);
        lines.forEach((line, index) => {
          ctx.fillText(line, 10, 45 + index * 18);
        });

        const base64Img = canvas.toDataURL("image/png");

        // Request real server-side Gemini 3.5 Flash OCR
        const ocrRes = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Img }),
        });

        const ocrData = await ocrRes.json();
        if (ocrRes.ok && ocrData.success && ocrData.text) {
          // Real OCR success!
          onAddVaultEntry(
            targetFolderId!,
            `OCR Scan ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            ocrData.text,
            "ocr"
          );
          handleTriggerNotification("Vault: OCR Screen capture completed!");
        } else {
          // Offline fallback
          if (extractedTextFallback.trim()) {
            onAddVaultEntry(
              targetFolderId!,
              `Scan Crop ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              extractedTextFallback.trim(),
              "ocr"
            );
            handleTriggerNotification("Vault: Screen capture saved (Offline fallback)!");
          } else {
            throw new Error(ocrData.message || "No text detected in selected area");
          }
        }
      }
      setIsScanning(false);
    } catch (err: any) {
      console.error("OCR crop processing failed:", err);
      setOcrError(err.message || "OCR connection timeout. Please check your environment keys.");
    } finally {
      setOcrLoading(false);
    }
  };

  //Snapping drag bubble release
  const handleBubbleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    // Dismiss detection: if the bubble is close to the bottom dismissal area, stop the background service!
    if (info.point.y > window.innerHeight - 130) {
      onServiceStartedChange(false);
      handleTriggerNotification("Orbit: Background Floating Service Stopped");
    }
    setIsOverDismiss(false);
  };

  // Render crop box
  const getCropStyle = () => {
    if (!scanStart || !scanCurrent) return { display: "none" };
    const left = Math.min(scanStart.x, scanCurrent.x);
    const top = Math.min(scanStart.y, scanCurrent.y);
    const width = Math.abs(scanCurrent.x - scanStart.x);
    const height = Math.abs(scanCurrent.y - scanStart.y);
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 relative select-none">
      {/* Visual Bezels Smartphone */}
      <div
        id="phone-frame"
        className="relative mx-auto h-[580px] w-[310px] rounded-[44px] border-[12px] border-slate-900 bg-[#0d121f] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
      >
        {/* Dynamic Wallpaper selection */}
        <div className="absolute inset-0 z-0 bg-[#080b13]">
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#080b13] to-[#080b13] opacity-80" />
          <div className="absolute top-1/4 left-1/4 h-48 w-48 rounded-full blur-[80px]" style={{ backgroundColor: `${accentColor}15` }} />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full blur-[80px] bg-pink-500/10" />
        </div>

        {/* Top Camera Notch cutout */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-slate-900 rounded-b-2xl z-40 flex items-center justify-center gap-1.5 px-3">
          <div className="h-2 w-2 rounded-full bg-slate-950 flex shrink-0" />
          <div className="h-1 w-8 rounded bg-slate-950 shrink-0" />
        </div>

        {/* Operating System Status Bar */}
        <div className="h-6 px-5 pt-0.5 z-30 flex items-center justify-between text-[10px] font-medium text-white/70 select-none shrink-0 font-sans">
          <span>{phoneTime || "12:00 PM"}</span>
          <div className="flex items-center gap-1">
            <Signal className="h-3 w-3 shrink-0" />
            <Wifi className="h-3 w-3 shrink-0" />
            <Battery className="h-3.5 w-3.5 shrink-0" />
          </div>
        </div>

        {/* Real-time Dynamic App Notification Banner */}
        {activeNotification && (
          <motion.div
            id="notification-banner"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-8 inset-x-3 z-40 bg-slate-900/90 backdrop-blur-md border border-white/5 rounded-2xl p-2.5 flex items-center gap-2 shadow-lg"
          >
            <div className="h-7 w-7 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 font-bold shrink-0" style={{ color: accentColor }}>
              O
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-bold text-gray-400">System Notification</p>
              <p className="text-[11px] text-gray-200 truncate leading-snug">{activeNotification}</p>
            </div>
          </motion.div>
        )}

        {/* Inner Phone Content Viewport */}
        <div id="phone-content-view" ref={containerRef} className="flex-1 overflow-hidden relative z-10 flex flex-col">
          {activeAppId ? (
            // App Simulator Running
            <AppSimulator
              appId={activeAppId}
              appName={apps.find((a) => a.id === activeAppId)?.name || "App"}
              accentColor={accentColor}
              onBack={() => setActiveAppId(null)}
              onNewNotification={handleTriggerNotification}
            />
          ) : (
            // Home Screen View
            <div className="flex-1 flex flex-col justify-between p-4 relative">
              {/* Dynamic OS Clock widgets */}
              <div className="text-center mt-6 space-y-0.5 select-none">
                <h1 className="font-display text-4xl font-light tracking-wide text-white/95">
                  {phoneTime.split(" ")[0] || "12:00"}
                </h1>
                <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                  UTC ACTIVE SERVER PORT
                </p>
              </div>

              {/* Grid of Main Installed Simulated Apps */}
              <div className="grid grid-cols-4 gap-3 py-4 select-none flex-grow items-center">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleLaunchApp(app.id)}
                    className="flex flex-col items-center text-center cursor-pointer group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center p-1 shadow-md">
                      <span className="text-xl">{app.icon}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 truncate max-w-[50px] font-medium group-hover:text-white transition-colors">
                      {app.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Quick Apps Dock */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-2.5 grid grid-cols-4 gap-2 select-none shrink-0 mb-2">
                {apps.slice(0, 4).map((app) => (
                  <div
                    key={`dock-${app.id}`}
                    onClick={() => handleLaunchApp(app.id)}
                    className="flex justify-center items-center cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center p-1 hover:scale-105 active:scale-95 transition-transform">
                      <span className="text-lg">{app.icon}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Launcher Dashboard Overlay */}
          <LauncherOverlay
            isOpen={isOverlayOpen}
            onClose={() => setIsOverlayOpen(false)}
            accentColor={accentColor}
            lang={lang}
            apps={apps}
            onToggleFavorite={onToggleFavorite}
            onLaunchApp={handleLaunchApp}
            onStartScan={handleStartScan}
            speedDialEntries={speedDialEntries}
            onSaveSpeedDial={onSaveSpeedDial}
            onDeleteSpeedDial={onDeleteSpeedDial}
            vaultFolders={vaultFolders}
            vaultEntries={vaultEntries}
            onAddVaultFolder={onAddVaultFolder}
            onAddVaultEntry={onAddVaultEntry}
            onDeleteVaultFolder={onDeleteVaultFolder}
            onDeleteVaultEntry={onDeleteVaultEntry}
          />

          {/* Crop OCR Scanner Selection Overlay */}
          {isScanning && (
            <div
              id="ocr-scan-overlay"
              onMouseDown={handleScanMouseDown}
              onMouseMove={handleScanMouseMove}
              onMouseUp={handleScanMouseUp}
              className="absolute inset-0 z-40 bg-black/40 cursor-crosshair select-none flex flex-col justify-between"
            >
              {/* Dynamic drag crop bounding rectangle box outline */}
              <div
                style={getCropStyle()}
                className="absolute border-2 border-dashed border-cyan-400 bg-cyan-400/5 shadow-[0_0_8px_rgba(0,229,255,0.4)] pointer-events-none"
              >
                {/* Visual crop scanner indicators */}
                <div className="absolute top-1 left-2 bg-black/80 rounded px-1 text-[8px] font-mono text-cyan-400 font-bold tracking-widest flex items-center gap-0.5">
                  <Sparkles className="h-2 w-2 text-cyan-400" /> SELECT OCR AREA
                </div>
              </div>

              {/* Scanning status/holographic loading states */}
              {ocrLoading ? (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 p-4 text-center space-y-3">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    <Sparkles className="absolute top-0 right-0 h-4 w-4 text-cyan-400 animate-ping" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display font-bold text-xs text-white uppercase tracking-widest">
                      Gemini OCR Digesting
                    </p>
                    <p className="text-[9px] text-gray-500 leading-normal max-w-[200px]">
                      Proxied securely to Gemini 3.5 Flash server-side. Digitizing visual texts...
                    </p>
                  </div>
                </div>
              ) : ocrError ? (
                <div className="absolute bottom-4 inset-x-3 z-50 bg-red-950/90 border border-red-500/20 rounded-xl p-3 text-center space-y-2">
                  <div className="flex items-start gap-1 text-left text-red-200">
                    <Info className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <p className="text-[10px] leading-relaxed font-mono">
                      {ocrError}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsScanning(false)}
                    className="w-full py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-[10px]"
                  >
                    Close Scanner
                  </button>
                </div>
              ) : (
                <div className="w-full bg-black/80 backdrop-blur border-b border-white/5 py-1.5 px-3 flex justify-between items-center text-[10px] shrink-0">
                  <span className="text-gray-400 font-medium">Click & Drag to capture text</span>
                  <button
                    onClick={() => setIsScanning(false)}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded font-bold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Operating System Navigation Gestures bar */}
        <div className="h-5 shrink-0 flex justify-center items-center z-30 bg-black/40">
          <div className="h-1 w-24 rounded-full bg-white/20" />
        </div>
      </div>

      {/* DRAGGABLE BACKGROUND FLOATING SERVICE BUBBLE OVERLAY */}
      {/* Draggable Launcher circular button snapped to phone edges */}
      {serviceStarted && (
        <motion.div
          id="floating-bubble"
          drag
          dragMomentum={false}
          dragConstraints={containerRef}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleBubbleDragEnd}
          onClick={() => {
            if (!isDragging) {
              setIsOverlayOpen(!isOverlayOpen);
            }
          }}
          style={{
            height: `${bubbleSize}px`,
            width: `${bubbleSize}px`,
            borderColor: accentColor,
            boxShadow: `0 0 12px ${accentColor}30`,
          }}
          className="absolute z-50 rounded-full border-2 bg-[#090e1a]/95 cursor-grab active:cursor-grabbing flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          {/* Neon inner icon representing Orbit bubble */}
          <div className="h-2/3 w-2/3 rounded-full bg-black/40 flex items-center justify-center relative border border-white/5">
            <div
              style={{ backgroundColor: accentColor }}
              className="h-1/3 w-1/3 rounded-full animate-ping absolute"
            />
            <div
              style={{ backgroundColor: accentColor }}
              className="h-1/3 w-1/3 rounded-full relative"
            />
          </div>
        </motion.div>
      )}

      {/* Bubble Dismiss Dismiss Zone overlay */}
      {serviceStarted && isDragging && (
        <div
          id="dismiss-zone"
          className="absolute bottom-1 right-1/2 translate-x-1/2 z-40 bg-red-950/80 border border-red-500/20 backdrop-blur rounded-2xl py-2 px-6 flex items-center gap-2 text-white shadow-xl pointer-events-none"
        >
          <Trash2 className="h-4 w-4 text-red-400 animate-bounce" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-red-200">
            DRAG HERE TO DISMISS
          </span>
        </div>
      )}
    </div>
  );
};
