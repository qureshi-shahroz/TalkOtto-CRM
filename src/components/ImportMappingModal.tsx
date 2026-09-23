"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { createLeadsFromMapping } from "@/lib/actions";
import { IMPORT_FIELDS } from "@/lib/constants";

const NONE = "__none__";

export function ImportMappingModal({
  headers,
  rows,
  suggested,
  onClose,
}: {
  headers: string[];
  rows: string[][];
  suggested: Record<string, number | null>;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mapping, setMapping] = useState<Record<string, number | null>>(suggested);

  const previewRows = rows.slice(0, 3);
  const hasTarget = mapping.business !== null && mapping.business !== undefined
    || mapping.contactName !== null && mapping.contactName !== undefined;

  function setField(field: string, value: string) {
    setMapping((m) => ({ ...m, [field]: value === NONE ? null : Number(value) }));
  }

  function usedElsewhere(idx: number, field: string) {
    return Object.entries(mapping).some(([k, v]) => k !== field && v === idx);
  }

  function onImport() {
    startTransition(async () => {
      const res = await createLeadsFromMapping({ rows, mapping });
      router.refresh();
      alert(
        `Imported ${res.imported} of ${res.total} row${res.total === 1 ? "" : "s"}` +
          (res.skipped ? ` (${res.skipped} skipped — no business or contact name mapped).` : ".")
      );
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Map your columns</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted">
          {rows.length} row{rows.length === 1 ? "" : "s"} found. Tell us which column is which —
          we guessed where we could, correct anything that&apos;s wrong.
        </p>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {IMPORT_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-medium text-muted">{f.label}</label>
              <select
                value={mapping[f.key] ?? NONE}
                onChange={(e) => setField(f.key, e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
              >
                <option value={NONE}>— Don&apos;t import —</option>
                {headers.map((h, i) => (
                  <option key={i} value={i} disabled={usedElsewhere(i, f.key)}>
                    {h || `Column ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {previewRows.length > 0 && (
          <div className="mb-5 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left text-muted">
                  {headers.map((h, i) => (
                    <th key={i} className="whitespace-nowrap px-3 py-2 font-medium">
                      {h || `Column ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, r) => (
                  <tr key={r} className="border-b border-border/60 last:border-0">
                    {headers.map((_, i) => (
                      <td key={i} className="max-w-[160px] truncate whitespace-nowrap px-3 py-2 text-foreground/80">
                        {row[i] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!hasTarget && (
          <p className="mb-4 text-xs text-amber-300">
            Map at least Business or Contact Name, or every row will be skipped.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-foreground/80 hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            onClick={onImport}
            disabled={isPending || !hasTarget}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Importing…" : `Import ${rows.length} row${rows.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
