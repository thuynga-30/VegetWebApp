import type { StyleProp, ViewStyle } from "react-native";
import { Field } from "./Input";

interface Props {
  label?: string;
  /** YYYY-MM-DD (hoặc DD/MM/YYYY khi gõ tay trên app) */
  value: string;
  onChange: (v: string) => void;
  labelMuted?: boolean;
  textSm?: boolean;
  dense?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** App: ô nhập ngày dạng chữ (YYYY-MM-DD hoặc DD/MM/YYYY). Bản web dùng ô ngày của trình duyệt (DateField.web.tsx). */
export function DateField({ label, value, onChange, labelMuted, textSm, dense = true, style }: Props) {
  return (
    <Field
      style={style}
      label={label}
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      keyboardType="numbers-and-punctuation"
      autoCapitalize="none"
      labelMuted={labelMuted}
      textSm={textSm}
      dense={dense}
    />
  );
}
