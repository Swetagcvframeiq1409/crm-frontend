"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Headphones, Circle, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SlideOver from "@/components/ui/SlideOver";
import EmptyState from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { tickets as allTickets } from "@/data/mockData";
import { fmtDate } from "@/lib/dates";

// ── SLA helpers ───────────────────────────────────────────────────────────────

/** Returns true when the SLA deadline has passed and the ticket is still active. */
function isSlaBreached(ticket) {
  if (ticket.status === "Resolved" || ticket.status === "Closed") return false;
  const deadline = new Date(ticket.createdDate).getTime() + ticket.slaHours * 3_600_000;
  return Date.now() > deadline;
}

/** Deadline as a Date object. */
function slaDeadline(ticket) {
  return new Date(new Date(ticket.createdDate).getTime() + ticket.slaHours * 3_600_000);
}

/** Hours between two ISO/Date values, rounded to 1 dp. */
function hoursBetween(a, b) {
  return Math.abs(new Date(b) - new Date(a)) / 3_600_000;
}

// ── Badge maps ────────────────────────────────────────────────────────────────

const PRIORITY_VARIANT = {
  Low:    "muted",
  Medium: "amber",
  High:   "rose",
  Urgent: "rose",
};

const STATUS_VARIANT = {
  "Open":              "amber",
  "In Progress":       "teal",
  "Waiting on Client": "bluegrey",
  "Resolved":          "teal",
  "Closed":            "muted",
};

// ── Stat tile (no sparkline — same pattern as client detail) ──────────────────

function StatTile({ icon: Icon, label, value, iconColor = "#6B7280", valueColor }) {
  return (
    <div className="bg-white border border-[#E3E5EA] rounded-lg px-4 py-3.5 flex items-center gap-3">
      <span className="w-8 h-8 rounded bg-[#F5F6F8] flex items-center justify-center shrink-0">
        <Icon size={15} strokeWidth={1.8} style={{ color: iconColor }} />
      </span>
      <div>
        <p className="text-xs text-[#6B7280]">{label}</p>
        <p
          className="text-sm font-semibold mt-0.5"
          style={{ color: valueColor ?? "#171A21" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── SLA indicator dot ─────────────────────────────────────────────────────────

function SlaIndicator({ ticket }) {
  const done = ticket.status === "Resolved" || ticket.status === "Closed";
  if (done) {
    return <CheckCircle2 size={14} strokeWidth={2} className="text-[#6B7280]" title="Resolved" />;
  }
  if (isSlaBreached(ticket)) {
    return <AlertCircle size={14} strokeWidth={2} className="text-[#B3413A]" title="SLA breached" />;
  }
  return <Circle size={14} strokeWidth={2} className="text-[#0E7C66]" title="Within SLA" />;
}

// ── Ticket detail SlideOver ───────────────────────────────────────────────────

function TicketDetail({ ticket, onClose }) {
  if (!ticket) return null;

  const breached = isSlaBreached(ticket);
  const done = ticket.status === "Resolved" || ticket.status === "Closed";
  const deadline = slaDeadline(ticket);

  return (
    <SlideOver open={!!ticket} onClose={onClose} title={ticket.id} width="w-[520px]">
      {/* Subject + badges */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-[#171A21] leading-snug mb-2">
          {ticket.subject}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={PRIORITY_VARIANT[ticket.priority]}>
            {ticket.priority === "Urgent" ? "🔴 " : ""}{ticket.priority}
          </Badge>
          <Badge variant={STATUS_VARIANT[ticket.status]}>{ticket.status}</Badge>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5 pb-5 border-b border-[#E3E5EA]">
        <div>
          <p className="text-xs text-[#6B7280] mb-0.5">Client</p>
          <p className="font-medium text-[#171A21]">{ticket.client}</p>
        </div>
        <div>
          <p className="text-xs text-[#6B7280] mb-0.5">Project</p>
          <p className="font-medium text-[#171A21]">{ticket.project ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-[#6B7280] mb-0.5">Assigned to</p>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0E7C66]/12 flex items-center justify-center text-[9px] font-semibold text-[#0E7C66] shrink-0">
              {ticket.assignedTo.initials}
            </span>
            <span className="font-medium text-[#171A21]">{ticket.assignedTo.name}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-[#6B7280] mb-0.5">Created</p>
          <p className="font-medium text-[#171A21]">
            {fmtDate(ticket.createdDate.slice(0, 10))}
          </p>
        </div>
      </div>

      {/* SLA block */}
      <div
        className={`rounded-lg px-4 py-3 mb-5 border ${
          done
            ? "border-[#E3E5EA] bg-[#F5F6F8]"
            : breached
            ? "border-[#B3413A]/20 bg-[#B3413A]/5"
            : "border-[#0E7C66]/20 bg-[#0E7C66]/5"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6B7280] mb-0.5">SLA target</p>
            <p className="text-sm font-semibold text-[#171A21]">
              {ticket.slaHours}h response
              <span className="ml-2 text-xs font-normal text-[#6B7280]">
                (deadline {fmtDate(deadline.toISOString().slice(0, 10))})
              </span>
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              done
                ? "bg-[#E3E5EA] text-[#6B7280]"
                : breached
                ? "bg-[#B3413A]/10 text-[#B3413A]"
                : "bg-[#0E7C66]/10 text-[#0E7C66]"
            }`}
          >
            {done ? "Closed" : breached ? "Breached" : "Within SLA"}
          </span>
        </div>
        {ticket.resolvedDate && (
          <p className="text-xs text-[#6B7280] mt-1.5">
            Resolved in{" "}
            <span className="font-medium text-[#171A21]">
              {hoursBetween(ticket.createdDate, ticket.resolvedDate).toFixed(1)}h
            </span>
          </p>
        )}
      </div>

      {/* Activity timeline */}
      <div>
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
          Activity
        </p>
        <div className="relative">
          <div className="absolute left-3.5 top-2 bottom-2 w-px bg-[#E3E5EA]" />
          <ul className="flex flex-col gap-0">
            {ticket.activity.map((item, i) => (
              <li
                key={i}
                className={`flex gap-4 ${i < ticket.activity.length - 1 ? "pb-5" : ""}`}
              >
                <span className="w-7 h-7 rounded-full bg-[#0E7C66]/10 border-2 border-white flex items-center justify-center shrink-0 z-10">
                  <MessageSquare size={11} strokeWidth={2} className="text-[#0E7C66]" />
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-[#171A21]">{item.author}</span>
                    <span className="text-xs text-[#6B7280]">·</span>
                    <span className="text-xs text-[#6B7280]">{item.date}</span>
                  </div>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideOver>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const ALL_STATUSES  = ["All", "Open", "In Progress", "Waiting on Client", "Resolved", "Closed"];
const ALL_PRIORITIES = ["All", "Urgent", "High", "Medium", "Low"];

function TicketsContent() {
  const searchParams   = useSearchParams();
  const [loading]          = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  // Initialise client filter from ?client= query param (linked from client detail page)
  const [clientFilter, setClientFilter]   = useState(() => searchParams.get("client") ?? "");
  const [selected, setSelected] = useState(null);

  // ── derived stats (calculated, not hardcoded) ──────────────────────────────

  const openCount = useMemo(
    () => allTickets.filter((t) => t.status === "Open" || t.status === "In Progress").length,
    []
  );

  const breachCount = useMemo(
    () => allTickets.filter(isSlaBreached).length,
    []
  );

  // Constant — computed once from static seed data, no deps needed
  const resolved = allTickets.filter(
    (t) => (t.status === "Resolved" || t.status === "Closed") && t.resolvedDate
  );
  const avgResolutionHours =
    resolved.length > 0
      ? (
          resolved.reduce((sum, t) => sum + hoursBetween(t.createdDate, t.resolvedDate), 0) /
          resolved.length
        ).toFixed(1)
      : null;

  // ── filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allTickets.filter((t) => {
      if (statusFilter   !== "All" && t.status   !== statusFilter)   return false;
      if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
      if (clientFilter && t.client !== clientFilter)                 return false;
      if (q && !t.subject.toLowerCase().includes(q) &&
               !t.client.toLowerCase().includes(q)  &&
               !t.id.toLowerCase().includes(q))      return false;
      return true;
    });
  }, [search, statusFilter, priorityFilter, clientFilter]);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <Header
        title="Tickets"
        breadcrumbs={[{ label: "Tickets" }]}
      />

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatTile
          icon={Headphones}
          label="Open tickets"
          value={`${openCount} ticket${openCount !== 1 ? "s" : ""}`}
          iconColor="#0E7C66"
        />
        <StatTile
          icon={AlertCircle}
          label="SLA breaches"
          value={`${breachCount} ticket${breachCount !== 1 ? "s" : ""}`}
          iconColor={breachCount > 0 ? "#B3413A" : "#6B7280"}
          valueColor={breachCount > 0 ? "#B3413A" : undefined}
        />
        <StatTile
          icon={CheckCircle2}
          label="Avg resolution time"
          value={avgResolutionHours ? `${avgResolutionHours}h` : "—"}
          iconColor="#6B7280"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 px-3 text-sm border border-[#E3E5EA] rounded-lg bg-white text-[#171A21] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E7C66] transition-colors w-56"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-[#E3E5EA] rounded-lg bg-white text-[#171A21] focus:outline-none focus:border-[#0E7C66] transition-colors"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-[#E3E5EA] rounded-lg bg-white text-[#171A21] focus:outline-none focus:border-[#0E7C66] transition-colors"
        >
          {ALL_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p === "All" ? "All priorities" : p}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[#6B7280]">
          {clientFilter && (
            <button
              onClick={() => setClientFilter("")}
              className="mr-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0E7C66]/10 text-[#0E7C66] text-xs font-medium hover:bg-[#0E7C66]/20 transition-colors"
            >
              {clientFilter} ×
            </button>
          )}
          {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="No tickets found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="bg-white border border-[#E3E5EA] rounded-lg overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#E3E5EA] bg-[#F5F6F8]">
                {["Ticket", "Client", "Project", "Priority", "Assigned to", "Created", "Status", "SLA"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-medium text-[#6B7280] text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket, i) => (
                <tr
                  key={ticket.id}
                  onClick={() => setSelected(ticket)}
                  className={`cursor-pointer hover:bg-[#F5F6F8] transition-colors ${
                    i < filtered.length - 1 ? "border-b border-[#E3E5EA]" : ""
                  }`}
                >
                  {/* ID + subject */}
                  <td className="px-4 py-3">
                    <p className="font-mono-data text-xs text-[#6B7280]">{ticket.id}</p>
                    <p className="text-sm font-medium text-[#171A21] mt-0.5 max-w-[220px] truncate">
                      {ticket.subject}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#171A21] whitespace-nowrap">
                    {ticket.client}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] whitespace-nowrap">
                    {ticket.project ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={PRIORITY_VARIANT[ticket.priority]}>
                      {ticket.priority === "Urgent" ? "🔴 " : ""}{ticket.priority}
                    </Badge>
                  </td>
                  {/* Assigned to: avatar + name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-[#0E7C66]/12 flex items-center justify-center text-[9px] font-semibold text-[#0E7C66] shrink-0">
                        {ticket.assignedTo.initials}
                      </span>
                      <span className="text-sm text-[#171A21] whitespace-nowrap">
                        {ticket.assignedTo.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] whitespace-nowrap font-mono-data">
                    {fmtDate(ticket.createdDate.slice(0, 10))}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[ticket.status]}>{ticket.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <SlaIndicator ticket={ticket} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail slide-over */}
      <TicketDetail ticket={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<AppShell><Header title="Tickets" /><TableSkeleton rows={6} cols={7} /></AppShell>}>
      <TicketsContent />
    </Suspense>
  );
}
