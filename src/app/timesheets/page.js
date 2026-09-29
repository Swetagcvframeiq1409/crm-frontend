"use client";

/**
 * Timesheets page
 * State is kept in React memory only.
 * TODO: replace setSheets() calls with API mutations when the backend is ready.
 */

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { timesheets as seedData, projects } from "@/data/mockData";

// ── date helpers (one place, used everywhere) ─────────────────────────────────

const DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/** "2026-09-28" → Date (local midnight) */
function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Date → "28 Sep 2026" */
function fmt(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "2026-09-28" → "28 Sep – 4 Oct 2026" */
function weekLabel(iso) {
  const mon = parseISO(iso);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const sameMon = mon.getMonth() === sun.getMonth();
  const sameYear = mon.getFullYear() === sun.getFullYear();
  const start = sameMon
    ? `${mon.getDate()}`
    : `${mon.getDate()} ${MONTHS[mon.getMonth()]}${sameYear ? "" : ` ${mon.getFullYear()}`}`;
  return `${start} – ${fmt(sun)}`;
}

/** Add/subtract weeks from an ISO Monday string */
function shiftWeek(iso, delta) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + delta * 7);
  return d.toISOString().slice(0, 10);
}

/** Sum an hours[7] array */
function rowTotal(hours) {
  return hours.reduce((s, h) => s + (parseFloat(h) || 0), 0);
}

/** Sum all entries in a timesheet */
function sheetTotal(entries) {
  return entries.reduce((s, e) => s + rowTotal(e.hours), 0);
}

// ── status badge variant map ──────────────────────────────────────────────────

const STATUS_VARIANT = {
  Draft:     "muted",
  Submitted: "amber",
  Approved:  "teal",
  Rejected:  "rose",
};

// ── active projects lookup ────────────────────────────────────────────────────

const ACTIVE_PROJECTS = Object.fromEntries(
  projects.filter((p) => p.status === "Active").map((p) => [p.id, p])
);

// ── stat card (plain, no sparkline needed here) ───────────────────────────────

function MiniStat({ label, value, sub }) {
  return (
    <div className="bg-white border border-[#E3E5EA] rounded-lg px-4 py-3.5 flex flex-col gap-1">
      <span className="text-xs text-[#6B7280]">{label}</span>
      <span className="text-2xl font-semibold text-[#171A21] leading-none">{value}</span>
      {sub && <span className="text-xs text-[#6B7280]">{sub}</span>}
    </div>
  );
}

// ── My Timesheet tab ──────────────────────────────────────────────────────────

function MyTimesheetTab({ sheets, onUpdate, userId, userName }) {
  const toast = useToast();

  // Current week ISO (Mon 28 Sep 2026 is the seed "today")
  const [weekISO, setWeekISO] = useState("2026-09-28");

  // Find or synthesise a sheet for this user + week
  const existing = useMemo(
    () => sheets.find((s) => s.employeeId === userId && s.weekStart === weekISO),
    [sheets, userId, weekISO]
  );

  // Derive editable entries from the sheet (or empty rows for active projects)
  const baseEntries = useMemo(() => {
    if (existing) return existing.entries.map((e) => ({ ...e, hours: [...e.hours] }));
    // No sheet yet — show rows for every active project (hours all zero)
    return Object.keys(ACTIVE_PROJECTS).map((id) => ({
      projectId: id,
      hours: [0, 0, 0, 0, 0, 0, 0],
    }));
  }, [existing]);

  const [entries, setEntries] = useState(baseEntries);

  // Re-sync entries when week changes
  const handleWeekChange = useCallback((newISO) => {
    setWeekISO(newISO);
    const s = sheets.find((sh) => sh.employeeId === userId && sh.weekStart === newISO);
    if (s) {
      setEntries(s.entries.map((e) => ({ ...e, hours: [...e.hours] })));
    } else {
      setEntries(Object.keys(ACTIVE_PROJECTS).map((id) => ({ projectId: id, hours: [0,0,0,0,0,0,0] })));
    }
  }, [sheets, userId]);

  const rejectedByName = sheets.find(
    (s) => s.employeeName === userName && s.weekStart === weekISO && s.status === "Rejected"
  );
  const status   = rejectedByName?.status ?? existing?.status ?? "Draft";
  const readOnly = status === "Submitted" || status === "Approved";

  // Column totals
  const colTotals = DAYS.map((_, di) =>
    entries.reduce((s, e) => s + (parseFloat(e.hours[di]) || 0), 0)
  );
  const weeklyTotal = colTotals.reduce((s, v) => s + v, 0);

  function setHour(rowIdx, dayIdx, val) {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === rowIdx
          ? { ...e, hours: e.hours.map((h, j) => (j === dayIdx ? val : h)) }
          : e
      )
    );
  }

  function saveDraft() {
    onUpdate({ userId, weekISO, entries, status: "Draft", submittedDate: null });
    toast({ message: "Timesheet saved as draft." });
  }

  function submit() {
    onUpdate({ userId, weekISO, entries, status: "Submitted", submittedDate: weekISO });
    toast({ message: "Timesheet submitted for approval.", variant: "info" });
  }

  const totalColor =
    weeklyTotal < 40 || weeklyTotal > 45
      ? "text-[#B7791F] font-semibold"
      : "text-[#0E7C66] font-semibold";

  const inputCls =
    "w-14 text-center text-sm font-mono-data border border-[#E3E5EA] rounded px-1 py-1 " +
    "focus:outline-none focus:border-[#0E7C66] transition-colors bg-white disabled:bg-[#F5F6F8] disabled:text-[#6B7280]";

  return (
    <div className="flex flex-col gap-5">
      {/* Week selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleWeekChange(shiftWeek(weekISO, -1))}
          className="p-1.5 rounded border border-[#E3E5EA] hover:bg-[#F5F6F8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66]"
          aria-label="Previous week"
        >
          <ChevronLeft size={15} strokeWidth={2} />
        </button>
        <span className="text-sm font-medium text-[#171A21] min-w-[180px] text-center">
          {weekLabel(weekISO)}
        </span>
        <button
          onClick={() => handleWeekChange(shiftWeek(weekISO, 1))}
          className="p-1.5 rounded border border-[#E3E5EA] hover:bg-[#F5F6F8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66]"
          aria-label="Next week"
        >
          <ChevronRight size={15} strokeWidth={2} />
        </button>
        <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
      </div>

      {/* Grid */}
      <div className="bg-white border border-[#E3E5EA] rounded-lg overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#E3E5EA] bg-[#F5F6F8]">
              <th className="px-4 py-2.5 text-xs font-medium text-[#6B7280] text-left w-48">Project</th>
              {DAYS.map((d) => (
                <th key={d} className="px-2 py-2.5 text-xs font-medium text-[#6B7280] text-center w-16">{d}</th>
              ))}
              <th className="px-4 py-2.5 text-xs font-medium text-[#6B7280] text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, ri) => {
              const proj = ACTIVE_PROJECTS[entry.projectId];
              if (!proj) return null;
              const total = rowTotal(entry.hours);
              return (
                <tr key={entry.projectId} className="border-b border-[#E3E5EA] last:border-0">
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-medium text-[#171A21] truncate max-w-[180px]">{proj.name}</p>
                    <p className="text-xs text-[#6B7280]">{proj.client}</p>
                  </td>
                  {entry.hours.map((h, di) => (
                    <td key={di} className="px-2 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={h}
                        disabled={readOnly}
                        onChange={(ev) => setHour(ri, di, parseFloat(ev.target.value) || 0)}
                        className={inputCls}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right font-mono-data text-sm text-[#171A21]">
                    {total % 1 === 0 ? total : total.toFixed(1)}
                  </td>
                </tr>
              );
            })}

            {/* Column totals row */}
            <tr className="bg-[#F5F6F8] border-t border-[#E3E5EA]">
              <td className="px-4 py-2.5 text-xs font-medium text-[#6B7280]">Daily total</td>
              {colTotals.map((t, i) => (
                <td key={i} className="px-2 py-2.5 text-center font-mono-data text-xs text-[#171A21]">
                  {t % 1 === 0 ? t : t.toFixed(1)}
                </td>
              ))}
              <td className={`px-4 py-2.5 text-right font-mono-data text-sm ${totalColor}`}>
                {weeklyTotal % 1 === 0 ? weeklyTotal : weeklyTotal.toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Target note + actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6B7280]">
          Target: <span className="font-medium text-[#171A21]">40 hours</span>
          {weeklyTotal > 0 && weeklyTotal < 40 && (
            <span className="ml-2 text-[#B7791F]">({(40 - weeklyTotal).toFixed(1)} hrs short)</span>
          )}
          {weeklyTotal > 45 && (
            <span className="ml-2 text-[#B7791F]">({(weeklyTotal - 45).toFixed(1)} hrs over cap)</span>
          )}
        </p>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={saveDraft}>Save draft</Button>
            <Button onClick={submit} disabled={weeklyTotal === 0}>
              Submit for approval
            </Button>
          </div>
        )}

        {readOnly && (
          <p className="text-xs text-[#6B7280]">
            {status === "Approved" ? "Approved — read only." : "Submitted — awaiting approval."}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Approvals tab ─────────────────────────────────────────────────────────────

function ApprovalsTab({ sheets, onApprove, onReject }) {
  const pending = sheets.filter((s) => s.status === "Submitted");
  const rejected = sheets.filter((s) => s.status === "Rejected");

  if (pending.length === 0 && rejected.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No timesheets waiting"
        description="All submitted timesheets have been reviewed."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pending.length > 0 && <div className="bg-white border border-[#E3E5EA] rounded-lg overflow-hidden">
        <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[#E3E5EA] bg-[#F5F6F8]">
            {["Employee", "Week", "Total hours", "Submitted", ""].map((h) => (
              <th
                key={h}
                className={`px-4 py-3 text-xs font-medium text-[#6B7280] text-left whitespace-nowrap ${h === "Total hours" ? "text-right" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pending.map((s, i) => {
            const total = sheetTotal(s.entries);
            return (
              <tr
                key={s.id}
                className={`${i < pending.length - 1 ? "border-b border-[#E3E5EA]" : ""}`}
              >
                <td className="px-4 py-3 font-medium text-[#171A21]">{s.employeeName}</td>
                <td className="px-4 py-3 text-[#6B7280]">{weekLabel(s.weekStart)}</td>
                <td className="px-4 py-3 text-right font-mono-data text-[#171A21]">
                  {total % 1 === 0 ? total : total.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-[#6B7280]">
                  {s.submittedDate ? fmt(parseISO(s.submittedDate)) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onApprove(s.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-[#0E7C66] bg-[#0E7C66]/8 hover:bg-[#0E7C66]/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66]"
                    >
                      <CheckCircle2 size={13} strokeWidth={2} />
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(s.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-[#B3413A] bg-[#B3413A]/8 hover:bg-[#B3413A]/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3413A]"
                    >
                      <XCircle size={13} strokeWidth={2} />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>}

      {rejected.length > 0 && (
        <details className="bg-white border border-[#E3E5EA] rounded-lg overflow-hidden">
          <summary className="px-4 py-3 text-sm font-medium text-[#171A21] cursor-pointer">
            Recently rejected ({rejected.length})
          </summary>
          <div className="overflow-x-auto border-t border-[#E3E5EA]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#F5F6F8]">
                  {["Employee", "Week", "Total hours", "Status"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-medium text-[#6B7280] text-left whitespace-nowrap ${h === "Total hours" ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rejected.map((s, i) => {
                  const total = sheetTotal(s.entries);
                  return (
                    <tr key={s.id} className={i < rejected.length - 1 ? "border-b border-[#E3E5EA]" : ""}>
                      <td className="px-4 py-3 font-medium text-[#171A21]">{s.employeeName}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{weekLabel(s.weekStart)}</td>
                      <td className="px-4 py-3 text-right font-mono-data text-[#171A21]">
                        {total % 1 === 0 ? total : total.toFixed(1)}
                      </td>
                      <td className="px-4 py-3"><Badge variant="rose">Rejected</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const CAN_APPROVE = ["Sales Manager", "admin"];
const CURRENT_WEEK = "2026-09-28";

export default function TimesheetsPage() {
  const { user }  = useAuth();
  const toast     = useToast();
  const canApprove = CAN_APPROVE.includes(user?.role);

  // All timesheet state lives here — backend will own this later
  const [sheets, setSheets] = useState(seedData);
  const [tab, setTab]       = useState("mine");

  // ── stat calculations ──────────────────────────────────────────────────────

  const myCurrentSheet = sheets.find(
    (s) => s.employeeId === user?.id && s.weekStart === CURRENT_WEEK
  );
  const hoursThisWeek = myCurrentSheet ? sheetTotal(myCurrentSheet.entries) : 0;

  const pendingCount = sheets.filter((s) => s.status === "Submitted").length;

  // Average over last 4 approved weeks for this user, excluding the current week
  // so approving today's sheet doesn't skew the stat.
  const myApproved = sheets
    .filter(
      (s) =>
        s.employeeId === user?.id &&
        s.status === "Approved" &&
        s.weekStart < CURRENT_WEEK
    )
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    .slice(0, 4);
  const avgHours =
    myApproved.length > 0
      ? (myApproved.reduce((s, sh) => s + sheetTotal(sh.entries), 0) / myApproved.length).toFixed(1)
      : "—";

  // ── sheet mutation helpers ─────────────────────────────────────────────────

  function handleUpdate({ userId, weekISO, entries, status, submittedDate }) {
    setSheets((prev) => {
      const idx = prev.findIndex(
        (s) => s.employeeId === userId && s.weekStart === weekISO
      );
      const next = {
        id: idx >= 0 ? prev[idx].id : `TS-${Date.now()}`,
        employeeId: userId,
        employeeName: user?.name ?? userId,
        weekStart: weekISO,
        status,
        submittedDate,
        entries,
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = next;
        return updated;
      }
      return [...prev, next];
    });
  }

  function handleApprove(id) {
    setSheets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Approved" } : s))
    );
    const s = sheets.find((sh) => sh.id === id);
    toast({ message: `Approved timesheet for ${s?.employeeName ?? id}.` });
  }

  function handleReject(id) {
    setSheets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Rejected" } : s))
    );
    const s = sheets.find((sh) => sh.id === id);
    toast({ message: `Rejected timesheet for ${s?.employeeName ?? id}.`, variant: "error" });
  }

  // ── render ─────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "mine",      label: "My Timesheet" },
    ...(canApprove ? [{ id: "approvals", label: `Approvals${pendingCount > 0 ? ` (${pendingCount})` : ""}` }] : []),
  ];

  return (
    <AppShell>
      <Header
        title="Timesheets"
        breadcrumbs={[{ label: "Timesheets" }]}
      />

      {/* Stat row */}
      <div className={`grid ${canApprove ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-[minmax(0,16rem)]"} gap-4 mb-6`}>
        <MiniStat
          label="Hours logged this week"
          value={hoursThisWeek % 1 === 0 ? String(hoursThisWeek) : hoursThisWeek.toFixed(1)}
          sub="Current week"
        />
        {canApprove && (
          <>
            <MiniStat
              label="Awaiting approval"
              value={String(pendingCount)}
              sub={pendingCount === 1 ? "timesheet" : "timesheets"}
            />
            <MiniStat
              label="Avg weekly hours"
              value={String(avgHours)}
              sub="Last 4 approved weeks"
            />
          </>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-[#E3E5EA] mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none ${
              tab === t.id
                ? "border-[#0E7C66] text-[#0E7C66]"
                : "border-transparent text-[#6B7280] hover:text-[#171A21]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "mine" && (
        <MyTimesheetTab
          sheets={sheets}
          onUpdate={handleUpdate}
          userId={user?.id}
          userName={user?.name}
        />
      )}
      {tab === "approvals" && canApprove && (
        <ApprovalsTab
          sheets={sheets}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </AppShell>
  );
}
