import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Grid } from "@/components/ui/Misc";
import { TrustBadge } from "@/components/ui/Badges";
import { formatCurrency } from "@/lib/format";
import type { ProductCard as ProductCardType } from "@/types/product";

/** bg-card rounded-2xl border overflow-hidden (hover: shadow-lg + nhấc lên 2px trên web) */
export function ProductCard({ product }: { product: ProductCardType }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/products/${product.id}`} asChild>
      <Pressable
        accessibilityRole="link"
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        // Link asChild chỉ gộp được style dạng object (không dùng mảng / hàm)
        style={{
          backgroundColor: colors.card, borderRadius: radius.xxl, borderWidth: 1,
          borderColor: colors.border, overflow: "hidden",
          ...(hover
            ? { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 15, shadowOffset: { width: 0, height: 10 }, transform: [{ translateY: -2 }] }
            : null),
        }}
      >
        <Img uri={product.image} style={{ width: "100%", aspectRatio: 4 / 3 }} />
        <View style={{ padding: 16, gap: 8 }}>
          {product.batchTrustLevel ? <TrustBadge level={product.batchTrustLevel} size="sm" /> : null}

          <Txt size={16} lh={24} weight="600" numberOfLines={1}>{product.name}</Txt>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon name="map-pin" size={12} color={colors.mutedFg} />
            <Txt size={12} lh={16} muted numberOfLines={1} style={{ flex: 1 }}>
              {product.farmName ?? "Chưa có thông tin nông trại"}
            </Txt>
          </View>

          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingTop: 4 }}>
            <Txt size={18} lh={28} weight="700" color={colors.primary}>{formatCurrency(Number(product.price))}</Txt>
            <Txt size={10} lh={14} muted>Còn {product.remainingQuantity ?? 0}kg</Txt>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

/** grid grid-cols-2 md:grid-cols-4 gap-5 */
export function ProductGrid({ products, columns }: { products: ProductCardType[]; columns: number }) {
  return (
    <Grid cols={columns} gap={20}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </Grid>
  );
}
