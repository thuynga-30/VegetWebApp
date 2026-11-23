import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Misc";
import { AuthShell, SocialButton } from "@/components/common/AuthShell";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { errMessage } from "@/lib/errors";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login(form.email.trim(), form.password);
      await login(res.user, res.token);
      if (res.user.role === "seller") router.replace("/seller");
      else if (res.user.role === "admin") router.replace("/admin");
      else router.replace("/");
    } catch (err) {
      setError(errMessage(err, "Đăng nhập thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell heading="Chào mừng trở lại" text="Nông sản sạch, truy xuất tận gốc — chỉ vài chạm là đến bàn ăn.">
      <Txt size={24} lh={32} weight="700" style={{ marginTop: 32 }}>Đăng nhập</Txt>
      <Txt size={14} lh={20} muted style={{ marginTop: 4 }}>Nhập email và mật khẩu để tiếp tục</Txt>

      <View style={{ marginTop: 24, gap: 16 }}>
        {error ? <Txt size={14} lh={20} color={colors.destructive}>{error}</Txt> : null}

        <Field label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
        <Field label="Mật khẩu" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry autoCapitalize="none" returnKeyType="go" onSubmitEditing={handleSubmit} />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Checkbox checked={remember} onChange={setRemember} label="Ghi nhớ" />
          <Pressable><Txt size={14} lh={20} color={colors.primary}>Quên mật khẩu?</Txt></Pressable>
        </View>

        <Button title="Đăng nhập" onPress={handleSubmit} loading={loading} full />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 24 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Txt size={12} lh={16} muted>hoặc tiếp tục với</Txt>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <SocialButton label="Google" />
        <SocialButton label="Facebook" />
      </View>

      <Txt size={14} lh={20} muted center style={{ marginTop: 24 }}>
        Chưa có tài khoản?{" "}
        <Link href="/auth/register" style={{ color: colors.primary, fontFamily: "BeVietnamPro_500Medium" }}>Đăng ký ngay</Link>
      </Txt>
    </AuthShell>
  );
}
