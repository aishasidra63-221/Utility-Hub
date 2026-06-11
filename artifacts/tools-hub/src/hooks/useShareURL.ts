import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Syncs given state fields with URL search params.
 * - On mount, reads initial values from URL params.
 * - Returns `updateParams` to push new param values to the URL (replaceState, no history entry).
 * - Returns `copyShareLink` to copy the current URL to clipboard.
 */
export function useShareURL<T extends Record<string, string>>(
  defaults: T
): {
  initialValues: T;
  updateParams: (values: Partial<T>) => void;
  copyShareLink: () => Promise<void>;
  copied: boolean;
} {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  // Read initial values from URL on mount
  const initialValues: T = { ...defaults };
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const val = params.get(key as string);
      if (val !== null) {
        (initialValues as Record<keyof T, string>)[key] = val;
      }
    }
  }

  const updateParams = useCallback(
    (values: Partial<T>) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(values)) {
        if (v) {
          params.set(k, v);
        } else {
          params.delete(k);
        }
      }
      const newSearch = params.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
      window.history.replaceState(null, "", newUrl);
      void setLocation;
    },
    [setLocation]
  );

  const copyShareLink = useCallback(async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  // Clear URL params when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.location.search) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
  }, []);

  return { initialValues, updateParams, copyShareLink, copied };
}
