import { Pressable, ScrollView, StyleSheet } from "react-native";
import { colors, radius } from "@/theme";
import { Txt } from "./Txt";

export interface TabItem<T extends string> { key: T; label: string; count?: number }

interface Props<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (k: T) => void;
}

/** Hàng nút lọc/tab cuộn ngang (thay các nút tab ở bản web) */
export function FilterTabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Txt variant="small" bold color={active ? colors.primaryFg : colors.foreground}>
              {t.label}
              {t.count !== undefined ? ` (${t.count})` : ""}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
  },
});
