import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { colors, radius } from "@/theme";
import { Txt } from "./Txt";
import { Icon } from "./Icon";

export interface Option { value: string; label: string }

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  /** compact: giống <select> nhỏ của bản web (px-3 py-2.5 rounded-xl bg-background text-sm) */
  compact?: boolean;
  minWidth?: number;
}

/** Ô chọn dạng danh sách (thay <select>), chạy giống nhau trên web và app */
export function Select({ label, value, onChange, options, placeholder = "— Chọn —", compact, minWidth }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Txt variant="small" bold>{label}</Txt> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.box, compact && { minHeight: 42, borderRadius: radius.xl, backgroundColor: colors.background, borderColor: colors.border, minWidth }]}
      >
        <Txt size={14} lh={20} style={{ flex: 1 }} muted={!current} numberOfLines={1}>{current?.label ?? placeholder}</Txt>
        <Icon name="chevron-down" size={16} color={colors.mutedFg} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {label ? <Txt variant="h3" style={{ marginBottom: 8 }}>{label}</Txt> : null}
            <ScrollView style={{ maxHeight: 380 }}>
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => { onChange(o.value); setOpen(false); }}
                    style={[styles.option, active && { backgroundColor: colors.primarySoft }]}
                  >
                    <Txt style={{ flex: 1 }} bold={active} color={active ? colors.primary : undefined}>{o.label}</Txt>
                    {active ? <Icon name="check" size={16} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 44, borderWidth: 1, borderColor: colors.input, borderRadius: radius.lg,
    paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.card,
  },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", padding: 24 },
  sheet: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 16, width: "100%", maxWidth: 460, alignSelf: "center" },
  option: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 12, borderRadius: radius.md },
});
