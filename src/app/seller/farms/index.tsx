import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Grid } from "@/components/ui/Misc";
import { StatusBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { farmService } from "@/services/farmService";
import type { FarmListItem } from "@/types/farm";

const statusOf = (s?: string) => (s === "approved" ? "Approved" : s === "rejected" ? "Rejected" : "Pending");

/** bg-card border rounded-2xl overflow-hidden hover:border-primary */
function FarmCard({ f }: { f: FarmListItem }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/seller/farms/${f.id}`} asChild>
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          backgroundColor: colors.card, borderWidth: 1, borderColor: hover ? colors.primary : colors.border,
          borderRadius: radius.xxl, overflow: "hidden",
        }}
      >
        <Img uri={f.coverImage} style={{ width: "100%", aspectRatio: 16 / 9 }} fallback="Chưa có ảnh" />
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <Txt size={16} lh={24} weight="600" style={{ flexShrink: 1 }}>{f.farmName}</Txt>
            <StatusBadge status={statusOf(f.status)} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Icon name="map-pin" size={12} color={colors.mutedFg} />
            <Txt size={12} lh={16} muted style={{ flex: 1 }}>{f.address || "Chưa cập nhật địa chỉ"}</Txt>
          </View>
          <Txt size={14} lh={20} muted numberOfLines={2} style={{ marginTop: 8 }}>{f.description}</Txt>
        </View>
      </Pressable>
    </Link>
  );
}

export default function SellerFarmsPage() {
  const { isMd } = useLayout();
  const { data: farms, loading, refetch } = useFetch(() => farmService.getMyFarms(), []);

  if (loading) {
    return (
      <PanelPage>
        <Txt size={16} lh={24} muted>Đang tải...</Txt>
      </PanelPage>
    );
  }

  return (
    <PanelPage onRefresh={refetch}>
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <Txt size={14} lh={20} muted style={{ flex: 1 }}>
            {farms && farms.length > 0 ? `Bạn có ${farms.length} trang trại` : "Quản lý các trang trại của bạn"}
          </Txt>
          <Link href="/seller/farms/new" asChild>
            <Pressable
              style={{
                flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary,
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.lg,
              }}
            >
              <Icon name="plus" size={16} color={colors.primaryFg} />
              <Txt size={14} lh={20} weight="600" color={colors.primaryFg}>Thêm trang trại</Txt>
            </Pressable>
          </Link>
        </View>

        {farms && farms.length > 0 ? (
          <Grid cols={isMd ? 3 : 1} gap={16}>
            {farms.map((f) => <FarmCard key={f.id} f={f} />)}
          </Grid>
        ) : (
          <Txt size={14} lh={20} muted center style={{ paddingVertical: 40 }}>
            Bạn chưa có trang trại nào. Bấm "Thêm trang trại" để tạo trang trại đầu tiên.
          </Txt>
        )}
      </View>
    </PanelPage>
  );
}
