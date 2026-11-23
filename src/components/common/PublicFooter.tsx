import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, MAX_WIDTH } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { useLayout } from "@/hooks/useLayout";

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable><Txt size={14} lh={20} color={colors.sidebarFgSoft}>{label}</Txt></Pressable>
    </Link>
  );
}

/** Footer nền xanh đậm 4 cột giống PublicFooter bản web */
export function PublicFooter() {
  const { isMd } = useLayout();
  const col = { flex: isMd ? 1 : undefined } as const;
  const heading = (t: string) => (
    <Txt size={14} lh={20} weight="600" color={colors.sidebarFg} style={{ marginBottom: 12 }}>{t}</Txt>
  );

  return (
    <View style={{ backgroundColor: colors.sidebar, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 64 }}>
      <View
        style={{
          width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 40,
          flexDirection: isMd ? "row" : "column", gap: 32,
        }}
      >
        <View style={col}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="leaf" size={20} color={colors.primaryGlow} />
            <Txt size={16} lh={24} weight="700" color={colors.sidebarFg}>GreenFarmer</Txt>
          </View>
          <Txt size={14} lh={20} color={colors.sidebarFgSoft}>
            Nền tảng thương mại nông sản truy xuất nguồn gốc, kết nối nông dân với người tiêu dùng.
          </Txt>
        </View>

        <View style={col}>
          {heading("Khám phá")}
          <View style={{ gap: 8 }}>
            <FooterLink href="/products" label="Sản phẩm" />
            <FooterLink href="/trace" label="Truy xuất QR" />
            <FooterLink href="/orders" label="Đơn hàng của tôi" />
          </View>
        </View>

        <View style={col}>
          {heading("Dành cho nông dân")}
          <View style={{ gap: 8 }}>
            <FooterLink href="/auth/register" label="Đăng ký bán hàng" />
            <FooterLink href="/seller" label="Kênh nông dân" />
          </View>
        </View>

        <View style={col}>
          {heading("Liên hệ")}
          <View style={{ gap: 8 }}>
            <Txt size={14} lh={20} color={colors.sidebarFgSoft}>hello@greenfarmer.vn</Txt>
            <Txt size={14} lh={20} color={colors.sidebarFgSoft}>1900 1234</Txt>
          </View>
        </View>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.sidebarBorder, paddingVertical: 16 }}>
        <Txt size={12} lh={16} center color="rgba(242,243,228,0.7)">
          © {new Date().getFullYear()} GreenFarmer — Đồ án TTDN
        </Txt>
      </View>
    </View>
  );
}
