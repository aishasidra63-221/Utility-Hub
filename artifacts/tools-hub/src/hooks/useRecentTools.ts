import { useState, useCallback, useEffect } from "react";

const KEY = "toolhub_recent";
const MAX = 6;

export function addRecentTool(href: string): void {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    const next = [href, ...prev.filter((h) => h !== href)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("toolhub_recent_updated"));
  } catch { /* noop */ }
}

export function getRecentTools(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function clearRecentTools(): void {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("toolhub_recent_updated"));
  } catch { /* noop */ }
}

export function useRecentTools(): string[] {
  const [recents, setRecents] = useState<string[]>(getRecentTools);

  const refresh = useCallback(() => setRecents(getRecentTools()), []);

  useEffect(() => {
    window.addEventListener("toolhub_recent_updated", refresh);
    return () => window.removeEventListener("toolhub_recent_updated", refresh);
  }, [refresh]);

  return recents;
}
