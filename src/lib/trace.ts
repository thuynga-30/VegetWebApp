import { Platform } from "react-native";

/** Nội dung QR của lô hàng: link web công khai nếu có, nếu không dùng deep link của app */
export function buildTraceUrl(barcode: string): string {
  const code = encodeURIComponent(barcode);
  const fromEnv = process.env.EXPO_PUBLIC_PUBLIC_URL;
  if (fromEnv) return `${fromEnv.replace(/\/+$/, "")}/trace?code=${code}`;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/trace?code=${code}`;
  }
  return `greenfarmer://trace?code=${code}`;
}

/** QR có thể là mã lô thuần ("GF-XLR-2026-001") hoặc một link chứa ?code=... */
export function extractBatchCode(raw: string): string {
  const text = raw.trim();
  const m = text.match(/[?&]code=([^&#\s]+)/i);
  if (m) {
    try {
      return decodeURIComponent(m[1]).trim();
    } catch {
      return m[1].trim();
    }
  }
  return text;
}
