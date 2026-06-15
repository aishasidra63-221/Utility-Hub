---
name: Background Remover WASM fix
description: How to fix @imgly/background-removal failing in Replit due to onnxruntime-web dropping non-threaded WASM in v1.21+
---

## The rule
Use `onnxruntime-web@1.17.3` (not 1.21.0+) and configure `numThreads=1` + `wasmPaths` before importing @imgly.

**Why:** `onnxruntime-web@1.21.0` removed `ort-wasm-simd.wasm` (non-threaded), leaving only the threaded variant which requires `crossOriginIsolated=true` (SharedArrayBuffer). Replit's proxy doesn't set COEP/COOP headers, so `crossOriginIsolated` is always false. A COI service worker was tried but is unreliable in Replit's proxy environment.

**How to apply:**
```js
const ort = await import("onnxruntime-web");
ort.env.wasm.numThreads = 1; // forces non-threaded WASM
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/";
// Then import @imgly
const { removeBackground } = await import("@imgly/background-removal");
```

Package in tools-hub: `onnxruntime-web@1.17.3` (downgraded from 1.21.0).
`@imgly/background-removal@1.7.0` is compatible with ort@1.17.3 despite peer dep spec saying 1.21.0.
