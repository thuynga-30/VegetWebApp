import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Grid } from "@/components/ui/Misc";

/** inline-flex gap-1.5 text-sm text-muted-foreground: "← Danh sách trang trại" */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Icon name="arrow-left" size={16} color={colors.mutedFg} />
        <Txt size={14} lh={20} muted>{label}</Txt>
      </Pressable>
    </Link>
  );
}

/** bg-card border rounded-2xl */
export function Card({ children, pad = 24, style }: { children: React.ReactNode; pad?: number; style?: object }) {
  return (
    <View style={[{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: pad }, style]}>
      {children}
    </View>
  );
}

/** p-2.5 rounded-lg bg-muted/50 text-center */
export function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ padding: 10, borderRadius: radius.lg, backgroundColor: "rgba(242,243,232,0.5)", alignItems: "center" }}>
      <Txt size={11} lh={16} muted>{label}</Txt>
      <Txt size={14} lh={20} weight="500" center style={{ marginTop: 2 }}>{value}</Txt>
    </View>
  );
}

/** Thông báo: bg-primary/10 text-primary (hoặc destructive) text-sm rounded-xl px-4 py-2.5 */
export function MessageBox({ text, error }: { text: string; error?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: error ? "rgba(223,34,37,0.1)" : "rgba(27,126,42,0.1)",
        borderRadius: radius.xl, paddingHorizontal: 16, paddingVertical: 10,
      }}
    >
      <Txt size={14} lh={20} color={error ? colors.destructive : colors.primary}>{text}</Txt>
    </View>
  );
}

interface PreviewProps {
  coverUri: string | null;
  coverButtonLabel: string;
  onPickCover: () => void;
  farmName: string;
  address: string;
  description: string;
  areaHa: string;
  method: string;
  /** badge trạng thái bên phải tên (trang hồ sơ) */
  statusBadge?: React.ReactNode;
}

/** Thẻ ảnh bìa (aspect 16/7) + phần xem trước thông tin trang trại */
export function FarmPreview({ coverUri, coverButtonLabel, onPickCover, farmName, address, description, areaHa, method, statusBadge }: PreviewProps) {
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, overflow: "hidden" }}>
      <View style={{ width: "100%", aspectRatio: 16 / 7, backgroundColor: colors.muted }}>
        {coverUri ? (
          <Img uri={coverUri} style={{ width: "100%", height: "100%" }} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Txt size={14} lh={20} muted>Chưa có ảnh bìa</Txt>
          </View>
        )}
        <Pressable
          onPress={onPickCover}
          style={{
            position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.lg,
          }}
        >
          <Icon name="upload" size={14} color={colors.white} />
          <Txt size={12} lh={16} color={colors.white}>{coverButtonLabel}</Txt>
        </Pressable>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Txt size={20} lh={28} weight="700" style={{ flexShrink: 1 }}>{farmName || "Chưa đặt tên trang trại"}</Txt>
          {statusBadge}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
          <Icon name="map-pin" size={16} color={colors.mutedFg} />
          <Txt size={14} lh={20} muted style={{ flex: 1 }}>{address || "Chưa cập nhật địa chỉ"}</Txt>
        </View>
        {description ? <Txt size={14} lh={20} muted style={{ marginTop: 8 }}>{description}</Txt> : null}
        <View style={{ marginTop: 16 }}>
          <Grid cols={3} gap={12}>
            <InfoTile label="Diện tích" value={areaHa ? `${areaHa} ha` : "—"} />
            <InfoTile label="Phương pháp" value={method || "—"} />
          </Grid>
        </View>
      </View>
    </View>
  );
}

function CertTile({ uri, onRemove }: { uri: string; onRemove: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{ borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border, aspectRatio: 4 / 3, backgroundColor: colors.muted }}
    >
      <Img uri={uri} style={{ width: "100%", height: "100%" }} fallback="Chứng nhận" />
      {/* web: chỉ hiện khi rê chuột như bản gốc; app: luôn hiện */}
      <Pressable
        onPress={onRemove}
        accessibilityLabel="Xóa chứng nhận"
        style={{
          position: "absolute", top: 6, right: 6, padding: 4, borderRadius: 999,
          backgroundColor: "rgba(0,0,0,0.6)", opacity: hover || Platform.OS !== "web" ? 1 : 0,
        }}
      >
        <Icon name="x" size={14} color={colors.white} />
      </Pressable>
    </Pressable>
  );
}

interface CertsProps {
  items: { key: string | number; uri: string; onRemove: () => void }[];
  emptyText: string;
  buttonLabel: string;
  onPick: () => void;
  disabled?: boolean;
  hint?: string;
}

/** Thẻ "Chứng nhận": lưới 2 cột + nút chọn ảnh viền nét đứt */
export function CertificatesCard({ items, emptyText, buttonLabel, onPick, disabled, hint }: CertsProps) {
  const [hover, setHover] = useState(false);
  return (
    <Card pad={20}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name="award" size={16} color={colors.primary} />
        <Txt size={16} lh={24} weight="600">Chứng nhận</Txt>
      </View>

      <Grid cols={2} gap={8}>
        {items.map((c) => (
          <CertTile key={c.key} uri={c.uri} onRemove={c.onRemove} />
        ))}
      </Grid>
      {items.length === 0 ? <Txt size={12} lh={16} muted>{emptyText}</Txt> : null}

      <Pressable
        onPress={disabled ? undefined : onPick}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10,
          borderWidth: 2, borderStyle: "dashed", borderRadius: radius.lg, borderColor: hover ? colors.primary : colors.border,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Icon name="upload" size={16} color={hover ? colors.primary : colors.mutedFg} />
        <Txt size={14} lh={20} color={hover ? colors.primary : colors.mutedFg}>{buttonLabel}</Txt>
      </Pressable>
      {hint ? <Txt size={12} lh={16} muted style={{ marginTop: 8 }}>{hint}</Txt> : null}
    </Card>
  );
}
