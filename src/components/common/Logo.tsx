import { View } from "react-native";
import { colors } from "@/theme";
import { Icon } from "@/components/ui/Icon";
import { Txt } from "@/components/ui/Txt";
import { HeroGradient } from "@/components/ui/Gradient";

/** Ô vuông gradient + lá (w-9 h-9 rounded-xl bg-hero-gradient) */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <HeroGradient style={{ width: size, height: size, borderRadius: size / 3, alignItems: "center", justifyContent: "center" }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Icon name="leaf" size={size * 0.555} color={colors.white} />
      </View>
    </HeroGradient>
  );
}

/** "Green" + "Farmer"(xanh) — font-bold text-lg */
export function Logo({ dark }: { size?: number; dark?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <LogoMark />
      <Txt size={18} lh={28} weight="700" color={dark ? colors.sidebarFg : colors.foreground}>
        Green<Txt size={18} lh={28} weight="700" color={dark ? colors.primaryGlow : colors.primary}>Farmer</Txt>
      </Txt>
    </View>
  );
}
