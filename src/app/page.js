"use client";

import { useMemo, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import PipelineChart from "@/components/dashboard/PipelineChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AttentionList from "@/components/dashboard/AttentionList";
import { recentActivity, attentionClients, deals, leads } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { fmtValue } from "@/lib/format";

const STAGE_ORDER = ["Discovery", "Proposal", "Negotiation", "Won"];

const pipelineValue = deals
  .filter((deal) => deal.stage !== "Won")
  .reduce((sum, deal) => sum + deal.value, 0);

const activeLeads = leads.filter((lead) => ["New", "Contacted", "Qualified"].includes(lead.status)).length;

const wonThisMonthDeals = deals.filter(
  (deal) => deal.stage === "Won" && deal.closeDate.startsWith("2026-09")
);
const wonThisMonthCount = wonThisMonthDeals.length;
const wonThisMonthValue = wonThisMonthDeals.reduce((sum, deal) => sum + deal.value, 0);

const baseCards = [
  {
    id: "pipeline",
    label: "Total Pipeline Value",
    value: fmtValue(pipelineValue),
    isCurrency: true,
    delta: "+12%",
    deltaPositive: true,
  },
  {
    id: "leads",
    label: "Active Leads",
    value: String(activeLeads),
    delta: "+5",
    deltaPositive: true,
  },
  {
    id: "won",
    label: "Deals Won This Month",
    value: String(wonThisMonthCount),
    delta: fmtValue(wonThisMonthValue),
    deltaPositive: true,
  },
  {
    id: "overdue",
    label: "Overdue Follow-ups",
    value: "11",
    delta: "-2",
    deltaPositive: false,
  },
];

const RANGE_DATA = {
  "7d": {
    title: "7 days",
    revenue: [
      { label: "Mon", value: 18 }, { label: "Tue", value: 22 }, { label: "Wed", value: 26 }, { label: "Thu", value: 24 }, { label: "Fri", value: 29 }, { label: "Sat", value: 34 }, { label: "Sun", value: 38 },
    ],
    trends: {
      pipeline: [{ value: 30 }, { value: 32 }, { value: 31 }, { value: 35 }, { value: 37 }, { value: 38 }, { value: 42 }],
      leads: [{ value: 18 }, { value: 20 }, { value: 21 }, { value: 24 }, { value: 23 }, { value: 27 }, { value: 34 }],
      won: [{ value: 2 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 8 }],
      overdue: [{ value: 17 }, { value: 16 }, { value: 15 }, { value: 14 }, { value: 12 }, { value: 11 }, { value: 11 }],
    },
  },
  "30d": {
    title: "30 days",
    revenue: [
      { label: "Wk 1", value: 22 }, { label: "Wk 2", value: 25 }, { label: "Wk 3", value: 30 }, { label: "Wk 4", value: 42 },
    ],
    trends: {
      pipeline: [{ value: 38 }, { value: 42 }, { value: 40 }, { value: 46 }, { value: 48 }, { value: 52 }, { value: 58 }],
      leads: [{ value: 22 }, { value: 24 }, { value: 25 }, { value: 29 }, { value: 31 }, { value: 35 }, { value: 39 }],
      won: [{ value: 3 }, { value: 5 }, { value: 5 }, { value: 6 }, { value: 7 }, { value: 9 }, { value: 11 }],
      overdue: [{ value: 18 }, { value: 17 }, { value: 16 }, { value: 15 }, { value: 12 }, { value: 10 }, { value: 9 }],
    },
  },
  "90d": {
    title: "90 days",
    revenue: [
      { label: "Jul", value: 26 }, { label: "Aug", value: 29 }, { label: "Sep", value: 34 },
    ],
    trends: {
      pipeline: [{ value: 44 }, { value: 49 }, { value: 52 }, { value: 54 }, { value: 58 }, { value: 63 }, { value: 68 }],
      leads: [{ value: 26 }, { value: 28 }, { value: 31 }, { value: 34 }, { value: 39 }, { value: 42 }, { value: 46 }],
      won: [{ value: 4 }, { value: 5 }, { value: 6 }, { value: 8 }, { value: 9 }, { value: 11 }, { value: 13 }],
      overdue: [{ value: 20 }, { value: 17 }, { value: 14 }, { value: 12 }, { value: 10 }, { value: 8 }, { value: 7 }],
    },
  },
};

const periods = ["7d", "30d", "90d"];

function buildStageSummary(stageDeals = deals) {
  return STAGE_ORDER.map((stage) => {
    const matches = stageDeals.filter((deal) => deal.stage === stage);
    const value = matches.reduce((sum, deal) => sum + deal.value, 0);

    return {
      stage,
      count: matches.length,
      value,
    };
  });
}

export default function DashboardPage() {
  const [range, setRange] = useState("30d");
  const { user } = useAuth();
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";
  const summary = RANGE_DATA[range];
  const stageSummary = useMemo(() => buildStageSummary(deals), []);

  const cards = useMemo(
    () => baseCards.map((card) => ({
      ...card,
      trend: summary.trends[card.id],
    })),
    [summary]
  );

  const revenueData = useMemo(() => summary.revenue.map((item) => ({
    ...item,
    value: item.value * 100000,
  })), [summary]);

  return (
    <AppShell>
      <Header
        title={`${greeting}, ${user?.firstName ?? ""}`}
        subtitle={today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
      />

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-[#E3E5EA] bg-white p-1">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setRange(period)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${range === period ? "bg-[#0E7C66] text-white" : "text-[#6B7280] hover:bg-[#F5F6F8]"}`}
            >
              {RANGE_DATA[period].title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => (
          <StatCard key={card.id} {...card} animationDelay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-[#E3E5EA] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#171A21]">Revenue Trend</h2>
              <span className="text-xs text-[#6B7280]">{summary.title}</span>
            </div>
            <div className="h-55 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0E7C66" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#0E7C66" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E3E5EA" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]} />
                  <Area type="monotone" dataKey="value" stroke="#0E7C66" strokeWidth={2.5} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <PipelineChart stages={stageSummary} />
          <AttentionList clients={attentionClients} />
        </div>

        <div className="xl:col-span-1">
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>
    </AppShell>
  );
}
