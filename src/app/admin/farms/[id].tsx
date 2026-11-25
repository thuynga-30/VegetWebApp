import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img, Lightbox } from "@/components/ui/Img";
import { Field } from "@/components/ui/Input";
import { Grid } from "@/components/ui/Misc";
import { StatusBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { farmService } from "@/services/farmService";
import { formatDate } from "@/lib/format";
import { errMessage } from "@/lib/errors";

const TRUST_LABEL: Record<string, { level: number; text: string }> = {
  Low: { level: 1, text: "Cấp 1 — Đã xác minh cơ bản" },
  Medium: { level: 2, text: "Cấp 2 — Nhật ký canh tác đầy đủ" },
  High: { level: 3, text: "Cấp 3 — Chứng nhận & xác minh toàn diện" },
};

/** p-2.5 rounded-lg bg-muted/50 (căn trái) */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ padding: 10, borderRadius: radius.lg, backgroundColor: "rgba(242,243,232,0.5)" }}>
      <Txt size={11} lh={16} muted>{label}</Txt>
      <Txt size={14} lh={20} weight="500" style={{ marginTop: 2 }}>{value}</Txt>
    </View>
  );
}

/** bg-card border rounded-2xl p-5 */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 20 }}>
      {children}
    </View>
  );
}

function PhotoThumb({ url, index, onPress }: { url: string; index: number; onPress: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable onPress={onPress} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} style={{ opacity: hover ? 0.8 : 1 }} accessibilityLabel={`Ảnh ${index + 1}`}>
      <Img uri={url} style={{ width: "100%", aspectRatio: 1, borderRadius: radius.lg }} />
    </Pressable>
  );
}

/** Ô chứng nhận: rê chuột (web) hiện lớp mờ + biểu tượng phóng to */
function CertTile({ url, index, onPress }: { url: string; index: number; onPress: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityLabel={`Chứng nhận ${index + 1}`}
      style={{ width: "100%", aspectRatio: 4 / 3, backgroundColor: colors.muted, borderRadius: radius.xl, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}
    >
      <Img uri={url} style={{ width: "100%", height: "100%" }} />
      <View
        pointerEvents="none"
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center",
          backgroundColor: hover ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0)",
        }}
      >
        <View style={{ opacity: hover ? 1 : 0 }}>
          <Icon name="zoom-in" size={20} color={colors.white} />
        </View>
      </View>
    </Pressable>
  );
}

export default function FarmApprovalDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isMd } = useLayout();
  const { data: farm, loading } = useFetch(() => farmService.getByIdAdmin(Number(id)), [id]);

  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (loading) {
    return (
      <PanelPage>
        <Txt size={16} lh={24} muted>Đang tải...</Txt>
      </PanelPage>
    );
  }
  if (!farm) {
    return (
      <PanelPage>
        <Txt size={16} lh={24} muted>Không tìm thấy nông trại.</Txt>
      </PanelPage>
    );
  }

  const farmImages: string[] = farm.farmImages ?? farm.images ?? [];
  const certificates: string[] = farm.certificates ?? [];
  const status = farm.status ?? "pending";
  const badge = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending";
  const trust = TRUST_LABEL[farm.trustLevel ?? "Low"];

  const decide = async (action: "approve" | "reject") => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (action === "approve") await farmService.approve(farm.id);
      else await farmService.reject(farm.id, note || "Hồ sơ chưa đủ minh chứng");
      router.replace("/admin/users");
    } catch (err) {
      setErrorMsg(errMessage(err, "Có lỗi xảy ra, vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PanelPage>
      <View>
        <Link href="/admin/users" asChild>
          <Pressable style={{ alignSelf: "flex-start" }}>
            <Txt size={14} lh={20} muted>← Danh sách người dùng</Txt>
          </Pressable>
        </Link>

        <View style={{ marginTop: 12, flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 20 }}>
          {/* ===== Cột trái (2/3) ===== */}
          <View style={{ flex: isMd ? 2 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 20 }}>
            {/* Banner + thông tin cơ bản */}
            <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, overflow: "hidden" }}>
              <View style={{ width: "100%", aspectRatio: 16 / 6, backgroundColor: colors.muted }}>
                {farmImages[0] ? (
                  <Img uri={farmImages[0]} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Txt size={14} lh={20} muted>Chưa có ảnh</Txt>
                  </View>
                )}
              </View>
              <View style={{ padding: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <Txt size={20} lh={28} weight="700">{farm.farmName}</Txt>
                  <StatusBadge status={badge} />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <Icon name="map-pin" size={16} color={colors.mutedFg} />
                  <Txt size={14} lh={20} muted style={{ flex: 1 }}>{farm.address ?? "Chưa cập nhật địa chỉ"}</Txt>
                </View>
                {farm.description ? <Txt size={14} lh={20} muted style={{ marginTop: 8 }}>{farm.description}</Txt> : null}
                <View style={{ marginTop: 16 }}>
                  <Grid cols={isMd ? 4 : 2} gap={12}>
                    <Info label="Chủ trang trại" value={farm.ownerName ?? "—"} />
                    <Info label="Diện tích" value={farm.areaHa ? `${farm.areaHa} ha` : "—"} />
                    <Info label="Phương pháp" value={farm.farmingMethod ?? "—"} />
                    <Info label="Ngày đăng ký" value={farm.createdAt ? formatDate(farm.createdAt) : "—"} />
                  </Grid>
                </View>
              </View>
            </View>

            {/* Ảnh nông trại */}
            {farmImages.length > 1 ? (
              <Card>
                <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Hình ảnh nông trại ({farmImages.length})</Txt>
                <Grid cols={isMd ? 4 : 3} gap={8}>
                  {farmImages.map((url, i) => <PhotoThumb key={`${url}-${i}`} url={url} index={i} onPress={() => setLightbox(url)} />)}
                </Grid>
              </Card>
            ) : null}

            {/* Giấy tờ, chứng nhận */}
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Icon name="award" size={16} color={colors.primary} />
                <Txt size={16} lh={24} weight="600">Giấy tờ, chứng nhận ({certificates.length})</Txt>
              </View>
              {certificates.length > 0 ? (
                <Grid cols={2} gap={12}>
                  {certificates.map((url, i) => <CertTile key={`${url}-${i}`} url={url} index={i} onPress={() => setLightbox(url)} />)}
                </Grid>
              ) : (
                <Txt size={14} lh={20} muted>Chưa tải lên chứng nhận nào.</Txt>
              )}
            </Card>
          </View>

          {/* ===== Cột phải ===== */}
          <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 20 }}>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Icon name="trending-up" size={16} color={colors.primary} />
                <Txt size={16} lh={24} weight="600">Cấp tin cậy</Txt>
              </View>
              <Txt size={30} lh={36} weight="700" color={colors.primary}>
                {trust.level}<Txt size={16} lh={24} muted>/3</Txt>
              </Txt>
              <Txt size={12} lh={16} muted style={{ marginTop: 4 }}>{trust.text}</Txt>
              <Txt size={14} lh={20} style={{ marginTop: 16 }}>
                <Txt size={14} lh={20} muted>Số sản phẩm: </Txt>
                <Txt size={14} lh={20} weight="700">{farm.totalProducts}</Txt>
              </Txt>
            </Card>

            {status === "pending" ? (
              <Card>
                <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Quyết định duyệt hồ sơ</Txt>
                <Field dense textSm multiline rows={3} value={note} onChangeText={setNote} placeholder="Lý do từ chối..." />
                {errorMsg ? <Txt size={12} lh={16} color={colors.destructive} style={{ marginTop: 8 }}>{errorMsg}</Txt> : null}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                  <Pressable
                    onPress={submitting ? undefined : () => void decide("reject")}
                    style={{
                      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10,
                      borderRadius: radius.xl, borderWidth: 2, borderColor: colors.destructive, opacity: submitting ? 0.5 : 1,
                    }}
                  >
                    <Icon name="x" size={16} color={colors.destructive} />
                    <Txt size={16} lh={24} weight="600" color={colors.destructive}>Từ chối</Txt>
                  </Pressable>
                  <Pressable
                    onPress={submitting ? undefined : () => void decide("approve")}
                    style={{
                      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10,
                      borderRadius: radius.xl, backgroundColor: colors.primary, opacity: submitting ? 0.5 : 1,
                    }}
                  >
                    <Icon name="check" size={16} color={colors.primaryFg} />
                    <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>Duyệt hồ sơ</Txt>
                  </Pressable>
                </View>
              </Card>
            ) : (
              <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 20, alignItems: "center" }}>
                <Txt size={14} lh={20} muted center>
                  Hồ sơ đã được xử lý:{" "}
                  <Txt size={14} lh={20} weight="700" muted>{status === "approved" ? "Đã duyệt" : "Đã từ chối"}</Txt>
                </Txt>
              </View>
            )}
          </View>
        </View>

        <Lightbox uri={lightbox} onClose={() => setLightbox(null)} />
      </View>
    </PanelPage>
  );
}
