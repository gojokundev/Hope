import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LanguageCode, SimulatedApp, SpeedDialEntry, VaultFolder, VaultEntry } from "../types";
import { TRANSLATIONS } from "../translations";
import { evaluateExpression } from "../utils/evaluator";
import {
  Smartphone,
  FolderLock,
  Calculator as CalcIcon,
  Link,
  Search,
  Star,
  Plus,
  Trash2,
  Copy,
  ScanLine,
  X,
  CornerDownRight,
  Folder,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface LauncherOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  lang: LanguageCode;
  apps: SimulatedApp[];
  onToggleFavorite: (id: string) => void;
  onLaunchApp: (id: string) => void;
  onStartScan: (folderId: string) => void;
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

type TabId = "launcher" | "vault" | "calculator" | "speeddial";

export const LauncherOverlay: React.FC<LauncherOverlayProps> = ({
  isOpen,
  onClose,
  accentColor,
  lang,
  apps,
  onToggleFavorite,
  onLaunchApp,
  onStartScan,
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
  const [activeTab, setActiveTab] = useState<TabId>("launcher");
  const t = TRANSLATIONS[lang];
  const isRtl = lang === "ar" || lang === "fa";

  // Launcher state
  const [search, setSearch] = useState("");

  // Speed Dial states
  const [sdLabel, setSdLabel] = useState("");
  const [sdUrl, setSdUrl] = useState("");

  // Calculator states
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [calcError, setCalcError] = useState("");

  // Vault states
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);

  if (!isOpen) return null;

  // Search filtered apps
  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  const favoriteApps = apps.filter((app) => app.isFavorite);

  // Handle calculator key press
  const handleCalcKey = (key: string) => {
    setCalcError("");
    if (key === "C") {
      setCalcInput("");
      setCalcResult("");
    } else if (key === "=") {
      if (!calcInput.trim()) return;
      try {
        const val = evaluateExpression(calcInput);
        setCalcResult(String(val));
      } catch (e: any) {
        setCalcError(e.message || "Invalid expression");
      }
    } else {
      setCalcInput((prev) => prev + key);
    }
  };

  // Add speed dial
  const handleAddSpeedDial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdLabel.trim() || !sdUrl.trim()) return;
    onSaveSpeedDial(sdLabel.trim(), sdUrl.trim());
    setSdLabel("");
    setSdUrl("");
  };

  // Add folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onAddVaultFolder(newFolderName.trim());
    setNewFolderName("");
  };

  // Add Note manually
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFolderId || !newNoteTitle.trim() || !newNoteContent.trim()) return;
    onAddVaultEntry(activeFolderId, newNoteTitle.trim(), newNoteContent.trim(), "note");
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowNoteForm(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const activeFolder = vaultFolders.find((f) => f.id === activeFolderId);
  const currentFolderEntries = vaultEntries.filter((e) => e.folderId === activeFolderId);

  return (
    <div
      id="launcher-overlay"
      className="absolute inset-0 z-30 flex flex-col bg-slate-950/95 backdrop-blur-md text-white select-none overflow-hidden"
    >
      {/* Top Banner Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <h3 className="font-display font-bold text-sm tracking-wide text-gray-300">
          {t.overlay_launchpad}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Dynamic Main Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* LAUNCHER TAB */}
        {activeTab === "launcher" && (
          <div className="flex-grow flex flex-col space-y-4">
            {/* Search Input */}
            <div className="bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                id="app-search"
                type="text"
                placeholder={t.overlay_search_placeholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-white"
              />
            </div>

            {/* Favorite Apps section if search is empty */}
            {!search && favoriteApps.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                  {t.overlay_favorites}
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {favoriteApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col items-center text-center relative group cursor-pointer"
                    >
                      <div
                        onClick={() => {
                          onLaunchApp(app.id);
                          onClose();
                        }}
                        style={{ borderColor: accentColor }}
                        className="h-11 w-11 rounded-xl bg-black/40 border border-dashed flex items-center justify-center p-1 hover:scale-105 transition-transform"
                      >
                        <span className="text-xl">{app.icon}</span>
                      </div>
                      <p className="text-[9px] text-gray-300 mt-1 max-w-[50px] truncate">{app.name}</p>
                      <button
                        onClick={() => onToggleFavorite(app.id)}
                        className="absolute top-0 right-0 h-4 w-4 bg-slate-900 rounded-full border border-white/10 flex items-center justify-center"
                      >
                        <Star className="h-2 w-2 text-yellow-400 fill-yellow-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Apps Grid */}
            <div className="flex-grow space-y-1.5">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                {search ? t.overlay_search_results : t.overlay_all_apps}
              </h4>

              {filteredApps.length === 0 ? (
                <div className="text-center text-xs text-gray-500 py-8">{t.overlay_no_matching}</div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col items-center text-center relative group cursor-pointer"
                    >
                      <div
                        onClick={() => {
                          onLaunchApp(app.id);
                          onClose();
                        }}
                        className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1 hover:scale-105 transition-transform"
                      >
                        <span className="text-xl">{app.icon}</span>
                      </div>
                      <p className="text-[9px] text-gray-300 mt-1 max-w-[50px] truncate">{app.name}</p>
                      <button
                        onClick={() => onToggleFavorite(app.id)}
                        className="absolute top-0 right-0 h-4 w-4 bg-slate-900 rounded-full border border-white/10 flex items-center justify-center"
                      >
                        <Star
                          className={`h-2.5 w-2.5 ${
                            app.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VAULT TAB */}
        {activeTab === "vault" && (
          <div className="flex-grow flex flex-col space-y-4">
            {/* Folder selection screen */}
            {!activeFolderId ? (
              <div className="space-y-4">
                {/* Create Folder form */}
                <form onSubmit={handleCreateFolder} className="flex gap-2">
                  <input
                    id="new-folder-input"
                    type="text"
                    placeholder="New Folder Name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-cyan-500/30"
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: accentColor }}
                    className="p-2 rounded-xl text-black hover:opacity-95 active:scale-95 cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4 font-bold" />
                  </button>
                </form>

                {/* Directory List */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                    Secure Vault Directories
                  </h4>
                  {vaultFolders.length === 0 ? (
                    <div className="text-center text-xs text-gray-500 py-8">No vault folders. Create one above!</div>
                  ) : (
                    <div className="space-y-1.5">
                      {vaultFolders.map((folder) => {
                        const count = vaultEntries.filter((e) => e.folderId === folder.id).length;
                        return (
                          <div
                            key={folder.id}
                            className="flex items-center justify-between p-2.5 bg-white/3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <div
                              onClick={() => setActiveFolderId(folder.id)}
                              className="flex-1 flex items-center gap-2.5 cursor-pointer"
                            >
                              <Folder className="h-4 w-4" style={{ color: accentColor }} />
                              <span className="text-xs font-semibold text-gray-200">{folder.name}</span>
                              <span className="text-[9px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-gray-400">
                                {count} entries
                              </span>
                            </div>
                            <button
                              onClick={() => onDeleteVaultFolder(folder.id)}
                              className="text-gray-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Inside folder screen
              <div className="flex-grow flex flex-col space-y-3">
                {/* Back to folders list banner */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <button
                    onClick={() => setActiveFolderId(null)}
                    className="flex items-center text-xs text-gray-400 hover:text-white gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Folders
                  </button>
                  <span className="text-xs font-bold text-cyan-400">{activeFolder?.name}</span>
                  <button
                    onClick={() => {
                      onStartScan(activeFolderId);
                      onClose();
                    }}
                    style={{ backgroundColor: accentColor }}
                    className="flex items-center gap-1.5 text-black px-2.5 py-1 rounded-lg text-[10px] font-bold hover:scale-105 active:scale-95 cursor-pointer transition-transform shadow shadow-cyan-500/20 shrink-0"
                  >
                    <ScanLine className="h-3.5 w-3.5" /> {isRtl ? "مسح الشاشة" : "Scan Screen"}
                  </button>
                </div>

                {/* Create Note inline toggle */}
                {!showNoteForm ? (
                  <button
                    onClick={() => setShowNoteForm(true)}
                    className="w-full py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Write New Note
                  </button>
                ) : (
                  <form onSubmit={handleCreateNote} className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-2">
                    <input
                      id="note-title-input"
                      type="text"
                      placeholder="Note Title..."
                      required
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:border-cyan-500/30"
                    />
                    <textarea
                      id="note-content-input"
                      placeholder="Write description/content here..."
                      required
                      rows={3}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:border-cyan-500/30"
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowNoteForm(false)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ backgroundColor: accentColor }}
                        className="px-2.5 py-1 text-black font-semibold rounded text-[10px]"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>
                )}

                {/* List Entries */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {currentFolderEntries.length === 0 ? (
                    <div className="text-center text-xs text-gray-500 py-6">
                      No entries in this folder. Tap "Scan Screen" to run OCR on the active simulator screen!
                    </div>
                  ) : (
                    <div className="space-y-2 pb-4">
                      {currentFolderEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-1.5 relative group"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <h5 className="font-bold text-xs text-gray-200">{entry.title}</h5>
                            <span className="text-[8px] font-mono bg-white/5 px-1 rounded text-cyan-400 uppercase">
                              {entry.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 whitespace-pre-wrap leading-relaxed">
                            {entry.content}
                          </p>
                          <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-[9px] text-gray-500">
                            <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => copyToClipboard(entry.content)}
                                className="text-gray-400 hover:text-white flex items-center gap-0.5 p-1 rounded"
                              >
                                <Copy className="h-3 w-3" /> Copy
                              </button>
                              <button
                                onClick={() => onDeleteVaultEntry(entry.id)}
                                className="text-gray-400 hover:text-red-400 p-1 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CALCULATOR TAB */}
        {activeTab === "calculator" && (
          <div className="flex-grow flex flex-col justify-between">
            {/* Input Display Area */}
            <div className="space-y-2">
              <input
                id="calc-display"
                type="text"
                placeholder="0"
                value={calcInput}
                onChange={(e) => setCalcInput(e.target.value)}
                className="w-full text-right font-mono text-xl bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-white outline-none"
              />

              {/* Large output card */}
              <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 text-center min-h-[70px] flex flex-col justify-center">
                <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Result</p>
                {calcError ? (
                  <p className="text-xs font-semibold text-red-400 font-mono leading-tight">{calcError}</p>
                ) : (
                  <p
                    style={{ color: calcResult ? accentColor : "rgba(255,255,255,0.4)" }}
                    className="text-2xl font-bold font-mono truncate"
                  >
                    {calcResult || "0.00"}
                  </p>
                )}
              </div>
            </div>

            {/* Keypad Grid representation */}
            <div className="grid grid-cols-4 gap-1.5 mt-3">
              {["C", "(", ")", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "="].map(
                (key) => (
                  <button
                    key={key}
                    onClick={() => handleCalcKey(key)}
                    style={
                      key === "="
                        ? { backgroundColor: accentColor, color: "black" }
                        : key === "C"
                        ? { color: "#FF4D4D" }
                        : {}
                    }
                    className={`h-9 font-mono font-bold text-xs rounded-lg active:scale-95 transition-transform flex items-center justify-center ${
                      key === "="
                        ? "col-span-2 shadow shadow-cyan-500/20 font-extrabold"
                        : "bg-white/5 hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    {key}
                  </button>
                )
              )}
            </div>

            <p className="text-[9px] text-center text-gray-500 font-mono tracking-wide mt-2">
              Supported operators: + - * / ( ) .
            </p>
          </div>
        )}

        {/* SPEED DIAL TAB */}
        {activeTab === "speeddial" && (
          <div className="flex-grow flex flex-col space-y-3">
            {/* Save link form */}
            <form onSubmit={handleAddSpeedDial} className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-2">
              <input
                id="sd-label-input"
                type="text"
                placeholder="Label (e.g. Google)"
                required
                value={sdLabel}
                onChange={(e) => setSdLabel(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-cyan-500/30 text-white"
              />
              <div className="flex gap-1.5">
                <input
                  id="sd-url-input"
                  type="text"
                  placeholder="URL (e.g. google.com)"
                  required
                  value={sdUrl}
                  onChange={(e) => setSdUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-cyan-500/30 text-white"
                />
                <button
                  type="submit"
                  disabled={!sdLabel.trim() || !sdUrl.trim()}
                  style={{
                    backgroundColor: sdLabel.trim() && sdUrl.trim() ? accentColor : "rgba(255,255,255,0.05)",
                    color: sdLabel.trim() && sdUrl.trim() ? "black" : "#52525b",
                  }}
                  className="px-3.5 py-1 rounded-lg text-xs font-bold active:scale-95 cursor-pointer disabled:active:scale-100 disabled:cursor-not-allowed shrink-0"
                >
                  Save
                </button>
              </div>
            </form>

            <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Speed Dial Links
            </h4>

            {speedDialEntries.length === 0 ? (
              <div className="text-center text-xs text-gray-500 py-6">
                No saved speed dial links. Add your favorite website shortcuts above!
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 overflow-y-auto max-h-[160px] pb-2">
                {speedDialEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col items-center text-center relative p-1 group cursor-pointer"
                  >
                    <div
                      onClick={() => {
                        // Safe formatted link launch
                        let formattedUrl = entry.url;
                        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
                          formattedUrl = `https://${formattedUrl}`;
                        }
                        onLaunchApp("browser"); // Opens simulated browser
                        onClose();
                      }}
                      className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-sm"
                      style={{ color: accentColor }}
                    >
                      {entry.label.trim().substring(0, 1).toUpperCase()}
                    </div>
                    <p className="text-[9px] text-gray-300 mt-1 max-w-[50px] truncate">{entry.label}</p>
                    <button
                      onClick={() => onDeleteSpeedDial(entry.id)}
                      className="absolute top-0 right-0 h-4 w-4 bg-slate-900 rounded-full border border-white/10 flex items-center justify-center opacity-70 hover:opacity-100"
                    >
                      <X className="h-2 w-2 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid Tab Bar Footer Navigation */}
      <div className="h-14 border-t border-white/5 bg-black/60 shrink-0 flex items-center justify-around px-2 text-gray-500">
        <button
          onClick={() => setActiveTab("launcher")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "launcher" ? "text-white bg-white/5" : "hover:text-gray-300"
          }`}
        >
          <Smartphone className="h-4 w-4" style={activeTab === "launcher" ? { color: accentColor } : {}} />
          <span className="text-[8px] font-semibold uppercase tracking-wider">Launch</span>
        </button>

        <button
          onClick={() => setActiveTab("vault")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "vault" ? "text-white bg-white/5" : "hover:text-gray-300"
          }`}
        >
          <FolderLock className="h-4 w-4" style={activeTab === "vault" ? { color: accentColor } : {}} />
          <span className="text-[8px] font-semibold uppercase tracking-wider">Vault</span>
        </button>

        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "calculator" ? "text-white bg-white/5" : "hover:text-gray-300"
          }`}
        >
          <CalcIcon className="h-4 w-4" style={activeTab === "calculator" ? { color: accentColor } : {}} />
          <span className="text-[8px] font-semibold uppercase tracking-wider">Calc</span>
        </button>

        <button
          onClick={() => setActiveTab("speeddial")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "speeddial" ? "text-white bg-white/5" : "hover:text-gray-300"
          }`}
        >
          <Link className="h-4 w-4" style={activeTab === "speeddial" ? { color: accentColor } : {}} />
          <span className="text-[8px] font-semibold uppercase tracking-wider">Speed</span>
        </button>
      </div>
    </div>
  );
};
