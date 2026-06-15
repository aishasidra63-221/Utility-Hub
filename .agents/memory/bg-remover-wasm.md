---
name: Background Remover WASM fix
description: Root cause + fix for @imgly/background-removal@1.7.0 stuck/hanging in Replit
---

## Root Cause Summary

`@imgly/background-removal@1.7.0` internally uses `(await import("onnxruntime-web")).default` to get ort.
Our code imports as `await import("onnxruntime-web")` (namespace object). These are **different objects**:
- `ortMod.env.wasm` — named export (what our code was patching — WRONG target)
- `ortMod.default.env.wasm` — default export's env (what the library uses — CORRECT target)

Patching the wrong object means the library's own assignments go through unblocked:
- `ort2.env.wasm.numThreads = navigator.hardwareConcurrency` (e.g. 4)
- `ort2.env.wasm.wasmPaths = { mjs: blobUrl, wasm: blobUrl }` (threaded WASM blob URLs)

Result: ort tries to use threaded WASM (`ort-wasm-simd-threaded.wasm`), which needs SharedArrayBuffer.
In Replit's proxied iframe environment, `crossOriginIsolated = false` → SharedArrayBuffer unavailable → inference hangs silently at "Processing image: 0%".

## The Correct Fix (in BackgroundRemover.tsx)

Target `.default.env.wasm`:

```ts
const localWasmPath = `${window.location.origin}${import.meta.env.BASE_URL}bg-removal/`;
const ortMod = await import("onnxruntime-web");
const ortObj = (ortMod as any).default ?? ortMod;   // ← KEY: use .default
const wasmEnv = ortObj.env.wasm as any;
const noop = () => {};
try { Object.defineProperty(wasmEnv, "numThreads", { get: () => 1, set: noop, configurable: true }); } catch {}
try { Object.defineProperty(wasmEnv, "wasmPaths",  { get: () => localWasmPath, set: noop, configurable: true }); } catch {}

const { removeBackground } = await import("@imgly/background-removal");
```

**Why:**
- `numThreads=1` forces non-threaded WASM → no SharedArrayBuffer needed
- `wasmPaths = localWasmPath string` → ort constructs `localWasmPath + "ort-wasm-simd.wasm"` (served from public/bg-removal/)
- Wrapped in try/catch because the property may already be defined as non-configurable on second call

## resources.json — why loadAsUrl still works
The library's `loadAsUrl("/onnxruntime-web/ort-wasm-simd-threaded.wasm", config)` reads from
`public/bg-removal/resources.json` which HAS those keys (chunks point to CDN). The blob URL is created
but since our setter is noop, the `wasmPaths` assignment is ignored. Our getter returns `localWasmPath`.

## Local WASM files (public/bg-removal/)
Keep all three:
- `ort-wasm-simd.wasm` — used when numThreads=1 + SIMD supported
- `ort-wasm.wasm` — fallback when SIMD not supported  
- `ort-wasm-simd-threaded.wasm` — NOT used (threaded blocked), but present in resources.json

## onnxruntime-web version
Pinned to `1.17.3` in package.json. v1.21+ dropped non-threaded WASM entirely — do not upgrade.
