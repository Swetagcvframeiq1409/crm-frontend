"use client";

import { useEffect, useState } from "react";
import { ReceiptText, Search, SearchX } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import InvoiceSlideOver from "@/components/billing/InvoiceSlideOver";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/context/AuthContext";
import { invoices } from "@/data/mockData";
import { fmtDate } from "@/lib/dates";
import { fmtINR } from "@/lib/format";

const STATUS_VARIANT = {
  Draft: "muted",
  Sent: "bluegrey",
  Paid: "teal",
  Overdue: "rose",
};

const METHODS = ["All methods", "Milestone", "Hourly"];
const STATUSES = ["All statuses", "Draft", "Sent", "Paid", "Overdue"];

function getAmount(items) {
  return items.reduce((sum, invoice) => sum + invoice.amount, 0);
}

function localISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInvoiceStatus(invoice, today) {
  if (invoice.status === "Paid" || invoice.status === "Draft") return invoice.status;
  return invoice.dueDate < today ? "Overdue" : "Sent";
}

export default function BillingPage() {
  const { user } = useAuth();
  const canViewBilling = ["admin", "Sales Manager"].includes(user?.role);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [methodFilter, setMethodFilter] = useState("All methods");
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const today = localISODate();
  const currentInvoices = invoices.map((invoice) => ({
    ...invoice,
    status: getInvoiceStatus(invoice, today),
  }));

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const outstandingInvoices = currentInvoices.filter((invoice) => ["Sent", "Overdue"].includes(invoice.status));
  const overdueInvoices = currentInvoices.filter((invoice) => invoice.status === "Overdue");
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const paidThisMonth = currentInvoices.filter(
    (invoice) => invoice.status === "Paid" && invoice.paidDate?.slice(0, 7) === monthKey
  );

  const query = search.trim().toLowerCase();
  const filteredInvoices = currentInvoices.filter((invoice) => {
    const matchesSearch = !query || [invoice.id, invoice.client, invoice.project]
      .some((value) => value.toLowerCase().includes(query));
    const matchesStatus = statusFilter === "All statuses" || invoice.status === statusFilter;
    const matchesMethod = methodFilter === "All methods" || invoice.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  function clearFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setMethodFilter("All methods");
  }

  function openInvoice(invoice) {
    setSelectedInvoice(invoice);
  }

  if (!canViewBilling) {
    return (
      <AppShell>
        <Header title="Billing" />
        <EmptyState
          icon={ReceiptText}
          title="Billing isn't available for your role"
          description="Ask an Admin or Sales Manager for access."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header title="Billing" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total outstanding"
          value={fmtINR(getAmount(outstandingInvoices))}
          isCurrency
          delta={`${outstandingInvoices.length} invoices`}
          deltaPositive={false}
          trend={outstandingInvoices.map((invoice, index) => ({ value: (index + 1) * invoice.amount }))}
        />
        <StatCard
          label="Overdue amount"
          value={fmtINR(getAmount(overdueInvoices))}
          isCurrency
          delta={`${overdueInvoices.length} invoices`}
          deltaPositive={false}
          trend={overdueInvoices.map((invoice, index) => ({ value: (index + 1) * invoice.amount }))}
        />
        <StatCard
          label="Paid this month"
          value={fmtINR(getAmount(paidThisMonth))}
          isCurrency
          delta="This month"
          deltaPositive
          trend={paidThisMonth.map((invoice, index) => ({ value: (index + 1) * invoice.amount }))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <label className="relative">
          <span className="sr-only">Search invoices</span>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="search"
            placeholder="Search invoices..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-56 pl-8 pr-3 py-2 text-sm border border-[#E3E5EA] rounded bg-white text-[#171A21] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E7C66]"
          />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-3 py-2 text-sm border border-[#E3E5EA] rounded bg-white text-[#171A21] focus:outline-none focus:border-[#0E7C66]"
          >
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by method</span>
          <select
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
            className="px-3 py-2 text-sm border border-[#E3E5EA] rounded bg-white text-[#171A21] focus:outline-none focus:border-[#0E7C66]"
          >
            {METHODS.map((method) => <option key={method}>{method}</option>)}
          </select>
        </label>
        <span className="text-sm text-[#6B7280]">
          {filteredInvoices.length} {filteredInvoices.length === 1 ? "invoice" : "invoices"}
        </span>
        {(search || statusFilter !== "All statuses" || methodFilter !== "All methods") && (
          <Button variant="ghost" onClick={clearFilters}>Clear filters</Button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No invoices found"
          description="Try changing your search or filters."
          action={{ label: "Clear filters", onClick: clearFilters }}
        />
      ) : (
        <div className="bg-white border border-[#E3E5EA] rounded-lg overflow-x-auto">
          <table className="w-full min-w-190 text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#E3E5EA] bg-[#F5F6F8]">
                {["Invoice", "Project", "Method", "Amount", "Due date", "Status"].map((heading) => (
                  <th key={heading} className={`px-4 py-3 text-xs font-medium text-[#6B7280] text-left whitespace-nowrap ${heading === "Amount" ? "text-right" : ""}`}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => openInvoice(invoice)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openInvoice(invoice);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Open invoice ${invoice.id} for ${invoice.client}`}
                  className="border-b border-[#E3E5EA] last:border-0 hover:bg-[#F5F6F8]/70 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0E7C66]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#171A21]">{invoice.id}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{invoice.client}</p>
                  </td>
                  <td className="px-4 py-3 text-[#171A21]">{invoice.project}</td>
                  <td className="px-4 py-3">
                    <Badge variant={invoice.method === "Hourly" ? "bluegrey" : "teal"}>{invoice.method}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data text-[#171A21]">{fmtINR(invoice.amount)}</td>
                  <td className={`px-4 py-3 ${invoice.status === "Overdue" ? "text-[#B3413A]" : "text-[#6B7280]"}`}>
                    {fmtDate(invoice.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[invoice.status]}>{invoice.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InvoiceSlideOver
        invoice={selectedInvoice}
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
      />
    </AppShell>
  );
}