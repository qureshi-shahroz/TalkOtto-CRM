export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const pct = Math.max(4, Math.round((s.value / max) * 100));
        const prev = i > 0 ? steps[i - 1].value : null;
        const rate = prev ? Math.round((s.value / prev) * 100) : 100;
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="text-foreground/85">{s.label}</span>
              <span className="text-muted">
                <span className="font-medium text-foreground">{s.value.toLocaleString()}</span>
                {i > 0 ? <span className="ml-1.5 text-xs">({rate}%)</span> : null}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
