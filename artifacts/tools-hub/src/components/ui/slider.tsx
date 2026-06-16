import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, max = 100, min = 0, ...props }, ref) => {
  const [dragging, setDragging] = React.useState(false);
  const currentValue = (value ?? defaultValue ?? [0]) as number[];
  const pct = ((currentValue[0] - min) / (max - min)) * 100;
  const showPct = max === 100 && min === 0;

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      max={max}
      min={min}
      className={cn(
        "relative flex w-full touch-none select-none items-center group py-1",
        className
      )}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
      {...props}
    >
      {/* Track */}
      <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-primary/10 overflow-hidden">
        {/* Animated fill */}
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-75" />
      </SliderPrimitive.Track>

      {/* Thumb */}
      <SliderPrimitive.Thumb
        className={cn(
          "relative block h-[18px] w-[18px] rounded-full",
          "bg-background border-2 border-primary",
          "shadow-md shadow-primary/25",
          "transition-all duration-150 ease-out",
          "hover:scale-[1.3] hover:shadow-lg hover:shadow-primary/35",
          "active:scale-110",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {/* Floating tooltip */}
        <span
          aria-hidden
          className={cn(
            "absolute -top-9 left-1/2 -translate-x-1/2",
            "px-2 py-0.5 rounded-lg",
            "bg-primary text-primary-foreground",
            "text-[11px] font-bold leading-none whitespace-nowrap",
            "pointer-events-none select-none",
            "transition-all duration-150 ease-out origin-bottom",
            dragging
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-1"
          )}
        >
          {showPct ? `${currentValue[0]}%` : currentValue[0]}
          {/* Arrow */}
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary" />
        </span>

        {/* Glow pulse while dragging */}
        {dragging && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
            style={{ animationDuration: "0.8s" }}
          />
        )}
      </SliderPrimitive.Thumb>

      {/* Track percentage gradient overlay — shows fill even before range element */}
      <style>{`
        [data-slider-pct] .slider-track-fill {
          width: ${pct}%;
        }
      `}</style>
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
