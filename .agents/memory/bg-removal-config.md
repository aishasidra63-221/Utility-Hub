---
name: Background Removal WASM configuration
description: How to correctly configure @imgly/background-removal in this project to avoid COEP blocking and URL errors
---

## Rule
`publicPath` must be a **full URL** (with origin), not a root-relative path.

**Why:** The library internally calls `new URL(path, publicPath)` which throws "Failed to construct 'URL': Invalid base URL" if publicPath is a bare path like `/bg-removal/`. It must include the protocol and host.

**How to apply:**
```ts
publicPath: `${window.location.origin}/bg-removal/`
```

## WASM files and COEP
The app sets `Cross-Origin-Embedder-Policy: require-corp`. CDN-hosted WASM (e.g., jsdelivr) is blocked unless it serves with `Cross-Origin-Resource-Policy: cross-origin`. To avoid this, `public/bg-removal/resources.json` was updated to point WASM chunk `name` fields to local paths (`/bg-removal/ort-wasm-simd.wasm`) instead of the CDN URLs.

The AI model chunks (isnet, isnet_fp16, isnet_quint8) still fetch from `staticimgly.com` — those work because model fetches go through the library's own fetch logic which handles COEP correctly.

## Local asset layout
- `public/bg-removal/resources.json` — resource manifest (patched to use local WASM)
- `public/bg-removal/ort-wasm-simd.wasm` — main WASM runtime
- `public/bg-removal/ort-wasm-simd-threaded.wasm` — threaded variant
- `public/bg-removal/ort-wasm.wasm` — fallback
- `public/bg-removal/dummy.mjs` — dummy ES module placeholder
