import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, MAX_WIDTH, radius } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Misc";
import { ProductGrid } from "@/components/common/ProductCard";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { categoryColor, categoryEmoji } from "@/lib/format";
import type { TrustLevel } from "@/types/batch";

const TRUST_LEVELS: { value: TrustLevel; label: string }[] = [
  { value: "High", label: "Cấp 3 — Chứng nhận & Xác minh toàn diện" },
  { value: "Medium", label: "Cấp 2 — Nhật ký canh tác đầy đủ" },
  { value: "Low", label: "Cấp 1 — Đã xác minh cơ bản" },
];

type SortOption = "newest" | "price_asc" | "price_desc";
const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
];

const LIMIT = 12;

/** bg-card border rounded-2xl p-4 */
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16 }}>
      <Txt size={14} lh={20} weight="600" style={{ marginBottom: 12 }}>{title}</Txt>
      {children}
    </View>
  );
}

/** Nút danh mục trong sidebar: px-3 py-2 rounded-lg text-sm, đang chọn: bg-primary/10 text-primary font-medium */
function CategoryButton({ active, onPress, emoji, bg, label }: {
  active: boolean; onPress: () => void; emoji?: string; bg?: string; label: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.lg,
        backgroundColor: active ? "rgba(27,126,42,0.1)" : hover ? "rgba(242,243,232,0.6)" : "transparent",
      }}
    >
      {emoji ? (
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
          <Txt size={12} lh={16}>{emoji}</Txt>
        </View>
      ) : null}
      <Txt size={14} lh={20} weight={active ? "500" : "400"} color={active ? colors.primary : colors.foreground} style={{ flex: 1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

function PageButton({ label, onPress, disabled, active }: { label: string; onPress: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg,
        backgroundColor: active ? colors.primary : "transparent", opacity: disabled ? 0.4 : 1,
      }}
    >
      <Txt size={14} lh={20} color={active ? colors.primaryFg : colors.foreground}>{label}</Txt>
    </Pressable>
  );
}

export default function ProductListPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const { isMd } = useLayout();
  const { width } = useWindowDimensions();
  const isSm = width >= 640;
  const isLg = width >= 1024;

  const category = typeof params.category === "string" ? params.category : "";
  const [input, setInput] = useState(typeof params.search === "string" ? params.search : "");
  const [keyword, setKeyword] = useState(input.trim());
  const [trustLevels, setTrustLevels] = useState<TrustLevel[]>(["High", "Medium", "Low"]);
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  // Debounce ô tìm kiếm để không gọi API mỗi lần gõ phím
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      setKeyword(input.trim());
      router.setParams({ search: input.trim() || undefined } as any);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Đổi bộ lọc thì quay về trang 1
  useEffect(() => setPage(1), [keyword, category, trustLevels, sort]);

  const { data: categories, loading: categoryLoading } = useFetch(() => categoryService.getAll(), []);

  const { data: productResponse, loading: productLoading, error: productError } = useFetch(
    () =>
      productService.getAll({
        search: keyword || undefined,
        categoryId: category ? Number(category) : undefined,
        batchTrustLevel: trustLevels.length === 1 ? trustLevels[0] : undefined,
        sort,
        page,
        limit: LIMIT,
      }),
    [keyword, category, trustLevels, sort, page]
  );

  const setCategory = (id: string) => router.setParams({ category: id || undefined } as any);
  const toggleTrustLevel = (level: TrustLevel) =>
    setTrustLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));

  const products = productResponse?.data ?? [];
  const totalPages = productResponse?.meta.totalPages ?? 1;

  const sidebar = (
    <View style={{ gap: 16, width: isMd ? 240 : "100%" }}>
      <Panel title="Danh mục">
        {categoryLoading ? (
          <Txt size={14} lh={20} muted>Đang tải danh mục...</Txt>
        ) : (
          <View style={{ gap: 4 }}>
            <CategoryButton active={category === ""} onPress={() => setCategory("")} label="Tất cả" />
            {categories?.map((c) => (
              <CategoryButton
                key={c.id}
                active={category === String(c.id)}
                onPress={() => setCategory(String(c.id))}
                emoji={categoryEmoji(c.name)}
                bg={categoryColor(c.name)}
                label={c.name}
              />
            ))}
          </View>
        )}
      </Panel>

      <Panel title="Cấp độ tin cậy">
        <View style={{ gap: 8 }}>
          {TRUST_LEVELS.map((t) => (
            <Checkbox
              key={t.value}
              top
              checked={trustLevels.includes(t.value)}
              onChange={() => toggleTrustLevel(t.value)}
              label={<Txt size={14} lh={20}>{t.label}</Txt>}
            />
          ))}
        </View>
      </Panel>
    </View>
  );

  return (
    <Screen padded={false} footer>
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 40 }}>
        <Txt size={30} lh={36} weight="700">Sản phẩm</Txt>
        <Txt size={16} lh={24} muted style={{ marginTop: 4 }}>
          Nông sản đã được xác minh nguồn gốc từ các trang trại đối tác.
        </Txt>

        <View style={{ marginTop: 24, flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 24 }}>
          {sidebar}

          <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0 }}>
            {/* SEARCH + SORT */}
            <View style={{ flexDirection: isSm ? "row" : "column", gap: 12 }}>
              <View style={{ flex: isSm ? 1 : undefined, justifyContent: "center" }}>
                <View style={{ position: "absolute", left: 12, zIndex: 1 }} pointerEvents="none">
                  <Icon name="search" size={16} color={colors.mutedFg} />
                </View>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Tìm rau, quả, gạo..."
                  placeholderTextColor={colors.mutedFg + "99"}
                  returnKeyType="search"
                  style={{
                    minHeight: 42, paddingLeft: 36, paddingRight: 12, paddingVertical: 10, borderRadius: radius.xl,
                    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
                    fontSize: 14, fontFamily: "BeVietnamPro_400Regular", color: colors.foreground,
                  }}
                />
              </View>
              <Select compact minWidth={170} value={sort} onChange={(v) => setSort(v as SortOption)} options={SORT_OPTIONS} />
            </View>

            {productError ? (
              <View style={{ marginTop: 24, padding: 16, borderRadius: radius.xl, backgroundColor: "#fef2f2" }}>
                <Txt size={14} lh={20} color="#dc2626">Không thể tải danh sách sản phẩm.</Txt>
                <Txt size={14} lh={20} color="#dc2626">{productError}</Txt>
              </View>
            ) : null}

            {productLoading ? (
              <View style={{ paddingVertical: 64, alignItems: "center" }}>
                <Txt muted>Đang tải sản phẩm...</Txt>
              </View>
            ) : products.length > 0 ? (
              <View style={{ marginTop: 24 }}>
                <ProductGrid products={products} columns={isLg ? 3 : 2} />
              </View>
            ) : (
              <View style={{ paddingVertical: 64, alignItems: "center" }}>
                <Txt muted center>Không tìm thấy sản phẩm phù hợp.</Txt>
              </View>
            )}

            {!productLoading && productResponse?.meta ? (
              <View style={{ marginTop: 24, alignItems: "center", gap: 12 }}>
                <Txt size={14} lh={20} muted>
                  Hiển thị {products.length} / {productResponse.meta.total} sản phẩm
                </Txt>
                {totalPages > 1 ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                    <PageButton label="Trước" disabled={page <= 1} onPress={() => setPage((p) => p - 1)} />
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <PageButton key={p} label={String(p)} active={page === p} onPress={() => setPage(p)} />
                    ))}
                    <PageButton label="Sau" disabled={page >= totalPages} onPress={() => setPage((p) => p + 1)} />
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Screen>
  );
}
