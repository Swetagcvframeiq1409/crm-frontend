"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Trash2, SearchX } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SlideOver from "@/components/ui/SlideOver";
import EmptyState from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import { proposals, clients } from "@/data/mockData";
import { fmtValue, fmtINR } from "@/lib/format";
import { fmtDate } from "@/lib/dates";

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_VARIANTS = {
  Draft:       "muted",
  Sent:        "bluegrey",
  Negotiation: "amber",
  Accepted:    "teal",
  Rejected:    "rose",
};

const STATUSES = ["All", "Draft", "Sent", "Negotiation", "Accepted", "Rejected"];

function isExpired(iso) {
  return new Date(iso) < new Date();
}

// ── Proposal detail panel ─────────────────────────────────────────────────────

function ProposalDetail({ proposal: p }) {
  if (!p) return null;

  const subtotal = p.lineItems.reduce((s, li) => s + li.amount, 0);
  const afterDiscount = subtotal - (p.discount ?? 0);
  const tax = Math.round(afterDiscount * p.taxRate);
  const total = afterDiscount + tax;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={STATUS_VARIANTS[p.status]}>{p.status}</Badge>
          <span className="font-mono-data text-xs text-[#6B7280]">{p.id} · {p.version}</span>
        </div>
        <h3 className="text-base font-semibold text-[#171A21] leading-snug">{p.client}</h3>
        <p className="text-sm text-[#6B7280] mt-0.5">{p.service}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Owner",       value: p.owner.name,          mono: false },
          { label: "Valid Until", value: fmtDate(p.validUntil), mono: false, expired: isExpired(p.validUntil) },
        ].map(({ label, value, mono, expired }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-xs text-[#6B7280]">{label}</span>
            <span className={`text-sm font-medium ${expired ? "text-[#B3413A]" : "text-[#171A21]"} ${mono ? "font-mono-data" : ""}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-[#E3E5EA]" />

      {/* Line items */}
      <div>
        <p className="text-xs font-medium text-[#6B7280] mb-2">Line Items</p>
        <div className="flex flex-col gap-0">
          {p.lineItems.map((li, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-2 ${i < p.lineItems.length - 1 ? "border-b border-[#F5F6F8]" : ""}`}
            >
              <span className="text-sm text-[#171A21] pr-4">{li.desc}</span>
              <span className="font-mono-data text-sm text-[#171A21] shrink-0">{fmtINR(li.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-[#F5F6F8] rounded-lg px-4 py-3 flex flex-col gap-1.5">
        {[
          { label: "Subtotal",  value: fmtINR(subtotal),      muted: true  },
          ...(p.discount ? [{ label: "Discount", value: `− ${fmtINR(p.discount)}`, muted: true, rose: true }] : []),
          { label: `GST (${p.taxRate * 100}%)`, value: fmtINR(tax), muted: true },
        ].map(({ label, value, rose }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-[#6B7280]">{label}</span>
            <span className={`font-mono-data ${rose ? "text-[#B3413A]" : "text-[#6B7280]"}`}>{value}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-[#E3E5EA] mt-0.5">
          <span className="text-[#171A21]">Total</span>
          <span className="font-mono-data text-[#171A21]">{fmtINR(total)}</span>
        </div>
      </div>

      <hr className="border-[#E3E5EA]" />

      {/* Version history */}
      <div>
        <p className="text-xs font-medium text-[#6B7280] mb-3">Version History</p>
        <div className="relative">
          <div className="absolute left-2.75 top-1.5 bottom-1.5 w-px bg-[#E3E5EA]" />
          <ul className="flex flex-col gap-0">
            {p.versions.map((v, i) => (
              <li key={v.ver} className={`flex gap-3 ${i < p.versions.length - 1 ? "pb-4" : ""}`}>
                <span className="w-5.5 h-5.5 rounded-full bg-white border-2 border-[#E3E5EA] flex items-center justify-center shrink-0 z-10">
                  <span className="text-[9px] font-semibold text-[#6B7280]">{v.ver}</span>
                </span>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs text-[#6B7280]">{v.date}</p>
                  <p className="text-sm text-[#171A21] mt-0.5">{v.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── New proposal form ─────────────────────────────────────────────────────────

const EMPTY_LINE = { desc: "", amount: "" };
const EMPTY_FORM = {
  client: "", service: "", status: "Draft", validUntil: "",
  lineItems: [{ ...EMPTY_LINE }],
};

function NewProposalForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setLine  = (i, k) => (e) => {
    const items = form.lineItems.map((li, idx) => idx === i ? { ...li, [k]: e.target.value } : li);
    setForm((f) => ({ ...f, lineItems: items }));
  };
  const addLine    = () => setForm((f) => ({ ...f, lineItems: [...f.lineItems, { ...EMPTY_LINE }] }));
  const removeLine = (i) => setForm((f) => ({ ...f, lineItems: f.lineItems.filter((_, idx) => idx !== i) }));

  const subtotal = form.lineItems.reduce((s, li) => s + (parseFloat(li.amount) || 0), 0);
  const tax      = Math.round(subtotal * 0.18);
  const total    = subtotal + tax;

  const valid = form.client && form.service;

  const inputCls = "w-full border border-[#E3E5EA] rounded px-3 py-2 text-sm text-[#171A21] bg-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E7C66] transition-colors";
  const labelCls = "text-xs text-[#6B7280] mb-1 block";

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className={labelCls}>Client <span className="text-[#B3413A]">*</span></label>
        <select className={inputCls} value={form.client} onChange={setField("client")}>
          <option value="">Select client</option>
          {clients.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>Service / Requirement <span className="text-[#B3413A]">*</span></label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          placeholder="Brief description of the engagement…"
          value={form.service}
          onChange={setField("service")}
        />
      </div>

      {/* Line items */}
      <div>
        <label className={labelCls}>Line Items</label>
        <div className="flex flex-col gap-2">
          {form.lineItems.map((li, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className={`${inputCls} flex-1`}
                placeholder="Description"
                value={li.desc}
                onChange={setLine(i, "desc")}
              />
              <input
                className={`${inputCls} w-28 font-mono-data shrink-0`}
                placeholder="Amount"
                type="number"
                value={li.amount}
                onChange={setLine(i, "amount")}
              />
              {form.lineItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="p-1.5 text-[#6B7280] hover:text-[#B3413A] transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLine}
          className="mt-2 text-xs text-[#0E7C66] hover:text-[#0a6354] font-medium flex items-center gap-1 transition-colors"
        >
          <Plus size={12} strokeWidth={2.5} /> Add line item
        </button>
      </div>

      {/* Totals preview */}
      {subtotal > 0 && (
        <div className="bg-[#F5F6F8] rounded-lg px-4 py-3 flex flex-col gap-1.5">
          {[
            { label: "Subtotal", value: fmtINR(subtotal) },
            { label: "GST (18%)", value: fmtINR(tax) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{label}</span>
              <span className="font-mono-data text-[#6B7280]">{value}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-[#E3E5EA] mt-0.5">
            <span className="text-[#171A21]">Total</span>
            <span className="font-mono-data text-[#171A21]">{fmtINR(total)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Valid Until</label>
          <input className={inputCls} type="date" value={form.validUntil} onChange={setField("validUntil")} />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={form.status} onChange={setField("status")}>
            {STATUSES.filter((s) => s !== "All").map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="pt-2 border-t border-[#E3E5EA]">
        <Button
          type="submit"
          disabled={!valid}
          className={`w-full justify-center ${!valid ? "opacity-40 cursor-not-allowed" : ""}`}
          onClick={() => valid && onCreate?.(form)}
        >
          Save Proposal
        </Button>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  const [statusFilter, setStatus] = useState("All");
  const [selected, setSelected]   = useState(null);
  const [addOpen, setAddOpen]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const reduced = useReducedMotion();
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      const finish = setTimeout(() => setFirstLoad(false), 80);
      return () => clearTimeout(finish);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() =>
    statusFilter === "All" ? proposals : proposals.filter((p) => p.status === statusFilter),
    [statusFilter]
  );

  const closeAll = () => { setSelected(null); setAddOpen(false); };
  const openAdd = () => { setSelected(null); setAddOpen(true); };
  const openDetail = (p) => { setAddOpen(false); setSelected(p); };
  const clearFilters = () => setStatus("All");

  const handleCreate = (form) => {
    closeAll();
    toast({ message: `Proposal for ${form.client} created successfully.` });
  };

  const COLS = ["Proposal / Client", "Service", "Value", "Status", "Valid Until", "Owner"];

  return (
    <AppShell>
      <Header
        title="Proposals"
        action={
          <Button onClick={openAdd}>
            <Plus size={15} strokeWidth={2.5} /> New Proposal
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-[#E3E5EA] rounded px-3 py-2 text-sm bg-white text-[#171A21] focus:outline-none focus:border-[#0E7C66] transition-colors"
        >
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-sm text-[#6B7280]">
          {filtered.length} {filtered.length === 1 ? "proposal" : "proposals"}
        </span>
      </div>

      {loading ? (
        <TableSkeleton rows={7} cols={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E3E5EA] rounded-lg">
          <EmptyState
            icon={SearchX}
            title="No proposals match this filter"
            description="Try a different status to see matching work."
            action={{ label: "Clear filters", onClick: clearFilters }}
          />
        </div>
      ) : (
        <div className="bg-white border border-[#E3E5EA] rounded-lg overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#E3E5EA] bg-[#F5F6F8]">
                {COLS.map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-medium text-[#6B7280] text-left whitespace-nowrap ${h === "Value" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const expired = isExpired(p.validUntil);
                const shouldAnimate = !reduced && firstLoad;
                return (
                  <motion.tr
                    key={p.id}
                    initial={shouldAnimate ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={shouldAnimate ? { duration: 0.2, delay: i * 0.03 } : { duration: 0 }}
                    onClick={() => openDetail(p)}
                    className={`cursor-pointer transition-colors hover:bg-[#F5F6F8] ${
                      i < filtered.length - 1 ? "border-b border-[#E3E5EA]" : ""
                    } ${selected?.id === p.id ? "bg-[#F5F6F8]" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#171A21]">{p.client}</p>
                      <p className="font-mono-data text-xs text-[#6B7280] mt-0.5">{p.id} · {p.version}</p>
                    </td>
                    <td className="px-4 py-3 max-w-60">
                      <p className="truncate text-[#6B7280]" title={p.service}>{p.service}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data text-[#171A21] whitespace-nowrap">
                      {fmtValue(p.value)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={STATUS_VARIANTS[p.status]}>{p.status}</Badge>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${expired ? "text-[#B3413A]" : "text-[#6B7280]"}`}>
                      {fmtDate(p.validUntil)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0E7C66]/12 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-semibold text-[#0E7C66]">{p.owner.initials}</span>
                        </span>
                        <span className="text-sm text-[#171A21]">{p.owner.name}</span>
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <SlideOver open={!!selected} onClose={closeAll} title={selected ? `${selected.id} · ${selected.version}` : ""}>
        <ProposalDetail proposal={selected} />
      </SlideOver>

      <SlideOver open={addOpen} onClose={closeAll} title="New Proposal">
        <NewProposalForm onCreate={handleCreate} />
      </SlideOver>
    </AppShell>
  );
}
