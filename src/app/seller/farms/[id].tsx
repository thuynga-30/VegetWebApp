import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Field } from "@/components/ui/Input";
import { Grid } from "@/components/ui/Misc";
import { StatusBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { BackLink, Card, CertificatesCard, FarmPreview, MessageBox } from "@/components/common/FarmParts";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { farmService } from "@/services/farmService";
import { confirmDialog } from "@/lib/dialog";
import { errMessage } from "@/lib/errors";
import { MAX_IMAGE_SIZE, pickImages, type PickedImage } from "@/lib/upload";

export default function FarmProfilePage() {
  const { id, message: incoming } = useLocalSearchParams<{ id: string; message?: string }>();
  const farmId = Number(id);
  const router = useRouter();
  const { isMd } = useLayout();

  const { data: farm, loading, refetch } = useFetch(
    () => (Number.isFinite(farmId) ? farmService.getMyFarm(farmId) : Promise.resolve(null)),
    [farmId]
  );

  const [form, setForm] = useState({ farm_name: "", owner_name: "", address: "", description: "", area_ha: "", farming_method: "" });
  const [coverFile, setCoverFile] = useState<PickedImage | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Trang tạo trang trại gửi kèm thông báo khi chuyển sang đây
  const [message, setMessage] = useState<string>(typeof incoming === "string" ? incoming : "");
  const [isError, setIsError] = useState(false);

  const say = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  useEffect(() => {
    if (farm) {
      setForm({
        farm_name: farm.farm_name ?? "",
        owner_name: farm.owner_name ?? "",
        address: farm.address ?? "",
        description: farm.description ?? "",
        area_ha: farm.area_ha != null ? String(farm.area_ha) : "",
        farming_method: farm.farming_method ?? "",
      });
    }
  }, [farm]);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pickCover = async () => {
    try {
      const [file] = await pickImages();
      if (!file) return;
      if (file.size && file.size > MAX_IMAGE_SIZE) return say("Ảnh vượt quá 5MB, vui lòng chọn ảnh nhỏ hơn.", true);
      setCoverFile(file);
    } catch (err) {
      say(errMessage(err), true);
    }
  };

  const submit = async () => {
    if (!farm) return;
    setSaving(true);
    say("");
    try {
      // 1. Cập nhật thông tin (chỉ gửi các trường backend nhận)
      await farmService.updateMyFarm(farm.id, {
        farm_name: form.farm_name,
        owner_name: form.owner_name,
        address: form.address,
        description: form.description,
        area_ha: form.area_ha ? Number(form.area_ha) : undefined,
        farming_method: form.farming_method,
      });
      // 2. Đổi ảnh bìa: tải ảnh mới lên rồi mới xóa ảnh cũ
      if (coverFile) {
        await farmService.uploadImage(farm.id, coverFile, "Farm");
        if (farm.cover) await farmService.deleteImage(farm.cover.id);
        setCoverFile(null);
      }
      say(  "Đã cập nhật hồ sơ trang trại. Trang trại đã chuyển sang trạng thái chờ Admin kiểm duyệt lại.");
      refetch();
    } catch (err) {
      say(errMessage(err, "Lưu thất bại"), true);
    } finally {
      setSaving(false);
    }
  };
  const deleteFarm = async () => {
    if (!farm) return;

    const confirmed = await confirmDialog(
      `Bạn có chắc chắn muốn xóa trang trại "${farm.farm_name}" không? Thao tác này không thể hoàn tác.`,
      undefined,
      "Xóa trang trại"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      say("");

      await farmService.deleteMyFarm(farm.id);

      router.replace("/seller/farms");
    } catch (err) {
      say(
        errMessage(err, "Không thể xóa trang trại"),
        true
      );
    } finally {
      setSaving(false);
    }
  };
  const uploadCertificate = async () => {
    if (!farm) return;
    try {
      const [file] = await pickImages();
      if (!file) return;
      if (file.size && file.size > MAX_IMAGE_SIZE) return say("Ảnh vượt quá 5MB, vui lòng chọn ảnh nhỏ hơn.", true);
      setUploading(true);
      say("");
      await farmService.uploadImage(farm.id, file, "Certifi");
      say("Đã tải chứng nhận lên.");
      refetch();
    } catch (err) {
      say(errMessage(err, "Tải chứng nhận thất bại"), true);
    } finally {
      setUploading(false);
    }
  };

  const removeCertificate = async (imageId: number) => {
    if (!(await confirmDialog("Xóa chứng nhận này?", undefined, "Xóa"))) return;
    try {
      await farmService.deleteImage(imageId);
      refetch();
    } catch (err) {
      say(errMessage(err, "Xóa thất bại"), true);
    }
  };

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
        <View style={{ gap: 12 }}>
          <BackLink href="/seller/farms" label="Danh sách trang trại" />
          <Txt size={16} lh={24} muted>Không tìm thấy trang trại.</Txt>
        </View>
      </PanelPage>
    );
  }

  const coverSrc = coverFile?.uri ?? farm.cover?.url ?? null;
  const statusLabel = farm.status === "approved" ? "Approved" : farm.status === "rejected" ? "Rejected" : "Pending";

  return (
    <PanelPage>
      <View style={{ width: "100%", maxWidth: 1152, alignSelf: "center", gap: 20 }}>
        <BackLink href="/seller/farms" label="Danh sách trang trại" />
        {message ? <MessageBox text={message} error={isError} /> : null}

        <View style={{ flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 20 }}>
          {/* Cột trái: ảnh + thông tin trang trại */}
          <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 20 }}>
            <FarmPreview
              coverUri={coverSrc}
              coverButtonLabel="Đổi ảnh bìa"
              onPickCover={pickCover}
              farmName={form.farm_name}
              address={form.address}
              description={form.description}
              areaHa={form.area_ha}
              method={form.farming_method}
              statusBadge={<StatusBadge status={statusLabel} />}
            />

            <Card>
              <View style={{ gap: 16 }}>
                <Txt size={16} lh={24} weight="600">Chỉnh sửa thông tin</Txt>
                <Grid cols={isMd ? 2 : 1} gap={12}>
                  <Field dense label="Tên trang trại" value={form.farm_name} onChangeText={set("farm_name")} />
                  <Field dense label="Chủ trang trại" value={form.owner_name} onChangeText={set("owner_name")} />
                </Grid>
                <Field dense label="Địa chỉ" value={form.address} onChangeText={set("address")} />
                <Grid cols={isMd ? 2 : 1} gap={12}>
                  <Field dense label="Diện tích (ha)" value={form.area_ha} onChangeText={set("area_ha")} keyboardType="decimal-pad" />
                  <Field dense label="Phương pháp canh tác" value={form.farming_method} onChangeText={set("farming_method")} />
                </Grid>
                <Field dense label="Mô tả" value={form.description} onChangeText={set("description")} multiline rows={3} />

                <Pressable
                  onPress={saving ? undefined : submit}
                  style={{
                    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary,
                    paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.lg, opacity: saving ? 0.5 : 1,
                  }}
                >
                  <Icon name="save" size={16} color={colors.primaryFg} />
                  <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</Txt>
                </Pressable>
                <Pressable
                  onPress={saving ? undefined : deleteFarm}
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "#FEE2E2",
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: radius.lg,
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  <Icon
                    name="trash-2"
                    size={16}
                    color="#DC2626"
                  />

                  <Txt
                    size={14}
                    lh={20}
                    weight="600"
                    color="#DC2626"
                  >
                    Xóa trang trại
                  </Txt>
                </Pressable>
              </View>
            </Card>
          </View>

          {/* Cột phải: chứng nhận */}
          <View style={{ width: isMd ? 320 : "100%" }}>
            <CertificatesCard
              items={farm.certificates.map((c) => ({ key: c.id, uri: c.url, onRemove: () => removeCertificate(c.id) }))}
              emptyText="Chưa có chứng nhận nào."
              buttonLabel={uploading ? "Đang tải lên..." : "Tải chứng nhận mới"}
              onPick={uploadCertificate}
              disabled={uploading}
            />
          </View>
        </View>
      </View>
    </PanelPage>
  );
}
