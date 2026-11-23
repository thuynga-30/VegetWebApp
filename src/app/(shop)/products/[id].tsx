import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { colors, radius } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Grid } from "@/components/ui/Misc";
import { TrustBadge } from "@/components/ui/Badges";
import { ReviewSection } from "@/components/common/ReviewSection";
import { useFetch } from "@/hooks/useFetch";
import { useCart } from "@/hooks/useCart";
import { useLayout } from "@/hooks/useLayout";
import { productService } from "@/services/productService";
import { formatCurrency, formatDate } from "@/lib/format";
import { errMessage } from "@/lib/errors";

const MAX_W = 1152; // max-w-6xl

function Wrap({ children, py }: { children: React.ReactNode; py: number }) {
  return (
    <View style={{ width: "100%", maxWidth: MAX_W, alignSelf: "center", paddingHorizontal: 16, paddingVertical: py }}>
      {children}
    </View>
  );
}

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const { isMd } = useLayout();
  const { addItem } = useCart();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  const { data: product, loading } = useFetch(() => productService.getById(productId), [productId]);

  if (loading) {
    return (
      <Screen padded={false} footer>
        <Wrap py={64}><Txt size={16} lh={24} muted>Đang tải...</Txt></Wrap>
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen padded={false} footer>
        <Wrap py={64}><Txt size={16} lh={24} muted>Không tìm thấy sản phẩm.</Txt></Wrap>
      </Screen>
    );
  }

  const batch = product.currentBatch;
  const remaining = batch?.quantity ?? 0;

  const handleAddToCart = async () => {
    if (!batch) {
      setCartError("Sản phẩm hiện không có lô hàng đang bán.");
      return;
    }
    if (remaining <= 0) {
      setCartError("Sản phẩm đã hết hàng.");
      return;
    }
    if (qty > remaining) {
      setCartError(`Chỉ còn ${remaining}kg trong lô hàng.`);
      return;
    }

    setAdding(true);
    setCartMessage("");
    setCartError("");
    try {
      await addItem(batch.id, qty);
      setCartMessage(`Đã thêm ${qty}kg ${product.name} vào giỏ hàng.`);
      setQty(1);
    } catch (error) {
      console.warn("Add to cart error:", error);
      setCartError(errMessage(error, "Không thể thêm sản phẩm vào giỏ hàng."));
    } finally {
      setAdding(false);
    }
  };

  const stepBtn = (label: string, onPress: () => void) => (
    <Pressable onPress={adding ? undefined : onPress} style={{ paddingHorizontal: 12, paddingVertical: 8, opacity: adding ? 0.5 : 1 }}>
      <Txt size={16} lh={24}>{label}</Txt>
    </Pressable>
  );

  const dateTile = (label: string, date: string) => (
    <View
      style={{
        flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: radius.lg,
        backgroundColor: "rgba(242,243,232,0.5)",
      }}
    >
      <Icon name="calendar" size={16} color={colors.mutedFg} />
      <Txt size={14} lh={20} style={{ flex: 1 }}>
        {label}: <Txt size={14} lh={20} weight="700">{formatDate(date)}</Txt>
      </Txt>
    </View>
  );

  return (
    <Screen padded={false} footer>
      <Wrap py={40}>
        <View style={{ flexDirection: isMd ? "row" : "column", gap: 40 }}>
          {/* ẢNH: rounded-2xl overflow-hidden border bg-muted aspect-square */}
          <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%" }}>
            <View
              style={{
                borderRadius: radius.xxl, overflow: "hidden", borderWidth: 1, borderColor: colors.border,
                backgroundColor: colors.muted,
              }}
            >
              <Img uri={product.image} style={{ width: "100%", aspectRatio: 1 }} fallback="Không có hình ảnh" />
            </View>
          </View>

          {/* THÔNG TIN */}
          <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%" }}>
            {batch?.trustLevel ? <TrustBadge level={batch.trustLevel} /> : null}

            <Txt size={30} lh={36} weight="700" style={{ marginTop: 12 }}>{product.name}</Txt>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, marginTop: 8 }}>
              <View style={{ marginTop: 2 }}>
                <Icon name="map-pin" size={16} color={colors.mutedFg} />
              </View>
              <Txt size={14} lh={20} muted style={{ flex: 1 }}>
                {product.farm ? (
                  <>
                    <Txt size={14} lh={20} weight="500" color={colors.foreground}>{product.farm.farmName}</Txt>
                    {product.farm.address ? ` · ${product.farm.address}` : ""}
                  </>
                ) : (
                  "Chưa có thông tin nông trại"
                )}
              </Txt>
            </View>

            <Txt size={30} lh={36} weight="700" color={colors.primary} style={{ marginTop: 16 }}>
              {formatCurrency(product.price)}
            </Txt>

            <Txt size={14} lh={20} muted style={{ marginTop: 4 }}>
              {batch ? `Còn ${remaining}kg trong lô ${batch.batchCode}` : "Hiện không có lô hàng đang bán."}
            </Txt>

            {/* SỐ LƯỢNG + THÊM VÀO GIỎ */}
            {batch && remaining > 0 ? (
              <View style={{ marginTop: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border,
                      borderRadius: radius.lg, overflow: "hidden",
                    }}
                  >
                    {stepBtn("−", () => setQty((q) => Math.max(1, q - 1)))}
                    <Txt size={16} lh={24} center style={{ paddingHorizontal: 16, minWidth: 50 }}>{qty}</Txt>
                    {stepBtn("+", () => setQty((q) => Math.min(remaining, q + 1)))}
                  </View>

                  <Pressable
                    onPress={adding ? undefined : handleAddToCart}
                    style={{
                      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                      backgroundColor: colors.primary, paddingVertical: 12, borderRadius: radius.xl, opacity: adding ? 0.5 : 1,
                    }}
                  >
                    {adding ? <ActivityIndicator size="small" color={colors.primaryFg} /> : <Icon name="shopping-cart" size={16} color={colors.primaryFg} />}
                    <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>{adding ? "Đang thêm..." : "Thêm vào giỏ"}</Txt>
                  </Pressable>
                </View>

                {cartMessage ? <Txt size={14} lh={20} color="#16a34a" style={{ marginTop: 12 }}>{cartMessage}</Txt> : null}
                {cartError ? <Txt size={14} lh={20} color={colors.destructive} style={{ marginTop: 12 }}>{cartError}</Txt> : null}
              </View>
            ) : null}

            {batch && remaining <= 0 ? (
              <View style={{ marginTop: 24, paddingVertical: 12, borderRadius: radius.xl, backgroundColor: colors.muted, alignItems: "center" }}>
                <Txt size={16} lh={24} weight="600" muted>Hết hàng</Txt>
              </View>
            ) : null}

            {/* LINK TRUY XUẤT */}
            {batch ? (
              <Link href={`/trace?code=${encodeURIComponent(batch.batchCode)}`} asChild>
                <Pressable style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" }}>
                  <Icon name="scan-line" size={16} color={colors.primary} />
                  <Txt size={14} lh={20} color={colors.primary}>Xem nguồn gốc lô hàng {batch.batchCode}</Txt>
                </Pressable>
              </Link>
            ) : null}

            {/* NGÀY GIEO TRỒNG / THU HOẠCH */}
            {batch ? (
              <View style={{ marginTop: 24 }}>
                <Grid cols={2} gap={12}>
                  {dateTile("Gieo trồng", batch.plantingDate)}
                  {dateTile("Thu hoạch", batch.harvestDate)}
                </Grid>
              </View>
            ) : null}
          </View>
        </View>

        <ReviewSection productId={product.id} />
      </Wrap>
    </Screen>
  );
}
