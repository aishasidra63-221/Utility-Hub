---
name: Background Remover library choice
description: Which library to use for client-side background removal and why @huggingface/transformers failed
---

## Rule
Always use `@imgly/background-removal` (already in dependencies) for the Background Remover tool. Never use `@huggingface/transformers` pipeline("background-removal") for this.

## Why
`@huggingface/transformers` with Xenova/modnet caused two separate bugs:
1. **Backend init failure** — tries WebGPU first; `navigator.gpu` exists in some browsers even with no real GPU adapter, causing "no available backend found. ERR: [webgpu]". The WASM fallback then also failed.
2. **Corrupted output** — the compositing code that was added to work around premultiplied-alpha had a broken inversion heuristic (`avgAlpha > 200`) that incorrectly flipped the mask when the subject filled most of the frame, making the background opaque and subject transparent.

Setting `wasmPaths` to a CDN (e.g. jsdelivr) also conflicts with `Cross-Origin-Embedder-Policy: require-corp` unless the CDN sends CORP headers.

## How to apply
Use `@imgly/background-removal` directly:
```typescript
const { removeBackground } = await import("@imgly/background-removal");
const resultBlob = await removeBackground(file, {
  debug: false,
  model: "medium",
  output: { format: "image/png", type: "foreground", quality: 1 },
  progress: (_key, current, total) => { /* update UI */ },
});
```
The library handles its own WASM/model loading, is purpose-built for this task, and produces correct RGBA output at original image resolution. No backend configuration needed.
