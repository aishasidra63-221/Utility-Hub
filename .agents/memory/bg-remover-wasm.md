---
name: Background Remover WASM fix
description: How to fix @imgly/background-removal failing in Replit's cross-origin iframe due to threaded WASM requiring SharedArrayBuffer
---

## Root Cause
`@imgly/background-removal@1.7.0` always loads `ort-wasm-simd-threaded.wasm` (shared-memory WASM).
Threaded WASM requires `SharedArrayBuffer`, which requires `crossOriginIsolated=true`.
Replit preview is shown inside a cross-origin iframe that doesn't have `allow="cross-origin-isolated"`,
so `crossOriginIsolated` is always `false` even if the app sends COOP+COEP headers.
Result: `CompileError: WebAssembly` / "no available backend found".

## The Fix (3 parts)

### 1. Lock numThreads=1 via Object.defineProperty
The library overrides `ort.env.wasm.numThreads = maxNumThreads()` after we set it.
Use `Object.defineProperty` to make the property non-writable before importing the library:
```ts
const ort = await import("onnxruntime-web");
Object.defineProperty(ort.env.wasm, "numThreads", {
  get: () => 1,
  set: (_v: number) => { /* noop */ },
  configurable: true,
});
```

### 2. Custom resources.json in public/bg-removal/
The library fetches `{publicPath}resources.json` to find WASM/model files.
Serve a custom one that:
- **WASM entry** (`/onnxruntime-web/ort-wasm-simd-threaded.wasm`): single absolute-URL chunk pointing to
  `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/ort-wasm-simd.wasm` (NON-THREADED, 10551547 bytes)
- **MJS entry** (`/onnxruntime-web/ort-wasm-simd-threaded.mjs`): dummy `dummy.mjs` (19 bytes) served from same origin
- **Model entries**: absolute URLs prepended with `https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/`

The library uses `new URL(chunk.name, publicPath)` — absolute chunk names override the base URL.

### 3. Dynamic publicPath in component
```ts
const publicPath = `${window.location.origin}${import.meta.env.BASE_URL}bg-removal/`;
```

## Why non-threaded WASM works
`ort-wasm-simd.wasm` uses no shared memory imports → compiles without `SharedArrayBuffer`.
With `numThreads=1` locked, ort never creates worker threads → MJS file never actually imported.

## CORS requirements
All cross-origin assets must have `cross-origin-resource-policy: cross-origin` for COEP to allow them:
- jsdelivr: ✅ has CORP + CORS headers
- staticimgly.com: ✅ has CORP header

## Files
- `artifacts/tools-hub/public/bg-removal/resources.json` — custom resources manifest
- `artifacts/tools-hub/public/bg-removal/dummy.mjs` — 19-byte dummy JS (for MJS size check)
- `artifacts/tools-hub/src/pages/BackgroundRemover.tsx` — uses Object.defineProperty + dynamic publicPath
