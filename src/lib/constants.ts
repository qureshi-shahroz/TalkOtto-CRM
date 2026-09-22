export const LEAD_STATUSES = ["New", "Qualified", "Nurture", "Customer", "Lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const CALL_OUTCOMES = [
  "No answer",
  "Voicemail",
  "Wrong number",
  "Connected",
  "Not interested",
  "Interested",
  "Demo booked",
  "Follow up",
  "Closed",
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

export const CONNECTED_OUTCOMES: CallOutcome[] = [
  "Connected",
  "Not interested",
  "Interested",
  "Demo booked",
  "Follow up",
  "Closed",
];

export const STATUS_COLORS: Record<string, string> = {
  New: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Qualified: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Nurture: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Customer: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Lost: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export const OUTCOME_COLORS: Record<string, string> = {
  "Not called": "bg-slate-500/15 text-slate-300 border-slate-500/30",
  "No answer": "bg-slate-500/15 text-slate-300 border-slate-500/30",
  Voicemail: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "Wrong number": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  Connected: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  "Not interested": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  Interested: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Demo booked": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "Follow up": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Closed: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
};
