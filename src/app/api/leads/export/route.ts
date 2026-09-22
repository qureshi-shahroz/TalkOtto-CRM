import { prisma } from "@/lib/prisma";

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { business: "asc" } });

  const headers = [
    "business",
    "contactName",
    "phone",
    "email",
    "website",
    "industry",
    "location",
    "source",
    "status",
    "callStatus",
    "callsCount",
    "lastCalledAt",
    "nextFollowUp",
    "notes",
  ];

  const rows = leads.map((l) =>
    headers
      .map((h) => csvEscape((l as unknown as Record<string, unknown>)[h]))
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-export.csv"`,
    },
  });
}
