import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { colors, MAX_WIDTH, radius } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Grid } from "@/components/ui/Misc";
import { HeroGradient } from "@/components/ui/Gradient";
import { ProductGrid } from "@/components/common/ProductCard";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { productService } from "@/services/productService";
import { farmService } from "@/services/farmService";
import { categoryService } from "@/services/categoryService";
import { categoryColor, categoryEmoji } from "@/lib/format";

const HERO_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900";

const VALUES: { icon: IconName; title: string; d: string }[] = [
  { icon: "sprout", title: "Nhật ký canh tác chi tiết", d: "Mỗi lô hàng đều có timeline gieo trồng, chăm sóc, thu hoạch minh bạch." },
  { icon: "scan-line", title: "Mã QR theo lô hàng", d: "Quét QR trên bao bì để xác thực đúng nguồn gốc trước và sau khi nhận hàng." },
  { icon: "truck", title: "Điểm gom khu vực", d: "Logistics 2 lớp: điểm gom kiểm tra chất lượng lần 2 trước khi giao đi." },
];

/** `max-w-7xl mx-auto px-4` + padding dọc */
function Section({ py, children }: { py: number; children: React.ReactNode }) {
  return (
    <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16, paddingVertical: py }}>
      {children}
    </View>
  );
}

/** Ô danh mục: bg-card border rounded-2xl p-6 text-center, icon tròn + tên căn giữa */
function CategoryTile({ id, name }: { id: number; name: string }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/products?category=${id}`} asChild>
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{
          alignItems: "center", justifyContent: "center", gap: 12, padding: 24, backgroundColor: colors.card,
          borderWidth: 1, borderColor: hover ? colors.primary : colors.border, borderRadius: radius.xxl,
        }}
      >
        <View
          style={{
            width: 56, height: 56, borderRadius: 28, backgroundColor: categoryColor(name),
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Txt size={24} lh={32} center>{categoryEmoji(name)}</Txt>
        </View>
        <Txt size={16} lh={24} weight="500" center>{name}</Txt>
      </Pressable>
    </Link>
  );
}

function SectionTitle({ title, sub, right, isMd }: { title: string; sub: string; right?: React.ReactNode; isMd: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
      <View style={{ flex: 1 }}>
        <Txt size={isMd ? 30 : 24} lh={isMd ? 36 : 32} weight="700" style={{ letterSpacing: -0.3 }}>{title}</Txt>
        <Txt size={16} lh={24} muted>{sub}</Txt>
      </View>
      {right}
    </View>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { isMd } = useLayout();

  const products = useFetch(() => productService.getAll({ page: 1, limit: 8, sort: "newest" }), []);
  const farms = useFetch(() => farmService.getAll(), []);
  const categories = useFetch(() => categoryService.getAll(), []);

  const productList = products.data?.data ?? [];
  const totalProducts = products.data?.meta?.total ?? productList.length;

  const msg = (text: string, error?: boolean) => (
    <Txt size={16} lh={24} color={error ? colors.red500 : colors.mutedFg}>{text}</Txt>
  );

  return (
    <Screen padded={false} footer maxWidth={100000}>
      {/* ===== HERO ===== */}
      <HeroGradient opacity={0.95} glowAt={{ x: 0.2, y: 0.1, r: 0.45 }}>
        <View
          style={{
            width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16,
            paddingVertical: isMd ? 112 : 80, flexDirection: isMd ? "row" : "column", alignItems: "center", gap: 40,
          }}
        >
          <View style={{ flex: isMd ? 1 : undefined, alignSelf: "stretch" }}>
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", paddingHorizontal: 12,
                paddingVertical: 4, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.15)",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Icon name="sprout" size={14} color={colors.white} />
              <Txt size={12} lh={16} color={colors.white}>Từ nông trại đến bàn ăn</Txt>
            </View>

            <Txt
              size={isMd ? 48 : 36}
              lh={isMd ? 60 : 45}
              weight="700"
              color={colors.white}
              style={{ marginTop: 16, letterSpacing: isMd ? -0.5 : -0.36 }}
            >
              Nông sản sạch,{"\n"}truy xuất tận gốc
            </Txt>

            <Txt size={18} lh={28} color="rgba(255,255,255,0.9)" style={{ marginTop: 16, maxWidth: 512 }}>
              Mỗi lô hàng đều có nhật ký canh tác chi tiết và mã QR minh bạch — bạn biết chính xác rau quả đến từ đâu, được trồng thế nào.
            </Txt>

            <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              <Pressable
                onPress={() => router.push("/products")}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.white,
                  paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl,
                  shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6,
                }}
              >
                <Txt size={16} lh={24} weight="600" color={colors.primary}>Mua sắm ngay</Txt>
                <Icon name="arrow-right" size={16} color={colors.primary} />
              </Pressable>

              <Pressable
                onPress={() => router.push("/trace")}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.1)",
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", paddingHorizontal: 24, paddingVertical: 12,
                  borderRadius: radius.xl,
                }}
              >
                <Icon name="scan-line" size={16} color={colors.white} />
                <Txt size={16} lh={24} color={colors.white}>Truy xuất QR</Txt>
              </Pressable>
            </View>

            <View style={{ marginTop: 40, flexDirection: "row", flexWrap: "wrap", gap: 24 }}>
              {[
                { v: farms.data ? String(farms.data.length) : "…", l: "Nông trại" },
                { v: String(totalProducts), l: "Sản phẩm" },
                { v: "8,000+", l: "Khách hàng" },
              ].map((s) => (
                <View key={s.l}>
                  <Txt size={24} lh={32} weight="700" color={colors.white}>{s.v}</Txt>
                  <Txt size={14} lh={20} color="rgba(255,255,255,0.8)">{s.l}</Txt>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flex: isMd ? 1 : undefined, alignSelf: "stretch" }}>
            <View
              style={{
                borderRadius: radius.xxxl, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.25,
                shadowRadius: 25, shadowOffset: { width: 0, height: 25 }, elevation: 16,
              }}
            >
              <Img uri={HERO_IMAGE} style={{ width: "100%", aspectRatio: 4 / 5 }} fallback="Rau củ tươi" />
            </View>
          </View>
        </View>
      </HeroGradient>

      {/* ===== 3 GIÁ TRỊ ===== */}
      <Section py={64}>
        <Grid cols={isMd ? 3 : 1} gap={24}>
          {VALUES.map((v) => (
            <View
              key={v.title}
              style={{ padding: 24, borderRadius: radius.xxl, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
            >
              <View
                style={{
                  width: 48, height: 48, borderRadius: radius.xl, backgroundColor: "rgba(27,126,42,0.1)",
                  alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}
              >
                <Icon name={v.icon} size={24} color={colors.primary} />
              </View>
              <Txt size={18} lh={28} weight="600">{v.title}</Txt>
              <Txt size={14} lh={20} muted style={{ marginTop: 8 }}>{v.d}</Txt>
            </View>
          ))}
        </Grid>
      </Section>

      {/* ===== DANH MỤC ===== */}
      <Section py={32}>
        <SectionTitle title="Danh mục nông sản" sub="Chọn loại nông sản bạn cần" isMd={isMd} />
        {categories.loading
          ? msg("Đang tải danh mục...")
          : categories.error
            ? msg("Không thể tải danh mục.", true)
            : categories.data && categories.data.length > 0
              ? (
                <Grid cols={isMd ? 5 : 2} gap={16}>
                  {categories.data.map((c) => (
                    <CategoryTile key={c.id} id={c.id} name={c.name} />
                  ))}
                </Grid>
              )
              : msg("Chưa có danh mục.")}
      </Section>

      {/* ===== SẢN PHẨM NỔI BẬT ===== */}
      <Section py={48}>
        <SectionTitle
          title="Sản phẩm nổi bật"
          sub="Được xác minh nguồn gốc toàn diện"
          isMd={isMd}
          right={
            <Link href="/products" asChild>
              <Pressable><Txt size={14} lh={20} color={colors.primary}>Xem tất cả →</Txt></Pressable>
            </Link>
          }
        />
        {products.loading
          ? msg("Đang tải sản phẩm...")
          : products.error
            ? msg("Không thể tải danh sách sản phẩm.", true)
            : productList.length > 0
              ? <ProductGrid products={productList} columns={isMd ? 4 : 2} />
              : msg("Chưa có sản phẩm.")}
      </Section>

      {/* ===== NÔNG TRẠI ĐỐI TÁC ===== */}
      <Section py={48}>
        <SectionTitle title="Nông trại đối tác" sub="Những nông trại đã được xác minh" isMd={isMd} />
        {farms.loading
          ? msg("Đang tải nông trại...")
          : farms.error
            ? msg("Không thể tải danh sách nông trại.", true)
            : farms.data && farms.data.length > 0
              ? (
                <Grid cols={isMd ? 3 : 1} gap={20}>
                  {farms.data.map((farm) => (
                    <View
                      key={farm.id}
                      style={{ borderRadius: radius.xxl, overflow: "hidden", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
                    >
                      <Img uri={farm.coverImage} style={{ width: "100%", aspectRatio: 16 / 10 }} fallback="Chưa có ảnh nông trại" />
                      <View style={{ padding: 20 }}>
                        <Txt size={16} lh={24} weight="600">{farm.farmName}</Txt>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
                          <Icon name="map-pin" size={12} color={colors.mutedFg} />
                          <Txt size={12} lh={16} muted numberOfLines={1} style={{ flex: 1 }}>
                            {farm.address ?? "Chưa cập nhật địa chỉ"}
                          </Txt>
                        </View>
                        <Txt size={14} lh={20} muted numberOfLines={2} style={{ marginTop: 8 }}>
                          {farm.description ?? "Nông trại đối tác GreenFarmer"}
                        </Txt>
                      </View>
                    </View>
                  ))}
                </Grid>
              )
              : msg("Chưa có nông trại đối tác.")}
      </Section>

      {/* ===== CTA NÔNG DÂN ===== */}
      <Section py={64}>
        <HeroGradient style={{ borderRadius: radius.xxxl }}>
          <View
            style={{
              padding: isMd ? 56 : 40, flexDirection: isMd ? "row" : "column", alignItems: "center",
              justifyContent: "space-between", gap: 24,
            }}
          >
            <View style={{ flex: isMd ? 1 : undefined }}>
              <Txt size={isMd ? 30 : 24} lh={isMd ? 36 : 32} weight="700" color={colors.white}>Bạn là nông dân?</Txt>
              <Txt size={16} lh={24} color="rgba(255,255,255,0.9)" style={{ marginTop: 8 }}>
                Đăng ký bán hàng và xây dựng thương hiệu nông sản uy tín cùng GreenFarmer.
              </Txt>
            </View>
            <Pressable
              onPress={() => router.push("/auth/register")}
              style={{
                backgroundColor: colors.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl,
                shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6,
              }}
            >
              <Txt size={16} lh={24} weight="600" color={colors.primary}>Đăng ký ngay</Txt>
            </Pressable>
          </View>
        </HeroGradient>
      </Section>
    </Screen>
  );
}
