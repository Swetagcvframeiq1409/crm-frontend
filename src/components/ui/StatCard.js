"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

function parseValue(raw) {
  const stripped = raw.replace(/,/g, "");
  const match = stripped.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], num: parseFloat(match[2]), suffix: match[3] };
}

function formatNum(num, originalRaw) {
  const stripped = originalRaw.replace(/,/g, "");
  const match = stripped.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return originalRaw;
  const isFloat = match[2].includes(".");
  if (isFloat) return num.toFixed(2);
  // Keep Indian digit grouping for values that were originally grouped.
  if (originalRaw.includes(",")) {
    return Math.round(num).toLocaleString("en-IN");
  }
  return String(Math.round(num));
}

function useCountUp(target, duration, skip) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (skip) return;

    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, skip, target]);

  return skip ? target : display;
}

export default function StatCard({ label, value, isCurrency, delta, deltaPositive, trend = [], animationDelay = 0 }) {
  const reduced = useReducedMotion();
  const ArrowIcon = deltaPositive ? ArrowUpRight : ArrowDownRight;

  const parsed = parseValue(value);
  const counted = useCountUp(parsed?.num ?? 0, 600, reduced || !parsed);

  const displayValue = parsed && !reduced
    ? `${parsed.prefix}${formatNum(counted, value)}${parsed.suffix}`
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.28, delay: reduced ? 0 : animationDelay, ease: "easeOut" }}
      className="bg-white border border-[#E3E5EA] rounded-lg px-4 py-3.5 flex flex-col gap-2.5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-[#6B7280]">{label}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${deltaPositive ? "bg-[#0E7C66]/10 text-[#0E7C66]" : "bg-[#B3413A]/10 text-[#B3413A]"}`}>
          <ArrowIcon size={11} strokeWidth={2} />
          {delta}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <span className={`text-2xl font-semibold text-[#171A21] leading-none ${isCurrency ? "font-mono-data" : ""}`}>
          {displayValue}
        </span>
      </div>

      <div className="h-8 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={deltaPositive ? "#0E7C66" : "#B3413A"}
              strokeWidth={2.2}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
