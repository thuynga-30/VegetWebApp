import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { colors } from "@/theme";

/** Be Vietnam Pro: mỗi độ đậm là một file font riêng */
const FAMILY: Record<string, string> = {
  "400": "BeVietnamPro_400Regular",
  normal: "BeVietnamPro_400Regular",
  "500": "BeVietnamPro_500Medium",
  "600": "BeVietnamPro_600SemiBold",
  "700": "BeVietnamPro_700Bold",
  bold: "BeVietnamPro_700Bold",
  "800": "BeVietnamPro_800ExtraBold",
  "900": "BeVietnamPro_800ExtraBold",
};

type Variant = "h1" | "h2" | "h3" | "title" | "body" | "small" | "tiny" | "price";

// Cỡ chữ / dòng theo Tailwind: xs 12/16, sm 14/20, base 16/24, lg 18/28, 2xl 24/32, 3xl 30/36
const variants: Record<Variant, TextStyle> = {
  h1: { fontSize: 30, lineHeight: 36, fontWeight: "700", letterSpacing: -0.3 },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: "700", letterSpacing: -0.24 },
  h3: { fontSize: 18, lineHeight: 28, fontWeight: "600", letterSpacing: -0.18 },
  title: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
  body: { fontSize: 14, lineHeight: 20 },
  small: { fontSize: 12, lineHeight: 16 },
  tiny: { fontSize: 11, lineHeight: 16 },
  price: { fontSize: 18, lineHeight: 28, fontWeight: "700" },
};

interface Props extends TextProps {
  variant?: Variant;
  muted?: boolean;
  bold?: boolean;
  primary?: boolean;
  color?: string;
  center?: boolean;
  /** ghi đè cỡ chữ (px); dòng tự tính theo Tailwind nếu không đặt lh */
  size?: number;
  lh?: number;
  weight?: "400" | "500" | "600" | "700" | "800";
}

export function Txt({ variant = "body", muted, bold, primary, color, center, size, lh, weight, style, ...rest }: Props) {
  const merged = StyleSheet.flatten([
    { color: colors.foreground },
    variants[variant],
    muted && { color: colors.mutedFg },
    primary && { color: colors.primary },
    bold && { fontWeight: "700" as const },
    size ? { fontSize: size, lineHeight: lh ?? Math.round(size * 1.5) } : lh ? { lineHeight: lh } : null,
    weight ? { fontWeight: weight } : null,
    center && { textAlign: "center" as const },
    color ? { color } : null,
    style,
  ]) as TextStyle;

  const w = String(merged.fontWeight ?? "400");
  // Dùng font riêng theo độ đậm; bỏ fontWeight để tránh bị in đậm giả
  const final: TextStyle = { ...merged, fontFamily: FAMILY[w] ?? FAMILY["400"], fontWeight: "normal" };
  return <Text {...rest} style={final} />;
}
