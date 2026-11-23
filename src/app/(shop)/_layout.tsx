import { View } from "react-native";
import { Stack } from "expo-router";
import { colors } from "@/theme";
import { PublicHeader } from "@/components/common/PublicHeader";

/** PublicLayout: header cố định + nội dung (footer nằm cuối mỗi trang cuộn) */
export default function ShopLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PublicHeader />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      </View>
    </View>
  );
}
