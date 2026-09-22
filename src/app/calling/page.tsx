import { prisma } from "@/lib/prisma";
import { CallingWorkspace } from "@/components/CallingWorkspace";

export const dynamic = "force-dynamic";

export default async function CallingPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const { leadId } = await searchParams;

  const [dueLeads, freshLeads, requestedLead] = await Promise.all([
    prisma.lead.findMany({
      where: {
        nextFollowUp: { lte: new Date() },
        status: { notIn: ["Lost", "Customer"] },
      },
      orderBy: { nextFollowUp: "asc" },
    }),
    prisma.lead.findMany({
      where: {
        callsCount: 0,
        status: { notIn: ["Lost", "Customer"] },
      },
      orderBy: { createdAt: "asc" },
    }),
    leadId ? prisma.lead.findUnique({ where: { id: leadId } }) : Promise.resolve(null),
  ]);

  const seen = new Set<string>();
  const queue = [];

  if (requestedLead) {
    queue.push(requestedLead);
    seen.add(requestedLead.id);
  }
  for (const l of [...dueLeads, ...freshLeads]) {
    if (!seen.has(l.id)) {
      seen.add(l.id);
      queue.push(l);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5">
        <div className="text-xs uppercase tracking-widest text-muted">Voxline workspace</div>
        <h1 className="text-2xl font-semibold tracking-tight">Calling</h1>
        <p className="text-sm text-muted">
          Work through today&apos;s queue — overdue follow-ups first, then fresh leads.
        </p>
      </div>
      <CallingWorkspace initialQueue={queue} />
    </div>
  );
}
