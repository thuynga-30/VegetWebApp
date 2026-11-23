import { View } from "react-native";
import QRCodeSvg from "react-native-qrcode-svg";
import { radius, shadow } from "@/theme";

export function QRCode({ value, size = 160 }: { value: string; size?: number }) {
  return (
    <View style={[{ backgroundColor: "#fff", padding: 8, borderRadius: radius.md, alignSelf: "flex-start" }, shadow]}>
      <QRCodeSvg value={value || " "} size={size} ecl="M" />
    </View>
  );
}
