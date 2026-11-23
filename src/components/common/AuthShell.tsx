import { Pressable, ScrollView, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { HeroGradient } from "@/components/ui/Gradient";
import { Logo } from "@/components/common/Logo";
import { useLayout } from "@/hooks/useLayout";

/** Khung chung trang đăng nhập / đăng ký: `min-h-screen grid md:grid-cols-2` */
export function AuthShell({ heading, text, children }: { heading: string; text: string; children: React.ReactNode }) {
  const { isMd } = useLayout();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.background }}>
      {isMd ? (
        <HeroGradient style={{ flex: 1 }} glowAt={{ x: 0.2, y: 0.2, r: 0.5 }}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
            <View
              style={{
                width: 64, height: 64, borderRadius: radius.xxl, backgroundColor: "rgba(255,255,255,0.15)",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon name="leaf" size={32} color={colors.white} />
            </View>
            <Txt size={30} lh={36} weight="700" color={colors.white} center style={{ marginTop: 24 }}>{heading}</Txt>
            <Txt size={16} lh={24} color="rgba(255,255,255,0.85)" center style={{ marginTop: 12, maxWidth: 320 }}>{text}</Txt>
          </View>
        </HeroGradient>
      ) : null}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1, justifyContent: "center", paddingHorizontal: isMd ? 64 : 24,
          paddingTop: 48 + insets.top, paddingBottom: 48,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: "100%", maxWidth: 384, alignSelf: "center" }}>
          <Link href="/" asChild>
            <Pressable accessibilityRole="link" style={{ alignSelf: "flex-start" }}><Logo /></Pressable>
          </Link>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

/** Nút Google / Facebook: border rounded-lg py-2.5 text-sm font-medium */
export function SocialButton({ label }: { label: string }) {
  return (
    <Pressable
      style={(s) => [
        { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingVertical: 10, alignItems: "center" },
        (s as any).hovered && { backgroundColor: colors.muted },
      ]}
    >
      <Txt size={14} lh={20} weight="500">{label}</Txt>
    </Pressable>
  );
}
