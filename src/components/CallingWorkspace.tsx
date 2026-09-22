"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@prisma/client";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  SkipForward,
  PartyPopper,
  Clock,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { logCall } from "@/lib/actions";
import { CALL_OUTCOMES, type CallOutcome } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

const OUTCOME_FOLLOWUP_DAYS: Partial<Record<CallOutcome, number>> = {
  "No answer": 1,
  Voicemail: 2,
  Interested: 3,
  "Demo booked": 1,
  "Follow up": 3,
};

function defaultFollowUp(outcome: CallOutcome | null): string {
  if (!outcome) return "";
  const days = OUTCOME_FOLLOWUP_DAYS[outcome];
  if (!days) return "";
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function CallingWorkspace({ initialQueue }: { initialQueue: Lead[] }) {
  const router = useRouter();
  const [queue, setQueue] = useState(initialQueue);
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [isPending, startTransition] = useTransition();
  const [session, setSession] = useState<{ business: string; outcome: string }[]>([]);

  const current = queue[0];

  const dueVsFresh = useMemo(() => {
    if (!current) return null;
    return current.callsCount === 0 ? "First contact" : "Follow-up";
  }, [current]);

  function handleOutcome(outcome: CallOutcome) {
    if (!current || isPending) return;
    startTransition(async () => {
      await logCall({
        leadId: current.id,
        outcome,
        notes: notes || undefined,
        nextFollowUp: followUp || null,
      });
      setSession((s) => [{ business: current.business, outcome }, ...s].slice(0, 8));
      setQueue((q) => q.slice(1));
      setNotes("");
      setFollowUp("");
      router.refresh();
    });
  }

  function skip() {
    setQueue((q) => [...q.slice(1), q[0]].filter(Boolean));
    setNotes("");
    setFollowUp("");
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-20 text-center">
        <PartyPopper className="mb-3 h-8 w-8 text-accent" />
        <h2 className="text-lg font-semibold">Queue clear</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">
          No overdue follow-ups or fresh leads right now. Add more leads or check back once a
          follow-up date arrives.
        </p>
        {session.length > 0 && <SessionSummary session={session} />}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between text-xs text-muted">
          <span>
            Lead 1 of {queue.length} in queue{" "}
            {dueVsFresh && <span className="text-accent">· {dueVsFresh}</span>}
          </span>
          <button
            onClick={skip}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-foreground/70 hover:bg-surface-2"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Skip
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-4 w-4 text-muted" />
                {current.business}
              </div>
              <div className="text-sm text-muted">{current.contactName}</div>
            </div>
            <div className="flex gap-2">
              <StatusBadge value={current.status} kind="status" />
              <StatusBadge value={current.callStatus} kind="outcome" />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <a
              href={`tel:${current.phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-accent hover:opacity-90"
            >
              <Phone className="h-4 w-4" />
              {current.phone}
            </a>
            {current.email && (
              <a
                href={`mailto:${current.email}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground/80 hover:bg-surface-2"
              >
                <Mail className="h-4 w-4 text-muted" />
                {current.email}
              </a>
            )}
            {current.website && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground/80">
                <Globe className="h-4 w-4 text-muted" />
                {current.website}
              </div>
            )}
            {current.location && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground/80">
                <MapPin className="h-4 w-4 text-muted" />
                {current.location}
              </div>
            )}
          </div>

          {current.notes && (
            <div className="mb-5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground/80">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                Previous notes
              </span>
              <p className="mt-1">{current.notes}</p>
            </div>
          )}

          <div className="mb-5 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Last called {formatDate(current.lastCalledAt)}
            </span>
            <span>{current.callsCount} calls so far</span>
            {current.industry && <span>{current.industry}</span>}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-muted">Call notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What did they say? Any objections, pricing questions, next steps…"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm placeholder:text-muted focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1 block text-xs font-medium text-muted">
              Next follow-up (optional)
            </label>
            <input
              type="date"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Log outcome
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CALL_OUTCOMES.map((outcome) => (
                <button
                  key={outcome}
                  disabled={isPending}
                  onClick={() => {
                    if (!followUp) setFollowUp(defaultFollowUp(outcome));
                    handleOutcome(outcome);
                  }}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground/85 transition hover:border-accent/50 hover:text-accent disabled:opacity-50"
                >
                  {outcome}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold">Up next</h3>
          <ul className="space-y-2">
            {queue.slice(1, 6).map((l) => (
              <li key={l.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-foreground/80">{l.business}</span>
                <span className="ml-2 shrink-0 text-xs text-muted">
                  {l.callsCount === 0 ? "New" : formatDate(l.nextFollowUp)}
                </span>
              </li>
            ))}
            {queue.length <= 1 && <li className="text-sm text-muted">Nothing else queued.</li>}
          </ul>
        </div>

        {session.length > 0 && <SessionSummary session={session} />}
      </div>
    </div>
  );
}

function SessionSummary({ session }: { session: { business: string; outcome: string }[] }) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-4 text-left">
      <h3 className="mb-3 text-sm font-semibold">This session</h3>
      <ul className="space-y-2 text-sm">
        {session.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-2">
            <span className="truncate text-foreground/80">{s.business}</span>
            <StatusBadge value={s.outcome} kind="outcome" />
          </li>
        ))}
      </ul>
      <div className="mt-3 text-xs text-muted">{formatDateTime(new Date())}</div>
    </div>
  );
}
