"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const stageColors = {
  Discovery:   "#6B7280",
  Proposal:    "#B7791F",
  Negotiation: "#0E7C66",
  Won:         "#171A21",
};

function fmt(v) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

export default function PipelineChart({ stages }) {
  const data = stages.map((stage) => ({
    ...stage,
    name: stage.stage,
  }));

  return (
    <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
      <h2 className="text-sm font-semibold text-[#171A21] mb-4">Deals by Stage</h2>
      <div className="h-57.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid horizontal={false} stroke="#E3E5EA" strokeDasharray="3 3" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={76} tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip
              cursor={{ fill: "rgba(14,124,102,0.04)" }}
              formatter={(value, name) => [name === "count" ? value : fmt(Number(value)), name === "count" ? "Deals" : "Value"]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((entry) => (
                <Cell key={entry.stage} fill={stageColors[entry.stage]} opacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
