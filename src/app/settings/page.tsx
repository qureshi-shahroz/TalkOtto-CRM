import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "settings" } });

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5">
        <div className="text-xs uppercase tracking-widest text-muted">Workspace</div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">Your name, company, and daily calling target.</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
