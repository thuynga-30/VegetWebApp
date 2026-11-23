import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Misc";
import { AuthShell } from "@/components/common/AuthShell";
import { authService } from "@/services/authService";
import { errMessage } from "@/lib/errors";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", address: "" });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (Object.values(form).some((v) => !v.trim())) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (!agree) {
      setError("Vui lòng đồng ý với điều khoản và chính sách bảo mật.");
      return;
    }
    setLoading(true);
    try {
      await authService.register({ ...form, email: form.email.trim(), role });
      router.replace("/auth/login");
    } catch (err) {
      setError(errMessage(err, "Đăng ký thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell heading="Tham gia GreenFarmer" text="Mua nông sản sạch hoặc bán sản phẩm của trang trại bạn.">
      <Txt size={24} lh={32} weight="700" style={{ marginTop: 32 }}>Đăng ký tài khoản</Txt>

      {/* grid grid-cols-2 gap-2 p-1 rounded-lg bg-muted mt-5 */}
      <View style={{ flexDirection: "row", gap: 8, padding: 4, borderRadius: radius.lg, backgroundColor: colors.muted, marginTop: 20 }}>
        {(["buyer", "seller"] as const).map((r) => {
          const on = role === r;
          return (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[
                { flex: 1, paddingVertical: 8, borderRadius: radius.md, alignItems: "center", borderWidth: 1, borderColor: "transparent" },
                on && {
                  backgroundColor: colors.card, borderColor: colors.border, shadowColor: "#000", shadowOpacity: 0.08,
                  shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
                },
              ]}
            >
              <Txt size={14} lh={20} weight="500" color={on ? colors.foreground : colors.mutedFg}>
                {r === "buyer" ? "Người mua" : "Nông dân / Người bán"}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 20, gap: 16 }}>
        {error ? <Txt size={14} lh={20} color={colors.destructive}>{error}</Txt> : null}

        <Field label="Họ và tên" value={form.full_name} onChangeText={set("full_name")} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Field style={{ flex: 1 }} label="Số điện thoại" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" />
          <Field style={{ flex: 1 }} label="Email" value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <Field label="Mật khẩu" value={form.password} onChangeText={set("password")} secureTextEntry autoCapitalize="none" />
        <Field label="Địa chỉ" value={form.address} onChangeText={set("address")} />

        <Checkbox top checked={agree} onChange={setAgree} label="Tôi đồng ý với điều khoản và chính sách bảo mật của GreenFarmer" />

        <Button title="Tạo tài khoản" onPress={handleSubmit} loading={loading} full />
      </View>

      <Txt size={14} lh={20} muted center style={{ marginTop: 24 }}>
        Đã có tài khoản?{" "}
        <Link href="/auth/login" style={{ color: colors.primary, fontFamily: "BeVietnamPro_500Medium" }}>Đăng nhập</Link>
      </Txt>
    </AuthShell>
  );
}
