import { ArrowRightLeft, UserPlus, FileEdit, Trophy, AlertCircle, StickyNote } from "lucide-react";

const typeConfig = {
  stage_change: { icon: ArrowRightLeft, color: "#6B7280" },
  new_lead:     { icon: UserPlus,       color: "#0E7C66" },
  proposal:     { icon: FileEdit,       color: "#B7791F" },
  won:          { icon: Trophy,         color: "#0E7C66" },
  overdue:      { icon: AlertCircle,    color: "#B3413A" },
  note:         { icon: StickyNote,     color: "#6B7280" },
};

export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4 flex flex-col">
      <h2 className="text-sm font-semibold text-[#171A21] mb-3">Recent Activity</h2>
      <ul className="flex flex-col overflow-y-auto max-h-72">
        {activities.map(({ id, text, time, type }, i) => {
          const { icon: Icon, color } = typeConfig[type] ?? typeConfig.note;
          return (
            <li
              key={id}
              className={`flex items-start gap-3 py-2.5 ${i < activities.length - 1 ? "border-b border-[#F5F6F8]" : ""}`}
            >
              <span
                className="mt-0.5 w-6 h-6 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon size={13} style={{ color }} strokeWidth={2} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#171A21] leading-snug">{text}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
