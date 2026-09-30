"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import GlobalSearch from "@/components/ui/GlobalSearch";

export default function Header({ title, subtitle, action, breadcrumbs }) {
  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef(null);
  const router          = useRouter();
  const { user, logout } = useAuth();
  const toast           = useToast();

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleLogout() {
    setOpen(false);
    toast({ message: "You've been signed out.", variant: "info" });
    logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        {breadcrumbs?.length > 1 && (
          <nav className="flex items-center gap-1 mb-1">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={11} className="text-[#6B7280]" strokeWidth={1.8} />}
                {crumb.href
                  ? <Link href={crumb.href} className="text-xs text-[#6B7280] hover:text-[#0E7C66] transition-colors">{crumb.label}</Link>
                  : <span className="text-xs text-[#171A21] font-medium">{crumb.label}</span>
                }
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-lg font-semibold text-[#171A21] leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {action}
        <GlobalSearch />

        <button className="relative p-2 rounded hover:bg-[#E3E5EA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66]">
          <Bell size={18} className="text-[#6B7280]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B3413A]" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#E3E5EA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66]"
          >
            <div className="w-8 h-8 rounded-full bg-[#0E7C66]/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-[#0E7C66]">{user?.initials}</span>
            </div>
            <span className="text-sm text-[#171A21] font-medium">{user?.firstName} {user?.lastName}</span>
            <ChevronDown
              size={14} strokeWidth={2}
              className={`text-[#6B7280] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#E3E5EA] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-50 animate-[fadeScale_0.12s_ease-out]">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-[#171A21]">{user?.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{user?.email}</p>
                {user?.role && <p className="text-xs text-[#6B7280] mt-0.5">{user.role}</p>}
              </div>
              <div className="border-t border-[#E3E5EA]" />
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#B3413A] hover:bg-[#B3413A]/6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3413A]"
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
