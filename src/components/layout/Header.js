import { Bell } from "lucide-react";

export default function Header({ title, subtitle, action }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-lg font-semibold text-[#171A21] leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <button className="relative p-2 rounded hover:bg-[#E3E5EA] transition-colors">
          <Bell size={18} className="text-[#6B7280]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B3413A]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0E7C66]/15 flex items-center justify-center">
            <span className="text-xs font-semibold text-[#0E7C66]">RK</span>
          </div>
          <span className="text-sm text-[#171A21] font-medium">Rahul K.</span>
        </div>
      </div>
    </header>
  );
}
