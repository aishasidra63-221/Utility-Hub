interface UsageCountProps {
  count: number;
  label?: string;
}

/**
 * Inline usage badge shown in the tool breadcrumb line.
 * Only renders once the count is > 0 to stay out of the way for first-time users.
 */
export function UsageCount({ count, label = "use" }: UsageCountProps) {
  if (count === 0) return null;

  const noun = count === 1 ? label : `${label}s`;

  return (
    <span
      className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] font-medium"
      data-testid="text-usage-inline"
      title={`You've used this tool ${count} time${count !== 1 ? "s" : ""}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
      {count} {noun}
    </span>
  );
}
