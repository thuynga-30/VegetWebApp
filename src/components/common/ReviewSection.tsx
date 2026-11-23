import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { reviewService } from "@/services/reviewService";
import { productService } from "@/services/productService";
import { formatDate } from "@/lib/format";
import { errMessage } from "@/lib/errors";
import type { ReviewItem } from "@/types/product";

function StarRating({ value, onChange, size = 20, readOnly }: { value: number; onChange?: (v: number) => void; size?: number; readOnly?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Pressable
          key={s}
          disabled={readOnly}
          onPress={() => onChange?.(s)}
          onHoverIn={() => !readOnly && setHover(s)}
          onHoverOut={() => !readOnly && setHover(null)}
          accessibilityLabel={`${s} sao`}
        >
          <Icon
            name="star"
            size={size}
            color={s <= display ? colors.amber400 : "rgba(92,103,93,0.4)"}
            fill={s <= display ? colors.amber400 : "none"}
          />
        </Pressable>
      ))}
    </View>
  );
}

export function ReviewSection({ productId }: { productId: number }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(productId);
      setReviews(response.reviews?.items ?? []);
    } catch (err) {
      console.warn("Không thể tải đánh giá:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews]
  );
  const avg = useMemo(() => (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0), [reviews]);

  const submit = async () => {
    setError(null);
    setSuccess(false);
    if (rating < 1) {
      setError("Vui lòng chọn số sao đánh giá.");
      return;
    }
    try {
      setSubmitting(true);
      await reviewService.create(productId, { rating, comment: comment.trim() || undefined });
      setRating(0);
      setComment("");
      setSuccess(true);
      await loadReviews();
    } catch (err) {
      setError(errMessage(err, "Có lỗi xảy ra, vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ marginTop: 56, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 40 }}>
      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Icon name="message-square" size={20} color={colors.primary} />
        <Txt size={20} lh={28} weight="700">Đánh giá sản phẩm</Txt>
      </View>

      {/* TỔNG QUAN */}
      {!loading && reviews.length > 0 ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <StarRating value={Math.round(avg)} readOnly size={16} />
          <Txt size={14} lh={20} weight="600">{avg.toFixed(1)}/5</Txt>
          <Txt size={14} lh={20} muted>· {reviews.length} đánh giá</Txt>
        </View>
      ) : (
        <View style={{ height: 12 }} />
      )}

      {/* FORM: rounded-2xl border bg-muted/30 p-5 mb-8 */}
      <View
        style={{
          borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border,
          backgroundColor: "rgba(242,243,232,0.3)", padding: 20, marginBottom: 32,
        }}
      >
        {user ? (
          <View style={{ gap: 12 }}>
            <View>
              <Txt size={14} lh={20} weight="500" style={{ marginBottom: 6 }}>Đánh giá của bạn</Txt>
              <StarRating value={rating} onChange={setRating} />
            </View>

            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
              placeholderTextColor={colors.mutedFg + "99"}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{
                minHeight: 78, borderWidth: 1, borderColor: colors.input, borderRadius: radius.md,
                backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 8,
                fontSize: 14, lineHeight: 20, fontFamily: "BeVietnamPro_400Regular", color: colors.foreground,
              }}
            />

            {error ? <Txt size={14} lh={20} color={colors.destructive}>{error}</Txt> : null}
            {success ? <Txt size={14} lh={20} color={colors.primary}>Cảm ơn bạn đã đánh giá!</Txt> : null}

            <Pressable
              onPress={submitting ? undefined : submit}
              style={{
                alignSelf: "flex-start", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                height: 36, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary,
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? <ActivityIndicator size="small" color={colors.primaryFg} /> : null}
              <Txt size={14} lh={20} weight="500" color={colors.primaryFg}>Gửi đánh giá</Txt>
            </Pressable>
          </View>
        ) : (
          <Txt size={14} lh={20} muted>
            <Link href="/auth/login" style={{ color: colors.primary, fontFamily: "BeVietnamPro_500Medium" }}>Đăng nhập</Link>{" "}
            để viết đánh giá cho sản phẩm này.
          </Txt>
        )}
      </View>

      {/* DANH SÁCH */}
      {loading ? (
        <Txt size={14} lh={20} muted>Đang tải đánh giá...</Txt>
      ) : sorted.length === 0 ? (
        <Txt size={14} lh={20} muted>Chưa có đánh giá nào cho sản phẩm này.</Txt>
      ) : (
        <View style={{ gap: 24 }}>
          {sorted.map((r) => (
            <View key={r.id} style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
                <Txt size={14} lh={20}>{(r.buyerName ?? "U").charAt(0).toUpperCase()}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Txt size={14} lh={20} weight="500">{r.buyerName ?? "Người dùng"}</Txt>
                  <Txt size={12} lh={16} muted>{formatDate(r.createdAt)}</Txt>
                </View>
                <StarRating value={r.rating} readOnly size={14} />
                {r.comment ? (
                  <Txt size={14} lh={20} color="rgba(11,32,16,0.9)" style={{ marginTop: 6 }}>{r.comment}</Txt>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
