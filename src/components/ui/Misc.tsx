import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadow } from "@/theme";
import { Txt } from "./Txt";
import { Icon, type IconName } from "./Icon";

export function Row({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]}>{children}</View>;
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

export function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, minWidth: 96, backgroundColor: colors.muted + "99", borderRadius: radius.md, padding: 10 }}>
      <Txt variant="tiny" muted>{label}</Txt>
      <Txt variant="title">{value}</Txt>
    </View>
  );
}

export function KV({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <Txt muted={!bold} bold={bold}>{label}</Txt>
      <Txt bold={bold} primary={bold} style={{ flexShrink: 1, textAlign: "right" }}>{value}</Txt>
    </View>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
      <View style={{ flex: 1 }}>
        <Txt variant="h2">{title}</Txt>
        {subtitle ? <Txt muted variant="small">{subtitle}</Txt> : null}
      </View>
      {action}
    </View>
  );
}

export function StatCard({
  icon, label, value, sub, highlight,
}: { icon: IconName; label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <View
      style={[
        {
          flexGrow: 1, flexBasis: 150, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
          borderRadius: radius.xl, padding: 14, gap: 8,
        },
        shadow,
        highlight && { borderColor: colors.amber400, borderWidth: 2 },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 42, height: 42, borderRadius: radius.lg, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="tiny" muted>{label}</Txt>
          <Txt variant="h3" numberOfLines={1} adjustsFontSizeToFit>{value}</Txt>
        </View>
      </View>
      {sub ? <Txt variant="tiny" muted>{sub}</Txt> : null}
    </View>
  );
}

export function QtyStepper({
  value, onChange, min = 1, max, disabled,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; disabled?: boolean }) {
  const btn = (label: string, onPress: () => void, off: boolean) => (
    <Pressable
      onPress={off || disabled ? undefined : onPress}
      style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", opacity: off || disabled ? 0.35 : 1 }}
      accessibilityRole="button"
    >
      <Txt variant="h3">{label}</Txt>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.card }}>
      {btn("−", () => onChange(Math.max(min, value - 1)), value <= min)}
      <Txt bold style={{ minWidth: 30, textAlign: "center" }}>{value}</Txt>
      {btn("+", () => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1), max !== undefined && value >= max)}
    </View>
  );
}

export interface TimelineItem {
  id: string | number;
  date?: string;
  title: string;
  description?: string;
  image?: string | null;
  by?: string;
}

export function Timeline({ items, renderImage }: { items: TimelineItem[]; renderImage?: (uri: string) => React.ReactNode }) {
  return (
    <View style={{ marginLeft: 8, borderLeftWidth: 2, borderLeftColor: "#bbf7d0", gap: 20 }}>
      {items.map((it) => (
        <View key={it.id} style={{ paddingLeft: 18 }}>
          <View
            style={{
              position: "absolute", left: -9, top: 3, width: 16, height: 16, borderRadius: 8,
              backgroundColor: colors.green700, borderWidth: 3, borderColor: colors.green100,
            }}
          />
          {it.date ? <Txt variant="small" muted>{it.date}</Txt> : null}
          <Txt variant="title">{it.title}</Txt>
          {it.description ? <Txt variant="small" muted style={{ marginTop: 2 }}>{it.description}</Txt> : null}
          {it.by ? <Txt variant="tiny" muted style={{ marginTop: 4 }}>Người ghi nhận: {it.by}</Txt> : null}
          {it.image && renderImage ? <View style={{ marginTop: 8 }}>{renderImage(it.image)}</View> : null}
        </View>
      ))}
    </View>
  );
}

export function Checkbox({ checked, onChange, label, top }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; top?: boolean }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{ flexDirection: "row", alignItems: top ? "flex-start" : "center", gap: 8 }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={{
          width: 16, height: 16, borderRadius: 4, borderWidth: 1, marginTop: top ? 3 : 0,
          borderColor: checked ? colors.primary : "#767676", backgroundColor: checked ? colors.primary : colors.white,
          alignItems: "center", justifyContent: "center",
        }}
      >
        {checked ? <Icon name="check" size={12} color={colors.white} strokeWidth={3} /> : null}
      </View>
      <View style={{ flex: 1 }}>{typeof label === "string" ? <Txt size={14} lh={20} muted>{label}</Txt> : label}</View>
    </Pressable>
  );
}

/** Ô chọn phương thức: flex items-center gap-3 p-3 rounded-xl border (chọn: border-primary bg-primary/5) */
export function Radio({ selected, onSelect, label, disabled }: { selected: boolean; onSelect: () => void; label: string; disabled?: boolean }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onSelect}
      style={{
        flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderWidth: 1, borderRadius: radius.xl,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? "rgba(27,126,42,0.05)" : "transparent",
        opacity: disabled ? 0.5 : 1,
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
    >
      <View
        style={{
          width: 16, height: 16, borderRadius: 8, borderWidth: selected ? 5 : 1,
          borderColor: selected ? colors.primary : "#767676", backgroundColor: colors.white,
        }}
      />
      <Icon name="credit-card" size={16} color={colors.mutedFg} />
      <Txt size={16} lh={24} style={{ flex: 1 }}>{label}</Txt>
    </Pressable>
  );
}

/** Lưới n cột có khoảng cách `gap` (thay Tailwind grid-cols-n gap-x) */
export function Grid({ cols, gap = 16, children }: { cols: number; gap?: number; children?: React.ReactNode }) {
  const items = (Array.isArray(children) ? children.flat() : [children]).filter(Boolean) as React.ReactNode[];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -gap / 2, marginVertical: -gap / 2 }}>
      {items.map((c, i) => (
        <View key={i} style={{ width: `${100 / cols}%`, padding: gap / 2 }}>
          {c}
        </View>
      ))}
    </View>
  );
}
