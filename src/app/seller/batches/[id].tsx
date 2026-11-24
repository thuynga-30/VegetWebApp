import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Field } from "@/components/ui/Input";
import { DateField } from "@/components/ui/DateField";
import { Grid, Timeline } from "@/components/ui/Misc";
import { StatusBadge, TrustBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { QRCode } from "@/components/common/QRCode";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { batchService } from "@/services/batchService";
import { buildTraceUrl } from "@/lib/trace";
import { downloadQr, printQr } from "@/lib/qrActions";
import { errMessage } from "@/lib/errors";
import { formatDate, normalizeDateInput } from "@/lib/format";
import { MAX_IMAGE_SIZE, pickImages } from "@/lib/upload";

const MAX_FILES = 10;

/** p-2 rounded-lg bg-muted/40 */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ padding: 8, borderRadius: radius.lg, backgroundColor: "rgba(242,243,232,0.4)" }}>
      <Txt size={12} lh={16} muted>{label}</Txt>
      <Txt size={14} lh={20} weight="500">{value}</Txt>
    </View>
  );
}

function Card({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 20,
        alignItems: center ? "center" : undefined,
      }}
    >
      {children}
    </View>
  );
}

export default function BatchDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const batchId = Number(id);
  const { isMd } = useLayout();
  const { width } = useWindowDimensions();
  const narrow = width < 520;

  const { data: batch, loading, refetch: refetchBatch } = useFetch(() => batchService.getById(batchId), [id]);
  const { data: logs, loading: logsLoading, refetch: refetchLogs } = useFetch(() => batchService.getLogs(batchId), [id]);

  // Nhật ký canh tác
  const [showForm, setShowForm] = useState(false);
  const [logDate, setLogDate] = useState("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Ảnh lô hàng
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  // Mã QR
  const qrRef = useRef<any>(null);

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

  // Ưu tiên trường image; nếu API trả về mảng images thì lấy ảnh đầu tiên
  const coverImage: string | null = (batch as any).image ?? (batch as any).images?.[0]?.image_url ?? null;

  const resetForm = () => {
    setLogDate("");
    setActivity("");
    setDescription("");
    setImage("");
    setError("");
  };

  const submitLog = async () => {
    const date = normalizeDateInput(logDate);
    if (!logDate.trim() || !activity.trim()) {
      setError("Vui lòng nhập ngày và hoạt động canh tác.");
      return;
    }
    if (!date) {
      setError("Ngày không hợp lệ (định dạng YYYY-MM-DD).");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await batchService.addLog(batchId, {
        log_date: date,
        activity: activity.trim(),
        description: description.trim() || undefined,
        image: image.trim() || undefined,
      });
      resetForm();
      setShowForm(false);
      refetchLogs();
    } catch (err) {
      setError(errMessage(err, "Không thể thêm mục nhật ký, vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickImages = async () => {
    let files;
    try {
      files = await pickImages({ multiple: true, limit: MAX_FILES });
    } catch (err) {
      setImageError(errMessage(err));
      return;
    }
    if (!files.length) return;
    if (files.length > MAX_FILES) {
      setImageError(`Tối đa ${MAX_FILES} ảnh mỗi lần.`);
      return;
    }
    if (files.some((f) => !!f.size && f.size > MAX_IMAGE_SIZE)) {
      setImageError("Mỗi ảnh tối đa 5MB.");
      return;
    }
    setUploading(true);
    setImageError("");
    try {
      await batchService.uploadImages(batchId, files);
      refetchBatch();
    } catch (err) {
      setImageError(errMessage(err, "Không thể tải ảnh lên, vui lòng thử lại."));
    } finally {
      setUploading(false);
    }
  };

  const traceUrl = batch.barcode ? buildTraceUrl(batch.barcode) : "";

  return (
    <PanelPage onRefresh={() => { refetchBatch(); refetchLogs(); }}>
      <View style={{ flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 24 }}>
        {/* ===== Cột trái (2/3) ===== */}
        <View style={{ flex: isMd ? 2 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 20 }}>
          <Card>
            <View style={{ flexDirection: narrow ? "column" : "row", alignItems: "flex-start", gap: 16 }}>
              <View style={{ width: 96, flexShrink: 0 }}>
                {coverImage ? (
                  <Img uri={coverImage} style={{ width: 96, height: 96, borderRadius: radius.xl }} />
                ) : (
                  <Pressable
                    onPress={uploading ? undefined : handlePickImages}
                    style={{
                      width: 96, height: 96, borderRadius: radius.xl, borderWidth: 2, borderStyle: "dashed", borderColor: colors.border,
                      backgroundColor: "rgba(242,243,232,0.3)", alignItems: "center", justifyContent: "center", gap: 4, opacity: uploading ? 0.5 : 1,
                    }}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color={colors.mutedFg} />
                    ) : (
                      <>
                        <Icon name="image-plus" size={20} color={colors.mutedFg} />
                        <Txt size={12} lh={16} muted>Thêm ảnh</Txt>
                      </>
                    )}
                  </Pressable>
                )}
                {coverImage ? (
                  <Pressable onPress={uploading ? undefined : handlePickImages} style={{ marginTop: 4, opacity: uploading ? 0.5 : 1 }}>
                    <Txt size={12} lh={16} color={colors.primary} center>{uploading ? "Đang tải..." : "+ Thêm ảnh"}</Txt>
                  </Pressable>
                ) : null}
                {imageError ? <Txt size={12} lh={16} color={colors.destructive} style={{ marginTop: 4 }}>{imageError}</Txt> : null}
              </View>

              <View style={{ flex: narrow ? undefined : 1, width: narrow ? "100%" : undefined, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <Txt size={20} lh={28} weight="700">{batch.product_name}</Txt>
                  <StatusBadge status={batch.approval_status} />
                  <TrustBadge level={batch.trust_level} size="sm" />
                </View>
                <Txt size={12} lh={16} mono muted style={{ marginTop: 4 }}>{batch.barcode ?? "Chưa có mã (chờ admin duyệt)"}</Txt>
                <View style={{ marginTop: 12 }}>
                  <Grid cols={3} gap={12}>
                    <Info label="Gieo" value={formatDate(batch.planting_date)} />
                    <Info label="Thu hoạch" value={formatDate(batch.harvest_date)} />
                    <Info label="Còn lại" value={`${batch.quantity}kg`} />
                  </Grid>
                </View>
              </View>
            </View>
          </Card>

          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Txt size={16} lh={24} weight="600">Nhật ký canh tác</Txt>
              <Pressable
                onPress={() => {
                  setShowForm((v) => !v);
                  if (showForm) resetForm();
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Icon name={showForm ? "x" : "plus"} size={16} color={colors.primary} />
                <Txt size={14} lh={20} color={colors.primary}>{showForm ? "Hủy" : "Thêm mục"}</Txt>
              </Pressable>
            </View>

            {showForm ? (
              <View
                style={{
                  marginBottom: 20, padding: 16, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
                  backgroundColor: "rgba(242,243,232,0.2)", gap: 12,
                }}
              >
                <Grid cols={width >= 640 ? 2 : 1} gap={12}>
                  <DateField labelMuted textSm label="Ngày *" value={logDate} onChange={setLogDate} />
                  <Field dense labelMuted textSm label="Hoạt động *" value={activity} onChangeText={setActivity} placeholder="VD: Bón phân hữu cơ, tưới nước..." />
                </Grid>
                <Field dense labelMuted textSm label="Mô tả" value={description} onChangeText={setDescription} multiline rows={2} placeholder="Chi tiết về hoạt động canh tác..." />
                <Field dense labelMuted textSm label="Ảnh (URL)" value={image} onChangeText={setImage} placeholder="https://..." autoCapitalize="none" keyboardType="url" />
                {error ? <Txt size={14} lh={20} color={colors.destructive}>{error}</Txt> : null}
                <Pressable
                  onPress={submitting ? undefined : submitLog}
                  style={{
                    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8,
                    borderRadius: radius.lg, backgroundColor: colors.primary, opacity: submitting ? 0.5 : 1,
                  }}
                >
                  {submitting ? <ActivityIndicator size="small" color={colors.primaryFg} /> : null}
                  <Txt size={14} lh={20} weight="500" color={colors.primaryFg}>Lưu mục nhật ký</Txt>
                </Pressable>
              </View>
            ) : null}

            {logsLoading ? (
              <Txt size={14} lh={20} muted>Đang tải nhật ký...</Txt>
            ) : logs && logs.length > 0 ? (
              <Timeline
                items={logs.map((l) => ({
                  id: l.id,
                  date: formatDate(l.log_date),
                  title: l.activity,
                  description: l.description,
                  image: l.image ?? null,
                }))}
                renderImage={(uri) => <Img uri={uri} style={{ width: 160, height: 96, borderRadius: radius.lg }} />}
              />
            ) : (
              <Txt size={14} lh={20} muted>Chưa có mục nhật ký canh tác nào. Hãy thêm mục đầu tiên.</Txt>
            )}
          </Card>
        </View>

        {/* ===== Cột phải (QR) ===== */}
        <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0 }}>
          <Card center>
            <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Mã QR truy xuất</Txt>
            {batch.approval_status === "Approved" && batch.barcode ? (
              <>
                <QRCode value={traceUrl} getRef={(r) => (qrRef.current = r)} />
                <Txt size={12} lh={16} mono center style={{ marginTop: 8 }}>{batch.barcode}</Txt>
                <View style={{ marginTop: 16, flexDirection: "row", gap: 8, alignSelf: "stretch" }}>
                  <Pressable
                    onPress={() => downloadQr(qrRef.current, batch.barcode!, traceUrl).catch((e) => setImageError(errMessage(e)))}
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }}
                  >
                    <Icon name="download" size={16} />
                    <Txt size={14} lh={20}>Tải</Txt>
                  </Pressable>
                  <Pressable
                    onPress={() => printQr(qrRef.current, batch.barcode!, traceUrl).catch((e) => setImageError(errMessage(e)))}
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }}
                  >
                    <Icon name="printer" size={16} />
                    <Txt size={14} lh={20}>In tem</Txt>
                  </Pressable>
                </View>
              </>
            ) : (
              <Txt size={14} lh={20} muted center>
                {batch.approval_status === "Pending" ? "QR sẽ xuất hiện sau khi admin duyệt lô hàng." : "Lô hàng đã bị từ chối, không có mã QR."}
              </Txt>
            )}
          </Card>
        </View>
      </View>
    </PanelPage>
  );
}
