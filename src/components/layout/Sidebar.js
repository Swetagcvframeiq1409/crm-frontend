"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GitMerge, Briefcase, FileText, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/",          icon: LayoutDashboard },
  { label: "Leads",     href: "/leads",      icon: Users           },
  { label: "Pipeline",  href: "/pipeline",   icon: GitMerge        },
  { label: "Clients",   href: "/clients",    icon: Briefcase       },
  { label: "Proposals", href: "/proposals",  icon: FileText        },
  { label: "Settings",  href: "/settings",   icon: Settings        },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-[#12172B] flex flex-col z-30">
      <div className="px-5 py-5 border-b border-white/8">
        <span className="text-white font-semibold text-base tracking-tight">
          CVFrame<span className="text-[#0E7C66]">IQ</span>
        </span>
        <p className="text-[#A9B0CC] text-xs mt-0.5">CRM Platform</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                active
                  ? "bg-[#0E7C66]/20 text-white"
                  : "text-[#A9B0CC] hover:bg-white/6 hover:text-white"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/8">
        <p className="text-[#A9B0CC] text-xs">v1.0.0</p>
      </div>
    </aside>
  );
}
