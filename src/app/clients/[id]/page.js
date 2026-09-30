import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, Mail, RefreshCw, Folder, CalendarDays, Clock, PhoneCall, AtSign, Users, Headphones, FileText } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { clients, contracts, tickets } from "@/data/mockData";
import { fmtValue } from "@/lib/format";
import { fmtDate, daysUntil } from "@/lib/dates";
import { getClientHealth } from "@/lib/clientHealth";

const HEALTH_BADGE = { Healthy: "teal", "Needs Attention": "amber", "At Risk": "rose" };
const CONTRACT_BADGE = { Active: "teal", Expiring: "amber", Renewed: "bluegrey", Expired: "rose" };

const TIMELINE_ICON = {
  Meeting: { icon: Users,     color: "#0E7C66" },
  Call:    { icon: PhoneCall, color: "#B7791F" },
  Email:   { icon: AtSign,    color: "#6B7280" },
};

function StatTile({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="bg-white border border-[#E3E5EA] rounded-lg px-4 py-3.5 flex items-center gap-3">
      <span className="w-8 h-8 rounded bg-[#F5F6F8] flex items-center justify-center shrink-0">
        <Icon size={15} className="text-[#6B7280]" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-[#6B7280]">{label}</p>
        <p className={`text-sm font-semibold text-[#171A21] mt-0.5 ${mono ? "font-mono-data" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
  const client = clients.find((c) => c.id === id);
  if (!client) notFound();
  const health = getClientHealth(client);
  const contract = contracts.find((item) => item.clientId === client.id);

  const openTickets = tickets.filter(
    (t) => t.client === client.name && (t.status === "Open" || t.status === "In Progress")
  ).length;
  const renewalDays = contract ? daysUntil(contract.renewalDate) : null;
  const renewalColor = renewalDays < 0
    ? "text-[#B3413A]"
    : renewalDays < 60
      ? "text-[#B7791F]"
      : "text-[#6B7280]";
  const renewalLabel = renewalDays === null
    ? "No renewal date"
    : renewalDays < 0
      ? `${Math.abs(renewalDays)} days past renewal`
      : renewalDays === 0
        ? "Renewal due today"
        : `${renewalDays} days until renewal`;

  return (
    <AppShell>
      <Header
        title={
          <div className="flex items-center gap-2">
            <span>{client.name}</span>
            <Badge variant={HEALTH_BADGE[health.status]}>{health.status}</Badge>
          </div>
        }
        subtitle={client.industry}
        breadcrumbs={[{ label: "Clients", href: "/clients" }, { label: client.name }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
        <StatTile icon={Folder}      label="Active Projects"  value={`${client.activeProjects} project${client.activeProjects !== 1 ? "s" : ""}`} />
        <StatTile icon={RefreshCw}   label="Contract Value"   value={fmtValue(client.contractValue)} mono />
        <StatTile icon={CalendarDays} label="Renewal Date"    value={fmtDate(client.renewalDate)} />
        <StatTile icon={Clock}       label="Client Since"     value={fmtDate(client.clientSince)} />
        <Link href={`/tickets?client=${encodeURIComponent(client.name)}`} className="block">
          <StatTile icon={Headphones} label="Open Tickets" value={`${openTickets} ticket${openTickets !== 1 ? "s" : ""}`} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
            <h2 className="text-sm font-semibold text-[#171A21] mb-4">Primary Contact</h2>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#0E7C66]/12 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-[#0E7C66]">
                  {client.contact.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171A21]">{client.contact.name}</p>
                <p className="text-xs text-[#6B7280]">{client.contact.role}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={`mailto:${client.contact.email}`}
                className="flex items-center gap-2.5 text-sm text-[#6B7280] hover:text-[#0E7C66] transition-colors group"
              >
                <Mail size={13} strokeWidth={1.8} className="shrink-0 group-hover:text-[#0E7C66]" />
                <span className="truncate">{client.contact.email}</span>
              </a>
              <a
                href={`tel:${client.contact.phone}`}
                className="flex items-center gap-2.5 text-sm text-[#6B7280] hover:text-[#0E7C66] transition-colors group"
              >
                <Phone size={13} strokeWidth={1.8} className="shrink-0 group-hover:text-[#0E7C66]" />
                <span className="font-mono-data">{client.contact.phone}</span>
              </a>
            </div>
          </div>

          {contract && (
            <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
              <h2 className="text-sm font-semibold text-[#171A21] mb-4 flex items-center gap-2">
                <FileText size={14} strokeWidth={1.8} className="text-[#6B7280]" />
                Contract
              </h2>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs font-mono-data text-[#6B7280]">{contract.id}</span>
                <Badge variant={CONTRACT_BADGE[contract.status] ?? "muted"}>{contract.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-xs text-[#6B7280]">Value</p>
                  <p className="text-sm font-semibold font-mono-data text-[#171A21] mt-1">{fmtValue(contract.value)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Renewal date</p>
                  <p className="text-sm font-medium text-[#171A21] mt-1">{fmtDate(contract.renewalDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Start date</p>
                  <p className="text-sm font-medium text-[#171A21] mt-1">{fmtDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">End date</p>
                  <p className="text-sm font-medium text-[#171A21] mt-1">{fmtDate(contract.endDate)}</p>
                </div>
              </div>
              <p className={`text-xs font-medium mt-4 pt-3 border-t border-[#E3E5EA] ${renewalColor}`}>
                {renewalLabel}
              </p>
              <p className="text-xs text-[#6B7280] mt-2">{contract.note}</p>
            </div>
          )}

          <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
            <h2 className="text-sm font-semibold text-[#171A21] mb-3">Health factors</h2>
            {health.factors.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {health.factors.map((factor) => (
                  <li key={factor} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#B7791F] shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#6B7280]">No current factors need attention.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
            <h2 className="text-sm font-semibold text-[#171A21] mb-4">Communication Timeline</h2>

            <div className="relative">
              <div className="absolute left-3.75 top-2 bottom-2 w-px bg-[#E3E5EA]" />

              <ul className="flex flex-col gap-0">
                {client.timeline.map(({ id, date, type, text }, i) => {
                  const { icon: Icon, color } = TIMELINE_ICON[type] ?? TIMELINE_ICON.Email;
                  return (
                    <li key={id} className={`flex gap-4 ${i < client.timeline.length - 1 ? "pb-5" : ""}`}>
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white"
                        style={{ backgroundColor: `${color}18` }}
                      >
                        <Icon size={13} style={{ color }} strokeWidth={2} />
                      </span>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-[#171A21]">{type}</span>
                          <span className="text-xs text-[#6B7280]">·</span>
                          <span className="text-xs text-[#6B7280]">{date}</span>
                        </div>
                        <p className="text-sm text-[#6B7280] leading-relaxed">{text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
