import { Stack } from "expo-router";
import { colors } from "@/theme";
import { RoleGuard } from "@/components/common/RoleGuard";
import { PanelShell, type PanelMenuItem } from "@/components/common/PanelShell";

const MENU: PanelMenuItem[] = [
  { to: "/seller", label: "Tổng quan", icon: "home", end: true },
  { to: "/seller/farms", label: "Hồ sơ trang trại", icon: "map-pin" },
  { to: "/seller/batches", label: "Lô hàng", icon: "package" },
  { to: "/seller/orders", label: "Đơn hàng", icon: "shopping-bag" },
];

const TITLES: Record<string, string> = {
  "/seller": "Tổng quan",
  "/seller/farms": "Hồ sơ trang trại",
  "/seller/farms/new": "Thêm trang trại mới",
  "/seller/batches": "Lô hàng",
  "/seller/batches/new": "Tạo lô hàng mới",
  "/seller/orders": "Đơn hàng",
};

function titleOf(pathname: string) {
  return (
    TITLES[pathname] ??
    (pathname.startsWith("/seller/batches/") ? "Chi tiết lô hàng" : pathname.startsWith("/seller/farms/") ? "Hồ sơ trang trại" : "Kênh nông dân")
  );
}

export default function SellerLayout() {
  return (
    <RoleGuard allow={["seller"]}>
      <PanelShell badge="seller" subtitle="Kênh nông dân" fallbackName="Nông dân" menu={MENU} titleOf={titleOf}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      </PanelShell>
    </RoleGuard>
  );
}
