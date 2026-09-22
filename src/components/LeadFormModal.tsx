"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { createLead, updateLead, deleteLead } from "@/lib/actions";
import { LEAD_STATUSES } from "@/lib/constants";
import type { Lead } from "@prisma/client";

function toInputDate(d: Date | null | undefined) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

export function LeadFormModal({ lead, onClose }: { lead?: Lead; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEdit = Boolean(lead);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      if (lead) {
        await updateLead(lead.id, formData);
      } else {
        await createLead(formData);
      }
      router.refresh();
      onClose();
    });
  }

  function onDelete() {
    if (!lead) return;
    startTransition(async () => {
      await deleteLead(lead.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit lead" : "New lead"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Business" name="business" defaultValue={lead?.business} required />
            <Field label="Contact name" name="contactName" defaultValue={lead?.contactName} required />
            <Field label="Phone" name="phone" defaultValue={lead?.phone} required />
            <Field label="Email" name="email" defaultValue={lead?.email ?? ""} type="email" />
            <Field label="Website" name="website" defaultValue={lead?.website ?? ""} />
            <Field label="Industry" name="industry" defaultValue={lead?.industry ?? ""} />
            <Field label="Location" name="location" defaultValue={lead?.location ?? ""} />
            <Field label="Source" name="source" defaultValue={lead?.source ?? "Manual"} />
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Status</label>
              <select
                name="status"
                defaultValue={lead?.status ?? "New"}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Next follow-up"
              name="nextFollowUp"
              type="date"
              defaultValue={toInputDate(lead?.nextFollowUp)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Notes</label>
            <textarea
              name="notes"
              defaultValue={lead?.notes ?? ""}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {isEdit && !confirmDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Delete lead
                </button>
              )}
              {isEdit && confirmDelete && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted">Delete this lead?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isPending}
                    className="font-medium text-rose-400 hover:text-rose-300"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-muted hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm text-foreground/80 hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? "Saving…" : isEdit ? "Save changes" : "Add lead"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
      />
    </div>
  );
}
