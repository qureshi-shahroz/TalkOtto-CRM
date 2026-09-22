import { cn } from "@/lib/utils";
import { STATUS_COLORS, OUTCOME_COLORS } from "@/lib/constants";

export function StatusBadge({ value, kind }: { value: string; kind: "status" | "outcome" }) {
  const map = kind === "status" ? STATUS_COLORS : OUTCOME_COLORS;
  const cls = map[value] ?? "bg-slate-500/15 text-slate-300 border-slate-500/30";
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
        cls
      )}
    >
      {value}
    </span>
  );
}
