import { createElement } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/theme";
import { Txt } from "./Txt";

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  labelMuted?: boolean;
  textSm?: boolean;
  dense?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Web: <input type="date"> thật của trình duyệt, giống bản ReactJS gốc */
export function DateField({ label, value, onChange, labelMuted, textSm, dense = true, style }: Props) {
  return (
    <View style={[{ gap: 4 }, style]}>
      {label ? (labelMuted ? <Txt size={12} lh={16} muted>{label}</Txt> : <Txt size={14} lh={20} weight="500">{label}</Txt>) : null}
      {createElement("input", {
        type: "date",
        value,
        onChange: (e: any) => onChange(e.target.value),
        style: {
          width: "100%",
          boxSizing: "border-box",
          minHeight: dense ? 42 : 46,
          padding: dense ? "8px 12px" : "10px 12px",
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
          background: colors.background,
          color: colors.foreground,
          fontSize: textSm ? 14 : 16,
          fontFamily: "BeVietnamPro_400Regular, sans-serif",
          outline: "none",
        },
      })}
    </View>
  );
}
