import { Upload } from "lucide-react";

interface ImageDropZoneProps {
  dragOver: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClick: () => void;
  title: React.ReactNode;
  subtitle?: string;
  badges?: string[];
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
  subtitle = "Multiple files OK",
  badges = ["JPG", "PNG", "WebP"],
  testId,
  children,
}: ImageDropZoneProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
      data-testid={testId}
      className={`relative rounded-2xl py-12 px-8 text-center cursor-pointer mb-6 outline-none overflow-hidden select-none ${
        dragOver ? "dropzone-active" : "dropzone-idle"
      }`}
    >
      {/* Corner brackets */}
      <span className={`absolute top-3 left-3 w-5 h-5 border-t-[2.5px] border-l-[2.5px] rounded-tl transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute top-3 right-3 w-5 h-5 border-t-[2.5px] border-r-[2.5px] rounded-tr transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute bottom-3 left-3 w-5 h-5 border-b-[2.5px] border-l-[2.5px] rounded-bl transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute bottom-3 right-3 w-5 h-5 border-b-[2.5px] border-r-[2.5px] rounded-br transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />

      {/* Icon circle */}
      <div className={`relative mx-auto mb-5 w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-200 ${dragOver ? "scale-110" : ""}`}>
        <div className={`absolute inset-0 rounded-full transition-colors duration-200 ${dragOver ? "bg-primary/15" : "bg-primary/8"}`} />
        <div className="absolute inset-0 rounded-full ring-[6px] ring-primary/8" />
        <div className={`absolute inset-3 rounded-full transition-colors duration-200 ${dragOver ? "bg-primary/20" : "bg-primary/10"}`} />
        <Upload className={`relative z-10 w-8 h-8 transition-colors duration-200 ${dragOver ? "text-primary" : "text-primary/70"}`} />
      </div>

      {/* Text */}
      <p className={`text-sm font-semibold transition-colors duration-200 ${dragOver ? "text-primary" : "text-foreground"}`}>
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}

      {/* File type badges */}
      {badges.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
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

      {children}
    </div>
  );
}
