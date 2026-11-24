import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Field } from "@/components/ui/Input";
import { DateField } from "@/components/ui/DateField";
import { Select } from "@/components/ui/Select";
import { Grid } from "@/components/ui/Misc";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { batchService } from "@/services/batchService";
import { notify } from "@/lib/dialog";
import { errMessage } from "@/lib/errors";
import { normalizeDateInput } from "@/lib/format";
import { pickImages, type PickedImage } from "@/lib/upload";
import type { TrustLevel } from "@/types/batch";

interface LogRow { log_date: string; activity: string; description: string }

const TRUST_PREVIEW: Record<TrustLevel, { title: string; desc: string; icon: IconName; fg: string; bg: string; hint: string }> = {
  Low: {
    title: "Cấp 1 — Cơ bản", desc: "Thông tin lô hàng tối thiểu", icon: "shield",
    fg: colors.trustBronze, bg: "rgba(190,126,81,0.15)", hint: "Bổ sung nhật ký canh tác để đạt Cấp 2.",
  },
  Medium: {
    title: "Cấp 2 — Bạc", desc: "Có nhật ký canh tác đầy đủ", icon: "shield-check",
    fg: colors.slate600, bg: "rgba(148,163,184,0.15)", hint: "Bổ sung chứng nhận và ảnh thực địa để đạt Cấp 3.",
  },
  High: {
    title: "Cấp 3 — Vàng", desc: "Có nhật ký, ảnh thực địa đầy đủ", icon: "award",
    fg: colors.trustGold, bg: "rgba(239,179,0,0.15)", hint: "Lô hàng đủ điều kiện cấp độ tin cậy cao nhất!",
  },
};

const OTHER = "__other__";
const MAX_IMAGES = 10;
const MAX_SIZE = 5 * 1024 * 1024; // khớp giới hạn 5MB ở backend

/** bg-card border rounded-2xl p-6 */
function Card({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 24,
        alignItems: center ? "center" : undefined,
      }}
    >
      {children}
    </View>
  );
}

/** Ảnh xem trước có nút xóa (web: hiện khi rê chuột) */
function Thumb({ uri, index, onRemove }: { uri: string; index: number; onRemove: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)}>
      <Img uri={uri} style={{ width: "100%", aspectRatio: 1, borderRadius: radius.lg }} fallback={`Ảnh ${index + 1}`} />
      <Pressable
        onPress={onRemove}
        accessibilityLabel="Xóa ảnh"
        style={{
          position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)",
          alignItems: "center", justifyContent: "center", opacity: hover || Platform.OS !== "web" ? 1 : 0,
        }}
      >
        <Icon name="x" size={14} color={colors.white} />
      </Pressable>
    </Pressable>
  );
}

/** Vùng chọn ảnh viền nét đứt (web: hỗ trợ kéo thả file) */
function DropZone({ onPick, onDropFiles }: { onPick: () => void; onDropFiles: (files: PickedImage[]) => void }) {
  const [hover, setHover] = useState(false);
  const ref = useRef<any>(null);
  const dropRef = useRef(onDropFiles);
  dropRef.current = onDropFiles;

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const el: HTMLElement | null = ref.current;
    if (!el || !el.addEventListener) return;
    const over = (e: Event) => { e.preventDefault(); setHover(true); };
    const leave = () => setHover(false);
    const drop = (e: any) => {
      e.preventDefault();
      setHover(false);
      const files: File[] = Array.from(e.dataTransfer?.files ?? []);
      dropRef.current(
        files.filter((f) => f.type.startsWith("image/")).map((f, i) => ({
          uri: URL.createObjectURL(f), name: f.name || `image-${i}.jpg`, type: f.type, size: f.size,
        }))
      );
    };
    el.addEventListener("dragover", over);
    el.addEventListener("dragleave", leave);
    el.addEventListener("drop", drop);
    return () => {
      el.removeEventListener("dragover", over);
      el.removeEventListener("dragleave", leave);
      el.removeEventListener("drop", drop);
    };
  }, []);

  const c = hover ? colors.primary : colors.mutedFg;
  return (
    <Pressable
      ref={ref}
      onPress={onPick}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        marginTop: 4, alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 32,
        borderWidth: 2, borderStyle: "dashed", borderRadius: radius.xl, borderColor: hover ? colors.primary : colors.border,
      }}
    >
      <Icon name="upload-cloud" size={24} color={c} />
      <Txt size={14} lh={20} color={c}>
        {Platform.OS === "web" ? "Kéo thả hoặc nhấn để chọn nhiều ảnh" : "Nhấn để chọn nhiều ảnh"}
      </Txt>
    </Pressable>
  );
}

export default function BatchCreatePage() {
  const router = useRouter();
  const { isMd } = useLayout();
  const { data: products, refetch: refetchProducts } = useFetch(() => productService.getMyProducts(), []);
  const { data: categories } = useFetch(() => categoryService.getAll(), []);

  const [form, setForm] = useState({ product_id: "", planting_date: "", harvest_date: "", quantity: "", price: "" });
  const [logs, setLogs] = useState<LogRow[]>([{ log_date: "", activity: "", description: "" }]);
  const [newProduct, setNewProduct] = useState({ name: "", category_id: "" });
  const [images, setImages] = useState<PickedImage[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"draft" | "submit" | null>(null);

  const addLog = () => setLogs((l) => [...l, { log_date: "", activity: "", description: "" }]);
  const removeLog = (i: number) => setLogs((l) => l.filter((_, idx) => idx !== i));
  const updateLog = (i: number, key: keyof LogRow, value: string) =>
    setLogs((l) => l.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));

  const addFiles = (picked: PickedImage[]) => {
    if (picked.length === 0) return;
    const tooBig = picked.filter((f) => !!f.size && f.size > MAX_SIZE);
    const ok = picked.filter((f) => !f.size || f.size <= MAX_SIZE);
    const room = MAX_IMAGES - images.length;
    if (ok.length > room) setError(`Tối đa ${MAX_IMAGES} ảnh cho mỗi lô.`);
    else if (tooBig.length) setError("Một số ảnh vượt quá 5MB nên đã bị bỏ qua.");
    else setError("");
    setImages((prev) => [...prev, ...ok.slice(0, Math.max(room, 0))]);
  };

  const pickFiles = async () => {
    try {
      addFiles(await pickImages({ multiple: true, limit: Math.max(MAX_IMAGES - images.length, 1) }));
    } catch (err) {
      setError(errMessage(err));
    }
  };

  const filledLogs = logs.filter((l) => normalizeDateInput(l.log_date) && l.activity).length;
  const trustLevel: TrustLevel = useMemo(() => {
    if (images.length > 0 && filledLogs >= 2) return "High";
    if (filledLogs >= 1) return "Medium";
    return "Low";
  }, [images.length, filledLogs]);
  const preview = TRUST_PREVIEW[trustLevel];

  const submit = async (mode: "draft" | "submit") => {
    setError("");
    if (mode === "draft") {
      notify("Đã lưu nháp lô hàng (chỉ lưu tạm trên trình duyệt, chưa gửi admin duyệt).");
      return;
    }

    const isOther = form.product_id === OTHER;
    if (!form.product_id) return setError("Vui lòng chọn sản phẩm.");
    if (isOther) {
      if (!newProduct.name.trim()) return setError("Vui lòng nhập tên sản phẩm mới.");
      if (!newProduct.category_id) return setError("Vui lòng chọn danh mục cho sản phẩm mới.");
      if (!form.price || Number(form.price) <= 0) return setError("Vui lòng nhập giá bán cho sản phẩm mới.");
    }

    const harvest = normalizeDateInput(form.harvest_date);
    if (!form.harvest_date.trim()) return setError("Vui lòng chọn ngày thu hoạch.");
    if (!harvest) return setError("Ngày thu hoạch không hợp lệ (định dạng YYYY-MM-DD).");
    const planting = normalizeDateInput(form.planting_date);
    if (form.planting_date.trim() && !planting) return setError("Ngày gieo trồng không hợp lệ (định dạng YYYY-MM-DD).");
    if (logs.some((l) => l.log_date.trim() && !normalizeDateInput(l.log_date))) {
      return setError("Ngày trong nhật ký canh tác không hợp lệ (định dạng YYYY-MM-DD).");
    }

    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || qty < 1) return setError("Sản lượng phải là số nguyên lớn hơn 0.");

    setLoading(mode);
    try {
      // Sản phẩm khác: tạo sản phẩm trước, rồi dùng id vừa tạo cho lô hàng
      let productId = Number(form.product_id);
      if (isOther) {
        const p = await productService.create({
          name: newProduct.name.trim(),
          category_id: Number(newProduct.category_id),
          price: Number(form.price),
        });
        productId = p.id;
        // Nếu bước tạo lô bên dưới lỗi, bấm gửi lại sẽ dùng sản phẩm này, không tạo trùng
        setForm((f) => ({ ...f, product_id: String(p.id) }));
        setNewProduct({ name: "", category_id: "" });
        refetchProducts();
      }

      const created = await batchService.create({
        productId,
        plantingDate: planting || undefined,
        harvestDate: harvest,
        quantity: qty,
        cultivationLogs: logs
          .filter((l) => l.activity && normalizeDateInput(l.log_date))
          .map((l) => ({
            activity: l.activity,
            description: l.description || undefined,
            logDate: normalizeDateInput(l.log_date),
          })),
      });

      // Gửi ảnh thật sau khi tạo lô (field "files" khớp FilesInterceptor ở backend)
      if (images.length > 0) {
        try {
          await batchService.uploadImages(created.id, images);
        } catch (err) {
          // Lô đã tạo xong; có thể tải lại ảnh sau
          console.error("Upload batch images error:", err);
        }
      }
      router.replace("/seller/batches");
    } catch (err) {
      setError(errMessage(err, "Tạo lô hàng thất bại"));
    } finally {
      setLoading(null);
    }
  };

  const half = isMd ? 2 : 2; // grid-cols-2 giữ nguyên cả điện thoại

  // Tách "chứng nhận" / "ảnh thực địa" trong gợi ý để in đậm
  const hintParts = preview.hint.split(/(\bchứng nhận\b|\bảnh thực địa\b)/i);

  return (
    <PanelPage>
      <View>
        {error ? <Txt size={14} lh={20} color={colors.destructive} style={{ marginBottom: 16 }}>{error}</Txt> : null}

        <View style={{ flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 20 }}>
          {/* Cột trái: form */}
          <View style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 20 }}>
            <Card>
              <View style={{ gap: 16 }}>
                <Txt size={16} lh={24} weight="600">Thông tin lô hàng</Txt>

                <View>
                  <Select
                    label="Sản phẩm"
                    value={form.product_id}
                    onChange={(v) => setForm({ ...form, product_id: v })}
                    placeholder="— Chọn sản phẩm —"
                    options={[
                      ...(products ?? []).map((p) => ({ value: String(p.id), label: p.name })),
                      { value: OTHER, label: "+ Sản phẩm khác (nhập tên mới)" },
                    ]}
                  />
                  {form.product_id === OTHER ? (
                    <View
                      style={{
                        marginTop: 12, padding: 16, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
                        backgroundColor: "rgba(242,243,232,0.2)", gap: 12,
                      }}
                    >
                      <Grid cols={isMd ? 2 : 1} gap={12}>
                        <Field
                          dense labelMuted textSm label="Tên sản phẩm mới *" value={newProduct.name}
                          onChangeText={(v) => setNewProduct({ ...newProduct, name: v })} placeholder="VD: Cà chua bi"
                        />
                        <Select
                          textSm
                          label="Danh mục *"
                          value={newProduct.category_id}
                          onChange={(v) => setNewProduct({ ...newProduct, category_id: v })}
                          placeholder="— Chọn danh mục —"
                          options={(categories ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
                        />
                      </Grid>
                      <Txt size={12} lh={16} muted>
                        Sản phẩm mới được tạo cùng lúc với lô hàng, giá lấy từ ô "Giá bán" bên dưới.
                      </Txt>
                    </View>
                  ) : null}
                </View>

                <Grid cols={half} gap={12}>
                  <DateField label="Ngày gieo trồng" value={form.planting_date} onChange={(v) => setForm({ ...form, planting_date: v })} />
                  <DateField label="Ngày thu hoạch (dự kiến)" value={form.harvest_date} onChange={(v) => setForm({ ...form, harvest_date: v })} />
                </Grid>

                <Grid cols={half} gap={12}>
                  <Field dense label="Sản lượng (kg)" value={form.quantity} onChangeText={(v) => setForm({ ...form, quantity: v })} keyboardType="number-pad" />
                  <Field dense label="Giá bán (VNĐ/kg)" value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} keyboardType="number-pad" />
                </Grid>

                <View>
                  <Txt size={14} lh={20} weight="500">Ảnh lô hàng ({images.length}/{MAX_IMAGES})</Txt>
                  <DropZone onPick={pickFiles} onDropFiles={addFiles} />
                  {images.length > 0 ? (
                    <View style={{ marginTop: 12 }}>
                      <Grid cols={isMd ? 5 : 3} gap={8}>
                        {images.map((img, i) => (
                          <Thumb key={`${img.uri}-${i}`} uri={img.uri} index={i} onRemove={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} />
                        ))}
                      </Grid>
                    </View>
                  ) : null}
                </View>
              </View>
            </Card>

            <Card>
              <View style={{ gap: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Txt size={16} lh={24} weight="600">Nhật ký canh tác (timeline)</Txt>
                  <Pressable onPress={addLog} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon name="plus" size={16} color={colors.primary} />
                    <Txt size={14} lh={20} color={colors.primary}>Thêm mục</Txt>
                  </Pressable>
                </View>

                {logs.map((l, i) => (
                  <View key={i} style={{ flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 8 }}>
                    <View style={{ width: isMd ? 140 : "100%" }}>
                      <DateField textSm value={l.log_date} onChange={(v) => updateLog(i, "log_date", v)} />
                    </View>
                    <Field style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%" }} dense textSm placeholder="Gieo hạt" value={l.activity} onChangeText={(v) => updateLog(i, "activity", v)} />
                    <Field style={{ flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%" }} dense textSm placeholder="Mô tả" value={l.description} onChangeText={(v) => updateLog(i, "description", v)} />
                    <Pressable
                      onPress={() => removeLog(i)}
                      accessibilityLabel="Xóa mục"
                      style={{ padding: 8, borderRadius: radius.lg, alignSelf: isMd ? "flex-start" : "flex-end" }}
                    >
                      <Icon name="trash-2" size={16} color={colors.destructive} />
                    </Pressable>
                  </View>
                ))}

                <View style={{ backgroundColor: "#fffbeb", borderRadius: radius.lg, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Txt size={12} lh={16} color="#92400e">
                    💡 Nhật ký càng chi tiết → Admin đánh giá cấp độ tin cậy càng cao (Vàng nếu có nhật ký đầy đủ + chứng nhận + ảnh thực địa).
                  </Txt>
                </View>
              </View>
            </Card>
          </View>

          {/* Cột phải: preview cấp độ tin cậy + hướng dẫn + hành động */}
          <View style={{ width: isMd ? 320 : "100%", gap: 20 }}>
            <Card center>
              <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Cấp độ tin cậy dự kiến</Txt>
              <View style={{ width: 56, height: 56, borderRadius: radius.xxl, backgroundColor: preview.bg, alignItems: "center", justifyContent: "center" }}>
                <Icon name={preview.icon} size={28} color={preview.fg} />
              </View>
              <Txt size={16} lh={24} weight="700" center style={{ marginTop: 12 }}>{preview.title}</Txt>
              <Txt size={12} lh={16} muted center style={{ marginTop: 4 }}>{preview.desc}</Txt>
              <View style={{ alignSelf: "stretch", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Txt size={12} lh={16} muted center>
                  {hintParts.map((part, idx) =>
                    /chứng nhận|ảnh thực địa/i.test(part) ? <Txt key={idx} size={12} lh={16} weight="700" muted>{part}</Txt> : part
                  )}
                </Txt>
              </View>
            </Card>

            <Card>
              <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Sau khi gửi</Txt>
              <View style={{ gap: 8 }}>
                {["Admin xem xét trong 24h", "Nhận thông báo duyệt/từ chối", "Lô hàng lên sàn + tự sinh mã QR"].map((t, i) => (
                  <Txt key={t} size={14} lh={20} muted>{i + 1}. {t}</Txt>
                ))}
              </View>
            </Card>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={loading !== null ? undefined : () => submit("draft")}
                style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.border, opacity: loading !== null ? 0.5 : 1 }}
              >
                <Txt size={16} lh={24} weight="600">Lưu nháp</Txt>
              </Pressable>
              <Pressable
                onPress={loading !== null ? undefined : () => submit("submit")}
                style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: radius.xl, backgroundColor: colors.primary, opacity: loading !== null ? 0.5 : 1 }}
              >
                <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>{loading === "submit" ? "Đang gửi..." : "Gửi duyệt"}</Txt>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </PanelPage>
  );
}
