"use client";

import { useEffect, useMemo } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  success: {
    icon: CheckCircle2,
    className: "border-l-[#0E7C66] bg-white text-[#171A21]",
    iconClass: "text-[#0E7C66]",
  },
  error: {
    icon: AlertCircle,
    className: "border-l-[#B3413A] bg-white text-[#171A21]",
    iconClass: "text-[#B3413A]",
  },
  info: {
    icon: Info,
    className: "border-l-[#B7791F] bg-white text-[#171A21]",
    iconClass: "text-[#B7791F]",
  },
};

export function ToastViewport({ toasts }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-100 flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = variants[toast.variant] ?? variants.success;
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 18, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-[#E3E5EA] border-l-[3px] px-3.5 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.10)] ${config.className}`}
            >
              <span className={`mt-0.5 ${config.iconClass}`}>
                <Icon size={16} strokeWidth={2} />
              </span>
              <span className="text-sm leading-snug">{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
