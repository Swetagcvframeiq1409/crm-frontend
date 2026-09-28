export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(iso) {
  return Math.ceil((new Date(iso) - Date.now()) / 86400000);
}

export function urgency(iso) {
  const days = daysUntil(iso);
  if (days <= 3) return "rose";
  if (days <= 7) return "amber";
  return null;
}
