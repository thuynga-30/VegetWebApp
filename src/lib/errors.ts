import { API_BASE_URL } from "./config";

/** Lấy thông điệp lỗi thân thiện từ lỗi backend (message có thể là chuỗi hoặc mảng) */
export function errMessage(err: any, fallback = "Có lỗi xảy ra, vui lòng thử lại."): string {
  const m = err?.message ?? err?.response?.data?.message ?? err?.error;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string" && m) {
    if (m === "Network Error") {
      return `Không kết nối được máy chủ (${API_BASE_URL}). Kiểm tra backend đang chạy, đúng địa chỉ/cổng/giao thức và đã bật CORS cho trang web này.`;
    }
    return m;
  }
  return fallback;
}
