"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { projects } from "@/data/mockData";
import { fmtValue } from "@/lib/format";
import { fmtDate, daysUntil } from "@/lib/dates";

// ── constants ─────────────────────────────────────────────────────────────────

const STATUSES = ["All", "Planning", "Active", "On Hold", "Completed"];

const STATUS_BADGE = {
  Planning:  "muted",
  Active:    "teal",
  "On Hold": "amber",
  Completed: "bluegrey",
};

// ── helpers ───────────────────────────────────────────────────────────────────

function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#E3E5EA] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#0E7C66] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-[#6B7280] tabular-nums w-7 text-right">{pct}%</span>
    </div>
  );
}

function OwnerAvatar({ initials, name }) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-[#0E7C66]/12 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-semibold text-[#0E7C66]">{initials}</span>
      </span>
      <span className="text-sm text-[#171A21]">{name}</span>
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const router = useRouter();
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [loading, setLoading]       = useState(true);
  const [didAnimate, setDidAnimate] = useState(false);
  const reduced                     = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => { setLoading(false); setDidAnimate(true); }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
      const matchS = statusFilter === "All" || p.status === statusFilter;
      return matchQ && matchS;
    });
  }, [search, statusFilter]);

  // Summary stats — calculated from full dataset, not filtered view
  const { activeCount, onHoldCount, endingSoon } = useMemo(() => ({
    activeCount:  projects.filter((p) => p.status === "Active").length,
    onHoldCount:  projects.filter((p) => p.status === "On Hold").length,
    endingSoon:   projects.filter((p) => {
      const d = daysUntil(p.endDate);
      return d >= 0 && d <= 60 && p.status !== "Completed";
    }).length,
  }), []);

  const COLS = ["Project / Client", "Manager", "Team", "End Date", "Budget", "Progress", "Status"];

  return (
    <AppShell>
      <Header title="Projects" />

      {/* Summary row */}
      <div className="flex items-center gap-5 mb-5">
        {[
          { label: "Active",          value: activeCount  },
          { label: "On Hold",         value: onHoldCount  },
          { label: "Ending in 60 days", value: endingSoon },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[#171A21]">{value}</span>
            <span className="text-sm text-[#6B7280]">{label}</span>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Filter projects..."
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
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E3E5EA] rounded-lg">
          <EmptyState
            icon={SearchX}
            title="No projects match your filters"
            description="Try adjusting your search or status filter."
            action={{ label: "Clear filters", onClick: () => { setSearch(""); setStatus("All"); } }}
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
                    className={`px-4 py-3 text-xs font-medium text-[#6B7280] text-left whitespace-nowrap ${h === "Budget" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((project, i) => {
                const shouldAnimate = !reduced && !didAnimate;
                const managerInitials = project.projectManager
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <motion.tr
                    key={project.id}
                    initial={shouldAnimate ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={shouldAnimate ? { duration: 0.2, delay: i * 0.03 } : { duration: 0 }}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className={`cursor-pointer transition-colors hover:bg-[#F5F6F8] ${i < filtered.length - 1 ? "border-b border-[#E3E5EA]" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#171A21]">{project.name}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{project.client}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <OwnerAvatar initials={managerInitials} name={project.projectManager} />
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                      {project.team.length} member{project.team.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                      {fmtDate(project.endDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data text-[#171A21] whitespace-nowrap">
                      {fmtValue(project.budget)}
                    </td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <ProgressBar value={project.progress} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={STATUS_BADGE[project.status]}>{project.status}</Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
