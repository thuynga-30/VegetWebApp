import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { colors, radius } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Badges";
import { useFetch } from "@/hooks/useFetch";
import { orderService } from "@/services/orderService";
import { formatCurrency, formatDate } from "@/lib/format";
import { confirmDialog } from "@/lib/dialog";
import { errMessage } from "@/lib/errors";

const PAY_METHOD = { COD: "Thanh toán khi nhận hàng (COD)", VNPay: "VNPay" } as const;
const PAY_STATUS = { Unpaid: "Chưa thanh toán", Paid: "Đã thanh toán", Failed: "Thanh toán thất bại" } as const;

function Wrap({ children, py }: { children: React.ReactNode; py: number }) {
  return (
    <View style={{ width: "100%", maxWidth: 768, alignSelf: "center", paddingHorizontal: 16, paddingVertical: py }}>
      {children}
    </View>
  );
}

/** bg-card border rounded-2xl p-6 */
function Card({ title, children, mt }: { title: string; children: React.ReactNode; mt: number }) {
  return (
    <View style={{ marginTop: mt, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 24 }}>
      <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>{title}</Txt>
      {children}
    </View>
  );
}

export default function OrderDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, loading, refetch } = useFetch(() => orderService.getById(Number(id)), [id]);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const confirmReceived = async () => {
    if (!order) return;
    setConfirming(true);
    setError("");
    try {
      await orderService.confirmReceived(order.id);
      refetch();
    } catch (err) {
      setError(errMessage(err, "Xác nhận thất bại"));
    } finally {
      setConfirming(false);
    }
  };

  const cancelOrder = async () => {
    if (!order) return;
    if (!(await confirmDialog(`Bạn chắc chắn muốn hủy đơn hàng #${order.id}?`, undefined, "Hủy đơn"))) return;
    setCancelling(true);
    setError("");
    try {
      await orderService.cancel(order.id);
      refetch();
    } catch (err) {
      setError(errMessage(err, "Hủy đơn thất bại"));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Screen padded={false} footer>
        <Wrap py={64}><Txt size={16} lh={24} muted>Đang tải...</Txt></Wrap>
      </Screen>
    );
  }
  if (!order) {
    return (
      <Screen padded={false} footer>
        <Wrap py={64}><Txt size={16} lh={24} muted>Không tìm thấy đơn hàng.</Txt></Wrap>
      </Screen>
    );
  }

  // Chỉ cho khách tự hủy khi đơn còn chờ duyệt và chưa thanh toán online
  const isPending = order.status === "Pending";
  const canCancel = isPending && order.payment_status !== "Paid";
  const paidPending = isPending && order.payment_status === "Paid";
  const details = order.details ?? [];

  return (
    <Screen padded={false} footer>
      <Wrap py={40}>
        <Link href="/orders" asChild>
          <Pressable style={{ alignSelf: "flex-start" }}>
            <Txt size={14} lh={20} muted>← Đơn hàng của tôi</Txt>
          </Pressable>
        </Link>

        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <Txt size={24} lh={32} weight="700">Đơn hàng #{order.id}</Txt>
          <StatusBadge status={order.status} />
        </View>

        <Card title="Thông tin nhận hàng" mt={24}>
          <View style={{ gap: 4 }}>
            <Txt size={14} lh={20} muted>{order.receiver_name} · {order.receiver_phone}</Txt>
            <Txt size={14} lh={20} muted>{order.shipping_address}</Txt>
            <Txt size={14} lh={20} muted>Đặt ngày {formatDate(order.created_at)}</Txt>
            {order.payment_method ? (
              <Txt size={14} lh={20} muted>
                Thanh toán: {PAY_METHOD[order.payment_method] ?? order.payment_method}
                {order.payment_status ? ` · ${PAY_STATUS[order.payment_status] ?? order.payment_status}` : ""}
              </Txt>
            ) : null}
            {order.tracking_note ? (
              <View style={{ marginTop: 8, padding: 12, borderRadius: radius.lg, backgroundColor: "rgba(242,243,232,0.5)" }}>
                <Txt size={14} lh={20} muted>{order.tracking_note}</Txt>
              </View>
            ) : null}
          </View>
        </Card>

        <Card title="Sản phẩm" mt={16}>
          <View style={{ gap: 8 }}>
            {details.map((d, i) => (
              <View
                key={d.id}
                style={{
                  flexDirection: "row", justifyContent: "space-between", gap: 12, paddingBottom: 8,
                  borderBottomWidth: i === details.length - 1 ? 0 : 1, borderBottomColor: colors.border,
                }}
              >
                <Txt size={14} lh={20} style={{ flex: 1 }}>{d.product_name ?? `Lô hàng #${d.batch_id}`} × {d.quantity}</Txt>
                <Txt size={14} lh={20} weight="500">{formatCurrency(d.price * d.quantity)}</Txt>
              </View>
            ))}
          </View>
          <View
            style={{
              flexDirection: "row", justifyContent: "space-between", paddingTop: 12, marginTop: 12,
              borderTopWidth: 1, borderTopColor: colors.border,
            }}
          >
            <Txt size={18} lh={28} weight="700">Tổng cộng</Txt>
            <Txt size={18} lh={28} weight="700" color={colors.primary}>{formatCurrency(order.total_price)}</Txt>
          </View>
        </Card>

        {error ? <Txt size={14} lh={20} color={colors.destructive} style={{ marginTop: 16 }}>{error}</Txt> : null}

        <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          {order.status === "Shipping" || order.status === "Delivered" ? (
            <Pressable
              onPress={confirming ? undefined : confirmReceived}
              style={{
                flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary,
                paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl, opacity: confirming ? 0.5 : 1,
              }}
            >
              <Icon name="check-circle-2" size={16} color={colors.primaryFg} />
              <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>
                {confirming ? "Đang xác nhận..." : "Xác nhận đã nhận hàng"}
              </Txt>
            </Pressable>
          ) : null}

          {canCancel ? (
            <Pressable
              onPress={cancelling ? undefined : cancelOrder}
              style={{
                flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 2, borderColor: colors.destructive,
                paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl, opacity: cancelling ? 0.5 : 1,
              }}
            >
              <Icon name="x-circle" size={16} color={colors.destructive} />
              <Txt size={16} lh={24} weight="600" color={colors.destructive}>{cancelling ? "Đang hủy..." : "Hủy đơn hàng"}</Txt>
            </Pressable>
          ) : null}
        </View>

        {paidPending ? (
          <Txt size={12} lh={16} muted style={{ marginTop: 12 }}>
            Đơn này đã thanh toán online nên không thể tự hủy. Vui lòng liên hệ cửa hàng để được hoàn tiền.
          </Txt>
        ) : null}
      </Wrap>
    </Screen>
  );
}
