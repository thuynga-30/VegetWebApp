import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Link, usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon, type IconName } from "@/components/ui/Icon";
import { HeroGradient } from "@/components/ui/Gradient";
import { useAuth } from "@/hooks/useAuth";
import { useLayout } from "@/hooks/useLayout";

export interface PanelMenuItem {
  to: string;
  label: string;
  icon: IconName;
  /** chỉ sáng khi đúng khớp đường dẫn (vd trang Tổng quan) */
  end?: boolean;
}

interface Props {
  /** nhãn nhỏ cạnh logo ("seller" / "admin") */
  badge: string;
  /** dòng mô tả dưới tên người dùng */
  subtitle: string;
  fallbackName: string;
  menu: PanelMenuItem[];
  titleOf: (pathname: string) => string;
  children: React.ReactNode;
}

const SIDEBAR_BORDER = "rgba(33,67,41,0.4)";

function isActive(pathname: string, item: PanelMenuItem) {
  return item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
}

/** flex items-center gap-3 px-3 py-2 rounded-lg text-sm (đang chọn: bg-sidebar-primary, chữ tối, font-medium) */
function SidebarItem({ item, active }: { item: PanelMenuItem; active: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={item.to} asChild>
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.lg,
          backgroundColor: active ? colors.primaryGlow : hover ? colors.sidebarAccent : "transparent",
        }}
      >
        <Icon name={item.icon} size={16} color={active ? "#030f05" : colors.sidebarFg} />
        <Txt size={14} lh={20} weight={active ? "500" : "400"} color={active ? "#030f05" : colors.sidebarFg}>{item.label}</Txt>
      </Pressable>
    </Link>
  );
}

function Sidebar({ badge, subtitle, fallbackName, menu, pathname }: Omit<Props, "titleOf" | "children"> & { pathname: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ width: 256, backgroundColor: colors.sidebar }}>
      <Link href="/" asChild>
        <Pressable
          style={{
            flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, height: 64 + insets.top, paddingTop: insets.top,
            borderBottomWidth: 1, borderBottomColor: SIDEBAR_BORDER,
          }}
        >
          <HeroGradient style={{ width: 32, height: 32, borderRadius: radius.lg }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Icon name="leaf" size={16} color={colors.white} />
            </View>
          </HeroGradient>
          <Txt size={16} lh={24} weight="700" color={colors.sidebarFg}>GreenFarmer</Txt>
          <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: "rgba(95,191,73,0.2)" }}>
            <Txt size={10} lh={14} color={colors.primaryGlow} style={{ textTransform: "uppercase" }}>{badge}</Txt>
          </View>
        </Pressable>
      </Link>

      <View style={{ padding: 12, flex: 1, gap: 4 }}>
        {menu.map((item) => (
          <SidebarItem key={item.to} item={item} active={isActive(pathname, item)} />
        ))}
      </View>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: SIDEBAR_BORDER }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(95,191,73,0.3)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Txt size={16} lh={24} weight="600" color={colors.sidebarFg}>{(user?.full_name?.[0] ?? fallbackName[0]).toUpperCase()}</Txt>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={14} lh={20} weight="500" color={colors.sidebarFg} numberOfLines={1}>{user?.full_name ?? fallbackName}</Txt>
            <Txt size={12} lh={16} color="rgba(242,243,228,0.7)" numberOfLines={1}>{subtitle}</Txt>
          </View>
          <Pressable
            onPress={async () => {
              await logout();
              router.replace("/auth/login");
            }}
            style={{ padding: 6, borderRadius: 4 }}
            accessibilityLabel="Đăng xuất"
          >
            <Icon name="log-out" size={16} color={colors.sidebarFg} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * Khung khu vực quản lý (Seller / Admin):
 * máy tính: sidebar 256px + header; điện thoại: header + thanh menu cuộn ngang.
 */
export function PanelShell({ badge, subtitle, fallbackName, menu, titleOf, children }: Props) {
  const pathname = usePathname();
  const { isMd } = useLayout();
  const { logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.background }}>
      {isMd ? <Sidebar badge={badge} subtitle={subtitle} fallbackName={fallbackName} menu={menu} pathname={pathname} /> : null}

      <View style={{ flex: 1, minWidth: 0 }}>
        {/* header: h-16 border-b bg-background px-6 gap-4 */}
        <View
          style={{
            height: 64 + insets.top, paddingTop: insets.top, paddingHorizontal: isMd ? 24 : 16, flexDirection: "row",
            alignItems: "center", gap: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background,
          }}
        >
          <Txt size={18} lh={28} weight="600" numberOfLines={1} style={{ flexShrink: 1 }}>{titleOf(pathname)}</Txt>
          <View style={{ flex: 1 }} />
          <Link href="/" asChild>
            <Pressable>
              <Txt size={14} lh={20} muted>← {isMd ? "Về trang khách hàng" : "Trang khách"}</Txt>
            </Pressable>
          </Link>
          {!isMd ? (
            <Pressable
              onPress={async () => {
                await logout();
                router.replace("/auth/login");
              }}
              accessibilityLabel="Đăng xuất"
              style={{ padding: 4 }}
            >
              <Icon name="log-out" size={18} color={colors.mutedFg} />
            </Pressable>
          ) : null}
        </View>

        {/* điện thoại: menu cuộn ngang (bản web gốc ẩn sidebar dưới 768px) */}
        {!isMd ? (
          <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
              {menu.map((item) => {
                const on = isActive(pathname, item);
                return (
                  <Link key={item.to} href={item.to} asChild>
                    <Pressable
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6,
                        borderRadius: radius.full, borderWidth: 1, borderColor: on ? colors.primary : colors.border,
                        backgroundColor: on ? colors.primary : "transparent",
                      }}
                    >
                      <Icon name={item.icon} size={14} color={on ? colors.primaryFg : colors.foreground} />
                      <Txt size={14} lh={20} color={on ? colors.primaryFg : colors.foreground}>{item.label}</Txt>
                    </Pressable>
                  </Link>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </View>
  );
}
