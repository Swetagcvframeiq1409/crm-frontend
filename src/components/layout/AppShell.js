"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AppShell({ children }) {
  const { loggedIn, ready } = useAuth();
  const router              = useRouter();
  const pathname            = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (ready && !loggedIn) {
      router.replace("/login");
    }
  }, [ready, loggedIn, router]);

  // Wait for storage restoration before deciding whether to redirect.
  if (!ready || !loggedIn) return null;

  return (
    <div className="flex h-full min-h-screen bg-[#F5F6F8]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main
        style={{ marginLeft: collapsed ? 56 : 224 }}
        className="flex-1 px-8 py-6 min-h-screen transition-[margin-left] duration-200 ease-in-out"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
