"use client";

import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function Topbar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q ? `/leads?q=${encodeURIComponent(q)}` : "/leads");
  }

  return (
    <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-8">
      <form onSubmit={onSubmit} className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search leads by business, contact, phone…"
          className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none"
        />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/leads?new=1"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New lead
        </Link>
      </div>
    </header>
  );
}
