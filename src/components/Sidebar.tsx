import Link from "next/link";
import { PhoneCall, LayoutDashboard, Users, Settings, Radio } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/calling", label: "Calling", icon: PhoneCall },
  { href: "/settings", label: "Settings", icon: Settings },
];

export async function Sidebar() {
  const todayStart = startOfDay(new Date());

  const [settings, callsToday] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "settings" } }),
    prisma.callLog.count({ where: { calledAt: { gte: todayStart } } }),
  ]);

  const target = settings?.dailyCallTarget ?? 40;
  const pct = Math.min(100, Math.round((callsToday / Math.max(target, 1)) * 100));

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <PhoneCall className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide">VOXLINE</div>
          <div className="text-[10px] uppercase tracking-widest text-muted">Call command</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2">
        <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-widest text-muted">
          Workspace
        </div>
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <item.icon className="h-4 w-4 text-muted" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="m-3 rounded-xl border border-border bg-surface-2 p-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>Calling target</span>
          <span className="font-medium text-foreground">{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-[11px] text-muted">
          {callsToday} of {target} calls today
        </div>
      </div>

      <div className="m-3 mt-0 flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3">
        <Radio className="h-4 w-4 text-accent" />
        <div className="text-[11px]">
          <div className="font-medium text-foreground">Ready to call</div>
          <div className="text-muted">Local · {settings?.companyName ?? "Tech House"}</div>
        </div>
      </div>
    </aside>
  );
}
