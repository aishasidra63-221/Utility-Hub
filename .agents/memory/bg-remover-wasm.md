---
name: Background Remover WASM fix
description: Root cause + fix for @imgly/background-removal@1.7.0 "Aborted(CompileError: WebAssembly)" in Replit
---

## Actual Root Cause (confirmed by reading ort source)

`ort@1.17.3` WASM backend selects file via:
```js
Ga = (simd, threaded) => simd ? (threaded ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm") : ...
Ha = numThreads => numThreads === 1 ? false : (numThreads > 1 && SharedArrayBuffer !== undefined)
```

`locateFile` logic:
```js
let s = typeof wasmPaths === "string" ? wasmPaths : undefined;  // CDN prefix
let h = Ga(simd, Ha(numThreads));                               // filename
let g = typeof wasmPaths === "object" ? wasmPaths[h] : undefined; // lookup by filename key
// For .wasm: uses g || (s ?? defaultBase) + h
```

The library sets `ort.env.wasm.wasmPaths = { mjs: blobUrl, wasm: blobUrl }` — keys are `mjs`/`wasm`,
NOT filename keys. So `g = wasmPaths["ort-wasm-simd.wasm"] = undefined`. Ort falls back to bundled
base path `B` (Vite output dir) which has no WASM files → `Aborted(CompileError: WebAssembly)`.

The `crossOriginIsolated` / SharedArrayBuffer issue is a red herring for the compiled error —
the REAL issue is ort can't find the WASM binary at all.

## The Fix (in BackgroundRemover.tsx)

Lock BOTH `numThreads` AND `wasmPaths` via `Object.defineProperty` BEFORE importing the library:

```ts
const CDN = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/";
const ort = await import("onnxruntime-web");
const noop = () => {};
Object.defineProperty(ort.env.wasm, "numThreads", { get: () => 1, set: noop, configurable: true });
Object.defineProperty(ort.env.wasm, "wasmPaths",  { get: () => CDN, set: noop, configurable: true });
const { removeBackground } = await import("@imgly/background-removal");
```

**Why this works:**
- `numThreads=1` → `Ha(1) = false` → `h = "ort-wasm-simd.wasm"` (non-threaded, no SharedArrayBuffer)
- `wasmPaths = CDN string` → `s = CDN` → ort constructs `CDN + "ort-wasm-simd.wasm"` ✅
- jsdelivr serves that file with `CORP: cross-origin` ✅

**Why previous attempts failed:**
- Only locking `numThreads` → library still set `wasmPaths = {wasm: blobUrl}` → ort's `g=undefined` fallback
- Custom resources.json WASM entry → library created blob URL, but ort used filename key lookup → still fell back to base path
- COI service worker → `crossOriginIsolated` can't be true in cross-origin iframe without parent `allow="cross-origin-isolated"`

## Supporting infrastructure (keep these in place)
- `public/coi-serviceworker.js` + service worker registration in `index.html` — adds COOP/COEP headers, may help in some contexts
- `public/bg-removal/resources.json` — still needed so library's `loadAsUrl()` succeeds for WASM/MJS entries (library checks size); ort ignores the blob URL anyway due to our wasmPaths lock
- Model chunks (staticimgly.com) in resources.json are still required and work correctly

## CORS requirements for model chunks
- jsdelivr: `CORP: cross-origin` ✅
- staticimgly.com: `CORP: cross-origin` ✅
