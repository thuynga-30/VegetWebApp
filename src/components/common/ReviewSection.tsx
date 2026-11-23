import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { Notice } from "@/components/ui/States";
import { useAuth } from "@/hooks/useAuth";
import { reviewService } from "@/services/reviewService";
import { productService } from "@/services/productService";
import { formatDate } from "@/lib/format";
import { errMessage } from "@/lib/errors";
import type { ReviewItem } from "@/types/product";

function StarRating({ value, onChange, size = 22, readOnly }: { value: number; onChange?: (v: number) => void; size?: number; readOnly?: boolean }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Pressable key={s} disabled={readOnly} onPress={() => onChange?.(s)} accessibilityLabel={`${s} sao`}>
          <Icon name="star" size={size} color={s <= value ? colors.amber400 : colors.mutedFg + "66"} fill={s <= value ? colors.amber400 : "none"} />
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
  const avg = useMemo(
    () => (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0),
    [reviews]
  );

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
    <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="message-square" size={20} color={colors.primary} />
        <Txt variant="h2">Đánh giá sản phẩm</Txt>
      </View>

      {!loading && reviews.length > 0 ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <StarRating value={Math.round(avg)} readOnly size={16} />
          <Txt bold>{avg.toFixed(1)}/5</Txt>
          <Txt muted>· {reviews.length} đánh giá</Txt>
        </View>
      ) : null}

      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 16, gap: 12, backgroundColor: colors.muted + "66" }}>
        {user ? (
          <>
            <Txt variant="small" bold>Đánh giá của bạn</Txt>
            <StarRating value={rating} onChange={setRating} />
            <Field value={comment} onChangeText={setComment} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..." multiline rows={3} />
            {error ? <Notice text={error} /> : null}
            {success ? <Notice text="Cảm ơn bạn đã đánh giá!" tone="success" /> : null}
            <Button title="Gửi đánh giá" onPress={submit} loading={submitting} />
          </>
        ) : (
          <Txt muted>
            <Link href="/auth/login" style={{ color: colors.primary, fontWeight: "700" }}>Đăng nhập</Link> để viết đánh giá cho sản phẩm này.
          </Txt>
        )}
      </View>

      {loading ? (
        <Txt muted>Đang tải đánh giá...</Txt>
      ) : sorted.length === 0 ? (
        <Txt muted>Chưa có đánh giá nào cho sản phẩm này.</Txt>
      ) : (
        <View style={{ gap: 18 }}>
          {sorted.map((r) => (
            <View key={r.id} style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
                <Txt bold primary>{(r.buyerName ?? "U").charAt(0).toUpperCase()}</Txt>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Txt variant="title">{r.buyerName ?? "Người dùng"}</Txt>
                  <Txt variant="small" muted>{formatDate(r.createdAt)}</Txt>
                </View>
                <StarRating value={r.rating} readOnly size={14} />
                {r.comment ? <Txt style={{ marginTop: 2 }}>{r.comment}</Txt> : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
