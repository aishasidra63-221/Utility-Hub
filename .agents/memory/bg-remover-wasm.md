---
name: Background Remover WASM fix
description: How to fix @imgly/background-removal failing in Replit due to threaded WASM requiring crossOriginIsolated headers
---

## The rule
`@imgly/background-removal@1.7.0` always uses `ort-wasm-simd-threaded.wasm` (threaded WASM), which requires `crossOriginIsolated=true` (SharedArrayBuffer). The fix is to add COOP + COEP headers to the Vite server config.

**Why:** Without `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`, the browser blocks SharedArrayBuffer, causing `CompileError: WebAssembly` when the library tries to compile the threaded WASM binary. The error surfaces as "no available backend found".

**How to apply:** Add to `vite.config.ts` server and preview sections:
```ts
headers: {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
},
```

**CDN:** Model files + WASM chunks are served from `https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/` (the library's default). The `resources.json` at that path lists all required files as content-addressed chunks. `staticimgly.com` returns `cross-origin-resource-policy: cross-origin` on all chunks, so COEP `require-corp` works without blocking any assets.

**publicPath to use:** `"https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/"` (the library default — do NOT use jsdelivr, it only has the JS code, not the model/WASM chunks).

**Package pinned:** `onnxruntime-web@1.17.3` in tools-hub (compatible with @imgly/background-removal@1.7.0).
