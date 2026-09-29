import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, RefreshCw, Folder, CalendarDays, Clock, PhoneCall, AtSign, Users, Headphones } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { clients, tickets } from "@/data/mockData";
import { fmtValue } from "@/lib/format";
import { fmtDate } from "@/lib/dates";

const HEALTH_BADGE = { Healthy: "teal", "Needs Attention": "amber", "At Risk": "rose" };

const TIMELINE_ICON = {
  Meeting: { icon: Users,     color: "#0E7C66" },
  Call:    { icon: PhoneCall, color: "#B7791F" },
  Email:   { icon: AtSign,    color: "#6B7280" },
};

// ── Stat tile ─────────────────────────────────────────────────────────────────

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

// ── Page (server component — no "use client" needed) ─────────────────────────

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
  const client = clients.find((c) => c.id === id);
  if (!client) notFound();

  const openTickets = tickets.filter(
    (t) => t.client === client.name && (t.status === "Open" || t.status === "In Progress")
  ).length;

  return (
    <AppShell>
      <Header
        title={
          <div className="flex items-center gap-2">
            <span>{client.name}</span>
            <Badge variant={HEALTH_BADGE[client.health]}>{client.health}</Badge>
          </div>
        }
        subtitle={client.industry}
        breadcrumbs={[{ label: "Clients", href: "/clients" }, { label: client.name }]}
      />

      {/* Quick stats row */}
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
        {/* Left col: contacts */}
        <div className="lg:col-span-1">
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
        </div>

        {/* Right col: timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
            <h2 className="text-sm font-semibold text-[#171A21] mb-4">Communication Timeline</h2>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3.75 top-2 bottom-2 w-px bg-[#E3E5EA]" />

              <ul className="flex flex-col gap-0">
                {client.timeline.map(({ id, date, type, text }, i) => {
                  const { icon: Icon, color } = TIMELINE_ICON[type] ?? TIMELINE_ICON.Email;
                  return (
                    <li key={id} className={`flex gap-4 ${i < client.timeline.length - 1 ? "pb-5" : ""}`}>
                      {/* Icon node on the line */}
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white"
                        style={{ backgroundColor: `${color}18` }}
                      >
                        <Icon size={13} style={{ color }} strokeWidth={2} />
                      </span>

                      {/* Content */}
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
