import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { Link, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, MAX_WIDTH, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/common/Logo";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useLayout } from "@/hooks/useLayout";

/** Header cố định phía trên: giống PublicHeader của bản web (logo, nav, giỏ hàng, tài khoản, menu mobile) */
export function PublicHeader() {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { isMd } = useLayout();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const NavLink = ({ href, label, exact, icon }: { href: string; label: string; exact?: boolean; icon?: boolean }) => {
    const on = !icon && active(href, exact);
    return (
      <Link href={href} asChild>
        <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4 }} accessibilityRole="link">
          {icon ? <Icon name="scan-line" size={16} color={colors.foreground} /> : null}
          <Txt size={14} lh={20} weight={on ? "500" : "400"} color={on ? colors.primary : colors.foreground}>{label}</Txt>
        </Pressable>
      </Link>
    );
  };

  const iconBtn = { padding: 8, borderRadius: radius.lg } as const;

  return (
    <View
      style={[
        {
          backgroundColor: "rgba(250,251,242,0.92)",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingTop: insets.top,
          zIndex: 40,
        },
        Platform.OS === "web" ? ({ position: "sticky", top: 0, backdropFilter: "blur(8px)" } as any) : null,
      ]}
    >
      <View
        style={{
          width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16,
          height: 64, flexDirection: "row", alignItems: "center", gap: 16,
        }}
      >
        <Link href="/" asChild>
          <Pressable accessibilityRole="link"><Logo /></Pressable>
        </Link>

        {isMd ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 24, marginLeft: 24 }}>
            <NavLink href="/" label="Trang chủ" exact />
            <NavLink href="/products" label="Sản phẩm" />
            <NavLink href="/trace" label="Truy xuất QR" icon />
            <NavLink href="/orders" label="Đơn hàng" />
          </View>
        ) : null}

        <View style={{ flex: 1 }} />

        {isMd && user?.role === "seller" ? (
          <Link href="/seller" asChild>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon name="layout-dashboard" size={16} color={colors.mutedFg} />
              <Txt size={12} lh={16} muted>Kênh nông dân</Txt>
            </Pressable>
          </Link>
        ) : null}
        {isMd && user?.role === "admin" ? (
          <Link href="/admin" asChild>
            <Pressable><Txt size={12} lh={16} muted>Admin</Txt></Pressable>
          </Link>
        ) : null}

        <Link href="/cart" asChild>
          <Pressable style={iconBtn} accessibilityLabel="Giỏ hàng">
            <Icon name="shopping-cart" size={20} />
            {totalItems > 0 ? (
              <View
                style={{
                  position: "absolute", top: -4, right: -4, minWidth: 20, height: 20, paddingHorizontal: 4,
                  borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
                }}
              >
                <Txt size={10} lh={14} weight="600" color={colors.primaryFg}>{totalItems}</Txt>
              </View>
            ) : null}
          </Pressable>
        </Link>

        <Link href={user ? "/profile" : "/auth/login"} asChild>
          <Pressable style={iconBtn} accessibilityLabel="Tài khoản">
            <Icon name="user" size={20} />
            {user ? (
              <View style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
            ) : null}
          </Pressable>
        </Link>

        {!isMd ? (
          <Pressable style={iconBtn} onPress={() => setOpen((v) => !v)} accessibilityLabel="Menu">
            <Icon name="menu" size={20} />
          </Pressable>
        ) : null}
      </View>

      {!isMd && open ? (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
          {[
            ["/", "Trang chủ"],
            ["/products", "Sản phẩm"],
            ["/trace", "Truy xuất QR"],
            ["/orders", "Đơn hàng"],
            ["/seller", "Kênh nông dân"],
            ["/admin", "Admin"],
          ].map(([href, label]) => (
            <Link key={href} href={href} asChild>
              <Pressable onPress={() => setOpen(false)} style={{ paddingVertical: 2 }}>
                <Txt size={14} lh={20}>{label}</Txt>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}
    </View>
  );
}
