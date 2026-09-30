"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { deals, invoices, leads, projects, tickets, timesheets } from "@/data/mockData";
import { fmtINR, fmtValue } from "@/lib/format";

const DATE_RANGES = ["This month", "Last 3 months", "This year"];
const PROJECT_STATUSES = ["Planning", "Active", "On Hold", "Completed"];
const PRIORITIES = ["Urgent", "High", "Medium", "Low"];
const PROJECT_COLORS = {
  Planning: "#6B7280",
  Active: "#0E7C66",
  "On Hold": "#B7791F",
  Completed: "#4B5563",
};
const PRIORITY_COLORS = {
  Urgent: "#B3413A",
  High: "#B3413A",
  Medium: "#B7791F",
  Low: "#0E7C66",
};

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRangeBounds(range, today) {
  const year = today.getFullYear();
  const month = today.getMonth();
  let start;
  let end;

  if (range === "This month") {
    start = new Date(year, month, 1);
    end = new Date(year, month + 1, 0);
  } else if (range === "Last 3 months") {
    start = new Date(year, month - 2, 1);
    end = new Date(year, month + 1, 0);
  } else {
    start = new Date(year, 0, 1);
    end = new Date(year, 11, 31);
  }

  return { start: toISODate(start), end: toISODate(end) };
}

function isDateInRange(value, range) {
  if (!value) return false;
  const date = value.slice(0, 10);
  return date >= range.start && date <= range.end;
}

function buildWinRateData(range) {
  const buckets = [];
  const cursor = new Date(`${range.start}T00:00:00`);
  const lastMonth = range.end.slice(0, 7);

  while (toISODate(cursor).slice(0, 7) <= lastMonth) {
    const key = toISODate(cursor).slice(0, 7);
    const monthlyDeals = deals.filter((deal) => deal.closeDate.startsWith(key));
    const wins = monthlyDeals.filter((deal) => deal.stage === "Won").length;
    buckets.push({
      month: cursor.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      winRate: monthlyDeals.length ? Math.round((wins / monthlyDeals.length) * 100) : null,
      wins,
      total: monthlyDeals.length,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets;
}

function ReportCard({ title, description, children }) {
  return (
    <section className="min-w-0 bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[#171A21]">{title}</h2>
        <p className="text-xs text-[#6B7280] mt-1">{description}</p>
      </div>
      {children}
    </section>
  );
}

const chartTooltipStyle = {
  borderColor: "#E3E5EA",
  borderRadius: 8,
  fontSize: 12,
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("This year");
  const canViewReports = ["admin", "Sales Manager"].includes(user?.role);
  const today = new Date();
  const range = getRangeBounds(dateRange, today);
  const winRateData = buildWinRateData(range);
  const rangeDeals = deals.filter((deal) => isDateInRange(deal.closeDate, range));
  const activeLeadCount = leads.filter((lead) => ["New", "Contacted", "Qualified"].includes(lead.status)).length;
  const convertedLeadCount = leads.filter((lead) => lead.status === "Converted").length;

  const rangeProjects = projects.filter(
    (project) => project.startDate <= range.end && project.endDate >= range.start
  );
  const projectStatusData = PROJECT_STATUSES.map((status) => ({
    status,
    count: rangeProjects.filter((project) => project.status === status).length,
  }));
  const rangeTimesheets = timesheets.filter(
    (sheet) => sheet.status === "Approved" && isDateInRange(sheet.weekStart, range)
  );
  const approvedHours = rangeTimesheets.reduce(
    (total, sheet) => total + sheet.entries.reduce(
      (sheetHours, entry) => sheetHours + entry.hours.reduce((entryHours, hours) => entryHours + (Number(hours) || 0), 0),
      0
    ),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "Paid" && isDateInRange(invoice.paidDate, range)
  );
  const outstandingInvoices = invoices.filter(
    (invoice) => ["Sent", "Overdue"].includes(invoice.status) && isDateInRange(invoice.issueDate, range)
  );
  const financeData = [
    { category: "Collected", amount: paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0), color: "#0E7C66" },
    { category: "Outstanding", amount: outstandingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0), color: "#B7791F" },
  ];

  const rangeTickets = tickets.filter((ticket) => isDateInRange(ticket.createdDate, range));
  const priorityData = PRIORITIES.map((priority) => ({
    priority,
    count: rangeTickets.filter((ticket) => ticket.priority === priority).length,
  }));
  const activeTickets = rangeTickets.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status));
  const breachedTickets = activeTickets.filter((ticket) =>
    new Date(ticket.createdDate).getTime() + ticket.slaHours * 3_600_000 < today.getTime()
  ).length;
  const slaData = [
    { result: "Within SLA", count: activeTickets.length - breachedTickets, color: "#0E7C66" },
    { result: "Breached", count: breachedTickets, color: "#B3413A" },
  ];
  const breachRate = activeTickets.length ? Math.round((breachedTickets / activeTickets.length) * 100) : 0;

  if (!canViewReports) {
    return (
      <AppShell>
        <Header title="Reports" />
        <EmptyState
          icon={BarChart3}
          title="Reports aren't available for your role"
          description="Ask an Admin or Sales Manager for access."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header title="Reports" />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <label htmlFor="report-date-range" className="text-sm font-medium text-[#171A21]">Date range</label>
        <select
          id="report-date-range"
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value)}
          className="px-3 py-2 text-sm border border-[#E3E5EA] rounded bg-white text-[#171A21] focus:outline-none focus:border-[#0E7C66]"
        >
          {DATE_RANGES.map((rangeOption) => <option key={rangeOption}>{rangeOption}</option>)}
        </select>
        <span className="text-xs text-[#6B7280]">{range.start} – {range.end}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ReportCard
          title="Sales · Win rate by month"
          description="Won deals divided by all deals with an expected close date in each month."
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winRateData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E3E5EA" strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value, _name, item) => [value == null ? "No deals" : `${value}% (${item.payload.wins}/${item.payload.total})`, "Win rate"]}
                />
                <Bar dataKey="winRate" name="Win rate" fill="#0E7C66" radius={[4, 4, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-[#6B7280]">
            Lead snapshot: {activeLeadCount} active · {convertedLeadCount} converted (lead records have no dated field)
          </p>
        </ReportCard>

        <ReportCard
          title="Delivery · Project status"
          description={`${rangeProjects.length} projects scheduled during the selected period.`}
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStatusData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E3E5EA" strokeDasharray="3 3" />
                <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [value, "Projects"]} />
                <Bar dataKey="count" name="Projects" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  {projectStatusData.map((item) => <Cell key={item.status} fill={PROJECT_COLORS[item.status]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-[#6B7280]">
            {approvedHours.toLocaleString("en-IN")} approved hours logged in the selected period
          </p>
        </ReportCard>

        <ReportCard
          title="Finance · Collected vs outstanding"
          description="Collected by payment date; outstanding invoices by issue date in the selected period."
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData} margin={{ top: 8, right: 8, left: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E3E5EA" strokeDasharray="3 3" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis tickFormatter={fmtValue} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} width={74} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [fmtINR(value), "Invoice total"]} />
                <Bar dataKey="amount" name="Invoice total" radius={[4, 4, 0, 0]} maxBarSize={64}>
                  {financeData.map((item) => <Cell key={item.category} fill={item.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>

        <ReportCard
          title="Support · Tickets and SLA"
          description={`${rangeTickets.length} tickets created in the selected period; SLA rate is based on active tickets.`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-[#6B7280] mb-1">Tickets by priority</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#E3E5EA" strokeDasharray="3 3" />
                    <XAxis dataKey="priority" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [value, "Tickets"]} />
                    <Bar dataKey="count" name="Tickets" radius={[3, 3, 0, 0]} maxBarSize={32}>
                      {priorityData.map((item) => <Cell key={item.priority} fill={PRIORITY_COLORS[item.priority]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-xs font-medium text-[#6B7280]">Active-ticket SLA</h3>
                <span className={`text-xs font-semibold ${breachedTickets ? "text-[#B3413A]" : "text-[#0E7C66]"}`}>
                  {breachRate}% breached
                </span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slaData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#E3E5EA" strokeDasharray="3 3" />
                    <XAxis dataKey="result" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [value, "Tickets"]} />
                    <Bar dataKey="count" name="Tickets" radius={[3, 3, 0, 0]} maxBarSize={44}>
                      {slaData.map((item) => <Cell key={item.result} fill={item.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </ReportCard>
      </div>
    </AppShell>
  );
}