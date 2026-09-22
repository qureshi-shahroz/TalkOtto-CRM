import { prisma } from "@/lib/prisma";
import { LeadsTable } from "@/components/LeadsTable";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; callStatus?: string; new?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();
  const status = params.status;
  const callStatus = params.callStatus;
  const openNew = params.new === "1";

  const where: Prisma.LeadWhereInput = {
    AND: [
      status ? { status } : {},
      callStatus ? { callStatus } : {},
      q
        ? {
            OR: [
              { business: { contains: q, mode: "insensitive" } },
              { contactName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { email: { contains: q, mode: "insensitive" } },
              { industry: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5">
        <div className="text-xs uppercase tracking-widest text-muted">Prospect database</div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted">Manage, qualify, and call your complete pipeline.</p>
      </div>
      <LeadsTable leads={leads} query={{ q, status, callStatus }} openNew={openNew} />
    </div>
  );
}
