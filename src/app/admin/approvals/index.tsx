import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Img } from "@/components/ui/Img";
import { Grid } from "@/components/ui/Misc";
import { TrustBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { approvalService } from "@/services/approvalService";
import { formatDate } from "@/lib/format";
import type { ApprovalStatus, BatchListItem } from "@/types/batch";

type Filter = ApprovalStatus | "All";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "Pending", label: "Chờ duyệt" },
  { key: "Approved", label: "Đã duyệt" },
  { key: "Rejected", label: "Từ chối" },
  { key: "All", label: "Tất cả" },
];

/** bg-card border rounded-2xl p-4 flex gap-4 hover:border-primary */
function BatchCard({ b }: { b: BatchListItem }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/admin/approvals/${b.id}`} asChild>
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          flexDirection: "row", gap: 16, padding: 16, backgroundColor: colors.card, borderWidth: 1,
          borderColor: hover ? colors.primary : colors.border, borderRadius: radius.xxl,
        }}
      >
        {b?.image ? <Img uri={b.image} style={{ width: 96, height: 96, borderRadius: radius.xl }} /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <Txt size={16} lh={24} weight="600" numberOfLines={1} style={{ flexShrink: 1 }}>{b.product_name}</Txt>
            <TrustBadge level={b.trust_level} size="sm" />
          </View>
          <Txt size={12} lh={16} mono muted style={{ marginTop: 2 }}>{b.batch_code}</Txt>
          <Txt size={12} lh={16} muted style={{ marginTop: 4 }}>{b.farm_name}</Txt>
          <View style={{ flexDirection: "row", gap: 4, marginTop: 8 }}>
            <Txt size={12} lh={16} style={{ flex: 1 }}>Thu hoạch: <Txt size={12} lh={16} weight="700">{formatDate(b.harvest_date)}</Txt></Txt>
            <Txt size={12} lh={16} style={{ flex: 1 }}>SL: <Txt size={12} lh={16} weight="700">{b.quantity}kg</Txt></Txt>
          </View>
          <View style={{ marginTop: 12, alignItems: "flex-end" }}>
            <Txt size={12} lh={16} color={colors.primary}>Xem duyệt →</Txt>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function ApprovalsPage() {
  const { isMd } = useLayout();
  const [filter, setFilter] = useState<Filter>("Pending");

  // getPending() chỉ trả lô đang chờ duyệt; các bộ lọc khác lấy toàn bộ rồi lọc phía client
  const { data: batches, loading, refetch } = useFetch(
    () => (filter === "Pending" ? approvalService.getPending() : approvalService.getAll()),
    [filter]
  );
  const list = (batches ?? []).filter((b) => (filter === "All" ? true : b.approval_status === filter));

  return (
    <PanelPage onRefresh={refetch}>
      <View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 20 }}>
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1,
                  borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : "transparent",
                }}
              >
                <Txt size={14} lh={20} color={on ? colors.primaryFg : colors.foreground}>{f.label}</Txt>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <Txt size={16} lh={24} muted>Đang tải...</Txt>
        ) : (
          <>
            <Grid cols={isMd ? 2 : 1} gap={16}>
              {list.map((b) => <BatchCard key={b.id} b={b} />)}
            </Grid>
            {list.length === 0 ? <Txt size={14} lh={20} muted>Không có lô hàng nào.</Txt> : null}
          </>
        )}
      </View>
    </PanelPage>
  );
}
