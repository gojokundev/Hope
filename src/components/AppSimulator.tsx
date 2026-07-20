import React, { useState, useEffect, useRef } from "react";
import { Search, Camera, MapPin, Play, Pause, Send, Sliders, ArrowLeft, Heart, RefreshCw } from "lucide-react";

interface AppSimulatorProps {
  appId: string;
  appName: string;
  accentColor: string;
  onBack: () => void;
  onNewNotification: (text: string) => void;
}

export const AppSimulator: React.FC<AppSimulatorProps> = ({
  appId,
  appName,
  accentColor,
  onBack,
  onNewNotification,
}) => {
  // Browser state
  const [url, setUrl] = useState("google.com");
  const [searchQuery, setSearchQuery] = useState("");
  const [browserHistory, setBrowserHistory] = useState<string[]>([]);

  // Camera state
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Maps state
  const [destination, setDestination] = useState("");
  const [routing, setRouting] = useState(false);

  // Music state
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(35);
  const [vibeBars, setVibeBars] = useState<number[]>(Array(15).fill(20));

  // Chat state
  const [chats, setChats] = useState<{ sender: "user" | "bot"; text: string; time: string }[]>([
    { sender: "bot", text: "Hey! Welcome to Orbit Messenger. How is your day going?", time: "10:32 AM" },
    { sender: "user", text: "I'm testing out the Orbit Launcher, it's super cool!", time: "10:33 AM" },
    { sender: "bot", text: "That is amazing! Try using the Vault Scan tool to copy our chat texts.", time: "10:33 AM" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Music progress interval
  useEffect(() => {
    let timer: any;
    if (isPlaying && appId === "music") {
      timer = setInterval(() => {
        setTrackProgress((p) => (p >= 100 ? 0 : p + 1));
        // Randomize audio visualizer bars
        setVibeBars(Array(15).fill(0).map(() => Math.floor(Math.random() * 55) + 10));
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, appId]);

  // Handle Send Chat
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = chatInput;
    setChats((prev) => [...prev, { sender: "user", text: userMsg, time: nowStr }]);
    setChatInput("");

    // Simulate bot reply
    setTimeout(() => {
      const botReplies = [
        "That's super cool! I love chatting with lazy people.",
        "Yes! Did you know Orbit runs 100% offline inside this phone simulator?",
        "Interesting thoughts. What mathematical calculations are you evaluating today?",
        "I'm a simulated robot, but my text is 100% extractable by our Gemini OCR!",
        "Try launching our Speed Dial bookmarks to navigate around!"
      ];
      const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
      setChats((prev) => [...prev, { sender: "bot", text: reply, time: nowStr }]);
      onNewNotification(`Messenger: New reply received!`);
    }, 1500);
  };

  // Render browser
  const renderBrowser = () => (
    <div id="sim-browser" className="flex flex-col h-full bg-white text-black font-sans">
      {/* Search Bar */}
      <div className="bg-gray-100 p-2 flex items-center border-b border-gray-200 gap-1">
        <div className="flex-1 bg-white border border-gray-300 rounded-lg px-2 py-1 flex items-center gap-1.5 text-xs">
          <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <input
            id="browser-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-gray-800"
          />
        </div>
        <button
          onClick={() => {
            setBrowserHistory((h) => [url, ...h]);
            onNewNotification(`Browser: Loaded ${url}`);
          }}
          style={{ backgroundColor: accentColor }}
          className="text-xs font-bold text-black px-2.5 py-1 rounded-md"
        >
          Go
        </button>
      </div>

      {/* Webpage viewport */}
      <div className="flex-1 p-4 bg-gray-50 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="border border-cyan-500/20 bg-cyan-500/5 rounded-xl p-3 text-center space-y-1">
            <h4 className="font-bold text-sm text-cyan-800">ORBIT DIRECTORY</h4>
            <p className="text-[10px] text-cyan-600">Browse the decentralized portal</p>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Recommended Sites</h5>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUrl("google.com")}
                className="p-2 bg-white rounded-lg border border-gray-200 text-left hover:bg-gray-100 transition-colors"
              >
                <p className="font-bold text-[11px] text-blue-600">Google Search</p>
                <p className="text-[9px] text-gray-400">Search the world</p>
              </button>
              <button
                onClick={() => setUrl("github.com/gojokundev")}
                className="p-2 bg-white rounded-lg border border-gray-200 text-left hover:bg-gray-100 transition-colors"
              >
                <p className="font-bold text-[11px] text-gray-800">Gojokun Dev</p>
                <p className="text-[9px] text-gray-400">Project developer</p>
              </button>
              <button
                onClick={() => setUrl("orbit-vault.local")}
                className="p-2 bg-white rounded-lg border border-gray-200 text-left hover:bg-gray-100 transition-colors"
              >
                <p className="font-bold text-[11px] text-cyan-600">Local Orbit</p>
                <p className="text-[9px] text-gray-400">Self-hosted notes portal</p>
              </button>
              <button
                onClick={() => setUrl("wikipedia.org")}
                className="p-2 bg-white rounded-lg border border-gray-200 text-left hover:bg-gray-100 transition-colors"
              >
                <p className="font-bold text-[11px] text-red-500">Wikipedia</p>
                <p className="text-[9px] text-gray-400">Online Encyclopedia</p>
              </button>
            </div>
          </div>

          <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-1">
            <p className="text-xs font-bold text-gray-700">Decentralized Web Index</p>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              This browser simulates a localized Web3 crawler. Type any address in the bar or tap a quick bookmark to experience instant client-side sandboxed browsing.
            </p>
          </div>
        </div>

        {/* Footer info for OCR */}
        <div className="text-[9px] text-center text-gray-400 border-t border-gray-200 pt-2">
          URL LOADED: <span className="font-mono text-cyan-600 font-semibold">{url}</span>
        </div>
      </div>
    </div>
  );

  // Render camera
  const handleCapturePhoto = () => {
    const canvas = cameraCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw random cyberpunk abstract scene on the canvas
    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = "#0d111a";
    ctx.fillRect(0, 0, width, height);

    // Some grid lines
    ctx.strokeStyle = "rgba(255, 42, 133, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Glowing circles
    const colors = [accentColor, "#FF2A85", "#D500F9"];
    for (let i = 0; i < 5; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = Math.random() * 40 + 10;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + "22";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw some stylized text to allow OCR of taken photos!
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px 'Space Grotesk', sans-serif";
    ctx.fillText("CAPTURED SCAN TARGET:", 15, 40);

    ctx.fillStyle = accentColor;
    ctx.font = "bold 18px 'JetBrains Mono', monospace";
    ctx.fillText("ORBIT_COSMIC_2026", 15, 70);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillText("SUCCESS: SYSTEM STABLE", 15, 100);
    ctx.fillText("PORT 3000 INGRESS STACK", 15, 120);

    const dataUrl = canvas.toDataURL("image/png");
    setPhotoTaken(dataUrl);
    onNewNotification("Camera: Photo captured!");
  };

  const renderCamera = () => (
    <div id="sim-camera" className="flex flex-col h-full bg-black text-white p-3 relative select-none">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" /> REC 1080P
        </span>
        <button
          onClick={() => setPhotoTaken(null)}
          className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded"
        >
          Reset
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden relative flex items-center justify-center">
        {photoTaken ? (
          <img src={photoTaken} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center space-y-2 p-4">
            <Camera className="h-8 w-8 mx-auto text-neutral-600 animate-pulse" />
            <p className="text-xs text-neutral-500">Viewfinder ready. Tap Capture below.</p>
          </div>
        )}
        {/* Helper Canvas */}
        <canvas ref={cameraCanvasRef} width={280} height={320} className="hidden" />
      </div>

      {/* Shutter panel */}
      <div className="h-16 flex items-center justify-center pt-2">
        <button
          id="shutter-btn"
          onClick={handleCapturePhoto}
          style={{ borderColor: accentColor }}
          className="h-12 w-12 rounded-full border-4 bg-white hover:bg-gray-200 transition-transform active:scale-90 flex items-center justify-center"
        >
          <div className="h-8 w-8 rounded-full bg-black/10" />
        </button>
      </div>
    </div>
  );

  // Render maps
  const renderMaps = () => (
    <div id="sim-maps" className="flex flex-col h-full bg-slate-900 text-white font-sans p-3">
      {/* Route input */}
      <div className="space-y-1 mb-2">
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 flex items-center text-xs gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-red-400" />
          <input
            id="maps-input"
            type="text"
            placeholder="Search destination (e.g. San Francisco)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-white"
          />
        </div>
        <button
          onClick={() => {
            if (destination.trim()) {
              setRouting(true);
              onNewNotification(`Maps: Routing to ${destination}`);
              setTimeout(() => {
                onNewNotification("Maps: GPS Navigation active");
              }, 1200);
            }
          }}
          style={{ backgroundColor: accentColor }}
          className="w-full py-1 rounded text-xs text-black font-bold flex items-center justify-center gap-1.5"
        >
          <MapPin className="h-3 w-3" /> Get Directions
        </button>
      </div>

      {/* Neon Map visualizer */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative flex flex-col justify-between p-3 select-none">
        {routing ? (
          <div className="h-full flex flex-col justify-between">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-center text-[10px] text-emerald-400">
              ROUTE LOCKED: <span className="font-bold">{destination.toUpperCase()}</span>
            </div>

            {/* Simulated Neon path */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="absolute inset-x-8 h-1 bg-white/5 rounded">
                <div
                  style={{ backgroundColor: accentColor }}
                  className="h-full w-2/3 animate-pulse rounded shadow-[0_0_8px_rgba(0,229,255,1)]"
                />
              </div>
              <div className="absolute h-8 w-8 bg-black border border-white/20 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                🚀
              </div>
            </div>

            <div className="text-center font-mono text-[9px] text-slate-500">
              ETA: 12 MINS | DIST: 4.8 MILES
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-1">
            <MapPin className="h-6 w-6 text-slate-500 animate-pulse" />
            <p className="text-[11px] text-slate-400">Enter a destination to view cyberpunk paths</p>
            <p className="text-[9px] text-slate-600">e.g. Neo-Tokyo Central Terminal</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Music
  const renderMusic = () => (
    <div id="sim-music" className="flex flex-col h-full bg-zinc-950 text-white p-3 font-sans justify-between select-none">
      <div className="text-center">
        <p className="text-[9px] font-mono text-zinc-500 tracking-wider">CYBER CONSOLE PLAYER</p>
      </div>

      {/* Album design */}
      <div className="flex flex-col items-center justify-center my-2 space-y-2">
        <div
          style={{ borderColor: accentColor }}
          className="h-28 w-28 rounded-2xl border bg-gradient-to-tr from-black via-zinc-900 to-black flex items-center justify-center shadow-lg shadow-black"
        >
          <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center border border-white/5 relative">
            <div className={`h-4 w-4 rounded-full bg-cyan-400 ${isPlaying ? "animate-ping" : ""}`} />
          </div>
        </div>

        <div className="text-center space-y-0.5">
          <h4 className="font-bold text-xs">Orbiting The Stars</h4>
          <p className="text-[10px] text-zinc-400 font-mono">Gojokun Records LLC</p>
        </div>
      </div>

      {/* Animated sound equalizer bars */}
      <div className="flex justify-center items-end h-12 gap-1 px-4">
        {vibeBars.map((h, i) => (
          <div
            key={i}
            style={{
              height: `${isPlaying ? h : 15}%`,
              backgroundColor: isPlaying ? accentColor : "#52525b"
            }}
            className="flex-1 rounded-t transition-all duration-300 shadow-[0_0_4px_currentColor]"
          />
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500">
          <span>0:45</span>
          <div className="flex-1 h-1 bg-zinc-800 rounded overflow-hidden">
            <div style={{ width: `${trackProgress}%`, backgroundColor: accentColor }} className="h-full rounded" />
          </div>
          <span>3:12</span>
        </div>

        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              onNewNotification(isPlaying ? "Music: Paused" : "Music: Playing 'Orbiting The Stars'");
            }}
            style={{ backgroundColor: accentColor }}
            className="h-10 w-10 rounded-full flex items-center justify-center text-black font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );

  // Render chat
  const renderChat = () => (
    <div id="sim-chat" className="flex flex-col h-full bg-[#0d121f] text-white">
      {/* Messages */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto flex flex-col">
        {chats.map((c, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl p-2 text-xs flex flex-col ${
              c.sender === "user"
                ? "bg-cyan-500/25 border border-cyan-500/20 text-cyan-100 self-end"
                : "bg-white/5 border border-white/5 text-gray-200 self-start"
            }`}
          >
            <p className="leading-relaxed">{c.text}</p>
            <span className="text-[8px] text-gray-400 self-end mt-1">{c.time}</span>
          </div>
        ))}
      </div>

      {/* Input row */}
      <div className="p-1.5 border-t border-white/5 bg-black/40 flex items-center gap-1.5">
        <input
          id="chat-input"
          type="text"
          placeholder="Type message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none text-white focus:border-cyan-500/30"
        />
        <button
          onClick={handleSendChat}
          style={{ backgroundColor: accentColor }}
          className="p-1.5 rounded-lg text-black hover:opacity-90 active:scale-95 cursor-pointer shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  // Render Settings
  const renderSettings = () => (
    <div id="sim-settings" className="flex flex-col h-full bg-slate-950 text-white p-3 font-sans overflow-y-auto space-y-4 select-none">
      <div className="space-y-1">
        <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">SYSTEM PARAMETERS</h4>
        <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-medium">OS Version</span>
            <span className="font-mono text-[10px] text-cyan-400 font-semibold">OrbitOS v2.6-Beta</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-medium">Processor</span>
            <span className="font-mono text-[10px] text-cyan-400">Virtual Core 8x</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-medium">Internal Storage</span>
            <span className="font-mono text-[10px] text-cyan-400">128 GB (25% Used)</span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">MOCK TELEMETRY INFO</h4>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-xs leading-relaxed text-gray-400 space-y-2">
          <p>
            Orbit launches background tasks using fully sandboxed Node execution context on Port 3000.
          </p>
          <p className="font-mono text-[10px] text-gray-500 border-t border-white/5 pt-1">
            Status: ACTIVE_STABLE
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div id="app-simulator-window" className="flex flex-col h-full bg-[#0a0f1d] overflow-hidden">
      {/* Title Bar */}
      <div className="h-10 bg-black/80 flex items-center justify-between px-3 shrink-0 border-b border-white/5 gap-2">
        <button
          onClick={onBack}
          className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <span className="font-display text-xs font-bold text-white max-w-[120px] truncate">
          {appName}
        </span>
        {/* Heart Favorite Trigger */}
        <Heart className="h-3.5 w-3.5 text-red-500 animate-pulse shrink-0" />
      </div>

      {/* App Client Viewport */}
      <div className="flex-1 overflow-hidden">
        {appId === "browser" && renderBrowser()}
        {appId === "camera" && renderCamera()}
        {appId === "maps" && renderMaps()}
        {appId === "music" && renderMusic()}
        {appId === "chat" && renderChat()}
        {appId === "settings" && renderSettings()}
      </div>
    </div>
  );
};
