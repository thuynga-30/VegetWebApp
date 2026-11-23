import { ActivityIndicator, View } from "react-native";
import { colors } from "@/theme";
import { Txt } from "./Txt";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

export function Loading({ text = "Đang tải..." }: { text?: string }) {
  return (
    <View style={{ paddingVertical: 48, alignItems: "center", gap: 10 }}>
      <ActivityIndicator color={colors.primary} />
      <Txt variant="small" muted>{text}</Txt>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={{ paddingVertical: 32, alignItems: "center", gap: 12 }}>
      <Icon name="alert-circle" size={28} color={colors.destructive} />
      <Txt color={colors.destructive} center>{message}</Txt>
      {onRetry ? <Button title="Thử lại" variant="outline" small onPress={onRetry} /> : null}
    </View>
  );
}

export function Empty({ text, icon = "inbox", action }: { text: string; icon?: IconName; action?: React.ReactNode }) {
  return (
    <View style={{ paddingVertical: 40, alignItems: "center", gap: 12, paddingHorizontal: 16 }}>
      <Icon name={icon} size={36} color={colors.mutedFg + "80"} />
      <Txt muted center>{text}</Txt>
      {action}
    </View>
  );
}

export function Notice({ text, tone = "error" }: { text: string; tone?: "error" | "success" | "info" }) {
  const map = {
    error: { bg: colors.destructiveSoft, fg: colors.destructive },
    success: { bg: colors.primarySoft, fg: colors.primary },
    info: { bg: colors.amber100, fg: colors.amber700 },
  }[tone];
  return (
    <View style={{ backgroundColor: map.bg, borderRadius: 10, padding: 12 }}>
      <Txt variant="small" color={map.fg}>{text}</Txt>
    </View>
  );
}
