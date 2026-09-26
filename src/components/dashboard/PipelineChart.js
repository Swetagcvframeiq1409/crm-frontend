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
  const max = Math.max(...stages.map((s) => s.count));
  return (
    <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
      <h2 className="text-sm font-semibold text-[#171A21] mb-4">Deals by Stage</h2>
      <div className="flex flex-col gap-3">
        {stages.map(({ stage, count, value }) => (
          <div key={stage} className="flex items-center gap-3">
            <span className="w-24 text-xs text-[#6B7280] shrink-0">{stage}</span>
            <div className="flex-1 h-6 bg-[#F5F6F8] rounded overflow-hidden">
              <div
                className="h-full rounded"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: stageColors[stage], opacity: 0.85 }}
              />
            </div>
            <span className="w-5 text-xs font-medium text-[#171A21] text-right shrink-0">{count}</span>
            <span className="w-16 text-xs font-mono-data text-[#6B7280] text-right shrink-0">{fmt(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
