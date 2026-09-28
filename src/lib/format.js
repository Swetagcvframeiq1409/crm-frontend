export function fmtValue(n) {
  const value = Number(n);
  if (Number.isNaN(value)) return "₹0";

  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function fmtINR(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}
