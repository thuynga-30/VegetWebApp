import {
  KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, MAX_WIDTH } from "@/theme";
import { PublicFooter } from "@/components/common/PublicFooter";

interface Props {
  children?: React.ReactNode;
  /** false: không cuộn (dùng cho màn hình có FlatList bên trong) */
  scroll?: boolean;
  padded?: boolean;
  /** dùng cho màn hình không có header (đăng nhập...) */
  safeTop?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
  background?: string;
  /** hiện footer của trang công khai ở cuối nội dung */
  footer?: boolean;
}

/** Khung màn hình: nền, cuộn, giới hạn bề rộng & căn giữa trên web / máy tính bảng */
export function Screen({
  children, scroll = true, padded = true, safeTop, refreshing, onRefresh, maxWidth = MAX_WIDTH, contentStyle, background, footer,
}: Props) {
  const insets = useSafeAreaInsets();
  const inner = [
    { width: "100%" as const, maxWidth, alignSelf: "center" as const },
    padded && { padding: 16, gap: 16 },
    contentStyle,
  ];

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingTop: safeTop ? insets.top : 0, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
    >
      <View style={{ flex: 1 }}>
        <View style={inner}>{children}</View>
      </View>
      {footer ? <PublicFooter /> : null}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingTop: safeTop ? insets.top : 0 }]}>
      <View style={[{ flex: 1 }, ...inner]}>{children}</View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, background ? { backgroundColor: background } : null]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
