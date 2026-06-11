import { useState, useCallback, useEffect } from "react";

const SETTINGS_KEY = "toolhub_settings";

export interface AppSettings {
  theme: "light" | "dark" | "system";
  imageQuality: number;
  pdfCompressLevel: "lossless" | "balanced" | "small";
  imageOutputFormat: "jpg" | "png" | "webp";
  autoDownload: boolean;
  showPrivacyTips: boolean;
}

export const SETTINGS_DEFAULTS: AppSettings = {
  theme: "system",
  imageQuality: 80,
  pdfCompressLevel: "balanced",
  imageOutputFormat: "jpg",
  autoDownload: false,
  showPrivacyTips: true,
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...SETTINGS_DEFAULTS };
    return { ...SETTINGS_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...SETTINGS_DEFAULTS };
  }
}

export function saveSettings(patch: Partial<AppSettings>): void {
  try {
    const next = { ...getSettings(), ...patch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("toolhub_settings_changed", { detail: next }));
  } catch {}
}

export function resetSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    window.dispatchEvent(new CustomEvent("toolhub_settings_changed", { detail: { ...SETTINGS_DEFAULTS } }));
  } catch {}
}

export function clearAllData(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("toolhub_") || key === "theme")) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("toolhub_settings_changed", { detail: { ...SETTINGS_DEFAULTS } }));
    window.dispatchEvent(new CustomEvent("toolhub_data_cleared"));
  } catch {}
}

export function useSettings(): { settings: AppSettings; update: (patch: Partial<AppSettings>) => void } {
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<AppSettings>;
      setSettings(ce.detail);
    };
    window.addEventListener("toolhub_settings_changed", handler);
    return () => window.removeEventListener("toolhub_settings_changed", handler);
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    saveSettings(patch);
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return { settings, update };
}
