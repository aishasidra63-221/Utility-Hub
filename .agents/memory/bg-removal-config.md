---
name: Background Removal WASM configuration
description: How to correctly configure @imgly/background-removal in this project to avoid COEP blocking, URL errors, and ort version mismatches
---

## Rule 1 — publicPath must be a full URL
`publicPath` must be a **full URL** (with origin), not a root-relative path.

**Why:** The library internally calls `new URL(path, publicPath)` which throws "Failed to construct 'URL': Invalid base URL" if publicPath is a bare path like `/bg-removal/`.

**How to apply:**
```ts
publicPath: `${window.location.origin}/bg-removal/`
```

---

## Rule 2 — COEP blocks CDN WASM; use local files
The app sets `Cross-Origin-Embedder-Policy: require-corp`. CDN-hosted WASM (e.g. jsdelivr, staticimgly.com) is blocked. All WASM files must be served locally.

**Local asset layout (`public/bg-removal/`):**
- `resources.json` — resource manifest (patched to use local WASM paths)
- `ort-wasm-simd-threaded.wasm` — **from onnxruntime-web@1.17.3 dist** (10,647,985 bytes) — correct threaded version
- `ort-wasm-simd.wasm` — non-threaded WASM (10,551,547 bytes)
- `ort-wasm.wasm` — fallback (9,726,745 bytes)
- `dummy.mjs` — stub ES module placeholder for the .mjs worker entry

In `resources.json`, the chunk for `/onnxruntime-web/ort-wasm-simd-threaded.wasm` must point to `/bg-removal/ort-wasm-simd-threaded.wasm` with size 10647985. The AI model chunks (isnet, isnet_fp16, isnet_quint8) still fetch from `staticimgly.com` — those are exempt from COEP because they go through the library's own fetch.

---

## Rule 3 — wasmPaths format mismatch between imgly and ort 1.17.3
`@imgly/background-removal@1.7.0` was built for `onnxruntime-web@1.21-dev`. It sets:
```js
ort.env.wasm.wasmPaths = { mjs: blobUrl, wasm: blobUrl }
```
But `onnxruntime-web@1.17.3` expects keys keyed by **exact filename**:
```js
{ "ort-wasm-simd-threaded.wasm": url, "ort-wasm-simd.wasm": url, ... }
```
Ort 1.17.3 silently ignores `{ mjs, wasm }`, falls back to page-root URL for WASM, gets a 404 HTML response → `CompileError: expected magic word 00 61 73 6d, found 3c 2`.

**Fix:** Use `Object.defineProperty` to intercept the setter and remap:
```ts
const ort = await import("onnxruntime-web");
const wasmEnv = ort.env.wasm as Record<string, unknown>;
let _wasmPathsValue: unknown = wasmEnv.wasmPaths;
Object.defineProperty(wasmEnv, "wasmPaths", {
  configurable: true, enumerable: true,
  get() { return _wasmPathsValue; },
  set(value: unknown) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const v = value as Record<string, string>;
      if ("wasm" in v) {
        _wasmPathsValue = {
          "ort-wasm-simd-threaded.wasm": v.wasm,
          "ort-wasm-simd.wasm":          v.wasm,
          "ort-wasm-threaded.wasm":       v.wasm,
          "ort-wasm.wasm":               v.wasm,
        };
        return;
      }
    }
    _wasmPathsValue = value;
  },
});
```
This intercept must run BEFORE `removeBackground()` is called.

---

## Do not upgrade onnxruntime-web
`onnxruntime-web` is pinned to `1.17.3` in this project. Do not upgrade without testing the background remover. The version mismatch is handled by the interception pattern above.
