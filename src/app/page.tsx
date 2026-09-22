import { prisma } from "@/lib/prisma";
import { daysAgo, startOfDay } from "@/lib/utils";
import { CONNECTED_OUTCOMES } from "@/lib/constants";
import { StatCard } from "@/components/StatCard";
import { CallsChart } from "@/components/CallsChart";
import { OutcomesDonut } from "@/components/OutcomesDonut";
import { Funnel } from "@/components/Funnel";
import {
  Users,
  PhoneCall,
  PhoneOutgoing,
  CalendarDays,
  Handshake,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CONNECTED_SET = new Set<string>(CONNECTED_OUTCOMES);
const isConnected = (outcome: string) => CONNECTED_SET.has(outcome);

export default async function DashboardPage() {
  const [leads, callLogs, settings] = await Promise.all([
    prisma.lead.findMany(),
    prisma.callLog.findMany({ orderBy: { calledAt: "asc" } }),
    prisma.settings.findUnique({ where: { id: "settings" } }),
  ]);

  const todayStart = startOfDay(new Date());
  const weekStart = daysAgo(6);

  const totalLeads = leads.length;
  const totalCalls = callLogs.length;
  const callsToday = callLogs.filter((c) => c.calledAt >= todayStart).length;
  const callsThisWeek = callLogs.filter((c) => c.calledAt >= weekStart).length;
  const connectedCalls = callLogs.filter((c) => isConnected(c.outcome)).length;
  const demosBooked = leads.filter((l) => l.callStatus === "Demo booked" || l.status === "Customer").length;
  const closedWon = leads.filter((l) => l.status === "Customer").length;
  const conversionRate = totalLeads ? Math.round((closedWon / totalLeads) * 1000) / 10 : 0;
  const target = settings?.dailyCallTarget ?? 40;

  // Calls over last 14 days
  const days: { label: string; calls: number; connected: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = daysAgo(i);
    const next = daysAgo(i - 1);
    const dayLogs = callLogs.filter((c) => c.calledAt >= d && c.calledAt < next);
    days.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      calls: dayLogs.length,
      connected: dayLogs.filter((c) => isConnected(c.outcome)).length,
    });
  }

  // Outcome breakdown
  const outcomeCounts = new Map<string, number>();
  for (const c of callLogs) outcomeCounts.set(c.outcome, (outcomeCounts.get(c.outcome) ?? 0) + 1);
  const outcomeData = Array.from(outcomeCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Funnel (based on current lead state)
  const called = leads.filter((l) => l.callsCount > 0).length;
  const connectedLeads = leads.filter((l) => isConnected(l.callStatus)).length;
  const interestedLeads = leads.filter((l) =>
    ["Interested", "Demo booked", "Follow up", "Closed"].includes(l.callStatus) || l.status === "Customer"
  ).length;
  const demoBookedLeads = leads.filter((l) => l.callStatus === "Demo booked" || l.status === "Customer").length;

  const funnelSteps = [
    { label: "Total leads", value: totalLeads },
    { label: "Called", value: called },
    { label: "Connected", value: connectedLeads },
    { label: "Interested", value: interestedLeads },
    { label: "Demo booked", value: demoBookedLeads },
    { label: "Closed / won", value: closedWon },
  ];

  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);
  const dueToday = leads.filter((l) => l.nextFollowUp && l.nextFollowUp <= todayEnd);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-1">
        <div className="text-xs uppercase tracking-widest text-muted">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Good {greeting()}, {settings?.userName ?? "there"}.
        </h1>
        <p className="text-sm text-muted">
          {callsToday >= target
            ? `You hit your daily target — ${callsToday} of ${target} calls made today.`
            : `${target - callsToday} calls left to hit today's target of ${target}.`}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/calling"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          <PhoneCall className="h-4 w-4" />
          Start calling
        </Link>
        {dueToday.length > 0 && (
          <Link
            href="/calling"
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground/85 hover:bg-surface-2"
          >
            <CalendarDays className="h-4 w-4 text-accent" />
            {dueToday.length} follow-up{dueToday.length === 1 ? "" : "s"} due today
          </Link>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total leads" value={totalLeads} icon={Users} />
        <StatCard label="Total calls" value={totalCalls} icon={PhoneOutgoing} />
        <StatCard label="Calls today" value={callsToday} icon={PhoneCall} accent hint={`Target ${target}`} />
        <StatCard label="Calls this week" value={callsThisWeek} icon={CalendarDays} />
        <StatCard label="Connected" value={connectedCalls} icon={Handshake} />
        <StatCard label="Demos booked" value={demosBooked} icon={Video} />
        <StatCard label="Closed / won" value={closedWon} icon={Target} accent />
        <StatCard label="Conversion rate" value={`${conversionRate}%`} icon={TrendingUp} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Calls over time</h2>
          <p className="mb-2 text-xs text-muted">Last 14 days · total vs. connected</p>
          <CallsChart data={days} />
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Call outcomes</h2>
          <p className="mb-4 text-xs text-muted">{totalCalls} calls analyzed</p>
          {outcomeData.length ? (
            <OutcomesDonut data={outcomeData} />
          ) : (
            <p className="py-8 text-center text-sm text-muted">No calls logged yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Conversion funnel</h2>
          <p className="mb-4 text-xs text-muted">Lead-to-close progression</p>
          <Funnel steps={funnelSteps} />
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Pipeline by status</h2>
          <p className="mb-4 text-xs text-muted">Where your leads currently sit</p>
          <div className="space-y-3">
            {["New", "Nurture", "Qualified", "Customer", "Lost"].map((status) => {
              const count = leads.filter((l) => l.status === status).length;
              const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="text-foreground/85">{status}</span>
                    <span className="text-muted">
                      <span className="font-medium text-foreground">{count}</span> ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-accent/70" style={{ width: `${Math.max(pct, count ? 3 : 0)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
