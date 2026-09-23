"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Download, Upload, Plus, PhoneCall } from "lucide-react";
import type { Lead } from "@prisma/client";
import { StatusBadge } from "@/components/StatusBadge";
import { LeadFormModal } from "@/components/LeadFormModal";
import { ImportMappingModal } from "@/components/ImportMappingModal";
import { LEAD_STATUSES, CALL_OUTCOMES } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { parseImportFile } from "@/lib/actions";
import Link from "next/link";

export function LeadsTable({
  leads,
  query,
  openNew = false,
}: {
  leads: Lead[];
  query: { q?: string; status?: string; callStatus?: string };
  openNew?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(query.q ?? "");
  const [modalLead, setModalLead] = useState<Lead | null | "new">(openNew ? "new" : null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<{
    headers: string[];
    rows: string[][];
    suggested: Record<string, number | null>;
  } | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("new");
    router.push(`/leads${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q);
  }

  function onImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await parseImportFile(fd);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (res.rows.length === 0) {
        alert("Couldn't read any rows from that file — is it a CSV/Excel file with a header row?");
        return;
      }
      setImportData(res);
    });
  }

  function closeModal() {
    setModalLead(null);
    if (searchParams.get("new") === "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new");
      router.push(`/leads${params.toString() ? `?${params.toString()}` : ""}`);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form onSubmit={onSearchSubmit} className="flex-1 min-w-[200px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search business, contact, phone, email…"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm placeholder:text-muted focus:border-accent/50 focus:outline-none"
          />
        </form>
        <select
          value={query.status ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={query.callStatus ?? ""}
          onChange={(e) => updateParam("callStatus", e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
        >
          <option value="">All call statuses</option>
          <option value="Not called">Not called</option>
          {CALL_OUTCOMES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          <a
            href="/api/leads/export"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground/80 hover:bg-surface-2"
          >
            <Download className="h-4 w-4" />
            Export
          </a>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground/80 hover:bg-surface-2 disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {isPending ? "Importing…" : "Import CSV/Excel"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xlsm"
            className="hidden"
            onChange={onImportChange}
          />
          <button
            onClick={() => setModalLead("new")}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add lead
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Call status</th>
              <th className="px-4 py-3 font-medium">Calls</th>
              <th className="px-4 py-3 font-medium">Next follow-up</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setModalLead(lead)}
                className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{lead.business}</div>
                  <div className="text-xs text-muted">{lead.industry ?? "—"} · {lead.location ?? "—"}</div>
                </td>
                <td className="px-4 py-3">{lead.contactName}</td>
                <td className="px-4 py-3 text-muted">{lead.phone}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={lead.status} kind="status" />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={lead.callStatus} kind="outcome" />
                </td>
                <td className="px-4 py-3 text-muted">{lead.callsCount}</td>
                <td
                  className={cn(
                    "px-4 py-3",
                    lead.nextFollowUp && lead.nextFollowUp <= new Date() ? "text-amber-300" : "text-muted"
                  )}
                >
                  {formatDate(lead.nextFollowUp)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/calling?leadId=${lead.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    Call
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">
                  No leads match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-muted">
        Showing {leads.length} lead{leads.length === 1 ? "" : "s"}
      </div>

      {modalLead && (
        <LeadFormModal lead={modalLead === "new" ? undefined : modalLead} onClose={closeModal} />
      )}

      {importData && (
        <ImportMappingModal
          headers={importData.headers}
          rows={importData.rows}
          suggested={importData.suggested}
          onClose={() => setImportData(null)}
        />
      )}
    </div>
  );
}
