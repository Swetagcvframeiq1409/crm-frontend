"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header({ title, subtitle, action }) {
  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef(null);
  const router          = useRouter();
  const { logout }      = useAuth();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-lg font-semibold text-[#171A21] leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {action}

        {/* Notification bell */}
        <button className="relative p-2 rounded hover:bg-[#E3E5EA] transition-colors">
          <Bell size={18} className="text-[#6B7280]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B3413A]" />
        </button>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#E3E5EA] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0E7C66]/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-[#0E7C66]">SG</span>
            </div>
            <span className="text-sm text-[#171A21] font-medium">Sweta G.</span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`text-[#6B7280] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#E3E5EA] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-50
                animate-[fadeScale_0.12s_ease-out]"
            >
              {/* User info — non-interactive */}
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-[#171A21]">Sweta G.</p>
                <p className="text-xs text-[#6B7280] mt-0.5">sweta.g@cvframeiq.com</p>
              </div>

              <div className="border-t border-[#E3E5EA]" />

              {/* Log out */}
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#B3413A] hover:bg-[#B3413A]/6 transition-colors"
                >
                  <LogOut size={14} strokeWidth={1.8} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
