import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Badges";
import { useFetch } from "@/hooks/useFetch";
import { orderService, type OrderWithDetails } from "@/services/orderService";
import { formatCurrency, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types/order";

type OrderTab = "All" | "Pending" | "Preparing" | "Shipping" | "Completed" | "Cancelled";

const TABS: { key: OrderTab; label: string }[] = [
  { key: "All", label: "Tất cả" },
  { key: "Pending", label: "Chờ duyệt" },
  { key: "Preparing", label: "Đang chuẩn bị" },
  { key: "Shipping", label: "Chờ nhận hàng" },
  { key: "Completed", label: "Hoàn thành" },
  { key: "Cancelled", label: "Đã hủy" },
];

// Mỗi tab gồm những trạng thái nào (null = không lọc)
const TAB_STATUSES: Record<OrderTab, OrderStatus[] | null> = {
  All: null,
  Pending: ["Pending"], // chờ admin duyệt
  Preparing: ["Confirmed", "Preparing"], // đã duyệt, người bán đang chuẩn bị hàng
  Shipping: ["Shipping", "Delivered"], // đang giao / đã giao, chờ khách xác nhận nhận hàng
  Completed: ["Completed"],
  Cancelled: ["Cancelled"],
};

/** Thẻ đơn hàng: bg-card border rounded-2xl p-5, rê chuột đổi viền xanh */
function OrderRow({ o }: { o: OrderWithDetails }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/orders/${o.id}`} asChild>
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          backgroundColor: colors.card, borderWidth: 1, borderColor: hover ? colors.primary : colors.border,
          borderRadius: radius.xxl, padding: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <View style={{ flexShrink: 1 }}>
            <Txt size={14} lh={20} mono muted>#{o.id}</Txt>
            <Txt size={16} lh={24} weight="600">{o.receiver_name} · {o.shipping_address}</Txt>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <StatusBadge status={o.status} />
            <Txt size={16} lh={24} weight="700" color={colors.primary}>{formatCurrency(o.total_price ?? 0)}</Txt>
          </View>
        </View>
        <Txt size={12} lh={16} muted style={{ marginTop: 8 }}>
          Đặt ngày {formatDate(o.created_at)} · {o.details?.length ?? 0} sản phẩm
        </Txt>
      </Pressable>
    </Link>
  );
}

export default function MyOrdersPage() {
  const { data: orders, loading } = useFetch(() => orderService.getMyOrders(), []);
  const [tab, setTab] = useState<OrderTab>("All");

  const filtered = useMemo(() => {
    if (!orders) return [];
    const statuses = TAB_STATUSES[tab];
    return statuses ? orders.filter((o) => statuses.includes(o.status)) : orders;
  }, [orders, tab]);

  const counts = useMemo(() => {
    const result = {} as Record<OrderTab, number>;
    TABS.forEach(({ key }) => {
      const statuses = TAB_STATUSES[key];
      result[key] = !orders ? 0 : statuses ? orders.filter((o) => statuses.includes(o.status)).length : orders.length;
    });
    return result;
  }, [orders]);

  return (
    <Screen padded={false} footer>
      <View style={{ width: "100%", maxWidth: 1024, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 40 }}>
        <Txt size={30} lh={36} weight="700">Đơn hàng của tôi</Txt>

        {loading ? (
          <Txt size={16} lh={24} muted style={{ marginTop: 24 }}>Đang tải...</Txt>
        ) : !orders || orders.length === 0 ? (
          <View style={{ marginTop: 64, alignItems: "center" }}>
            <Icon name="package-search" size={64} color={colors.mutedFg} strokeWidth={1.5} />
            <Txt size={16} lh={24} muted center style={{ marginTop: 16 }}>Bạn chưa có đơn hàng nào.</Txt>
            <Link href="/products" asChild>
              <Pressable style={{ marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl }}>
                <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>Mua sắm ngay</Txt>
              </Pressable>
            </Link>
          </View>
        ) : (
          <>
            {/* Lọc theo trạng thái */}
            <View style={{ marginTop: 24, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              {TABS.map((t) => {
                const on = tab === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setTab(t.key)}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 6,
                      borderRadius: radius.full, borderWidth: 1, borderColor: on ? colors.primary : colors.border,
                      backgroundColor: on ? colors.primary : "transparent",
                    }}
                  >
                    <Txt size={14} lh={20} color={on ? colors.primaryFg : colors.foreground}>{t.label}</Txt>
                    <Txt size={12} lh={16} color={on ? "rgba(252,252,248,0.9)" : colors.mutedFg}>({counts[t.key]})</Txt>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: 16, gap: 12 }}>
              {filtered.map((o) => (
                <OrderRow key={o.id} o={o} />
              ))}
              {filtered.length === 0 ? (
                <Txt size={14} lh={20} muted center style={{ paddingVertical: 40 }}>
                  Không có đơn hàng nào trong mục này.
                </Txt>
              ) : null}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
