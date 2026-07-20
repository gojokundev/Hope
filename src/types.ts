export type LanguageCode = "en" | "ar" | "fa";

export interface NeonTheme {
  id: string;
  displayName: string;
  colorHexStr: string;
}

export interface SpeedDialEntry {
  id: string;
  label: string;
  url: string;
}

export interface VaultFolder {
  id: string;
  name: string;
  timestamp: string;
}

export interface VaultEntry {
  id: string;
  folderId: string;
  type: "note" | "ocr";
  title: string;
  content: string;
  timestamp: string;
}

export interface SimulatedApp {
  id: string;
  name: string;
  category: string;
  icon: string;
  launchCount: number;
  isFavorite: boolean;
  mockContent: string; // The simulated screen content when opened
}

export interface PermissionStatus {
  displayOverApps: boolean | "skipped";
  usageStats: boolean | "skipped";
  foregroundNotifications: boolean | "skipped";
}

export const THEMES: NeonTheme[] = [
  { id: "cyan", displayName: "Neon Cyan", colorHexStr: "#00E5FF" },
  { id: "pink", displayName: "Neon Pink", colorHexStr: "#FF2A85" },
  { id: "green", displayName: "Neon Green", colorHexStr: "#00E676" },
  { id: "purple", displayName: "Neon Purple", colorHexStr: "#D500F9" },
  { id: "yellow", displayName: "Neon Yellow", colorHexStr: "#FFFFD6" },
];
