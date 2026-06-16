---
name: Background Remover — implementation
description: Final working approach for in-browser BG removal after repeated @imgly/background-removal failures and alpha corruption issues
---

## Final Working Solution

Uses `@huggingface/transformers` (already in package.json) with `Xenova/modnet`.

**Critical:** Never use the RGB values from the pipeline output blob directly. Premultiplied-alpha canvas reads corrupt colours (pixels with alpha=0 have RGB zeroed out). Always extract ONLY the alpha channel from the pipeline blob and apply it onto the original image's RGB.

**Auto-inversion detection:** If `avgAlpha > 200` across all mask pixels, the mask is inverted (background=opaque, subject=transparent). Flip with `255 - rawAlpha`.

```tsx
// Single-threaded WASM — no SharedArrayBuffer / COOP/COEP needed
(env.backends.onnx as any).wasm.numThreads = 1;

const pipe = await pipeline("background-removal", "Xenova/modnet", {
  device: "wasm",
  progress_callback: ...
});

const raw = await pipe(imageUrl);
const rawBlob = await raw.toBlob("image/png");

// THEN: applyMaskAlphaToOriginal(originalUrl, rawBlob)
// - draws originalImg → origData (correct RGB)
// - draws maskedImg on separate canvas → maskedData (alpha only)
// - if avgAlpha > 200: invert (isInverted = true)
// - copies (possibly inverted) alpha channel onto origData
// - exports from fresh canvas
```

Cache `pipe` in a module-level `let _pipe = null`. Reset on error.

## Why @imgly/background-removal failed (do not retry)

- Always uses `ort-wasm-simd-threaded.wasm` — requires SharedArrayBuffer → requires `crossOriginIsolated = true`
- Replit dev preview is proxied iframe — `crossOriginIsolated` always false
- Result: hangs silently at "Processing image: 0%"

## Why direct `raw.toBlob()` fails on its own

- `@huggingface/transformers` v4.x background-removal pipeline sometimes returns inverted masks
- Drawing a transparent PNG onto canvas and reading back pixels: premultiplied-alpha zeroes out RGB for transparent pixels
- Compositing result: background appears black instead of transparent, or entire image disappears

## Model

- `Xenova/modnet` — ~20MB, MODNet architecture, confirmed working
- `briaai/RMBG-1.4` — ~175MB fp32, general purpose, not yet tested in this env
