"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function SlideOver({ open, onClose, title, children, width = "w-[480px]" }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/25 z-40"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className={`fixed top-0 right-0 h-full ${width} bg-white border-l border-[#E3E5EA] z-50 flex flex-col`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E5EA] shrink-0">
              <h2 className="text-base font-semibold text-[#171A21]">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-[#F5F6F8] text-[#6B7280] hover:text-[#171A21] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
