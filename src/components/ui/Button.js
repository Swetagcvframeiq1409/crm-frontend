"use client";
import { motion, useReducedMotion } from "framer-motion";

const variants = {
  primary: "bg-[#0E7C66] text-white hover:bg-[#0a6354] active:bg-[#085a4a]",
  ghost:   "bg-transparent text-[#6B7280] hover:bg-[#F5F6F8] hover:text-[#171A21]",
  outline: "border border-[#E3E5EA] text-[#171A21] hover:bg-[#F5F6F8]",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
