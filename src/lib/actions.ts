"use server";

import { revalidatePath } from "next/cache";
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

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

export async function importLeadsCsv(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) return { imported: 0 };

  const text = await file.text();
  const rows = parseCsv(text);

  const data = rows
    .filter((r) => r.business || r.contactname)
    .map((r) => ({
      business: r.business || "Untitled",
      contactName: r.contactname || r["contact name"] || "",
      phone: r.phone || "",
      email: r.email || undefined,
      website: r.website || undefined,
      industry: r.industry || undefined,
      location: r.location || undefined,
      source: r.source || "Import",
      status: "New",
    }));

  if (data.length) {
    await prisma.lead.createMany({ data });
  }

  revalidatePath("/leads");
  revalidatePath("/");
  revalidatePath("/calling");
  return { imported: data.length };
}
