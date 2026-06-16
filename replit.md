# ToolsHub

A collection of 26+ privacy-focused browser utilities — image processing, PDF manipulation, generators, and more — that run entirely client-side using WebAssembly and AI models. No login, no ads, no server uploads.

## Run & Operate

- `pnpm --filter @workspace/tools-hub run dev` — run the ToolsHub frontend (port 5000)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite 7, Tailwind CSS 4, Wouter, TanStack Query v5
- API: Express 5, Pino logging
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Heavy processing: @imgly/background-removal, @huggingface/transformers, onnxruntime-web, tesseract.js (all client-side WASM/AI)

## Where things live

- `artifacts/tools-hub/` — main React SPA (entry: `src/main.tsx`)
- `artifacts/api-server/` — Express 5 backend (entry: `src/index.ts`, port 5000)
- `artifacts/mockup-sandbox/` — UI component sandbox
- `lib/db/` — Drizzle ORM schema and DB client
- `lib/api-spec/` — OpenAPI 3.1 spec (source of truth for API shape)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas

## Architecture decisions

- All tool processing runs entirely in the browser (WASM/AI) — no server uploads, privacy-first.
- Monorepo with pnpm workspaces; libs are consumed as `workspace:*` references with TypeScript path aliases.
- API shape is defined once in `lib/api-spec/openapi.yaml` and code-generated into both client hooks and Zod schemas.
- `minimumReleaseAge: 1440` in pnpm-workspace.yaml enforces a 1-day package age for supply-chain security — do not disable.

## Product

26+ browser-based utility tools grouped into: Image Tools, PDF Tools, Generator Tools, and Utility Tools. Users can favourite tools, all processing is local.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `preinstall` script blocks non-pnpm package managers. Always use `pnpm`.
- esbuild platform overrides in `pnpm-workspace.yaml` strip non-linux-x64 binaries — do not remove these.
- `onnxruntime-web` is pinned to `1.17.3` — do not upgrade without testing AI tools.
- Vite dev server requires `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` headers for SharedArrayBuffer (used by WASM tools).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
