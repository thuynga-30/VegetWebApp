import { Stack } from "expo-router";
import { colors } from "@/theme";
import { RoleGuard } from "@/components/common/RoleGuard";
import { PanelShell, type PanelMenuItem } from "@/components/common/PanelShell";

const MENU: PanelMenuItem[] = [
  { to: "/admin", label: "Tổng quan", icon: "home", end: true },
  { to: "/admin/approvals", label: "Kiểm duyệt lô hàng", icon: "check-square" },
  { to: "/admin/users", label: "Người dùng", icon: "users" },
  { to: "/admin/farms", label: "Nông trại", icon: "map-pin" },
  { to: "/admin/orders", label: "Đơn hàng", icon: "clipboard-list" },
  { to: "/admin/reports", label: "Báo cáo", icon: "bar-chart-3" },
];

const TITLES: Record<string, string> = {
  "/admin": "Tổng quan hệ thống",
  "/admin/approvals": "Kiểm duyệt lô hàng",
  "/admin/users": "Quản lý người dùng",
  "/admin/farms": "Quản lý nông trại",
  "/admin/orders": "Đơn hàng toàn hệ thống",
  "/admin/reports": "Báo cáo",
};

function titleOf(pathname: string) {
  return TITLES[pathname] ?? (pathname.startsWith("/admin/approvals/") ? "Chi tiết kiểm duyệt" : "Quản trị");
}

export default function AdminLayout() {
  return (
    <RoleGuard allow={["admin"]}>
      <PanelShell
        badge="admin"
        subtitle="Quản trị hệ thống"
        fallbackName="Quản trị viên"
        fallbackInitial="A"
        menu={MENU}
        titleOf={titleOf}
      >
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      </PanelShell>
    </RoleGuard>
  );
}
