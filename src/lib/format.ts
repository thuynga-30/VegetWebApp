export function formatCurrency(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? Math.round(n) : 0;
  const s = Math.abs(safe).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${safe < 0 ? "-" : ""}${s}₫`;
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function categoryEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("lá")) return "🥬";
  if (n.includes("trái") || n.includes("quả")) return "🍎";
  if (n.includes("củ")) return "🥕";
  if (n.includes("ngũ cốc") || n.includes("hạt") || n.includes("gạo")) return "🌾";
  if (n.includes("nấm") || n.includes("gia vị")) return "🍄";
  return "🌱";
}

export function categoryColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("lá")) return "#dcfce7";
  if (n.includes("trái") || n.includes("quả")) return "#fee2e2";
  if (n.includes("củ")) return "#ffedd5";
  if (n.includes("ngũ cốc") || n.includes("hạt") || n.includes("gạo")) return "#fef3c7";
  if (n.includes("nấm") || n.includes("gia vị")) return "#fce7f3";
  return "rgba(27,126,42,0.10)";
}

/** Chuẩn hoá ngày người dùng gõ (YYYY-MM-DD hoặc DD/MM/YYYY) về YYYY-MM-DD; trả "" nếu sai */
export function normalizeDateInput(v: string): string {
  const s = v.trim();
  if (!s) return "";
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}
