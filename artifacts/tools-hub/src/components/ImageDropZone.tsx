import { Upload } from "lucide-react";

interface ImageDropZoneProps {
  dragOver: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClick: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  badges?: string[];
  buttonLabel?: string;
  testId?: string;
  children?: React.ReactNode;
}

export function ImageDropZone({
  dragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  title,
  subtitle,
  badges = ["JPG", "PNG", "WebP"],
  buttonLabel = "Select Files",
  testId,
  children,
}: ImageDropZoneProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      data-testid={testId}
      className={`relative rounded-2xl py-14 px-8 text-center mb-6 outline-none overflow-hidden select-none ${
        dragOver ? "dropzone-active" : "dropzone-idle"
      }`}
    >
      {/* Corner brackets */}
      <span className={`absolute top-3 left-3 w-5 h-5 border-t-[2.5px] border-l-[2.5px] rounded-tl transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute top-3 right-3 w-5 h-5 border-t-[2.5px] border-r-[2.5px] rounded-tr transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute bottom-3 left-3 w-5 h-5 border-b-[2.5px] border-l-[2.5px] rounded-bl transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute bottom-3 right-3 w-5 h-5 border-b-[2.5px] border-r-[2.5px] rounded-br transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />

      {/* Optional title above button */}
      {title && (
        <p className={`text-sm font-semibold mb-5 transition-colors duration-200 ${dragOver ? "text-primary" : "text-muted-foreground"}`}>
          {title}
        </p>
      )}

      {/* Big CTA button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
          dragOver
            ? "bg-primary scale-105 shadow-primary/40"
            : "bg-primary hover:bg-primary/90 hover:scale-[1.02] shadow-primary/25"
        }`}
      >
        <Upload className="w-4 h-4" />
        {buttonLabel}
      </button>

      {/* "or drop here" */}
      <p className={`mt-4 text-xs transition-colors duration-200 ${dragOver ? "text-primary font-medium" : "text-muted-foreground"}`}>
        {dragOver ? "Release to upload" : "or drop files here"}
      </p>

      {/* File type badges */}
      {badges.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-5 flex-wrap">
          {badges.map((b) => (
            <span
              key={b}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors duration-200 ${
                dragOver
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {b}
            </span>
          ))}
        </div>
      )}

      {subtitle && (
        <p className="text-xs text-muted-foreground/60 mt-2">{subtitle}</p>
      )}

      {children}
    </div>
  );
}
