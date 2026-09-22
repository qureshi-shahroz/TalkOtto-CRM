-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "business" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "callStatus" TEXT NOT NULL DEFAULT 'Not called',
    "callsCount" INTEGER NOT NULL DEFAULT 0,
    "lastCalledAt" TIMESTAMP(3),
    "nextFollowUp" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "notes" TEXT,
    "calledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'settings',
    "userName" TEXT NOT NULL DEFAULT 'You',
    "companyName" TEXT NOT NULL DEFAULT 'Tech House',
    "dailyCallTarget" INTEGER NOT NULL DEFAULT 40,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
