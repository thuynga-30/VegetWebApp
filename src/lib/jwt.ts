const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64Decode(input: string): string {
  const str = input.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  let out = "";
  let bits = 0;
  let acc = 0;
  for (let i = 0; i < str.length; i++) {
    const v = CHARS.indexOf(str[i]);
    if (v < 0) continue;
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((acc >> bits) & 0xff);
    }
  }
  try {
    return decodeURIComponent(
      out.split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  } catch {
    return out;
  }
}

/** Lấy id người dùng (payload.sub) từ JWT; không phụ thuộc atob (Hermes cũ không có) */
export function getUserIdFromToken(token: string | null): number {
  try {
    if (!token) return 0;
    const payload = JSON.parse(base64Decode(token.split(".")[1]));
    return Number(payload.sub) || 0;
  } catch {
    return 0;
  }
}
