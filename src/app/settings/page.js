"use client";

import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Mail, CalendarDays, Calculator, MessagesSquare, PenLine } from "lucide-react";

const INTEGRATIONS = [
  {
    name: "Email",
    providers: "Gmail / Outlook",
    description: "Link email conversations with your clients and deals.",
    icon: Mail,
  },
  {
    name: "Calendar",
    providers: "Google Calendar / Outlook Calendar",
    description: "Keep client meetings and follow-ups in sync.",
    icon: CalendarDays,
  },
  {
    name: "Accounting",
    providers: "Tally / Zoho Books / QuickBooks",
    description: "Send invoices and payment details to your books.",
    icon: Calculator,
  },
  {
    name: "Team chat",
    providers: "Slack / Microsoft Teams",
    description: "Share important client and project updates with your team.",
    icon: MessagesSquare,
  },
  {
    name: "E-signature",
    providers: "DocuSign / Zoho Sign",
    description: "Send proposals and contracts for electronic signature.",
    icon: PenLine,
  },
];

function formatRole(role) {
  if (!role) return "";
  return role
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();

  return (
    <AppShell>
      <Header title="Settings" subtitle="Account settings and preferences" />

      <div className="flex flex-col gap-4">
        <section className="rounded-lg border border-[#E3E5EA] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#171A21]">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280]">Name</p>
              <p className="mt-1 text-sm font-medium text-[#171A21]">{user?.name ?? "Not available"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280]">Email</p>
              <p className="mt-1 text-sm font-medium text-[#171A21]">{user?.email ?? "Not available"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280]">Role</p>
              <p className="mt-1 text-sm font-medium text-[#171A21]">{formatRole(user?.role) || "Not available"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#E3E5EA] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#171A21]">Preferences</h2>
          <p className="mt-3 text-sm text-[#6B7280]">Coming soon</p>
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-[#171A21]">Integrations</h2>
            <p className="mt-1 text-xs text-[#6B7280]">Connect the tools your team already uses.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {INTEGRATIONS.map(({ name, providers, description, icon: Icon }) => (
              <article key={name} className="flex min-w-0 flex-col rounded-lg border border-[#E3E5EA] bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#F5F6F8] text-[#0E7C66]">
                    <Icon size={17} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#171A21]">{name}</h3>
                    <p className="mt-0.5 text-xs text-[#6B7280]">{providers}</p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[#6B7280]">{description}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 self-start"
                  onClick={() => toast({ message: "This will connect once the backend is ready." })}
                >
                  Connect
                </Button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
