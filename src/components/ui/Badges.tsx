import { View } from "react-native";
import { colors, radius } from "@/theme";
import { Txt } from "./Txt";
import { Icon, type IconName } from "./Icon";
import type { OrderStatus } from "@/types/order";
import type { ApprovalStatus, TrustLevel } from "@/types/batch";
import {
  APPROVAL_STATUS_LABEL, APPROVAL_STATUS_TONE, ORDER_STATUS_LABEL, ORDER_STATUS_TONE, TRUST_LEVEL_LABEL, type Tone,
} from "@/lib/constants";

export function Pill({ label, tone, small }: { label: string; tone: Tone; small?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: tone.bg,
        paddingHorizontal: small ? 8 : 10,
        paddingVertical: small ? 2 : 4,
        borderRadius: radius.full,
        alignSelf: "flex-start",
      }}
    >
      <Txt size={12} lh={16} weight="500" color={tone.fg}>{label}</Txt>
    </View>
  );
}

export function StatusBadge({ status }: { status: OrderStatus | ApprovalStatus }) {
  const tone =
    (ORDER_STATUS_TONE as Record<string, Tone>)[status] ??
    (APPROVAL_STATUS_TONE as Record<string, Tone>)[status] ??
    { bg: colors.muted, fg: colors.mutedFg };
  const label =
    (ORDER_STATUS_LABEL as Record<string, string>)[status] ??
    (APPROVAL_STATUS_LABEL as Record<string, string>)[status] ??
    status;
  return <Pill label={label} tone={tone} />;
}

// bg-[trust]/15  text-[trust]  border-[trust]/40|50  (khớp TrustBadge bản web)
const trustCfg: Record<TrustLevel, { icon: IconName; fg: string; bg: string; border: string }> = {
  Low: { icon: "shield", fg: colors.trustBronze, bg: "rgba(190,126,81,0.15)", border: "rgba(190,126,81,0.4)" },
  Medium: { icon: "shield-check", fg: colors.slate600, bg: "rgba(163,176,186,0.15)", border: "rgba(148,163,184,0.4)" },
  High: { icon: "award", fg: colors.trustGold, bg: "rgba(239,179,0,0.15)", border: "rgba(239,179,0,0.5)" },
};

export function TrustBadge({ level, size = "md" }: { level: TrustLevel | null | undefined; size?: "sm" | "md" }) {
  const small = size === "sm";
  const fs = small ? 11 : 12;
  const base = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: small ? 8 : 10,
    paddingVertical: small ? 2 : 4,
    alignSelf: "flex-start" as const,
  };
  const iconSize = small ? 12 : 14;

  if (!level) {
    return (
      <View style={[base, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Icon name="help-circle" size={iconSize} color={colors.mutedFg} />
        <Txt size={fs} lh={16} weight="500" color={colors.mutedFg}>Chưa xếp hạng</Txt>
      </View>
    );
  }
  const c = trustCfg[level];
  return (
    <View style={[base, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Icon name={c.icon} size={iconSize} color={c.fg} />
      <Txt size={fs} lh={16} weight="500" color={c.fg}>{TRUST_LEVEL_LABEL[level]}</Txt>
    </View>
  );
}
