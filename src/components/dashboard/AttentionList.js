import Badge from "../ui/Badge";

const dotColor = { rose: "bg-[#B3413A]", amber: "bg-[#B7791F]" };

export default function AttentionList({ clients }) {
  return (
    <div className="bg-white border border-[#E3E5EA] rounded-lg px-5 py-4">
      <h2 className="text-sm font-semibold text-[#171A21] mb-3">Clients Needing Attention</h2>
      <ul className="flex flex-col">
        {clients.map(({ id, name, status, statusColor, note }, i) => (
          <li
            key={id}
            className={`flex items-center gap-3 py-3 ${i < clients.length - 1 ? "border-b border-[#F5F6F8]" : ""}`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor[statusColor]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#171A21] truncate">{name}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{note}</p>
            </div>
            <Badge variant={statusColor}>{status}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
