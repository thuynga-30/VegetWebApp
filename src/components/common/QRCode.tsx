import { View } from "react-native";
import QRCodeSvg from "react-native-qrcode-svg";
import { radius } from "@/theme";

export function QRCode({ value, size = 160, getRef }: { value: string; size?: number; getRef?: (ref: any) => void }) {
  return (
    <View style={{
        backgroundColor: "#fff", padding: 8, borderRadius: radius.lg, alignSelf: "flex-start",
        shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1,
      }}>
      <QRCodeSvg value={value || " "} size={size} ecl="M" getRef={getRef} />
    </View>
  );
}
