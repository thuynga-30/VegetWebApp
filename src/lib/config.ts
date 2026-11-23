import { Platform } from "react-native";
import Constants from "expo-constants";

/** URL gốc backend NestJS (không kèm /api). */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (Platform.OS === "web") return "http://localhost:3000";

  // App trên điện thoại / giả lập: lấy IP máy đang chạy Metro để gọi tới backend cùng máy.
  const hostUri = Constants.expoConfig?.hostUri ?? "";
  const host = hostUri.split(":")[0];
  if (host) return `http://${host}:3000`;

  // Android emulator mặc định
  return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
}

export const API_BASE_URL = getApiBaseUrl();
