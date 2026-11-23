import axios from "axios";
import { API_BASE_URL } from "./config";
import { getToken } from "./storage";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const api = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Giữ nguyên hành vi bản web: trả thẳng res.data; lỗi trả về body lỗi của backend nếu có
api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data ?? err)
);

export default api;
