import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Grid, StatCard } from "@/components/ui/Misc";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { batchService } from "@/services/batchService";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { formatCurrency, formatDate } from "@/lib/format";

/** bg-card border rounded-2xl p-5 */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 20 }}>
      {children}
    </View>
  );
}

/** Dòng lô hàng chờ duyệt: flex gap-3 p-2 rounded-lg hover:bg-muted */
function PendingRow({ b }: { b: any }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/admin/approvals/${b.id}`} asChild>
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
          <Txt size={12} lh={16} muted numberOfLines={1}>{b.farm_name} · {b.batch_code}</Txt>
        </View>
        {/* text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full */}
        <View style={{ backgroundColor: colors.amber100, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full }}>
          <Txt size={12} lh={16} color={colors.amber700}>Chờ duyệt</Txt>
        </View>
      </Pressable>
    </Link>
  );
}

// Độ rộng cột bảng "Đơn hàng gần đây"
const COL = { id: 1, customer: 2, date: 1.4, value: 1.6 } as const;

export default function AdminOverviewPage() {
  const { isMd } = useLayout();
  const { data: batches, refetch: rb } = useFetch(() => batchService.getAllAdmin(), []);
  const { data: orders, refetch: ro } = useFetch(() => orderService.getAll(), []);
  const { data: userCount, refetch: ru } = useFetch(() => userService.getCount(), []);

  const pending = batches?.filter((b) => b.approval_status === "Pending") ?? [];
  const onSale = batches?.filter((b) => b.approval_status === "Approved").length ?? 0;
  const revenue =
    orders?.filter((o) => ["Delivered", "Completed"].includes(o.status)).reduce((s, o) => s + Number(o.total_price), 0) ?? 0;

  const head = (w: number, label: string, right?: boolean) => (
    <View key={label} style={{ flex: w, paddingBottom: 8, alignItems: right ? "flex-end" : "flex-start" }}>
      <Txt size={12} lh={16} muted style={{ textTransform: "uppercase" }}>{label}</Txt>
    </View>
  );

  return (
    <PanelPage onRefresh={() => { rb(); ro(); ru(); }}>
      <Grid cols={isMd ? 4 : 1} gap={16}>
        <StatCard icon="users" label="Tổng người dùng" value={String(userCount ?? 0)} />
        <StatCard icon="package" label="Lô hàng đang bán" value={String(onSale)} />
        <StatCard icon="check-square" label="Chờ kiểm duyệt" value={String(pending.length)} highlight={pending.length > 0} sub="Ưu tiên xử lý trong 24h" />
        <StatCard icon="shopping-bag" label="Doanh thu" value={formatCurrency(revenue)} />
      </Grid>

      <Panel>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Txt size={16} lh={24} weight="600">Lô hàng chờ duyệt</Txt>
          <Link href="/admin/approvals" asChild>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Txt size={12} lh={16} color={colors.primary}>Tất cả</Txt>
              <Icon name="arrow-right" size={12} color={colors.primary} />
            </Pressable>
          </Link>
        </View>
        <View style={{ gap: 8 }}>
          {pending.slice(0, 6).map((b) => <PendingRow key={b.id} b={b} />)}
          {pending.length === 0 ? <Txt size={14} lh={20} muted>Không có lô hàng nào đang chờ duyệt.</Txt> : null}
        </View>
      </Panel>

      <Panel>
        <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Đơn hàng gần đây</Txt>
        <View style={{ flexDirection: "row" }}>
          {head(COL.id, "Mã đơn")}
          {head(COL.customer, "Khách")}
          {head(COL.date, "Ngày")}
          {head(COL.value, "Giá trị", true)}
        </View>
        {orders?.slice(0, 8).map((o) => (
          <View
            key={o.id}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}
          >
            <View style={{ flex: COL.id }}><Txt size={14} lh={20} mono>#{o.id}</Txt></View>
            <View style={{ flex: COL.customer, paddingRight: 8 }}><Txt size={14} lh={20} numberOfLines={1}>{o.receiver_name}</Txt></View>
            <View style={{ flex: COL.date }}><Txt size={14} lh={20}>{formatDate(o.created_at)}</Txt></View>
            <View style={{ flex: COL.value, alignItems: "flex-end" }}>
              <Txt size={14} lh={20} weight="600">{formatCurrency(o.total_price)}</Txt>
            </View>
          </View>
        ))}
      </Panel>
    </PanelPage>
  );
}
