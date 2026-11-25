import { useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Img, Lightbox } from "@/components/ui/Img";
import { Field } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox, Grid } from "@/components/ui/Misc";
import { TrustBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { QRCode } from "@/components/common/QRCode";
import CultivationLogTimeline from "@/components/common/CultivationLogTimeline";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { approvalService } from "@/services/approvalService";
import { buildTraceUrl } from "@/lib/trace";
import { errMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import type { TrustLevel } from "@/types/batch";

const TRUST_OPTIONS = [
  { value: "Low", label: "Cấp 1 — Đã xác minh cơ bản" },
  { value: "Medium", label: "Cấp 2 — Nhật ký canh tác đầy đủ" },
  { value: "High", label: "Cấp 3 — Chứng nhận & Xác minh toàn diện" },
];

const CHECKLIST = [
  "Ảnh minh chứng khớp loại nông sản",
  "Đủ mốc thời gian: gieo trồng → chăm sóc → thu hoạch",
  "Giá bán hợp lý so với thị trường",
];

/** p-2 rounded-lg bg-muted/40 */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ padding: 8, borderRadius: radius.lg, backgroundColor: "rgba(242,243,232,0.4)" }}>
      <Txt size={12} lh={16} muted>{label}</Txt>
      <Txt size={14} lh={20} weight="500">{value}</Txt>
    </View>
  );
}

/** bg-card border rounded-2xl p-5 */
function Card({ children, center, gap }: { children: React.ReactNode; center?: boolean; gap?: number }) {
  return (
    <View
      style={{
        backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 20,
        alignItems: center ? "center" : undefined, gap,
      }}
    >
      {children}
    </View>
  );
}

function Thumb({ url, index, onPress }: { url: string; index: number; onPress: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable onPress={onPress} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} style={{ opacity: hover ? 0.8 : 1 }} accessibilityLabel={`Ảnh minh chứng ${index + 1}`}>
      <Img uri={url} style={{ width: "100%", aspectRatio: 1, borderRadius: radius.lg }} />
    </Pressable>
  );
}

export default function ApprovalDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isMd } = useLayout();
  const { width } = useWindowDimensions();
  const narrow = width < 520;

  const { data: batch, loading, refetch } = useFetch(() => approvalService.getById(Number(id)), [id]);
  const [note, setNote] = useState("");
  const [trust, setTrust] = useState<TrustLevel>("Low");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [checks, setChecks] = useState([false, false, false]);

  if (loading) {
    return (
      <PanelPage>
        <Txt size={16} lh={24} muted>Đang tải...</Txt>
      </PanelPage>
    );
  }
  if (!batch) {
    return (
      <PanelPage>
        <Txt size={16} lh={24} muted>Không tìm thấy lô hàng.</Txt>
      </PanelPage>
    );
  }

  const reject = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await approvalService.reject(batch.id, note || "Hồ sơ chưa đạt yêu cầu");
      router.replace("/admin/approvals");
    } catch (err) {
      setErrorMsg(errMessage(err, "Có lỗi xảy ra khi từ chối lô hàng."));
    } finally {
      setSubmitting(false);
    }
  };

  const approve = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await approvalService.approve(batch.id, trust, note);
      refetch(); // tải lại để lấy lô mới nhất (đã có barcode) thay vì điều hướng đi
    } catch (err) {
      setErrorMsg(errMessage(err, "Có lỗi xảy ra khi duyệt lô hàng."));
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    if (!batch.barcode) return;
    await Clipboard.setStringAsync(batch.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isApproved = batch.approval_status === "Approved" && !!batch.barcode;
  const images: string[] = batch.images ?? [];

  return (
    <PanelPage>
      <View style={{ flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 24 }}>
        {/* ===== Cột trái (2/3) ===== */}
        <View style={{ flex: isMd ? 2 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 20 }}>
          <Card>
            <View style={{ flexDirection: narrow ? "column" : "row", alignItems: "flex-start", gap: 16 }}>
              {batch.image ? (
                <Img uri={batch.image} style={{ width: 96, height: 96, borderRadius: radius.xl }} />
              ) : (
                <View style={{ width: 96, height: 96, borderRadius: radius.xl, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
                  <Txt size={12} lh={16} muted>Chưa có ảnh</Txt>
                </View>
              )}
              <View style={{ flex: narrow ? undefined : 1, width: narrow ? "100%" : undefined, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <Txt size={20} lh={28} weight="700">{batch.product_name}</Txt>
                  <TrustBadge level={batch.trust_level} size="sm" />
                </View>
                <Txt size={12} lh={16} mono muted style={{ marginTop: 4 }}>{batch.barcode ?? "Chưa duyệt"}</Txt>
                <Txt size={14} lh={20} muted style={{ marginTop: 4 }}>{batch.farm_name}</Txt>
                <View style={{ marginTop: 12 }}>
                  <Grid cols={3} gap={12}>
                    <Info label="Gieo" value={formatDate(batch.planting_date)} />
                    <Info label="Thu hoạch" value={formatDate(batch.harvest_date)} />
                    <Info label="Số lượng" value={`${batch.quantity}kg`} />
                  </Grid>
                </View>
              </View>
            </View>
          </Card>

          <CultivationLogTimeline logs={batch.cultivationLogs ?? []} />

          <Card>
            <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Ảnh minh chứng ({images.length})</Txt>
            {images.length === 0 ? (
              <Txt size={14} lh={20} muted>Lô hàng chưa có ảnh minh chứng.</Txt>
            ) : (
              <Grid cols={isMd ? 4 : 3} gap={8}>
                {images.map((url, i) => <Thumb key={`${url}-${i}`} url={url} index={i} onPress={() => setPreview(url)} />)}
              </Grid>
            )}
            <Lightbox uri={preview} onClose={() => setPreview(null)} />
          </Card>

          <Card>
            <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Checklist kiểm duyệt</Txt>
            <View style={{ gap: 8 }}>
              {CHECKLIST.map((label, i) => (
                <Checkbox
                  key={label}
                  checked={checks[i]}
                  onChange={() => setChecks((c) => c.map((v, idx) => (idx === i ? !v : v)))}
                  label={<Txt size={14} lh={20}>{label}</Txt>}
                />
              ))}
            </View>
          </Card>

          {/* Mã QR: hiện bất cứ khi nào lô đã có barcode, không chỉ ngay lúc vừa duyệt */}
          {isApproved ? (
            <Card center gap={16}>
              <Txt size={16} lh={24} weight="600">Mã QR truy xuất nguồn gốc</Txt>
              <View style={{ padding: 16, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border }}>
                <QRCode value={buildTraceUrl(batch.barcode ?? "")} size={180} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
                <View style={{ backgroundColor: colors.muted, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.lg }}>
                  <Txt size={12} lh={16} mono>{batch.barcode}</Txt>
                </View>
                <Pressable onPress={() => void copyCode()}>
                  <Txt size={12} lh={16} weight="500" color={colors.primary}>{copied ? "Đã sao chép ✓" : "Sao chép"}</Txt>
                </Pressable>
              </View>
              <Txt size={12} lh={16} muted center>
                Người mua quét mã này rồi nhập vào trang tra cứu để xem thông tin truy xuất nguồn gốc.
              </Txt>
            </Card>
          ) : null}
        </View>

        {/* ===== Cột phải ===== */}
        <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 16 }}>
          {batch.approval_status === "Pending" ? (
            <Card>
              <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Gán cấp độ tin cậy</Txt>
              <Select textSm value={trust} onChange={(v) => setTrust(v as TrustLevel)} options={TRUST_OPTIONS} />
              <View style={{ marginTop: 12 }}>
                <Field dense textSm multiline rows={3} value={note} onChangeText={setNote} placeholder="Ghi chú duyệt / lý do từ chối..." />
              </View>
              {errorMsg ? <Txt size={12} lh={16} color={colors.destructive} style={{ marginTop: 8 }}>{errorMsg}</Txt> : null}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
                <Pressable
                  onPress={submitting ? undefined : () => void reject()}
                  style={{
                    flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radius.xl, borderWidth: 2,
                    borderColor: colors.destructive, opacity: submitting ? 0.5 : 1,
                  }}
                >
                  <Txt size={16} lh={24} weight="600" color={colors.destructive}>Từ chối</Txt>
                </Pressable>
                <Pressable
                  onPress={submitting ? undefined : () => void approve()}
                  style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radius.xl, backgroundColor: colors.primary, opacity: submitting ? 0.5 : 1 }}
                >
                  <Txt size={16} lh={24} weight="600" color={colors.primaryFg} center>Duyệt & tạo QR</Txt>
                </Pressable>
              </View>
            </Card>
          ) : (
            <Card center>
              <Txt size={14} lh={20} muted center>
                Lô hàng này đã được xử lý — trạng thái hiện tại:{" "}
                <Txt size={14} lh={20} weight="700" muted>{batch.approval_status === "Approved" ? "Đã duyệt" : "Đã từ chối"}</Txt>
              </Txt>
            </Card>
          )}

          <Link href="/admin/approvals" asChild>
            <Pressable style={{ alignItems: "center", paddingVertical: 2 }}>
              <Txt size={14} lh={20} muted center>← Danh sách chờ duyệt</Txt>
            </Pressable>
          </Link>
        </View>
      </View>
    </PanelPage>
  );
}
