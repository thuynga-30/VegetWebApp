import { Platform } from "react-native";
import Constants from "expo-constants";

const DEV_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|\d{1,3}(\.\d{1,3}){3}|.+\.local)$/i;

/**
 * URL gốc backend NestJS (không kèm /api).
 *
 * Thứ tự ưu tiên:
 * 1. EXPO_PUBLIC_API_URL nếu có đặt (ghi đè tất cả).
 * 2. Web đang mở bằng localhost / địa chỉ IP / *.local (môi trường dev):
 *    dùng chính host đó + cổng API (mặc định 3000), cùng giao thức với trang đang mở.
 *      Mở https://192.168.2.131:5173  ->  https://192.168.2.131:3000
 *      Mở http://localhost:8081       ->  http://localhost:3000
 *    Chỉnh bằng EXPO_PUBLIC_API_PORT / EXPO_PUBLIC_API_PROTOCOL (http | https).
 * 3. Web chạy trên tên miền thật: `${origin}/api` (giống proxy "/api" của bản Vite cũ).
 * 4. App điện thoại: IP máy đang chạy Metro + cổng API.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const port = process.env.EXPO_PUBLIC_API_PORT || "3000";

  if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname, origin } = window.location;
    if (DEV_HOST.test(hostname)) {
      const proto = (process.env.EXPO_PUBLIC_API_PROTOCOL || protocol.replace(":", "")) as string;
      return `${proto}://${hostname}:${port}`;
    }
    return `${origin}/api`;
  }

  if (Platform.OS === "web") return `http://localhost:${port}`;

  // App trên điện thoại / giả lập: lấy IP máy đang chạy Metro để gọi tới backend cùng máy.
  const hostUri = Constants.expoConfig?.hostUri ?? "";
  const host = hostUri.split(":")[0];
  if (host) return `${process.env.EXPO_PUBLIC_API_PROTOCOL || "http"}://${host}:${port}`;

  // Android emulator mặc định
  return Platform.OS === "android" ? `http://10.0.2.2:${port}` : `http://localhost:${port}`;
}

export const API_BASE_URL = getApiBaseUrl();
