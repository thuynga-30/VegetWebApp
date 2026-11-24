import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Link, Redirect, useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Field } from "@/components/ui/Input";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/hooks/useAuth";
import { useLayout } from "@/hooks/useLayout";
import { authService } from "@/services/authService";
import { formatDate } from "@/lib/format";
import { errMessage } from "@/lib/errors";
import { MAX_IMAGE_SIZE, pickImages } from "@/lib/upload";

// Role từ backend là chữ thường (buyer/seller/admin); giữ thêm khóa viết hoa cho an toàn
const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị viên", seller: "Nông dân / Người bán", buyer: "Người mua",
  Admin: "Quản trị viên", Seller: "Nông dân / Người bán", Buyer: "Người mua",
};

function Wrap({ children, py }: { children: React.ReactNode; py: number }) {
  return (
    <View style={{ width: "100%", maxWidth: 768, alignSelf: "center", paddingHorizontal: 16, paddingVertical: py }}>
      {children}
    </View>
  );
}

/** Avatar tròn 64px: ảnh hoặc chữ cái đầu (bg-primary/10 text-primary text-xl font-semibold) */
function Avatar({ uri, name }: { uri?: string; name: string }) {
  return (
    <View
      style={{
        width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(27,126,42,0.1)",
        alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0,
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      ) : (
        <Txt size={20} lh={28} weight="600" color={colors.primary}>{(name[0] ?? "U").toUpperCase()}</Txt>
      )}
    </View>
  );
}

/** Lối tắt: px-3 py-2.5 rounded-lg text-sm, rê chuột nền muted */
function Shortcut({ href, icon, label, danger, onPress }: {
  href?: string; icon: IconName; label: string; danger?: boolean; onPress?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const body = (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.lg,
        backgroundColor: hover ? (danger ? "rgba(223,34,37,0.05)" : colors.muted) : "transparent",
      }}
    >
      <Icon name={icon} size={16} color={danger ? colors.destructive : colors.primary} />
      <Txt size={14} lh={20} color={danger ? colors.destructive : colors.foreground}>{label}</Txt>
    </Pressable>
  );
  return href ? <Link href={href} asChild>{body}</Link> : body;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: sessionUser, ready, logout } = useAuth();
  const { isMd } = useLayout();
  const { data: profile, loading, refetch } = useFetch(() => authService.getProfile(), []);

  const [form, setForm] = useState({ full_name: "", phone: "", address: "", avatar: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.data.full_name ?? "",
        phone: profile.data.phone ?? "",
        address: profile.data.address ?? "",
        avatar: profile.data.avatar ?? "",
      });
    }
  }, [profile]);

  const say = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  const submit = async () => {
    setSaving(true);
    say("");
    try {
      await authService.updateProfile(form);
      say("Đã cập nhật hồ sơ.");
      refetch();
    } catch (err) {
      say(errMessage(err, "Cập nhật thất bại"), true);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async () => {
    try {
      const [file] = await pickImages();
      if (!file) return;
      if (file.size && file.size > MAX_IMAGE_SIZE) {
        say("Ảnh vượt quá 5MB, vui lòng chọn ảnh nhỏ hơn.", true);
        return;
      }
      setFileName(file.name);
      setSaving(true);
      say("");
      const result = await authService.uploadAvatar(file);
      setForm((prev) => ({ ...prev, avatar: result.data.avatar ?? "" }));
      say("Đã cập nhật ảnh đại diện.");
    } catch (err) {
      say(errMessage(err, "Upload ảnh thất bại"), true);
    } finally {
      setSaving(false);
    }
  };

  // Trang cá nhân cần đăng nhập
  if (ready && !sessionUser) return <Redirect href="/auth/login" />;

  if (loading) {
    return (
      <Screen padded={false} footer>
        <Wrap py={64}><Txt size={16} lh={24} muted>Đang tải...</Txt></Wrap>
      </Screen>
    );
  }

  const role = profile?.data.role ?? sessionUser?.role;

  return (
    <Screen padded={false} footer>
      <Wrap py={40}>
        <Txt size={30} lh={36} weight="700">Hồ sơ cá nhân</Txt>

        <View style={{ marginTop: 24, flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 20 }}>
          {/* FORM CHỈNH SỬA */}
          <View
            style={{
              flex: isMd ? 1 : undefined, width: isMd ? undefined : "100%", minWidth: 0, gap: 16, padding: 24,
              backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl,
            }}
          >
            {message ? (
              <Txt size={14} lh={20} color={isError ? colors.destructive : colors.primary}>{message}</Txt>
            ) : null}

            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Avatar uri={form.avatar} name={form.full_name} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt size={14} lh={20} weight="500">Ảnh đại diện (URL)</Txt>
                {/* giống <input type="file">: nút "Chọn tệp" + tên tệp */}
                <Pressable
                  onPress={saving ? undefined : handleAvatarChange}
                  style={{
                    marginTop: 4, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8,
                    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
                  }}
                >
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }}>
                    <Txt size={14} lh={20}>Chọn tệp</Txt>
                  </View>
                  <Txt size={14} lh={20} muted numberOfLines={1} style={{ flex: 1 }}>{fileName || "Chưa chọn tệp nào"}</Txt>
                </Pressable>
              </View>
            </View>

            <Field dense icon="user" label="Họ và tên" value={form.full_name} onChangeText={(v) => setForm({ ...form, full_name: v })} />
            <Field dense icon="mail" label="Email" value={profile?.data.email ?? ""} onChangeText={() => {}} editable={false} />
            <Field dense icon="phone" label="Số điện thoại" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
            <Field dense icon="map-pin" label="Địa chỉ" value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />

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
          </View>

          {/* CỘT PHẢI: thông tin nhanh + lối tắt */}
          <View style={{ width: isMd ? 260 : "100%", gap: 16 }}>
            <View
              style={{
                alignItems: "center", padding: 20, backgroundColor: colors.card, borderWidth: 1,
                borderColor: colors.border, borderRadius: radius.xxl,
              }}
            >
              <Avatar uri={form.avatar} name={form.full_name} />
              <Txt size={16} lh={24} weight="600" center style={{ marginTop: 12 }}>{form.full_name || "—"}</Txt>
              <View style={{ marginTop: 4, paddingHorizontal: 10, paddingVertical: 2, borderRadius: radius.full, backgroundColor: "rgba(27,126,42,0.1)" }}>
                <Txt size={12} lh={16} weight="500" color={colors.primary}>{role ? ROLE_LABEL[role] ?? role : "—"}</Txt>
              </View>
              {profile?.data.created_at ? (
                <Txt size={12} lh={16} muted style={{ marginTop: 8 }}>Tham gia từ {formatDate(profile.data.created_at)}</Txt>
              ) : null}
            </View>

            <View style={{ padding: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl }}>
              {role === "buyer" ? <Shortcut href="/orders" icon="shopping-bag" label="Đơn hàng của tôi" /> : null}
              {role === "seller" ? (
                <>
                  <Shortcut href="/seller" icon="layout-dashboard" label="Kênh nông dân" />
                  <Shortcut href="/seller/batches" icon="package" label="Lô hàng của tôi" />
                </>
              ) : null}
              {role === "admin" ? <Shortcut href="/admin" icon="layout-dashboard" label="Trang quản trị" /> : null}
              <Shortcut icon="log-out" label="Đăng xuất" danger onPress={handleLogout} />
            </View>
          </View>
        </View>
      </Wrap>
    </Screen>
  );
}
