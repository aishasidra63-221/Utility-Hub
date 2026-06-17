import { useState, useRef, useCallback } from "react";
import { Lock, Copy, Check, Trash2, Upload, Download, ArrowLeftRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Mode = "encode" | "decode";
type InputType = "text" | "file";

function encodeText(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return btoa(text);
  }
}

function decodeText(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64.trim())));
  } catch {
    throw new Error("Invalid Base64 string — cannot decode.");
  }
}

function isValidBase64(s: string): boolean {
  try { atob(s.trim().replace(/\s/g, "")); return true; }
  catch { return false; }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve((e.target?.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const SAMPLE_TEXTS = [
  { label: "Hello World", value: "Hello, World! 👋" },
  { label: "URL", value: "https://toolshub.app/base64" },
  { label: "JSON", value: '{"name":"ToolsHub","private":true}' },
  { label: "Email", value: "user@example.com" },
];

export default function Base64Tool() {
  useSEO({
    title: "Base64 Encoder / Decoder — Text & File, Online & Private | ToolsHub",
    description: "Encode text or files to Base64, or decode Base64 back to text. Supports images, PDFs, and any file. 100% private, runs in your browser.",
  });

  const { count, increment } = useToolCounter("base64-tool");
  const [mode, setMode] = useState<Mode>("encode");
  const [inputType, setInputType] = useState<InputType>("text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileMime, setFileMime] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function process(text: string, m: Mode) {
    setError("");
    if (!text.trim()) { setOutput(""); return; }
    try {
      const result = m === "encode" ? encodeText(text) : decodeText(text);
      setOutput(result);
      increment();
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  function handleInput(val: string) {
    setInput(val); process(val, mode);
  }

  function handleModeSwitch() {
    const newMode: Mode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    const swapped = output;
    setInput(swapped); setOutput("");
    process(swapped, newMode);
    setFileName(""); setFileSize(0); setFileMime(""); setInputType("text");
  }

  async function handleFile(file: File) {
    setInputType("file");
    setFileName(file.name);
    setFileSize(file.size);
    setFileMime(file.type);
    setError("");
    try {
      const b64 = await fileToBase64(file);
      setInput(b64);
      if (mode === "encode") { setOutput(b64); }
      else { process(b64, mode); }
      increment();
    } catch {
      setError("Failed to read file.");
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0]; if (file) handleFile(file);
  }, [mode]);

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  function clear() {
    setInput(""); setOutput(""); setError(""); setFileName(""); setFileSize(0); setFileMime(""); setInputType("text");
  }

  const isImage = fileMime.startsWith("image/");
  const dataUri = isImage && inputType === "file" && input ? `data:${fileMime};base64,${input}` : "";

  const inputCharCount = input.length;
  const outputCharCount = output.length;
  const compressionRatio = inputCharCount && outputCharCount
    ? mode === "encode"
      ? ((outputCharCount / inputCharCount - 1) * 100).toFixed(1)
      : ((1 - outputCharCount / inputCharCount) * 100).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-5 pb-10">
      <div className="mb-8 flex flex-col items-center text-center gap-3">
        <div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Utility Tools</span>
            <UsageCount count={count} label="encoded/decoded" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Base64 Encoder / Decoder</h1>
          <p className="text-muted-foreground mt-2">Encode text or any file to Base64, or decode it back. Works entirely in your browser — nothing is uploaded.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex rounded-xl border border-border overflow-hidden">
          {(["encode", "decode"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setInput(""); setOutput(""); setError(""); setFileName(""); setFileSize(0); setInputType("text"); }}
              className={`px-5 py-2 text-sm font-medium capitalize transition-all ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground px-2 py-1 bg-muted/40 rounded-lg">
          {mode === "encode" ? "Text / File → Base64" : "Base64 → Text"}
        </div>
      </div>

      {mode === "encode" && (
        <div className="flex flex-wrap gap-2 mb-4">
          <p className="text-xs text-muted-foreground self-center">Quick samples:</p>
          {SAMPLE_TEXTS.map(s => (
            <button key={s.label} onClick={() => { setInputType("text"); handleInput(s.value); }}
              className="px-3 py-1 rounded-lg text-xs font-medium border border-border bg-muted/30 hover:bg-muted transition-all text-foreground">
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {mode === "encode" ? "Input (text or file)" : "Base64 Input"}
            </label>
            {inputCharCount > 0 && <span className="text-xs text-muted-foreground tabular-nums">{inputCharCount.toLocaleString()} chars</span>}
          </div>

          {mode === "encode" && inputType === "file" && fileName ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`rounded-xl border-2 border-dashed p-4 text-center transition-all cursor-pointer ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              onClick={() => fileRef.current?.click()}
            >
              {isImage && dataUri && <img src={dataUri} alt="preview" className="max-h-32 mx-auto rounded-lg mb-3 object-contain" />}
              <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{(fileSize / 1024).toFixed(1)} KB · {fileMime || "unknown type"} · Click to change</p>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); if (mode === "encode") setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <textarea
                value={input}
                onChange={e => { setInputType("text"); handleInput(e.target.value); }}
                placeholder={mode === "encode" ? "Type or paste text here, or drop a file…" : "Paste Base64 string here…"}
                className={`w-full min-h-[180px] rounded-xl border-2 bg-background px-4 py-3 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y transition-all ${dragging ? "border-primary bg-primary/5" : "border-border"}`}
                spellCheck={false}
              />
            </div>
          )}

          {mode === "encode" && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="gap-1.5 text-xs flex-1">
                <Upload className="w-3.5 h-3.5" /> Upload file
              </Button>
              <input ref={fileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              {(input || fileName) && (
                <Button size="sm" variant="ghost" onClick={clear} className="gap-1.5 text-xs">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}

          {mode === "decode" && input && (
            <div className="flex items-center gap-1.5 text-xs">
              {isValidBase64(input)
                ? <span className="flex items-center gap-1 text-emerald-500"><Check className="w-3 h-3" />Valid Base64</span>
                : <span className="flex items-center gap-1 text-amber-500"><AlertCircle className="w-3 h-3" />May contain invalid characters</span>}
            </div>
          )}
        </div>

        <div className="flex md:flex-col items-center justify-center gap-2 py-2">
          <button
            onClick={handleModeSwitch}
            className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted hover:border-primary/40 flex items-center justify-center transition-all group"
            title="Swap input and output"
          >
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          {compressionRatio !== null && (
            <span className={`text-[10px] font-medium tabular-nums ${mode === "encode" ? "text-amber-500" : "text-emerald-500"}`}>
              {mode === "encode" ? `+${compressionRatio}%` : `-${compressionRatio}%`}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {mode === "encode" ? "Base64 Output" : "Decoded Output"}
            </label>
            {outputCharCount > 0 && <span className="text-xs text-muted-foreground tabular-nums">{outputCharCount.toLocaleString()} chars</span>}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 min-h-[180px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              placeholder={mode === "encode" ? "Base64 output appears here…" : "Decoded text appears here…"}
              className="w-full min-h-[180px] rounded-xl border-2 border-border bg-muted/20 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground focus:outline-none resize-y text-foreground"
            />
          )}

          {output && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyOutput} className="gap-1.5 text-xs flex-1">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy output</>}
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadText(output, mode === "encode" ? "output.b64" : "decoded.txt")} className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </div>
          )}
        </div>
      </div>

      {output && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Input size", value: `${(new TextEncoder().encode(input).byteLength / 1024).toFixed(2)} KB` },
            { label: "Output size", value: `${(new TextEncoder().encode(output).byteLength / 1024).toFixed(2)} KB` },
            { label: "Size change", value: compressionRatio ? `${mode === "encode" ? "+" : "-"}${compressionRatio}%` : "—" },
            { label: "Encoding", value: "UTF-8 / Base64" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-muted/30 border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-foreground mb-2">What is Base64?</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Base64 is a binary-to-text encoding scheme that represents binary data using 64 printable ASCII characters. It's commonly used to embed images in HTML/CSS, store binary data in JSON, transmit data over text-only protocols (email, URLs), and encode API tokens or credentials. Base64 is <strong className="text-foreground">not encryption</strong> — it's just encoding. Anyone can decode it.
        </p>
      </div>
    </div>
  );
}
