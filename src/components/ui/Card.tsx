import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadow } from "@/theme";

export function Card({ children, style, flat }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; flat?: boolean }) {
  return <View style={[styles.card, !flat && shadow, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
    gap: 10,
  },
});
