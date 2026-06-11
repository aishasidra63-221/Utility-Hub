import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  onCopy: () => Promise<void>;
  copied: boolean;
  label?: string;
}

export function ShareButton({ onCopy, copied, label = "Copy share link" }: ShareButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onCopy}
      data-testid="button-share-link"
      className="gap-2 text-xs"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          Link copied!
        </>
      ) : (
        <>
          <Link2 className="w-3.5 h-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}
