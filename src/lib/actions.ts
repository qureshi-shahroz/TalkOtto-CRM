"use server";

import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import type { CallOutcome } from "@/lib/constants";

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : undefined;
}

function dateOrNull(fd: FormData, key: string): Date | null {
  const v = str(fd, key);
  return v ? new Date(v) : null;
}

export async function createLead(formData: FormData) {
  await prisma.lead.create({
    data: {
      business: str(formData, "business") ?? "Untitled",
      contactName: str(formData, "contactName") ?? "",
      phone: str(formData, "phone") ?? "",
      email: str(formData, "email"),
      website: str(formData, "website"),
      industry: str(formData, "industry"),
      location: str(formData, "location"),
      source: str(formData, "source") ?? "Manual",
      status: str(formData, "status") ?? "New",
      notes: str(formData, "notes"),
      nextFollowUp: dateOrNull(formData, "nextFollowUp"),
    },
  });
  revalidatePath("/leads");
  revalidatePath("/");
  revalidatePath("/calling");
}

export async function updateLead(id: string, formData: FormData) {
  await prisma.lead.update({
    where: { id },
    data: {
      business: str(formData, "business") ?? "Untitled",
      contactName: str(formData, "contactName") ?? "",
      phone: str(formData, "phone") ?? "",
      email: str(formData, "email"),
      website: str(formData, "website"),
      industry: str(formData, "industry"),
      location: str(formData, "location"),
      source: str(formData, "source") ?? "Manual",
      status: str(formData, "status") ?? "New",
      notes: str(formData, "notes"),
      nextFollowUp: dateOrNull(formData, "nextFollowUp"),
    },
  });
  revalidatePath("/leads");
  revalidatePath("/");
  revalidatePath("/calling");
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
  revalidatePath("/");
  revalidatePath("/calling");
}

function deriveStatus(outcome: CallOutcome, currentStatus: string): string {
  if (currentStatus === "Customer") return currentStatus;
  switch (outcome) {
    case "Closed":
      return "Customer";
    case "Not interested":
    case "Wrong number":
      return "Lost";
    case "Interested":
    case "Demo booked":
    case "Follow up":
      return "Qualified";
    default:
      return currentStatus === "New" ? "Nurture" : currentStatus;
  }
}

export async function logCall(input: {
  leadId: string;
  outcome: CallOutcome;
  notes?: string;
  nextFollowUp?: string | null;
}) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: input.leadId } });

  await prisma.callLog.create({
    data: {
      leadId: input.leadId,
      outcome: input.outcome,
      notes: input.notes || null,
    },
  });

  await prisma.lead.update({
    where: { id: input.leadId },
    data: {
      callStatus: input.outcome,
      callsCount: { increment: 1 },
      lastCalledAt: new Date(),
      nextFollowUp: input.nextFollowUp ? new Date(input.nextFollowUp) : null,
      status: deriveStatus(input.outcome, lead.status),
      notes: input.notes || lead.notes,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/");
  revalidatePath("/calling");
}

export async function updateSettings(formData: FormData) {
  const dailyCallTarget = Number(str(formData, "dailyCallTarget") ?? "40");
  await prisma.settings.upsert({
    where: { id: "settings" },
    update: {
      userName: str(formData, "userName") ?? "You",
      companyName: str(formData, "companyName") ?? "Tech House",
      dailyCallTarget: Number.isFinite(dailyCallTarget) ? dailyCallTarget : 40,
    },
    create: {
      id: "settings",
      userName: str(formData, "userName") ?? "You",
      companyName: str(formData, "companyName") ?? "Tech House",
      dailyCallTarget: Number.isFinite(dailyCallTarget) ? dailyCallTarget : 40,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/");
}

// RFC-4180-ish CSV parser: handles quoted fields, embedded commas, escaped quotes ("").
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim().length > 0)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.trim().length > 0)) rows.push(row);
  }

  return rows;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

// Checked in this order; a header is claimed by the first field whose keyword it contains
// (not exact-match — "Org Name" should still hit "org", "Point of Contact" should hit "contact").
// firstName/lastName are checked before contactName's broad "name" so "First Name"/"Last Name"
// don't get swallowed by it; contactName's own list stays specific for the same reason.
const FIELD_KEYWORDS: [string, string[]][] = [
  ["business", ["company", "business", "organization", "organisation", "org", "account", "employer", "firm", "vendor", "client"]],
  ["firstName", ["firstname", "fname"]],
  ["lastName", ["lastname", "lname", "surname"]],
  ["contactName", ["contactname", "fullname", "leadname", "personname", "owner", "manager", "poc", "pointofcontact", "decisionmaker", "representative", "contact", "name"]],
  ["phone", ["phone", "mobile", "cell", "telephone", "tel"]],
  ["email", ["email", "mail"]],
  ["website", ["website", "domain", "url", "site", "web"]],
  ["industry", ["industry", "sector", "category", "vertical", "niche"]],
  ["location", ["location", "city", "address", "region", "state"]],
  ["source", ["source", "channel"]],
  ["notes", ["note", "comment", "description", "remark"]],
];

function cellToString(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((t) => t.text).join("");
    if ("text" in v) return String(v.text ?? "");
    if ("result" in v) return String(v.result ?? "");
  }
  return String(v).trim();
}

async function parseXlsxRows(buffer: ArrayBuffer): Promise<string[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const rows: string[][] = [];
  sheet.eachRow((row) => {
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => cells.push(cellToString(cell.value)));
    if (cells.some((c) => c.trim().length > 0)) rows.push(cells);
  });
  return rows;
}

function rowsToRecords(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];

  const rawHeaders = rows[0].map(normalizeHeader);
  // Greedy, priority-ordered, substring match: each header can be claimed by only one
  // field, and once claimed it's skipped for the rest — so "Org Name" and "Owner" both
  // land correctly even though only one of them is an exact keyword ("org" vs "owner").
  const fieldIndex: Record<string, number> = {};
  const claimed = new Set<number>();
  for (const [field, keywords] of FIELD_KEYWORDS) {
    const idx = rawHeaders.findIndex(
      (h, i) => !claimed.has(i) && keywords.some((kw) => h.includes(kw))
    );
    if (idx !== -1) {
      fieldIndex[field] = idx;
      claimed.add(idx);
    }
  }

  return rows.slice(1).map((cells) => {
    const get = (field: string) => {
      const idx = fieldIndex[field];
      return idx === undefined ? "" : (cells[idx] ?? "").trim();
    };
    const contactName =
      get("contactName") || [get("firstName"), get("lastName")].filter(Boolean).join(" ");
    return {
      business: get("business"),
      contactName,
      phone: get("phone"),
      email: get("email"),
      website: get("website"),
      industry: get("industry"),
      location: get("location"),
      source: get("source"),
      notes: get("notes"),
    };
  });
}

export async function importLeadsFile(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { imported: 0, total: 0, skipped: 0, headers: [] as string[] };
  }

  const name = file.name.toLowerCase();
  const rows = name.endsWith(".xlsx") || name.endsWith(".xlsm")
    ? await parseXlsxRows(await file.arrayBuffer())
    : parseCsvRows(await file.text());

  const records = rowsToRecords(rows);
  const usable = records.filter((r) => r.business || r.contactName);

  const data = usable.map((r) => ({
    business: r.business || r.contactName || "Untitled",
    contactName: r.contactName || "",
    phone: r.phone || "",
    email: r.email || undefined,
    website: r.website || undefined,
    industry: r.industry || undefined,
    location: r.location || undefined,
    source: r.source || "Import",
    notes: r.notes || undefined,
    status: "New",
  }));

  if (data.length) {
    await prisma.lead.createMany({ data });
  }

  revalidatePath("/leads");
  revalidatePath("/");
  revalidatePath("/calling");
  return {
    imported: data.length,
    total: records.length,
    skipped: records.length - usable.length,
    headers: rows[0] ?? [],
  };
}
