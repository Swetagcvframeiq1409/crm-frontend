"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, GitMerge, Briefcase,
  FileText, FolderKanban, Clock, ReceiptText, Headphones, BarChart3, Settings, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const GROUPS = [
  {
    label: "Sales",
    items: [
      { label: "Dashboard", href: "/",          icon: LayoutDashboard },
      { label: "Leads",     href: "/leads",      icon: Users           },
      { label: "Pipeline",  href: "/pipeline",   icon: GitMerge        },
      { label: "Clients",   href: "/clients",    icon: Briefcase       },
      { label: "Proposals", href: "/proposals",  icon: FileText        },
      { label: "Projects",    href: "/projects",    icon: FolderKanban    },
      { label: "Timesheets",  href: "/timesheets",  icon: Clock           },
      { label: "Billing",     href: "/billing",     icon: ReceiptText, roles: ["admin", "Sales Manager"] },
      { label: "Tickets",     href: "/tickets",     icon: Headphones  },
      { label: "Reports",     href: "/reports",     icon: BarChart3, roles: ["admin", "Sales Manager"] },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings",  href: "/settings",   icon: Settings        },
    ],
  },
];

function formatRole(role) {
  if (!role) return "";
  return role
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const roleLabel = formatRole(user?.role);

  return (
    <aside
      style={{ width: collapsed ? 56 : 224 }}
      className="fixed top-0 left-0 h-full bg-[#12172B] flex flex-col z-30 transition-[width] duration-200 ease-in-out overflow-hidden"
    >
      <div className="flex items-center justify-between px-3.5 py-4 border-b border-white/8 shrink-0">
        {!collapsed && (
          <span className="text-white font-semibold text-base tracking-tight whitespace-nowrap">
            CVFrame<span className="text-[#0E7C66]">IQ</span>
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded text-[#A9B0CC] hover:bg-white/8 hover:text-white transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66]"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <PanelLeftOpen  size={16} strokeWidth={1.8} />
            : <PanelLeftClose size={16} strokeWidth={1.8} />
          }
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-4 overflow-y-auto">
        {GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold tracking-widest text-[#A9B0CC]/50 uppercase">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items
                .filter(({ roles }) => !roles || roles.includes(user?.role))
                .map(({ label, href, icon: Icon }) => {
                const active = href === "/" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={`relative flex items-center gap-3 px-2.5 py-2 rounded text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66] ${
                      active ? "text-white" : "text-[#A9B0CC] hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded bg-[#0E7C66]/20"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <Icon size={16} strokeWidth={active ? 2.5 : 1.8} className="relative shrink-0" />
                    {!collapsed && <span className="relative whitespace-nowrap">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-2.5 py-3 border-t border-white/8 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#0E7C66]/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-semibold text-[#0E7C66]">{user?.initials}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-[#A9B0CC] truncate">{roleLabel}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
