import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  await prisma.callLog.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.settings.deleteMany();

  await prisma.settings.create({
    data: { id: "settings", userName: "You", companyName: "Tech House", dailyCallTarget: 40 },
  });

  const leads = [
    {
      business: "Atlas Security",
      contactName: "Leo Foster",
      phone: "+1 (555) 223-2311",
      email: "leo.foster@atlassecurity.com",
      website: "atlassecurity.com",
      industry: "Cybersecurity",
      location: "San Jose, CA",
      source: "Website",
      status: "Qualified",
      callStatus: "Demo booked",
      callsCount: 4,
      lastCalledAt: daysAgo(1),
      nextFollowUp: daysFromNow(2),
      notes: "Asked for pricing details",
    },
    {
      business: "Beacon Legal",
      contactName: "Olivia Scott",
      phone: "+1 (555) 220-2200",
      email: "olivia.scott@beaconlegal.com",
      website: "beaconlegal.com",
      industry: "Legal",
      location: "Philadelphia, PA",
      source: "LinkedIn",
      status: "Qualified",
      callStatus: "Connected",
      callsCount: 4,
      lastCalledAt: daysAgo(2),
      nextFollowUp: null,
      notes: "Decision maker confirmed",
    },
    {
      business: "Brightline Media",
      contactName: "Ethan Cole",
      phone: "+1 (555) 213-1941",
      email: "ethan.cole@brightlinemedia.com",
      website: "brightlinemedia.com",
      industry: "Marketing",
      location: "New York, NY",
      source: "Website",
      status: "Qualified",
      callStatus: "Demo booked",
      callsCount: 1,
      lastCalledAt: daysAgo(3),
      nextFollowUp: daysFromNow(1),
      notes: "Asked for pricing details",
    },
    {
      business: "Cedar & Co.",
      contactName: "Henry Brooks",
      phone: "+1 (555) 217-2089",
      email: "henry.brooks@cedarco.com",
      website: "cedarco.com",
      industry: "Real Estate",
      location: "Miami, FL",
      source: "Referral",
      status: "Nurture",
      callStatus: "No answer",
      callsCount: 4,
      lastCalledAt: daysAgo(0),
      nextFollowUp: daysFromNow(3),
      notes: "Try again in the afternoon",
    },
    {
      business: "Clearview Data",
      contactName: "Grace Kim",
      phone: "+1 (555) 226-2422",
      email: "grace.kim@clearviewdata.com",
      website: "clearviewdata.com",
      industry: "Analytics",
      location: "San Diego, CA",
      source: "Apollo",
      status: "New",
      callStatus: "Follow up",
      callsCount: 4,
      lastCalledAt: daysAgo(0),
      nextFollowUp: daysFromNow(4),
      notes: "Decision maker confirmed",
    },
    {
      business: "Fathom Health",
      contactName: "Mia Chen",
      phone: "+1 (555) 212-1904",
      email: "mia.chen@fathomhealth.com",
      website: "fathomhealth.com",
      industry: "Healthcare",
      location: "Boston, MA",
      source: "Referral",
      status: "Nurture",
      callStatus: "No answer",
      callsCount: 7,
      lastCalledAt: daysAgo(3),
      nextFollowUp: null,
      notes: "Decision maker confirmed",
    },
    {
      business: "Fieldstone Finance",
      contactName: "Lucas Martin",
      phone: "+1 (555) 215-2015",
      email: "lucas.martin@fieldstonefinance.com",
      website: "fieldstonefinance.com",
      industry: "Fintech",
      location: "Charlotte, NC",
      source: "LinkedIn",
      status: "Qualified",
      callStatus: "Connected",
      callsCount: 7,
      lastCalledAt: daysAgo(1),
      nextFollowUp: daysFromNow(6),
      notes: "Asked for pricing details",
    },
    {
      business: "Harbor Insurance",
      contactName: "Daniel Evans",
      phone: "+1 (555) 227-2459",
      email: "daniel.evans@harborinsurance.com",
      website: "harborinsurance.com",
      industry: "Insurance",
      location: "Tampa, FL",
      source: "Referral",
      status: "Nurture",
      callStatus: "No answer",
      callsCount: 7,
      lastCalledAt: daysAgo(0),
      nextFollowUp: daysFromNow(1),
      notes: "Asked for pricing details",
    },
    {
      business: "Ironclad Manufacturing",
      contactName: "Ava Patel",
      phone: "+1 (555) 231-3312",
      email: "ava.patel@ironcladmfg.com",
      website: "ironcladmfg.com",
      industry: "Manufacturing",
      location: "Detroit, MI",
      source: "Cold list",
      status: "New",
      callStatus: "Not called",
      callsCount: 0,
      lastCalledAt: null,
      nextFollowUp: null,
      notes: null,
    },
    {
      business: "Juniper Logistics",
      contactName: "Noah Reyes",
      phone: "+1 (555) 233-3390",
      email: "noah.reyes@juniperlogistics.com",
      website: "juniperlogistics.com",
      industry: "Logistics",
      location: "Denver, CO",
      source: "Cold list",
      status: "New",
      callStatus: "Not called",
      callsCount: 0,
      lastCalledAt: null,
      nextFollowUp: null,
      notes: null,
    },
    {
      business: "Kestrel Ventures",
      contactName: "Sophia Turner",
      phone: "+1 (555) 240-1188",
      email: "sophia.turner@kestrelvc.com",
      website: "kestrelvc.com",
      industry: "Finance",
      location: "Austin, TX",
      source: "Website",
      status: "Lost",
      callStatus: "Not interested",
      callsCount: 3,
      lastCalledAt: daysAgo(9),
      nextFollowUp: null,
      notes: "Went with a competitor",
    },
    {
      business: "Lighthouse Retail",
      contactName: "Ben Okafor",
      phone: "+1 (555) 244-7723",
      email: "ben.okafor@lighthouseretail.com",
      website: "lighthouseretail.com",
      industry: "Retail",
      location: "Chicago, IL",
      source: "LinkedIn",
      status: "Customer",
      callStatus: "Closed",
      callsCount: 6,
      lastCalledAt: daysAgo(14),
      nextFollowUp: null,
      notes: "Signed annual plan",
    },
  ];

  for (const lead of leads) {
    const created = await prisma.lead.create({ data: lead });

    if (created.callsCount > 0) {
      const logCount = Math.min(created.callsCount, 4);
      for (let i = 0; i < logCount; i++) {
        await prisma.callLog.create({
          data: {
            leadId: created.id,
            outcome: i === logCount - 1 ? created.callStatus : "No answer",
            notes: i === logCount - 1 ? created.notes : null,
            calledAt: daysAgo(logCount - i),
          },
        });
      }
    }
  }

  console.log(`Seeded ${leads.length} leads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
