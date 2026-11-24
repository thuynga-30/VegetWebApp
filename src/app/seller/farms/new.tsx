import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Field } from "@/components/ui/Input";
import { Grid } from "@/components/ui/Misc";
import { PanelPage } from "@/components/common/PanelPage";
import { BackLink, Card, CertificatesCard, FarmPreview, MessageBox } from "@/components/common/FarmParts";
import { useLayout } from "@/hooks/useLayout";
import { farmService } from "@/services/farmService";
import { errMessage } from "@/lib/errors";
import { MAX_IMAGE_SIZE, pickImages, type PickedImage } from "@/lib/upload";

export default function FarmCreatePage() {
  const router = useRouter();
  const { isMd } = useLayout();
  const [form, setForm] = useState({ farm_name: "", address: "", description: "", area_ha: "", farming_method: "" });
  const [cover, setCover] = useState<PickedImage | null>(null);
  const [certs, setCerts] = useState<PickedImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const tooBig = (f: PickedImage) => !!f.size && f.size > MAX_IMAGE_SIZE;

  const pickCover = async () => {
    try {
      const [file] = await pickImages();
      if (!file) return;
      if (tooBig(file)) return setError("Ảnh vượt quá 5MB, vui lòng chọn ảnh nhỏ hơn.");
      setError("");
      setCover(file);
    } catch (err) {
      setError(errMessage(err));
    }
  };

  const addCertificates = async () => {
    try {
      const files = await pickImages({ multiple: true });
      if (files.length === 0) return;
      const ok = files.filter((f) => !tooBig(f));
      setError(ok.length < files.length ? "Một số ảnh vượt quá 5MB nên đã bị bỏ qua." : "");
      setCerts((prev) => [...prev, ...ok]);
    } catch (err) {
      setError(errMessage(err));
    }
  };

  const submit = async () => {
    const name = form.farm_name.trim();
    if (!name) {
      setError("Vui lòng nhập tên trang trại.");
      return;
    }
    const area = form.area_ha.trim() ? Number(form.area_ha) : undefined;
    if (area !== undefined && (!Number.isFinite(area) || area < 0)) {
      setError("Diện tích không hợp lệ.");
      return;
    }

    setSaving(true);
    setError("");

    // 1. Tạo trang trại
    let farmId: number;
    try {
      const farm = await farmService.createFarm({
        farm_name: name,
        address: form.address.trim() || undefined,
        description: form.description.trim() || undefined,
        area_ha: area,
        farming_method: form.farming_method.trim() || undefined,
      });
      farmId = farm.id;
    } catch (err) {
      setError(errMessage(err, "Tạo trang trại thất bại"));
      setSaving(false);
      return;
    }

    // 2. Trang trại đã có id: tải ảnh bìa và chứng nhận lên (lỗi ảnh không làm mất trang trại)
    const failed: string[] = [];
    const reason = (err: unknown) => errMessage(err, "lỗi không rõ");
    if (cover) {
      try {
        await farmService.uploadImage(farmId, cover, "Farm");
      } catch (err) {
        failed.push(`ảnh bìa (${reason(err)})`);
      }
    }
    for (const c of certs) {
      try {
        await farmService.uploadImage(farmId, c, "Certifi");
      } catch (err) {
        failed.push(`chứng nhận "${c.name}" (${reason(err)})`);
      }
    }

    router.replace({
      pathname: `/seller/farms/${farmId}` as any,
      params: {
        message: failed.length
          ? `Đã tạo trang trại nhưng chưa tải được: ${failed.join(", ")}. Bạn có thể thêm lại ở trang này.`
          : "Đã tạo trang trại. Trang trại đang chờ quản trị viên duyệt.",
      },
    });
  };

  return (
    <PanelPage>
      <View style={{ width: "100%", maxWidth: 1152, alignSelf: "center", gap: 20 }}>
        <BackLink href="/seller/farms" label="Danh sách trang trại" />
        <Txt size={20} lh={28} weight="700">Thêm trang trại mới</Txt>
        {error ? <MessageBox text={error} error /> : null}

        <View style={{ flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 20 }}>
          {/* Cột trái: ảnh + xem trước + form */}
          <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 20 }}>
            <FarmPreview
              coverUri={cover?.uri ?? null}
              coverButtonLabel={cover ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
              onPickCover={pickCover}
              farmName={form.farm_name}
              address={form.address}
              description={form.description}
              areaHa={form.area_ha}
              method={form.farming_method}
            />

            <Card>
              <View style={{ gap: 16 }}>
                <Txt size={16} lh={24} weight="600">Thông tin trang trại</Txt>
                <Field dense label="Tên trang trại *" value={form.farm_name} onChangeText={set("farm_name")} />
                <Field dense label="Địa chỉ" value={form.address} onChangeText={set("address")} />
                <Grid cols={isMd ? 2 : 1} gap={12}>
                  <Field dense label="Diện tích (ha)" value={form.area_ha} onChangeText={set("area_ha")} keyboardType="decimal-pad" />
                  <Field dense label="Phương pháp canh tác" value={form.farming_method} onChangeText={set("farming_method")} />
                </Grid>
                <Field dense label="Mô tả" value={form.description} onChangeText={set("description")} multiline rows={3} />

                <Txt size={12} lh={16} muted>
                  Chủ trang trại được lấy từ tên tài khoản của bạn. Trang trại mới ở trạng thái chờ duyệt cho đến khi quản trị viên xác nhận.
                </Txt>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Pressable
                    onPress={saving ? undefined : submit}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary,
                      paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.lg, opacity: saving ? 0.5 : 1,
                    }}
                  >
                    <Icon name="plus" size={16} color={colors.primaryFg} />
                    <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>{saving ? "Đang tạo..." : "Tạo trang trại"}</Txt>
                  </Pressable>
                  <Link href="/seller/farms" asChild>
                    <Pressable style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }}>
                      <Txt size={14} lh={20}>Hủy</Txt>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </Card>
          </View>

          {/* Cột phải: chứng nhận */}
          <View style={{ width: isMd ? 320 : "100%" }}>
            <CertificatesCard
              items={certs.map((c, i) => ({
                key: `${c.uri}-${i}`,
                uri: c.uri,
                onRemove: () => setCerts((prev) => prev.filter((_, idx) => idx !== i)),
              }))}
              emptyText="Chưa chọn chứng nhận nào."
              buttonLabel="Chọn chứng nhận"
              onPick={addCertificates}
              hint="Ảnh sẽ được tải lên sau khi trang trại được tạo."
            />
          </View>
        </View>
      </View>
    </PanelPage>
  );
}
