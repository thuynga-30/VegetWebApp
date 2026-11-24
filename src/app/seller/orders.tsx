import { useMemo, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { StatusBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { orderService, type OrderWithDetails } from "@/services/orderService";
import { batchService } from "@/services/batchService";
import { formatCurrency, formatDate } from "@/lib/format";
import { errMessage } from "@/lib/errors";
import { notify } from "@/lib/dialog";
import type { OrderStatus } from "@/types/order";
import type { BatchListItem } from "@/types/batch";

type Tab = "Active" | "Pending" | "Shipping" | "Done" | "Cancelled" | "All";

const TABS: { key: Tab; label: string }[] = [
  { key: "Active", label: "Cần xử lý" },
  { key: "Pending", label: "Chờ duyệt" },
  { key: "Shipping", label: "Đang giao" },
  { key: "Done", label: "Hoàn tất" },
  { key: "Cancelled", label: "Đã hủy" },
  { key: "All", label: "Tất cả" },
];

const TAB_STATUSES: Record<Tab, OrderStatus[] | null> = {
  Active: ["Confirmed", "Preparing"],
  Pending: ["Pending"],
  Shipping: ["Shipping"],
  Done: ["Delivered", "Completed"],
  Cancelled: ["Cancelled"],
  All: null,
};

// Độ rộng cột (flex) của bảng
const COL = { id: 1.1, customer: 1.5, address: 2.2, date: 1.1, status: 1.2, total: 1.2, action: 2 } as const;

function Cell({ w, children, right }: { w: number; children?: React.ReactNode; right?: boolean }) {
  return <View style={{ flex: w, padding: 12, justifyContent: "center", alignItems: right ? "flex-end" : "flex-start", minWidth: 0 }}>{children}</View>;
}

/** Nút thao tác: inline-flex gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium */
function ActionButton({ icon, label, onPress, disabled }: { icon: "package-check" | "truck"; label: string; onPress: () => void; disabled: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.lg,
        backgroundColor: hover ? "rgba(27,126,42,0.2)" : "rgba(27,126,42,0.1)", opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon name={icon} size={14} color={colors.primary} />
      <Txt size={12} lh={16} weight="500" color={colors.primary}>{label}</Txt>
    </Pressable>
  );
}

/** Cột "Thao tác": tùy trạng thái đơn */
function Actions({ o, acting, act }: { o: OrderWithDetails; acting: boolean; act: (id: number, s: OrderStatus) => void }) {
  if (o.status === "Confirmed") {
    return <ActionButton icon="package-check" label="Đã chuẩn bị hàng" disabled={acting} onPress={() => act(o.id, "Preparing")} />;
  }
  if (o.status === "Preparing") {
    return <ActionButton icon="truck" label="Đã gửi hàng" disabled={acting} onPress={() => act(o.id, "Shipping")} />;
  }
  if (o.status === "Pending") {
    return <Txt size={12} lh={16} muted>Chờ admin duyệt đơn</Txt>;
  }
  return <Txt size={12} lh={16} muted>—</Txt>;
}

/** Phần mở rộng: sản phẩm của bạn trong đơn + thông tin nhận hàng */
function ExpandedPanel({ o, batchById, isMd }: { o: OrderWithDetails; batchById: Map<number, BatchListItem>; isMd: boolean }) {
  const myItems = o.details?.filter((d) => batchById.has(d.batch_id)) ?? [];
  return (
    <View
      style={{
        flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 20, padding: 16,
        borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: "rgba(242,243,232,0.2)",
      }}
    >
      <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 8 }}>
        {myItems.map((d) => {
          const b = batchById.get(d.batch_id);
          return (
            <View
              key={d.id}
              style={{
                flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderWidth: 1,
                borderColor: colors.border, borderRadius: radius.xl, padding: 10,
              }}
            >
              {b?.image ? <Img uri={b.image} style={{ width: 48, height: 48, borderRadius: radius.lg }} /> : null}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt size={14} lh={20} weight="500" numberOfLines={1}>{b?.product_name ?? `Lô hàng #${d.batch_id}`}</Txt>
                <Txt size={12} lh={16} muted numberOfLines={1}>Mã lô {b?.batch_code} · SL: {d.quantity}</Txt>
              </View>
              <Txt size={14} lh={20} weight="600">{formatCurrency(d.price * d.quantity)}</Txt>
            </View>
          );
        })}
        {myItems.length === 0 ? (
          <Txt size={12} lh={16} muted>Không có sản phẩm nào của bạn trong đơn này.</Txt>
        ) : null}
      </View>

      <View
        style={{
          width: isMd ? 260 : "100%", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
          borderRadius: radius.xl, padding: 12, gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
          <View style={{ marginTop: 3 }}><Icon name="phone" size={14} color={colors.mutedFg} /></View>
          <Txt size={14} lh={20} style={{ flex: 1 }}>{o.receiver_phone}</Txt>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
          <View style={{ marginTop: 3 }}><Icon name="map-pin" size={14} color={colors.mutedFg} /></View>
          <Txt size={14} lh={20} style={{ flex: 1 }}>{o.shipping_address}</Txt>
        </View>
        {o.tracking_note ? (
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
            <View style={{ marginTop: 3 }}><Icon name="sticky-note" size={14} color={colors.mutedFg} /></View>
            <Txt size={14} lh={20} muted style={{ flex: 1 }}>{o.tracking_note}</Txt>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
      <Icon name="chevron-down" size={14} color={colors.mutedFg} />
    </View>
  );
}

/** Dòng của bảng (màn hình rộng) */
function TableRow({ o, open, toggle, acting, act, batchById, isMd }: RowProps) {
  const [hover, setHover] = useState(false);
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
      <Pressable
        onPress={toggle}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{ flexDirection: "row", backgroundColor: hover ? "rgba(242,243,232,0.3)" : "transparent" }}
      >
        <Cell w={COL.id}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Chevron open={open} />
            <Txt size={14} lh={20} mono>#{o.id}</Txt>
          </View>
        </Cell>
        <Cell w={COL.customer}><Txt size={14} lh={20}>{o.receiver_name}</Txt></Cell>
        <Cell w={COL.address}><Txt size={14} lh={20} muted>{o.shipping_address}</Txt></Cell>
        <Cell w={COL.date}><Txt size={14} lh={20}>{formatDate(o.created_at)}</Txt></Cell>
        <Cell w={COL.status}><StatusBadge status={o.status} /></Cell>
        <Cell w={COL.total} right><Txt size={14} lh={20} weight="600">{formatCurrency(o.total_price ?? 0)}</Txt></Cell>
        <Cell w={COL.action} right><Actions o={o} acting={acting} act={act} /></Cell>
      </Pressable>
      {open ? <ExpandedPanel o={o} batchById={batchById} isMd={isMd} /> : null}
    </View>
  );
}

/** Thẻ đơn hàng (điện thoại / màn hình hẹp) */
function OrderCard({ o, open, toggle, acting, act, batchById, isMd }: RowProps) {
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, overflow: "hidden" }}>
      <Pressable onPress={toggle} style={{ padding: 16, gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Chevron open={open} />
            <Txt size={14} lh={20} mono>#{o.id}</Txt>
          </View>
          <StatusBadge status={o.status} />
        </View>
        <Txt size={16} lh={24} weight="600">{o.receiver_name}</Txt>
        <Txt size={14} lh={20} muted>{o.shipping_address}</Txt>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Txt size={12} lh={16} muted>{formatDate(o.created_at)}</Txt>
          <Txt size={16} lh={24} weight="700">{formatCurrency(o.total_price ?? 0)}</Txt>
        </View>
        <View style={{ alignItems: "flex-start" }}>
          <Actions o={o} acting={acting} act={act} />
        </View>
      </Pressable>
      {open ? <ExpandedPanel o={o} batchById={batchById} isMd={isMd} /> : null}
    </View>
  );
}

interface RowProps {
  o: OrderWithDetails;
  open: boolean;
  toggle: () => void;
  acting: boolean;
  act: (id: number, s: OrderStatus) => void;
  batchById: Map<number, BatchListItem>;
  isMd: boolean;
}

export default function SellerOrdersPage() {
  const { width } = useWindowDimensions();
  const { isMd } = useLayout();
  const asTable = width >= 1100; // sidebar 256px + 7 cột cần đủ rộng

  const [tab, setTab] = useState<Tab>("Active");
  const { data: orders, loading, refetch } = useFetch(() => orderService.getSellerOrders(), []);
  const { data: myBatches } = useFetch(() => batchService.getMyBatches(), []);
  const [actingId, setActingId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const batchById = useMemo(() => {
    const map = new Map<number, BatchListItem>();
    myBatches?.forEach((b) => map.set(b.id, b));
    return map;
  }, [myBatches]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const statuses = TAB_STATUSES[tab];
    return statuses ? orders.filter((o) => statuses.includes(o.status)) : orders;
  }, [orders, tab]);

  const counts = useMemo(() => {
    const result = {} as Record<Tab, number>;
    TABS.forEach(({ key }) => {
      const statuses = TAB_STATUSES[key];
      result[key] = !orders ? 0 : statuses ? orders.filter((o) => statuses.includes(o.status)).length : orders.length;
    });
    return result;
  }, [orders]);

  const act = async (id: number, status: OrderStatus) => {
    setActingId(id);
    try {
      await orderService.updateStatus(id, status);
      refetch();
    } catch (err) {
      notify("Không thể cập nhật đơn hàng", errMessage(err));
    } finally {
      setActingId(null);
    }
  };

  const rowProps = (o: OrderWithDetails): RowProps => ({
    o,
    open: expanded === o.id,
    toggle: () => setExpanded(expanded === o.id ? null : o.id),
    acting: actingId === o.id,
    act,
    batchById,
    isMd,
  });

  const headCell = (w: number, label: string, right?: boolean) => (
    <View key={label} style={{ flex: w, padding: 12, alignItems: right ? "flex-end" : "flex-start" }}>
      <Txt size={12} lh={16} muted style={{ textTransform: "uppercase" }}>{label}</Txt>
    </View>
  );

  const emptyText = orders && orders.length > 0 ? "Không có đơn hàng nào trong mục này." : "Chưa có đơn hàng nào liên quan tới lô hàng của bạn.";
  const empty = !loading && filtered.length === 0;

  return (
    <PanelPage onRefresh={refetch}>
      <View>
        {/* Tabs lọc: px-4 py-1.5 rounded-full text-sm */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 20 }}>
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.full,
                  borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : "transparent",
                }}
              >
                <Txt size={14} lh={20} color={on ? colors.primaryFg : colors.foreground}>{t.label}</Txt>
                <Txt size={12} lh={16} color={on ? "rgba(252,252,248,0.9)" : colors.mutedFg}>({counts[t.key]})</Txt>
              </Pressable>
            );
          })}
        </View>

        {asTable ? (
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, overflow: "hidden" }}>
            <View style={{ flexDirection: "row", backgroundColor: "rgba(242,243,232,0.5)" }}>
              {headCell(COL.id, "Mã đơn")}
              {headCell(COL.customer, "Khách")}
              {headCell(COL.address, "Địa chỉ")}
              {headCell(COL.date, "Ngày")}
              {headCell(COL.status, "Trạng thái")}
              {headCell(COL.total, "Tổng", true)}
              {headCell(COL.action, "Thao tác", true)}
            </View>
            {filtered.map((o) => <TableRow key={o.id} {...rowProps(o)} />)}
            {empty ? <Txt size={14} lh={20} muted center style={{ padding: 24 }}>{emptyText}</Txt> : null}
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {filtered.map((o) => <OrderCard key={o.id} {...rowProps(o)} />)}
            {empty ? (
              <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl }}>
                <Txt size={14} lh={20} muted center style={{ padding: 24 }}>{emptyText}</Txt>
              </View>
            ) : null}
          </View>
        )}
        {loading ? <Txt size={14} lh={20} muted style={{ marginTop: 12 }}>Đang tải...</Txt> : null}
      </View>
    </PanelPage>
  );
}
