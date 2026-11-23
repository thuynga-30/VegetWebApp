import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/theme";
import { Txt } from "./Txt";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "outline" | "ghost" | "destructive" | "secondary" | "danger-outline";

interface Props {
  title?: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.primaryFg },
  secondary: { bg: colors.secondary, fg: colors.foreground },
  outline: { bg: colors.card, fg: colors.foreground, border: colors.border },
  ghost: { bg: "transparent", fg: colors.foreground },
  destructive: { bg: colors.destructive, fg: colors.white },
  "danger-outline": { bg: colors.card, fg: colors.destructive, border: colors.destructive },
};

export function Button({ title, onPress, variant = "primary", icon, loading, disabled, small, full, style, children }: Props) {
  const p = palette[variant];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        small ? styles.small : styles.md,
        { backgroundColor: p.bg, borderColor: p.border ?? "transparent", borderWidth: p.border ? 1 : 0 },
        full && { alignSelf: "stretch" },
        off && { opacity: 0.55 },
        pressed && !off && { opacity: 0.85 },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={p.fg} />
        ) : icon ? (
          <Icon name={icon} size={small ? 14 : 16} color={p.fg} />
        ) : null}
        {title ? (
          <Txt size={small ? 12 : 16} lh={small ? 16 : 24} weight="600" color={p.fg}>
            {title}
          </Txt>
        ) : null}
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  md: { minHeight: 44, paddingHorizontal: 18, paddingVertical: 10 },
  small: { minHeight: 34, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.md },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
