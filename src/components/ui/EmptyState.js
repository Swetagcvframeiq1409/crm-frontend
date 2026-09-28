export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="w-10 h-10 rounded-full bg-[#F5F6F8] flex items-center justify-center">
        <Icon size={18} className="text-[#6B7280]" strokeWidth={1.6} />
      </span>
      <div>
        <p className="text-sm font-medium text-[#171A21]">{title}</p>
        {description && <p className="text-xs text-[#6B7280] mt-0.5">{description}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 text-xs font-medium text-[#0E7C66] hover:text-[#0a6354] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66] rounded px-2 py-1"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
