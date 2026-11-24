import { useState } from "react";
import { StyleSheet, TextInput, View, type KeyboardTypeOptions, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/theme";
import { Txt } from "./Txt";
import { Icon, type IconName } from "./Icon";

interface Props {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  icon?: IconName;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  rows?: number;
  editable?: boolean;
  hint?: string;
  /** py-2 thay vì py-2.5 (cao 42px) */
  dense?: boolean;
  style?: StyleProp<ViewStyle>;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "next" | "go" | "search";
}

export function Field({
  label, value, onChangeText, placeholder, icon, secureTextEntry, keyboardType, autoCapitalize,
  multiline, rows = 3, editable = true, hint, dense, style, onSubmitEditing, returnKeyType,
}: Props) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ gap: 4 }, style]}>
      {label ? (
        <View style={styles.labelRow}>
          {icon ? <Icon name={icon} size={14} color={colors.mutedFg} /> : null}
          <Txt size={14} lh={20} weight="500">{label}</Txt>
        </View>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedFg + "99"}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        editable={editable}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          dense && { minHeight: 42, paddingVertical: 8 },
          multiline && { minHeight: 22 * rows + 20, paddingTop: 10 },
          focus && { borderColor: colors.primary },
          !editable && { backgroundColor: "rgba(242,243,232,0.5)", color: colors.mutedFg },
        ]}
      />
      {hint ? <Txt variant="tiny" muted>{hint}</Txt> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "BeVietnamPro_400Regular",
    color: colors.foreground,
    backgroundColor: colors.background,
  },
});
