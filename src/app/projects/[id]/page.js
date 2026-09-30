"use client";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { CalendarDays, Clock, Users, CheckCircle2, Loader2, Circle, AlertCircle, ReceiptText, Plus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import InvoiceSlideOver from "@/components/billing/InvoiceSlideOver";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { projects, timesheets, invoices } from "@/data/mockData";
import { fmtValue, fmtINR } from "@/lib/format";
import { fmtDate } from "@/lib/dates";

const STATUS_BADGE = {
  Planning:  "muted",
  Active:    "teal",
  "On Hold": "amber",
  Completed: "bluegrey",
};

const MILESTONE_STATUS = {
  Done:         { icon: CheckCircle2, color: "text-[#0E7C66]",  label: "Done"        },
  "In progress":{ icon: Loader2,      color: "text-[#B7791F]",  label: "In progress" },
  "Not started":{ icon: Circle,       color: "text-[#6B7280]",  label: "Not started" },
  Overdue:      { icon: AlertCircle,  color: "text-[#B3413A]",  label: "Overdue"     },
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

function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[#E3E5EA] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#0E7C66]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-[#171A21] tabular-nums w-9 text-right">{pct}%</span>
    </div>
  );
}

function MemberPill({ name }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="flex items-center gap-2">
      <span className="w-7 h-7 rounded-full bg-[#0E7C66]/12 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-semibold text-[#0E7C66]">{initials}</span>
      </span>
      <span className="text-sm text-[#171A21]">{name}</span>
    </span>
  );
}

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const toast = useToast();
  const [invoicePreview, setInvoicePreview] = useState(null);
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  const canManageBilling = ["admin", "Sales Manager"].includes(user?.role);
  const approvedHours = timesheets.reduce((projectHours, sheet) => {
    if (sheet.status !== "Approved") return projectHours;
    return projectHours + sheet.entries
      .filter((entry) => entry.projectId === project.id)
      .reduce((entryHours, entry) => entryHours + entry.hours.reduce((dailyHours, hours) => dailyHours + (Number(hours) || 0), 0), 0);
  }, 0);
  const billedHours = invoices.reduce((projectHours, invoice) => projectHours + invoice.lineItems
    .filter((item) => item.projectId === project.id)
    .reduce((itemHours, item) => itemHours + (Number(item.hours) || 0), 0), 0);
  const unbilledHours = Math.max(0, approvedHours - billedHours);
  const estimatedAmount = unbilledHours * project.hourlyRate;

  function createInvoicePreview() {
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const subtotal = Math.round(estimatedAmount);
    const tax = Math.round(subtotal * 0.18);
    const isoDate = (date) => date.toISOString().slice(0, 10);
    const hoursLabel = Number.isInteger(unbilledHours) ? String(unbilledHours) : unbilledHours.toFixed(1);

    setInvoicePreview({
      id: "Draft preview",
      client: project.client,
      project: project.name,
      projectId: project.id,
      method: "Hourly",
      lineItems: [{
        description: `${hoursLabel} hours at ${fmtINR(project.hourlyRate)}/hr`,
        amount: subtotal,
        projectId: project.id,
        hours: unbilledHours,
      }],
      amount: subtotal + tax,
      status: "Draft",
      issueDate: isoDate(issueDate),
      dueDate: isoDate(dueDate),
    });
    toast({ message: "Invoice created", variant: "success" });
  }

  const now = new Date();

  return (
    <AppShell>
      <Header
        title={project.name}
        subtitle={project.client}
        breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: project.name }]}
        action={<Badge variant={STATUS_BADGE[project.status]}>{project.status}</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile icon={CalendarDays} label="Budget"     value={fmtValue(project.budget)} mono />
        <StatTile icon={CalendarDays} label="Progress"   value={`${project.progress}%`} />
        <StatTile icon={Clock}        label="Start date" value={fmtDate(project.startDate)} />
        <StatTile icon={CalendarDays} label="End date"   value={fmtDate(project.endDate)} />
      </div>

      <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4 mb-5">
        <p className="text-xs text-[#6B7280] mb-2">Overall progress</p>
        <ProgressBar value={project.progress} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
            <h2 className="text-sm font-semibold text-[#171A21] mb-4 flex items-center gap-2">
              <Users size={14} strokeWidth={1.8} className="text-[#6B7280]" />
              Team
            </h2>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center justify-between gap-3">
                <MemberPill name={project.projectManager} />
                <span className="text-xs text-[#6B7280] shrink-0">Manager</span>
              </li>
              {project.team
                .filter((m) => m !== project.projectManager)
                .map((member) => (
                  <li key={member}>
                    <MemberPill name={member} />
                  </li>
                ))}
            </ul>
          </div>

          {canManageBilling && (
            <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
              <h2 className="text-sm font-semibold text-[#171A21] mb-4 flex items-center gap-2">
                <ReceiptText size={14} strokeWidth={1.8} className="text-[#6B7280]" />
                Billing
              </h2>
              <p className="text-xs text-[#6B7280]">Unbilled approved hours</p>
              <p className="text-xl font-semibold font-mono-data text-[#171A21] mt-1">{fmtINR(estimatedAmount)}</p>
              <p className="text-xs text-[#6B7280] mt-1">
                {Number.isInteger(unbilledHours) ? unbilledHours : unbilledHours.toFixed(1)} hours × {fmtINR(project.hourlyRate)}/hr
              </p>
              <Button
                onClick={createInvoicePreview}
                disabled={unbilledHours === 0}
                className="w-full justify-center mt-4"
              >
                <Plus size={14} strokeWidth={2} />
                Create invoice
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
            <h2 className="text-sm font-semibold text-[#171A21] mb-4">Milestones</h2>
            <ul className="flex flex-col">
              {project.milestones.map(({ name, dueDate, status }, i) => {
                const isOverdue =
                  status !== "Done" && new Date(dueDate) < now;
                const key = isOverdue ? "Overdue" : status;
                const { icon: Icon, color, label } = MILESTONE_STATUS[key] ?? MILESTONE_STATUS["Not started"];
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-3 py-3 ${i < project.milestones.length - 1 ? "border-b border-[#F5F6F8]" : ""}`}
                  >
                    <Icon size={15} strokeWidth={2} className={`mt-0.5 shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#171A21]">{name}</p>
                      <p className={`text-xs mt-0.5 ${isOverdue ? "text-[#B3413A]" : "text-[#6B7280]"}`}>
                        {fmtDate(dueDate)}
                        {isOverdue && " · Overdue"}
                      </p>
                    </div>
                    <span className={`text-xs font-medium shrink-0 ${color}`}>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <InvoiceSlideOver
        invoice={invoicePreview}
        open={Boolean(invoicePreview)}
        onClose={() => setInvoicePreview(null)}
      />
    </AppShell>
  );
}
