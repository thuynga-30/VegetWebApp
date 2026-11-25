import { useMemo, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { StatusBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { orderService, type OrderWithDetails } from "@/services/orderService";
import { formatCurrency, formatDate } from "@/lib/format";
import { errMessage } from "@/lib/errors";
import { notify } from "@/lib/dialog";
import type { OrderStatus } from "@/types/order";

type Tab = | "Pending" | "Approved" | "Completed" | "Cancelled" | "All";
const TABS: { key: Tab; label: string }[] = [
  { key: "Pending", label: "Chờ duyệt" },
  { key: "Approved", label: "Đã duyệt" },
  { key: "Completed", label: "Hoàn thành" },
  { key: "Cancelled", label: "Từ chối" },
  { key: "All", label: "Tất cả" },
];

// Các trạng thái coi là "đã duyệt" — mọi trạng thái sau khi admin xác nhận đơn, trước khi hoàn tất/hủy
const APPROVED_STATUSES: OrderStatus[] = ["Confirmed", "Preparing", "Shipping", "Delivered"];

// Độ rộng cột (flex) của bảng
const COL = { id: 1.1, customer: 1.5, address: 2.2, date: 1.1, status: 1.2, total: 1.2, action: 1.8 } as const;

function Cell({ w, children, right }: { w: number; children?: React.ReactNode; right?: boolean }) {
  return <View style={{ flex: w, padding: 12, justifyContent: "center", alignItems: right ? "flex-end" : "flex-start", minWidth: 0 }}>{children}</View>;
}

function SmallButton({ icon, label, tone, onPress, disabled }: {
  icon: IconName; label: string; tone: "primary" | "danger"; onPress: () => void; disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const fg = tone === "primary" ? colors.primary : colors.destructive;
  const base = tone === "primary" ? "27,126,42" : "223,34,37";
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.lg,
        backgroundColor: `rgba(${base},${hover ? 0.2 : 0.1})`, opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon name={icon} size={14} color={fg} />
      <Txt size={12} lh={16} weight="500" color={fg}>{label}</Txt>
    </Pressable>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
      <Icon name="chevron-down" size={14} color={colors.mutedFg} />
    </View>
  );
}

/** Phần mở rộng: sản phẩm trong đơn + thông tin giao hàng và tổng cộng */
function ExpandedPanel({ o, isMd }: { o: OrderWithDetails; isMd: boolean }) {
  return (
    <View
      style={{
        flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 20, padding: 16,
        borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: "rgba(242,243,232,0.2)",
      }}
    >
      <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 8 }}>
        {o.details?.map((d: any) => (
          <View
            key={d.id}
            style={{
              flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderWidth: 1,
              borderColor: colors.border, borderRadius: radius.xl, padding: 10,
            }}
          >
            {d.image ? <Img uri={d.image} style={{ width: 48, height: 48, borderRadius: radius.lg }} /> : null}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt size={14} lh={20} weight="500" numberOfLines={1}>{d.product_name ?? `Lô hàng #${d.batch_id}`}</Txt>
              <Txt size={12} lh={16} muted numberOfLines={1}>{d.farm_name} · Mã lô {d.batch_code} · SL: {d.quantity}</Txt>
            </View>
            <Txt size={14} lh={20} weight="600">{formatCurrency((d.price ?? 0) * d.quantity)}</Txt>
          </View>
        ))}
        {!o.details || o.details.length === 0 ? <Txt size={12} lh={16} muted>Không có chi tiết sản phẩm.</Txt> : null}
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
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, flexDirection: "row", justifyContent: "space-between" }}>
          <Txt size={14} lh={20} weight="600">Tổng cộng</Txt>
          <Txt size={14} lh={20} weight="600" color={colors.primary}>{formatCurrency(o.total_price)}</Txt>
        </View>
      </View>
    </View>
  );
}

interface RowProps {
  o: OrderWithDetails;
  open: boolean;
  toggle: () => void;
  acting: boolean;
  act: (id: number, s: OrderStatus) => void;
  showActions: boolean;
  isMd: boolean;
}

function ApproveRejectButtons({ o, acting, act }: Pick<RowProps, "o" | "acting" | "act">) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 }}>
      <SmallButton icon="check" label="Duyệt" tone="primary" disabled={acting} onPress={() => act(o.id, "Confirmed")} />
      <SmallButton icon="x" label="Từ chối" tone="danger" disabled={acting} onPress={() => act(o.id, "Cancelled")} />
    </View>
  );
}

function TableRow(p: RowProps) {
  const { o, open, toggle, showActions, isMd } = p;
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
        <Cell w={COL.total} right><Txt size={14} lh={20} weight="600">{formatCurrency(o.total_price)}</Txt></Cell>
        {showActions ? <Cell w={COL.action} right><ApproveRejectButtons {...p} /></Cell> : null}
      </Pressable>
      {open ? <ExpandedPanel o={o} isMd={isMd} /> : null}
    </View>
  );
}

/** Điện thoại / màn hình hẹp: mỗi đơn là một thẻ */
function OrderCard(p: RowProps) {
  const { o, open, toggle, showActions, isMd } = p;
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
          <Txt size={16} lh={24} weight="700">{formatCurrency(o.total_price)}</Txt>
        </View>
        {showActions ? (
          <View style={{ alignItems: "flex-start" }}>
            <ApproveRejectButtons {...p} />
          </View>
        ) : null}
      </Pressable>
      {open ? <ExpandedPanel o={o} isMd={isMd} /> : null}
    </View>
  );
}

export default function AdminOrdersPage() {
  const { width } = useWindowDimensions();
  const { isMd } = useLayout();
  const asTable = width >= 1100; // sidebar 256px + 6–7 cột cần đủ rộng

  const [tab, setTab] = useState<Tab>("Pending");
  const { data: orders, loading, refetch } = useFetch(() => orderService.getAll(), []);
  const [actingId, setActingId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!orders) return [];
    if (tab === "All") return orders;
    if (tab === "Pending") {
      return orders.filter((o) => o.status === "Pending");
    }
    if (tab === "Completed") {
      return orders.filter((o) => o.status === "Completed");
    }
    if (tab === "Cancelled") {
      return orders.filter((o) => o.status === "Cancelled");
    }
    return orders.filter((o) =>
      APPROVED_STATUSES.includes(o.status)
    );
  }, [orders, tab]);

  const counts = useMemo(() => {
    if (!orders) {
      return {
        Pending: 0,
        Approved: 0,
        Completed: 0,
        Cancelled: 0,
        All: 0,
      };
    }

    return {
      Pending: orders.filter(
        (o) => o.status === "Pending"
      ).length,

      Approved: orders.filter(
        (o) => APPROVED_STATUSES.includes(o.status)
      ).length,

      Completed: orders.filter(
        (o) => o.status === "Completed"
      ).length,

      Cancelled: orders.filter(
        (o) => o.status === "Cancelled"
      ).length,

      All: orders.length,
    };
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

  const showActions = tab === "Pending";
  const rowProps = (o: OrderWithDetails): RowProps => ({
    o,
    open: expanded === o.id,
    toggle: () => setExpanded(expanded === o.id ? null : o.id),
    acting: actingId === o.id,
    act,
    showActions,
    isMd,
  });

  const head = (w: number, label: string, right?: boolean) => (
    <View key={label} style={{ flex: w, padding: 12, alignItems: right ? "flex-end" : "flex-start" }}>
      <Txt size={12} lh={16} muted style={{ textTransform: "uppercase" }}>{label}</Txt>
    </View>
  );

  const emptyText =
    tab === "Pending"
      ? "Không có đơn hàng nào đang chờ duyệt."
      : tab === "Approved"
        ? "Không có đơn hàng nào đã duyệt."
        : tab === "Completed"
          ? "Chưa có đơn hàng nào hoàn thành."
          : tab === "Cancelled"
            ? "Không có đơn hàng nào bị từ chối."
            : "Không có đơn hàng nào.";
  const empty = !loading && filtered.length === 0;

  return (
    <PanelPage onRefresh={refetch}>
      <View>
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
              {head(COL.id, "Mã đơn")}
              {head(COL.customer, "Khách")}
              {head(COL.address, "Địa chỉ")}
              {head(COL.date, "Ngày")}
              {head(COL.status, "Trạng thái")}
              {head(COL.total, "Tổng", true)}
              {showActions ? head(COL.action, "Thao tác", true) : null}
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
