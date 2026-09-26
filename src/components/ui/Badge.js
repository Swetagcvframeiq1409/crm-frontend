const variants = {
  teal:     "bg-[#0E7C66]/10 text-[#0E7C66]",
  amber:    "bg-[#B7791F]/10 text-[#B7791F]",
  rose:     "bg-[#B3413A]/10 text-[#B3413A]",
  muted:    "bg-[#E3E5EA] text-[#6B7280]",
  bluegrey: "bg-[#4B5563]/10 text-[#4B5563]",
};

export default function Badge({ children, variant = "muted" }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
