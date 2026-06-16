---
name: SEO/AEO Growth Architecture
description: How programmatic conversion pages, AEO content blocks, related tools, and recently-used tracking are wired together in ToolsHub.
---

## Programmatic SEO Pages
- Data lives in `src/lib/conversionData.ts` — `CONVERSIONS` array + `CONVERSION_BY_SLUG` map.
- Template at `src/pages/ConversionPage.tsx` — uses `useLocation()` to extract slug from URL (no prop needed); looks up config from `CONVERSION_BY_SLUG`.
- Each of the 20 routes in `App.tsx` points to the same `ConversionPage` component — URL is the source of truth.
- Pages inject FAQ + HowTo JSON-LD schemas via `useEffect` (add/cleanup on mount/unmount).

## AEO/GEO Content Blocks (Tool Pages)
- `src/components/ToolAEOSection.tsx` renders: What is it, How does it work, Is it free, Is it private, Use cases, Why browser-based, Alternatives comparison table, FAQ accordion.
- Injects `schema-faq-tool` (FAQPage) and `schema-webapp-tool` (WebApplication) JSON-LD via DOM `useEffect`.
- Auto-injected by `Layout.tsx` — no individual tool page needs to import it.

## Layout Auto-Injection
- In `Layout.tsx`: `const toolData = NON_TOOL_PATHS.has(location) ? null : TOOL_BY_HREF.get(location) ?? null;`
- If `toolData` is not null, Layout renders `<RelatedTools>` then `<ToolAEOSection>` after `{children}`.
- Also calls `addRecentTool(location)` via `useEffect` when `toolData` is set.
- Conversion pages are NOT in `TOOL_BY_HREF`, so they get no AEO injection (they have their own content).

## Recently Used Tools
- `src/hooks/useRecentTools.ts` — localStorage key `toolhub_recent`, max 6, deduped, most recent first.
- Dispatches `toolhub_recent_updated` custom event so the Home page row updates reactively.
- `Home.tsx` reads `useRecentTools()` at component level, maps hrefs → `ALL_TOOLS` entries (not TOOL_BY_HREF — need `icon` field which is only on the local `ALL_TOOLS` array).

## Related Tools Component
- `src/components/RelatedTools.tsx` — shows Related, Recently Used, Popular sections as horizontal scrollable rows.
- Uses `TOOL_BY_HREF` (from `TOOLS_DATA`) for lookup — note `ToolData` has no `icon` field, only `iconBg`.
- Mini cards use `tool.iconBg` as a colored block since no icon is available from `ToolData`.

## Key Gotcha
- `ToolData` (from `TOOLS_DATA`) has no `icon` field — icons only exist in Home's local `ALL_TOOLS` array.
- Never use `TOOL_BY_HREF` to look up tools when you need the Lucide icon — use `ALL_TOOLS.find(t => t.href === href)` instead (only available inside Home.tsx scope).
