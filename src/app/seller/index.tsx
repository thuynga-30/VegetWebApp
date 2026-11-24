import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Grid, StatCard } from "@/components/ui/Misc";
import { StatusBadge, TrustBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { batchService } from "@/services/batchService";
import { orderService } from "@/services/orderService";
import { formatCurrency } from "@/lib/format";

/** bg-card border rounded-2xl p-5 */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 20 }}>
      {children}
    </View>
  );
}

/** Dòng danh sách: p-2 rounded-lg, rê chuột nền muted */
function BatchRow({ b }: { b: any }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/seller/batches/${b.id}`} asChild>
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          flexDirection: "row", alignItems: "center", gap: 12, padding: 8, borderRadius: radius.lg,
          backgroundColor: hover ? colors.muted : "transparent",
        }}
      >
        {b?.image ? <Img uri={b.image} style={{ width: 40, height: 40, borderRadius: radius.lg }} /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt size={14} lh={20} weight="500" numberOfLines={1}>{b.product_name}</Txt>
          <Txt size={12} lh={16} muted numberOfLines={1}>{b.batch_code}</Txt>
        </View>
        <TrustBadge level={b.trust_level} size="sm" />
      </Pressable>
    </Link>
  );
}

function OrderRow({ o }: { o: any }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 8,
        borderRadius: radius.lg, backgroundColor: hover ? colors.muted : "transparent",
      }}
    >
      <Txt size={14} lh={20} numberOfLines={1} style={{ flex: 1, minWidth: 0 }}>#{o.id} · {o.receiver_name}</Txt>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <StatusBadge status={o.status} />
        <Txt size={14} lh={20} weight="600">{formatCurrency(o.seller_total ?? o.total_price ?? 0)}</Txt>
      </View>
    </Pressable>
  );
}

export default function SellerOverviewPage() {
  const { isMd } = useLayout();
  const { data: batches, loading: lb, error: eb, refetch: rb } = useFetch(() => batchService.getMyBatches(), []);
  const { data: orders, loading: lo, error: eo, refetch: ro } = useFetch(() => orderService.getSellerOrders(), []);

  const pending = batches?.filter((b) => b.approval_status === "Pending") ?? [];
  const onSale = batches?.filter((b) => b.approval_status === "Approved") ?? [];

  // Doanh thu: chỉ tính đơn đã giao / hoàn thành
  const revenue =
    orders?.filter((o) => ["Delivered", "Completed"].includes(o.status)).reduce((s, o) => s + (o.seller_total ?? 0), 0) ?? 0;

  if (lb || lo) {
    return (
      <PanelPage>
        <View style={{ paddingVertical: 80, alignItems: "center" }}>
          <ActivityIndicator size="small" color={colors.mutedFg} />
        </View>
      </PanelPage>
    );
  }

  if (eb || eo) {
    return (
      <PanelPage>
        <View
          style={{
            alignItems: "center", gap: 12, padding: 24, backgroundColor: colors.card, borderWidth: 1,
            borderColor: colors.border, borderRadius: radius.xxl,
          }}
        >
          <Txt size={14} lh={20} color={colors.destructive} center>{eb ?? eo}</Txt>
          <Pressable
            onPress={() => {
              rb();
              ro();
            }}
          >
            <Txt size={14} lh={20} color={colors.primary} style={{ textDecorationLine: "underline" }}>Thử lại</Txt>
          </Pressable>
        </View>
      </PanelPage>
    );
  }

  return (
    <PanelPage onRefresh={() => { rb(); ro(); }}>
      <Grid cols={isMd ? 4 : 1} gap={16}>
        <StatCard icon="package" label="Lô hàng đang bán" value={String(onSale.length)} />
        <StatCard icon="check-square" label="Chờ kiểm duyệt" value={String(pending.length)} highlight={pending.length > 0} sub="Ưu tiên bổ sung minh chứng" />
        <StatCard icon="shopping-bag" label="Đơn hàng" value={String(orders?.length ?? 0)} />
        <StatCard icon="trending-up" label="Doanh thu" value={formatCurrency(revenue)} />
      </Grid>

      <Panel>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Txt size={16} lh={24} weight="600">Lô hàng gần đây</Txt>
          <Link href="/seller/batches" asChild>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Txt size={12} lh={16} color={colors.primary}>Tất cả</Txt>
              <Icon name="arrow-right" size={12} color={colors.primary} />
            </Pressable>
          </Link>
        </View>
        <View style={{ gap: 8 }}>
          {batches?.slice(0, 5).map((b) => <BatchRow key={b.id} b={b} />)}
          {!batches || batches.length === 0 ? <Txt size={14} lh={20} muted>Chưa có lô hàng nào.</Txt> : null}
        </View>
      </Panel>

      <Panel>
        <Txt size={16} lh={24} weight="600" style={{ marginBottom: 16 }}>Đơn hàng gần đây</Txt>
        <View style={{ gap: 8 }}>
          {orders?.slice(0, 5).map((o) => <OrderRow key={o.id} o={o} />)}
          {!orders || orders.length === 0 ? <Txt size={14} lh={20} muted>Chưa có đơn hàng nào.</Txt> : null}
        </View>
      </Panel>
    </PanelPage>
  );
}
