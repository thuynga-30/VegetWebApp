import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/States";
import type { UserRole } from "@/types/user";

/** Thay cho ProtectedRoute: chỉ cho phép đúng vai trò vào khu vực seller / admin */
export function RoleGuard({ allow, children }: { allow: UserRole[]; children: React.ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <View style={{ flex: 1 }}><Loading /></View>;
  if (!user) return <Redirect href="/auth/login" />;
  if (!allow.includes(user.role)) return <Redirect href="/" />;
  return <>{children}</>;
}
