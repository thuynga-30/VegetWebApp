import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { Link, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { colors, radius } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Field } from "@/components/ui/Input";
import { Grid, Radio } from "@/components/ui/Misc";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useLayout } from "@/hooks/useLayout";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { formatCurrency } from "@/lib/format";
import { errMessage } from "@/lib/errors";

const MAX_W = 1152; // max-w-6xl

/** bg-card border rounded-2xl p-6 */
function Card({ title, icon, children }: { title: string; icon?: "truck" | "wallet"; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
        {icon ? <Icon name={icon} size={16} color={colors.primary} /> : null}
        <Txt size={16} lh={24} weight="600">{title}</Txt>
      </View>
      {children}
    </View>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { isMd } = useLayout();

  const [pay, setPay] = useState<"COD" | "VNPay">("COD");
  const [form, setForm] = useState({
    receiver_name: user?.full_name ?? "",
    receiver_phone: user?.phone ?? "",
    shipping_address: user?.address ?? "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Phiên đăng nhập được nạp bất đồng bộ -> điền sẵn thông tin khi user sẵn sàng (không ghi đè nếu đã gõ)
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      receiver_name: f.receiver_name || user.full_name || "",
      receiver_phone: f.receiver_phone || user.phone || "",
      shipping_address: f.shipping_address || user.address || "",
    }));
  }, [user]);

  const setField = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  /** Mở cổng VNPay: web chuyển hẳn trang; app mở trình duyệt trong ứng dụng rồi quay về chi tiết đơn */
  const openVnpay = async (paymentUrl: string, orderId: number) => {
    if (Platform.OS === "web") {
      window.location.href = paymentUrl; // chuyển hẳn sang trang VNPay
      return;
    }
    const redirectUrl = Linking.createURL("/payment/vnpay/return");
    const result = await WebBrowser.openAuthSessionAsync(paymentUrl, redirectUrl);
    if (result.type === "success" && result.url) {
      // Backend đã redirect về deep link của app kèm tham số VNPay -> đi tới trang kết quả
      const query = result.url.includes("?") ? result.url.slice(result.url.indexOf("?")) : "";
      router.replace(`/payment/vnpay/return${query}` as any);
    } else {
      // Người dùng đóng trình duyệt: xem trạng thái thanh toán ở chi tiết đơn
      router.replace(`/orders/${orderId}` as any);
    }
  };

  const submit = async () => {
    if (items.length === 0) {
      setError("Giỏ hàng đang trống.");
      return;
    }
    if (!form.receiver_name.trim() || !form.receiver_phone.trim() || !form.shipping_address.trim()) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const payload = {
        cartItemIds: items.map((item) => item.cart_id),
        receiverName: form.receiver_name,
        receiverPhone: form.receiver_phone,
        shippingAddress: form.shipping_address,
        paymentMethod: pay,
      };
      const response = await orderService.checkout(payload);
      clearCart();

      if (pay === "VNPay") {
        const { paymentUrl } = await paymentService.createVnpayUrl(response.orderId);
        await openVnpay(paymentUrl, response.orderId);
        return;
      }

      setSuccess(`Đặt hàng thành công! Mã đơn hàng: #${response.orderId}`);
      setTimeout(() => router.replace("/orders"), 800);
    } catch (err) {
      console.warn("Checkout error:", err);
      setError(errMessage(err, "Đặt hàng thất bại, vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const disabled = items.length === 0 || loading;

  return (
    <Screen padded={false} footer>
      <View style={{ width: "100%", maxWidth: MAX_W, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 40 }}>
        <Txt size={30} lh={36} weight="700">Thanh toán</Txt>

        <View style={{ marginTop: 24, flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 24 }}>
          {/* CỘT TRÁI */}
          <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 20 }}>
            <Card title="Thông tin nhận hàng">
              {error ? <Txt size={14} lh={20} color={colors.destructive} style={{ marginBottom: 12 }}>{error}</Txt> : null}
              {success ? <Txt size={14} lh={20} color="#16a34a" style={{ marginBottom: 12 }}>{success}</Txt> : null}

              <Grid cols={isMd ? 2 : 1} gap={12}>
                <Field label="Họ tên" value={form.receiver_name} onChangeText={setField("receiver_name")} />
                <Field label="Số điện thoại" value={form.receiver_phone} onChangeText={setField("receiver_phone")} keyboardType="phone-pad" />
              </Grid>
              <View style={{ marginTop: 12 }}>
                <Field label="Địa chỉ" value={form.shipping_address} onChangeText={setField("shipping_address")} />
              </View>
              <View style={{ marginTop: 12 }}>
                <Field
                  label="Ghi chú"
                  value={form.note}
                  onChangeText={setField("note")}
                  placeholder="Ghi chú cho người bán / shipper..."
                  multiline
                  rows={2}
                />
              </View>
            </Card>

            <Card title="Phương thức giao hàng" icon="truck">
              <View
                style={{
                  padding: 16, borderRadius: radius.xl, borderWidth: 2, borderColor: "rgba(27,126,42,0.4)",
                  backgroundColor: "rgba(27,126,42,0.05)",
                }}
              >
                <Txt size={14} lh={20}>
                  <Txt size={14} lh={20} weight="700">Giao qua điểm gom khu vực</Txt>
                  {" — Đơn được gom tại hub khu vực gần bạn, kiểm tra chất lượng lần 2 trước khi bàn giao đối tác vận chuyển. Dự kiến 24-48h."}
                </Txt>
              </View>
            </Card>

            <Card title="Phương thức thanh toán" icon="wallet">
              <View style={{ gap: 8 }}>
                <Radio selected={pay === "COD"} onSelect={() => setPay("COD")} label="Thanh toán khi nhận hàng (COD)" />
                <Radio selected={pay === "VNPay"} onSelect={() => setPay("VNPay")} label="VNPay (ATM / Thẻ quốc tế / QR)" />
                <Radio selected={false} disabled onSelect={() => {}} label="Chuyển khoản ngân hàng" />
                <Radio selected={false} disabled onSelect={() => {}} label="Ví MoMo" />
              </View>
            </Card>
          </View>

          {/* CỘT PHẢI: tóm tắt đơn (sticky trên web) */}
          <View
            style={[
              {
                width: isMd ? 380 : "100%", padding: 20, backgroundColor: colors.card, borderWidth: 1,
                borderColor: colors.border, borderRadius: radius.xxl,
              },
              Platform.OS === "web" && isMd ? ({ position: "sticky", top: 16 } as any) : null,
            ]}
          >
            <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Đơn của bạn ({items.length} sản phẩm)</Txt>

            <ScrollView style={{ maxHeight: 256 }} nestedScrollEnabled>
              <View style={{ gap: 8 }}>
                {items.map((i) => (
                  <View key={i.cart_id} style={{ flexDirection: "row", gap: 12 }}>
                    <Img uri={i.image} style={{ width: 48, height: 48, borderRadius: radius.lg }} fallback="No image" />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Txt size={14} lh={20} numberOfLines={1}>{i.product_name}</Txt>
                      <Txt size={12} lh={16} muted>SL: {i.quantity} · {formatCurrency(i.price)}</Txt>
                    </View>
                    <Txt size={14} lh={20} weight="600">{formatCurrency(i.price * i.quantity)}</Txt>
                  </View>
                ))}
                {items.length === 0 ? (
                  <Link href="/products" asChild>
                    <Pressable><Txt size={14} lh={20} color={colors.primary}>Giỏ hàng trống — mua sắm</Txt></Pressable>
                  </Link>
                ) : null}
              </View>
            </ScrollView>

            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 16, paddingTop: 16, gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Txt size={14} lh={20} muted>Tạm tính</Txt>
                <Txt size={14} lh={20}>{formatCurrency(totalPrice)}</Txt>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Txt size={14} lh={20} muted>Vận chuyển</Txt>
              </View>
              <View
                style={{
                  flexDirection: "row", justifyContent: "space-between", paddingTop: 8,
                  borderTopWidth: 1, borderTopColor: colors.border,
                }}
              >
                <Txt size={18} lh={28} weight="700">Tổng cộng</Txt>
                <Txt size={18} lh={28} weight="700" color={colors.primary}>{formatCurrency(totalPrice)}</Txt>
              </View>
            </View>

            <Pressable
              onPress={disabled ? undefined : submit}
              style={{
                marginTop: 20, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: radius.xl,
                alignItems: "center", opacity: disabled ? 0.5 : 1,
              }}
            >
              <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>
                {loading ? "Đang xử lý..." : pay === "VNPay" ? "Thanh toán qua VNPay" : "Đặt hàng"}
              </Txt>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}
