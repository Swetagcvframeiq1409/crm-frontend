"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, AlertTriangle, RefreshCw, Folder, SearchX } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { clients } from "@/data/mockData";
import { fmtValue } from "@/lib/format";
import { fmtDate, daysUntil } from "@/lib/dates";

const HEALTH_DOT  = { Healthy: "bg-[#0E7C66]", "Needs Attention": "bg-[#B7791F]", "At Risk": "bg-[#B3413A]" };
const HEALTH_TEXT = { Healthy: "text-[#0E7C66]", "Needs Attention": "text-[#B7791F]", "At Risk": "text-[#B3413A]" };

function ClientCard({ client }) {
  const renewal = daysUntil(client.renewalDate);
  const renewalWarning = renewal <= 60;
  return (
    <Link
      href={`/clients/${client.id}`}
      className="bg-white border border-[#E3E5EA] rounded-lg p-5 flex flex-col gap-3 hover:border-[#0E7C66]/40 hover:bg-[#F5F6F8]/60 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#171A21] leading-snug group-hover:text-[#0E7C66] transition-colors truncate">{client.name}</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">{client.industry}</p>
        </div>
        <span className={`flex items-center gap-1.5 shrink-0 text-xs font-medium ${HEALTH_TEXT[client.health]}`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${HEALTH_DOT[client.health]}`} />
          {client.health}
        </span>
      </div>
      <hr className="border-[#F5F6F8]" />
      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
        <div className="flex items-center gap-1.5">
          <Folder size={12} className="text-[#6B7280] shrink-0" strokeWidth={1.8} />
          <span className="text-xs text-[#6B7280]">
            <span className="font-medium text-[#171A21]">{client.activeProjects}</span> active project{client.activeProjects !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-xs text-[#6B7280] text-right">
          <span className="font-mono-data font-medium text-[#171A21]">{fmtValue(client.contractValue)}</span>
        </div>
        <div className={`flex items-center gap-1.5 col-span-2 ${renewalWarning ? "text-[#B7791F]" : "text-[#6B7280]"}`}>
          <RefreshCw size={11} strokeWidth={1.8} className="shrink-0" />
          <span className="text-xs">Renews {fmtDate(client.renewalDate)}</span>
          {renewalWarning && <AlertTriangle size={11} strokeWidth={2} className="ml-0.5 shrink-0" />}
        </div>
      </div>
      <hr className="border-[#F5F6F8]" />
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-medium text-[#171A21]">{client.contact.name}</p>
        <p className="text-xs text-[#6B7280] truncate">{client.contact.email}</p>
      </div>
    </Link>
  );
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? clients : clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <AppShell>
      <Header title="Clients" />

      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Filter clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-[#E3E5EA] rounded bg-white text-[#171A21] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E7C66] w-52 transition-colors"
          />
        </div>
        <span className="text-sm text-[#6B7280]">{filtered.length} {filtered.length === 1 ? "client" : "clients"}</span>
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No clients match your search"
          description="Try a different name."
          action={{ label: "Clear search", onClick: () => setSearch("") }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => <ClientCard key={client.id} client={client} />)}
        </div>
      )}
    </AppShell>
  );
}
