import { useState, useCallback, useEffect } from "react";

const KEY_PREFIX = "toolhub_usage_";

/** Read the current count for a tool (does not cause a re-render). */
export function getToolCount(toolId: string): number {
  try {
    return parseInt(localStorage.getItem(`${KEY_PREFIX}${toolId}`) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

/** Increment a tool's usage count and return the new value. */
export function incrementToolCount(toolId: string): number {
  try {
    const next = getToolCount(toolId) + 1;
    localStorage.setItem(`${KEY_PREFIX}${toolId}`, String(next));
    // Notify other hooks on the same page
    window.dispatchEvent(new CustomEvent("toolhub_count_updated", { detail: { toolId, count: next } }));
    return next;
  } catch {
    return 0;
  }
}

/** Get counts for all tools at once (used on the home page). */
export function getAllToolCounts(): Record<string, number> {
  const ids = [
    "image-compressor", "image-converter", "image-resizer", "image-cropper",
    "pdf-converter", "qr-generator", "text-cleaner", "whatsapp-link",
    "password-generator", "json-formatter", "color-palette", "heic-converter",
  ];
  return Object.fromEntries(ids.map((id) => [id, getToolCount(id)]));
}

/**
 * React hook that tracks the usage count for a specific tool.
 * Provides an `increment` function to call on meaningful user action.
 */
export function useToolCounter(toolId: string): { count: number; increment: () => void } {
  const [count, setCount] = useState(() => getToolCount(toolId));

  // Listen for updates dispatched by incrementToolCount
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ toolId: string; count: number }>;
      if (ce.detail.toolId === toolId) setCount(ce.detail.count);
    };
    window.addEventListener("toolhub_count_updated", handler);
    return () => window.removeEventListener("toolhub_count_updated", handler);
  }, [toolId]);

  const increment = useCallback(() => {
    const next = incrementToolCount(toolId);
    setCount(next);
  }, [toolId]);

  return { count, increment };
}
