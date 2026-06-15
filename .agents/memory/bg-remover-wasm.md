---
name: Background Remover — implementation
description: Final working approach for in-browser BG removal after repeated @imgly/background-removal failures
---

## Final Working Solution

Replaced `@imgly/background-removal` with `@huggingface/transformers` (already in package.json).

```tsx
const { pipeline, env } = await import("@huggingface/transformers");

// Single-threaded WASM — no SharedArrayBuffer / COOP/COEP needed
(env.backends.onnx as any).wasm.numThreads = 1;

const pipe = await pipeline("background-removal", "Xenova/modnet", {
  device: "wasm",
  progress_callback: (prog: any) => { /* download progress */ },
});

const output = await pipe(imageUrl);  // returns RawImage with alpha applied
const blob = await output.toBlob("image/png");
```

Cache `pipe` in a module-level variable (`let _pipe = null`) so the model (~20MB) downloads only once per session.
Reset `_pipe = null` in the catch block so a failed init re-tries on next use.

## Why @imgly/background-removal failed (do not retry)

- Always uses `ort-wasm-simd-threaded.wasm` internally — even with numThreads=1 patches
- Threaded WASM requires SharedArrayBuffer → requires `crossOriginIsolated = true`
- Replit dev preview runs in a proxy iframe — `crossOriginIsolated` is always false there
- `Object.defineProperty` patches (both named-export and default-export variants) were not reliably intercepting the library's internal ort setup
- Result: inference hangs silently at "Processing image: 0%" forever

## Why @huggingface/transformers works

- Exposes `env.backends.onnx.wasm.numThreads = 1` directly (no monkey-patching needed)
- `background-removal` pipeline built-in with `Xenova/modnet` default (~20MB)
- Pipeline returns `RawImage` with alpha already applied — call `.toBlob("image/png")` directly
- No CDN WASM dependencies — library bundles its own WASM

## Model choice
- `Xenova/modnet` — ~20MB, MODNet architecture, portrait/subject matting, confirmed working
- `briaai/RMBG-1.4` — ~175MB fp32, general purpose, not yet tried with this setup
