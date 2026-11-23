import type { TrustLevel, ApprovalStatus } from "@/types/batch";
import type { OrderStatus } from "@/types/order";
import type { UserStatus } from "@/types/user";
import { colors } from "@/theme";

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  Active: "Đang hoạt động",
  Disabled: "Đã vô hiệu hóa",
};

export const TRUST_LEVEL_LABEL: Record<TrustLevel, string> = {
  Low: "Đã xác minh cơ bản",
  Medium: "Nhật ký canh tác đầy đủ",
  High: "Chứng nhận & Xác minh toàn diện",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  Pending: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Từ chối",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  Pending: "Chờ xử lý",
  Confirmed: "Đã xác nhận",
  Preparing: "Đang chuẩn bị",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

export type Tone = { bg: string; fg: string };

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  Pending: { bg: colors.muted, fg: colors.mutedFg },
  Confirmed: { bg: colors.blue100, fg: colors.blue700 },
  Preparing: { bg: colors.amber100, fg: colors.amber700 },
  Shipping: { bg: colors.indigo100, fg: colors.indigo700 },
  Delivered: { bg: colors.primarySoft, fg: colors.primary },
  Completed: { bg: colors.primarySoft, fg: colors.primary },
  Cancelled: { bg: colors.destructiveSoft, fg: colors.destructive },
};

export const APPROVAL_STATUS_TONE: Record<ApprovalStatus, Tone> = {
  Pending: { bg: colors.amber100, fg: colors.amber700 },
  Approved: { bg: colors.primarySoft, fg: colors.primary },
  Rejected: { bg: colors.destructiveSoft, fg: colors.destructive },
};

export const USER_STATUS_TONE: Record<UserStatus, Tone> = {
  Active: { bg: colors.primarySoft, fg: colors.primary },
  Disabled: { bg: colors.destructiveSoft, fg: colors.destructive },
};
