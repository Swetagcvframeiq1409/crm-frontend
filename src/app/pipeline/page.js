"use client";
import { useState, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LayoutGrid, List, Calendar, User } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import SlideOver from "@/components/ui/SlideOver";
import { deals as initialDeals } from "@/data/mockData";

// ── constants ─────────────────────────────────────────────────────────────────

const STAGES = ["Discovery", "Proposal", "Negotiation", "Won"];

const STAGE_META = {
  Discovery:   { tint: "bg-[#6B7280]/8",   text: "text-[#6B7280]",  badge: "muted"    },
  Proposal:    { tint: "bg-[#B7791F]/8",   text: "text-[#B7791F]",  badge: "amber"    },
  Negotiation: { tint: "bg-[#0E7C66]/8",   text: "text-[#0E7C66]",  badge: "teal"     },
  Won:         { tint: "bg-[#171A21]/6",   text: "text-[#171A21]",  badge: "muted"    },
};

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtValue(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return "₹" + n.toLocaleString("en-IN");
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Returns 'rose' | 'amber' | null based on days until close */
function urgency(iso) {
  const days = Math.ceil((new Date(iso) - Date.now()) / 86400000);
  if (days <= 3)  return "rose";
  if (days <= 7)  return "amber";
  return null;
}

const URGENCY_BORDER = {
  rose:  "border-l-[3px] border-l-[#B3413A]",
  amber: "border-l-[3px] border-l-[#B7791F]",
  null:  "border-l-[3px] border-l-transparent",
};

// ── DealCard (draggable) ──────────────────────────────────────────────────────

function DealCard({ deal, onClick, isDragOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id });
  const u = urgency(deal.closeDate);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging && !isDragOverlay ? 0 : 1,
    // lift effect on the overlay
    boxShadow: isDragOverlay ? "0 8px 24px rgba(0,0,0,0.13)" : undefined,
    cursor: isDragOverlay ? "grabbing" : "grab",
    zIndex: isDragOverlay ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // only fire click if not a drag (pointer didn't move much)
        if (!isDragging) onClick(deal);
      }}
      className={`bg-white border border-[#E3E5EA] rounded-lg px-3.5 py-3 flex flex-col gap-2 select-none
        ${URGENCY_BORDER[u] ?? URGENCY_BORDER["null"]}
        ${isDragOverlay ? "rotate-[1.5deg]" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-[#171A21] leading-snug">{deal.company}</span>
        <span className="font-mono-data text-sm font-medium text-[#171A21] whitespace-nowrap shrink-0">
          {fmtValue(deal.value)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
        <Calendar size={11} strokeWidth={1.8} />
        <span>{fmtDate(deal.closeDate)}</span>
        {u && (
          <span className={`ml-1 font-medium ${u === "rose" ? "text-[#B3413A]" : "text-[#B7791F]"}`}>
            {u === "rose" ? "· Closing soon" : "· This week"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded-full bg-[#0E7C66]/12 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-semibold text-[#0E7C66]">{deal.owner.initials}</span>
        </span>
        <span className="text-xs text-[#6B7280]">{deal.owner.name}</span>
      </div>
    </div>
  );
}

// ── Column (droppable) ────────────────────────────────────────────────────────

function Column({ stage, deals, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const meta = STAGE_META[stage];
  const total = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col min-w-0 flex-1">
      {/* Column header */}
      <div className={`${meta.tint} rounded-lg px-3.5 py-2.5 mb-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${meta.text}`}>{stage}</span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded bg-white/60 ${meta.text}`}>
            {deals.length}
          </span>
        </div>
        <span className="font-mono-data text-xs text-[#6B7280]">{fmtValue(total)}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2.5 flex-1 min-h-[120px] rounded-lg p-1 transition-colors
          ${isOver ? "bg-[#0E7C66]/5 ring-1 ring-[#0E7C66]/20" : ""}
        `}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListView({ deals, onRowClick }) {
  const STAGE_BADGE = { Discovery: "muted", Proposal: "amber", Negotiation: "teal", Won: "muted" };
  return (
    <div className="bg-white border border-[#E3E5EA] rounded-lg overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[#E3E5EA] bg-[#F5F6F8]">
            {["Company", "Stage", "Value", "Close Date", "Owner"].map((h) => (
              <th key={h} className={`px-4 py-3 text-xs font-medium text-[#6B7280] text-left whitespace-nowrap ${h === "Value" ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deals.map((deal, i) => {
            const u = urgency(deal.closeDate);
            return (
              <tr
                key={deal.id}
                onClick={() => onRowClick(deal)}
                className={`cursor-pointer hover:bg-[#F5F6F8] transition-colors ${i < deals.length - 1 ? "border-b border-[#E3E5EA]" : ""}`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-[#171A21]">{deal.company}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{deal.contact}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STAGE_BADGE[deal.stage]}>{deal.stage}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono-data text-[#171A21] whitespace-nowrap">
                  {fmtValue(deal.value)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-sm ${u === "rose" ? "text-[#B3413A]" : u === "amber" ? "text-[#B7791F]" : "text-[#6B7280]"}`}>
                    {fmtDate(deal.closeDate)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0E7C66]/12 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-[#0E7C66]">{deal.owner.initials}</span>
                    </span>
                    <span className="text-sm text-[#171A21]">{deal.owner.name}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Deal detail slide-over content ────────────────────────────────────────────

function DealDetail({ deal }) {
  if (!deal) return null;
  const u = urgency(deal.closeDate);
  const stageMeta = STAGE_META[deal.stage];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-[#171A21]">{deal.company}</h3>
        <p className="text-sm text-[#6B7280] mt-0.5">{deal.contact} · {deal.industry}</p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={stageMeta.badge}>{deal.stage}</Badge>
        {u && (
          <Badge variant={u}>{u === "rose" ? "Closing soon" : "Due this week"}</Badge>
        )}
      </div>

      <hr className="border-[#E3E5EA]" />

      {[
        { label: "Deal ID",     value: deal.id,                  mono: true  },
        { label: "Value",       value: fmtValue(deal.value),     mono: true  },
        { label: "Close Date",  value: fmtDate(deal.closeDate),  mono: false },
        { label: "Owner",       value: deal.owner.name,          mono: false },
      ].map(({ label, value, mono }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="text-xs text-[#6B7280]">{label}</span>
          <span className={`text-sm text-[#171A21] ${mono ? "font-mono-data" : "font-medium"}`}>{value}</span>
        </div>
      ))}

      {deal.note && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-[#6B7280]">Notes</span>
          <p className="text-sm text-[#171A21] leading-relaxed">{deal.note}</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [deals, setDeals]           = useState(initialDeals);
  const [view, setView]             = useState("board");   // "board" | "list"
  const [activeDeal, setActiveDeal] = useState(null);      // currently dragging
  const [selectedDeal, setSelected] = useState(null);      // slide-over

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Group deals by stage
  const byStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s, []]));
    deals.forEach((d) => { if (map[d.stage]) map[d.stage].push(d); });
    return map;
  }, [deals]);

  function handleDragStart({ active }) {
    setActiveDeal(deals.find((d) => d.id === active.id) ?? null);
  }

  function handleDragEnd({ active, over }) {
    setActiveDeal(null);
    if (!over || active.id === over.id) return;
    const targetStage = STAGES.includes(over.id) ? over.id : null;
    if (!targetStage) return;
    setDeals((prev) =>
      prev.map((d) => d.id === active.id ? { ...d, stage: targetStage } : d)
    );
  }

  const ViewToggle = (
    <div className="flex items-center border border-[#E3E5EA] rounded overflow-hidden bg-white">
      {[
        { id: "board", Icon: LayoutGrid, label: "Board" },
        { id: "list",  Icon: List,       label: "List"  },
      ].map(({ id, Icon, label }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
            view === id
              ? "bg-[#0E7C66] text-white"
              : "text-[#6B7280] hover:bg-[#F5F6F8]"
          }`}
        >
          <Icon size={14} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <AppShell>
      <Header title="Pipeline" action={ViewToggle} />

      {view === "board" ? (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 items-start overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <Column
                key={stage}
                stage={stage}
                deals={byStage[stage]}
                onCardClick={setSelected}
              />
            ))}
          </div>

          {/* Drag overlay — the floating card while dragging */}
          <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
            {activeDeal && (
              <DealCard deal={activeDeal} onClick={() => {}} isDragOverlay />
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <ListView deals={deals} onRowClick={setSelected} />
      )}

      <SlideOver
        open={!!selectedDeal}
        onClose={() => setSelected(null)}
        title={selectedDeal?.company ?? ""}
      >
        <DealDetail deal={selectedDeal} />
      </SlideOver>
    </AppShell>
  );
}
