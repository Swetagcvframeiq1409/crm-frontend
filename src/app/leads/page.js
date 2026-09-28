"use client";
import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SlideOver from "@/components/ui/SlideOver";
import { leads } from "@/data/mockData";

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_VARIANTS = {
  New: "muted", Contacted: "bluegrey", Qualified: "amber", Converted: "teal", Lost: "rose",
};
const STATUSES   = ["All", "New", "Contacted", "Qualified", "Converted", "Lost"];
const INDUSTRIES = ["BFSI", "Retail", "Logistics", "Healthcare", "Infrastructure", "Pharma", "Manufacturing", "Education", "Other"];
const OWNERS     = ["Sweta G.", "Priya S.", "Karan M."];

function fmtBudget(n) {
  return "₹" + n.toLocaleString("en-IN");
}

// ── sub-components ────────────────────────────────────────────────────────────

function OwnerCell({ owner }) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-[#0E7C66]/12 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-semibold text-[#0E7C66]">{owner.initials}</span>
      </span>
      <span className="text-sm text-[#171A21]">{owner.name}</span>
    </span>
  );
}

function LeadDetail({ lead }) {
  if (!lead) return null;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-[#171A21]">{lead.company}</h3>
        <p className="text-sm text-[#6B7280] mt-0.5">{lead.contact}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={STATUS_VARIANTS[lead.status]}>{lead.status}</Badge>
        <span className="text-xs text-[#6B7280]">{lead.industry}</span>
      </div>
      <hr className="border-[#E3E5EA]" />
      {[
        { label: "Lead ID",       value: lead.id,                mono: true  },
        { label: "Budget",        value: fmtBudget(lead.budget), mono: true  },
        { label: "Owner",         value: lead.owner.name,        mono: false },
        { label: "Last Activity", value: lead.lastActivity,      mono: false },
      ].map(({ label, value, mono }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="text-xs text-[#6B7280]">{label}</span>
          <span className={`text-sm text-[#171A21] ${mono ? "font-mono-data" : "font-medium"}`}>{value}</span>
        </div>
      ))}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-[#6B7280]">Requirement</span>
        <p className="text-sm text-[#171A21] leading-relaxed">{lead.requirement}</p>
      </div>
    </div>
  );
}

const EMPTY = { company: "", contact: "", industry: "", requirement: "", budget: "", status: "New", owner: "" };

function AddLeadForm() {
  const [form, setForm] = useState(EMPTY);
  const valid = form.company.trim() && form.contact.trim();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full border border-[#E3E5EA] rounded px-3 py-2 text-sm text-[#171A21] bg-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E7C66] transition-colors";
  const labelCls = "text-xs text-[#6B7280] mb-1 block";

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className={labelCls}>Company Name <span className="text-[#B3413A]">*</span></label>
        <input className={inputCls} placeholder="e.g. Acme Corp" value={form.company} onChange={set("company")} />
      </div>
      <div>
        <label className={labelCls}>Contact Person <span className="text-[#B3413A]">*</span></label>
        <input className={inputCls} placeholder="e.g. Ananya Sharma" value={form.contact} onChange={set("contact")} />
      </div>
      <div>
        <label className={labelCls}>Industry</label>
        <select className={inputCls} value={form.industry} onChange={set("industry")}>
          <option value="">Select industry</option>
          {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Requirement</label>
        <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Brief description…" value={form.requirement} onChange={set("requirement")} />
      </div>
      <div>
        <label className={labelCls}>Budget (₹)</label>
        <input className={`${inputCls} font-mono-data`} type="number" placeholder="e.g. 2500000" value={form.budget} onChange={set("budget")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={form.status} onChange={set("status")}>
            {STATUSES.filter((s) => s !== "All").map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Owner</label>
          <select className={inputCls} value={form.owner} onChange={set("owner")}>
            <option value="">Assign owner</option>
            {OWNERS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="pt-2 border-t border-[#E3E5EA]">
        <Button type="submit" disabled={!valid} className={`w-full justify-center ${!valid ? "opacity-40 cursor-not-allowed" : ""}`}>
          Save Lead
        </Button>
      </div>
    </form>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("All");
  const [selectedLead, setSelected]   = useState(null);
  const [addOpen, setAddOpen]         = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchQ = !q || l.company.toLowerCase().includes(q) || l.contact.toLowerCase().includes(q);
      const matchS = statusFilter === "All" || l.status === statusFilter;
      return matchQ && matchS;
    });
  }, [search, statusFilter]);

  const openDetail = (lead) => { setAddOpen(false); setSelected(lead); };
  const closeAll   = ()     => { setSelected(null); setAddOpen(false); };

  const COLS = ["Company / Contact", "Industry", "Requirement", "Budget", "Status", "Owner", "Last Activity"];

  return (
    <AppShell>
      <Header
        title="Leads"
        action={
          <Button onClick={() => { setSelected(null); setAddOpen(true); }}>
            <Plus size={15} strokeWidth={2.5} /> Add Lead
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search company or contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-[#E3E5EA] rounded bg-white text-[#171A21] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E7C66] w-64 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-[#E3E5EA] rounded px-3 py-2 text-sm bg-white text-[#171A21] focus:outline-none focus:border-[#0E7C66] transition-colors"
        >
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-sm text-[#6B7280]">
          {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E3E5EA] rounded-lg overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#E3E5EA] bg-[#F5F6F8]">
              {COLS.map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-medium text-[#6B7280] text-left whitespace-nowrap ${h === "Budget" ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#6B7280]">
                  No leads match your filters.
                </td>
              </tr>
            ) : filtered.map((lead, i) => (
              <tr
                key={lead.id}
                onClick={() => openDetail(lead)}
                className={`cursor-pointer transition-colors hover:bg-[#F5F6F8] ${
                  i < filtered.length - 1 ? "border-b border-[#E3E5EA]" : ""
                } ${selectedLead?.id === lead.id ? "bg-[#F5F6F8]" : ""}`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-[#171A21]">{lead.company}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{lead.contact}</p>
                </td>
                <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{lead.industry}</td>
                <td className="px-4 py-3 max-w-[220px]">
                  <p className="truncate text-[#171A21]" title={lead.requirement}>{lead.requirement}</p>
                </td>
                <td className="px-4 py-3 text-right font-mono-data text-[#171A21] whitespace-nowrap">
                  {fmtBudget(lead.budget)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={STATUS_VARIANTS[lead.status]}>{lead.status}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <OwnerCell owner={lead.owner} />
                </td>
                <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{lead.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-overs */}
      <SlideOver open={!!selectedLead} onClose={closeAll} title={selectedLead?.company ?? ""}>
        <LeadDetail lead={selectedLead} />
      </SlideOver>
      <SlideOver open={addOpen} onClose={closeAll} title="Add Lead">
        <AddLeadForm />
      </SlideOver>
    </AppShell>
  );
}
