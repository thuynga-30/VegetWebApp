import { Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { colors } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useLayout } from "@/hooks/useLayout";

/** Nút góc phải header khu vực seller/admin: về trang khách hàng + đăng xuất */
export function PanelHeaderRight() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { isMedium } = useLayout();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingRight: 14 }}>
      <Link href="/" asChild>
        <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }} accessibilityRole="link">
          <Icon name="arrow-left" size={16} color={colors.mutedFg} />
          {isMedium ? <Txt variant="small" muted>Về trang khách hàng</Txt> : null}
        </Pressable>
      </Link>
      <Pressable
        onPress={async () => {
          await logout();
          router.replace("/auth/login");
        }}
        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        accessibilityLabel={`Đăng xuất ${user?.full_name ?? ""}`}
      >
        <Icon name="log-out" size={16} color={colors.mutedFg} />
        {isMedium ? <Txt variant="small" muted>Đăng xuất</Txt> : null}
      </Pressable>
    </View>
  );
}
