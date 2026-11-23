import { Platform, Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { useCart } from "@/hooks/useCart";
import { useLayout } from "@/hooks/useLayout";
import { formatCurrency } from "@/lib/format";
import { errMessage } from "@/lib/errors";
import { notify } from "@/lib/dialog";

const SHIPPING = 25000;
const MAX_W = 1152; // max-w-6xl

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ width: "100%", maxWidth: MAX_W, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 40 }}>
      {children}
    </View>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, loading } = useCart();
  const { isMd } = useLayout();

  // Bản web gốc không bắt lỗi ở đây; trên app lỗi không bắt sẽ hiện màn hình đỏ nên báo bằng hộp thoại
  const safe = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err) {
      notify("Không thể cập nhật giỏ hàng", errMessage(err));
    }
  };

  if (loading) {
    return (
      <Screen padded={false} footer>
        <Wrap>
          <Txt size={30} lh={36} weight="700">Giỏ hàng</Txt>
          <Txt size={16} lh={24} muted center style={{ marginTop: 40 }}>Đang tải giỏ hàng...</Txt>
        </Wrap>
      </Screen>
    );
  }

  const stepBtn = (label: string, disabled: boolean, onPress: () => void) => (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{ paddingHorizontal: 8, paddingVertical: 4, opacity: disabled ? 0.5 : 1 }}
      accessibilityRole="button"
    >
      <Txt size={16} lh={24}>{label}</Txt>
    </Pressable>
  );

  return (
    <Screen padded={false} footer>
      <Wrap>
        <Txt size={30} lh={36} weight="700">Giỏ hàng</Txt>

        {items.length === 0 ? (
          <View style={{ marginTop: 64, alignItems: "center" }}>
            <Icon name="shopping-bag" size={64} color={colors.mutedFg} strokeWidth={1.5} />
            <Txt size={16} lh={24} muted center style={{ marginTop: 16 }}>
              Giỏ hàng trống. Chọn nông sản yêu thích để bắt đầu!
            </Txt>
            <Link href="/products" asChild>
              <Pressable
                style={{ marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl }}
              >
                <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>Đi mua sắm</Txt>
              </Pressable>
            </Link>
          </View>
        ) : (
          <View style={{ marginTop: 24, flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 24 }}>
            {/* DANH SÁCH */}
            <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 12 }}>
              {items.map((item) => (
                <View
                  key={item.cart_id}
                  style={{
                    flexDirection: "row", gap: 16, padding: 16, backgroundColor: colors.card,
                    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl,
                  }}
                >
                  <Img uri={item.image} style={{ width: 96, height: 96, borderRadius: radius.xl }} fallback="Không có ảnh" />

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Txt size={16} lh={24} weight="600">{item.product_name}</Txt>
                    <Txt size={12} lh={16} muted style={{ marginTop: 4 }}>
                      {item.farm_name ?? "Nông trại đối tác"} · Lô {item.batch_code ?? "N/A"}
                    </Txt>
                    <Txt size={16} lh={24} weight="700" color={colors.primary} style={{ marginTop: 8 }}>
                      {formatCurrency(item.price)}
                    </Txt>
                    <Txt size={12} lh={16} muted style={{ marginTop: 4 }}>Còn {item.stock}kg</Txt>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <Pressable
                      onPress={() => safe(() => removeItem(item.cart_id))}
                      style={{ padding: 6, borderRadius: 4 }}
                      accessibilityLabel="Xóa khỏi giỏ hàng"
                    >
                      <Icon name="trash-2" size={16} color={colors.destructive} />
                    </Pressable>

                    <View
                      style={{
                        flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border,
                        borderRadius: radius.lg, overflow: "hidden",
                      }}
                    >
                      {stepBtn("-", item.quantity <= 1, () =>
                        safe(() => updateQuantity(item.cart_id, Math.max(1, item.quantity - 1)))
                      )}
                      <Txt size={14} lh={20} style={{ paddingHorizontal: 12 }}>{item.quantity}</Txt>
                      {stepBtn("+", item.quantity >= item.stock, () =>
                        safe(() => updateQuantity(item.cart_id, Math.min(item.stock, item.quantity + 1)))
                      )}
                    </View>

                    <Txt size={16} lh={24} weight="600">{formatCurrency(item.price * item.quantity)}</Txt>
                  </View>
                </View>
              ))}
            </View>

            {/* TỔNG ĐƠN HÀNG: sticky trên web */}
            <View
              style={[
                {
                  width: isMd ? 360 : "100%", padding: 20, backgroundColor: colors.card, borderWidth: 1,
                  borderColor: colors.border, borderRadius: radius.xxl,
                },
                Platform.OS === "web" && isMd ? ({ position: "sticky", top: 16 } as any) : null,
              ]}
            >
              <Txt size={16} lh={24} weight="600">Tổng đơn hàng</Txt>

              <View style={{ marginTop: 16, gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                  <Txt size={14} lh={20} muted>Tạm tính</Txt>
                  <Txt size={14} lh={20}>{formatCurrency(totalPrice)}</Txt>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                  <Txt size={14} lh={20} muted>Phí vận chuyển (dự kiến)</Txt>
                  <Txt size={14} lh={20}>{formatCurrency(SHIPPING)}</Txt>
                </View>
                <View
                  style={{
                    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8,
                    flexDirection: "row", justifyContent: "space-between", gap: 12,
                  }}
                >
                  <Txt size={18} lh={28} weight="700">Tổng cộng</Txt>
                  <Txt size={18} lh={28} weight="700" color={colors.primary}>{formatCurrency(totalPrice + SHIPPING)}</Txt>
                </View>
              </View>

              <Link href="/checkout" asChild>
                <Pressable
                  style={{ marginTop: 20, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: radius.xl, alignItems: "center" }}
                >
                  <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>Tiến hành đặt hàng</Txt>
                </Pressable>
              </Link>
              <Link href="/products" asChild>
                <Pressable style={{ marginTop: 8, alignItems: "center", paddingVertical: 2 }}>
                  <Txt size={14} lh={20} muted>Tiếp tục mua sắm</Txt>
                </Pressable>
              </Link>
            </View>
          </View>
        )}
      </Wrap>
    </Screen>
  );
}
