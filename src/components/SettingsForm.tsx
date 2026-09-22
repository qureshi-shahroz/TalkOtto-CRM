"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@prisma/client";
import { updateSettings } from "@/lib/actions";

export function SettingsForm({ settings }: { settings: Settings | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await updateSettings(formData);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Your name</label>
        <input
          name="userName"
          defaultValue={settings?.userName ?? "You"}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Company</label>
        <input
          name="companyName"
          defaultValue={settings?.companyName ?? "Tech House"}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Daily call target</label>
        <input
          type="number"
          name="dailyCallTarget"
          min={1}
          defaultValue={settings?.dailyCallTarget ?? 40}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted">Used for the progress bar in the sidebar and dashboard.</p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="text-xs text-accent">Saved.</span>}
      </div>
    </form>
  );
}
