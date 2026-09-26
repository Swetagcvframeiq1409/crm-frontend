"use client";
import { motion } from "framer-motion";

export default function StatCard({ label, value, isCurrency, delta, deltaPositive, animationDelay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: animationDelay, ease: "easeOut" }}
      className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4 flex flex-col gap-2"
    >
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className={`text-2xl font-semibold text-[#171A21] leading-none ${isCurrency ? "font-mono-data" : ""}`}>
        {value}
      </span>
      {delta && (
        <span className={`text-xs ${deltaPositive ? "text-[#0E7C66]" : "text-[#B3413A]"}`}>
          {delta}
        </span>
      )}
    </motion.div>
  );
}
