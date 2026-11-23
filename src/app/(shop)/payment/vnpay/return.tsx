import { useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { colors } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { paymentService } from "@/services/paymentService";

/** Chuỗi query gửi lên backend để xác thực chữ ký VNPay */
function useQueryString(): string {
  const params = useLocalSearchParams();
  // Web: lấy nguyên văn location.search như bản gốc (tránh sai lệch mã hóa làm hỏng chữ ký)
  if (Platform.OS === "web" && typeof window !== "undefined") return window.location.search;
  const parts: string[] = [];
  Object.entries(params).forEach(([k, v]) => {
    (Array.isArray(v) ? v : [v]).forEach((val) => parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(val ?? ""))}`));
  });
  return parts.length ? `?${parts.join("&")}` : "";
}

export default function PaymentResultPage() {
  const search = useQueryString();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    setStatus("loading");
    paymentService
      .verifyVnpayReturn(search)
      .then((res) => {
        setMessage(res.message);
        setOrderId(res.orderId ?? null);
        setStatus(res.success ? "success" : "failed");
      })
      .catch(() => setStatus("failed"));
  }, [search]);

  return (
    <Screen padded={false} footer>
      <View style={{ width: "100%", maxWidth: 448, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 64, alignItems: "center" }}>
        {status === "loading" ? <Txt size={16} lh={24} center>Đang xác nhận thanh toán...</Txt> : null}

        {status === "success" ? (
          <>
            <Txt size={24} lh={32} weight="700" color={colors.primary} center style={{ marginBottom: 8 }}>Thanh toán thành công</Txt>
            <Txt size={16} lh={24} muted center style={{ marginBottom: 24 }}>{message}</Txt>
            <Link href={orderId ? `/orders/${orderId}` : "/orders"} asChild>
              <Pressable><Txt size={16} lh={24} weight="500" color={colors.primary}>Xem đơn hàng của bạn →</Txt></Pressable>
            </Link>
          </>
        ) : null}

        {status === "failed" ? (
          <>
            <Txt size={24} lh={32} weight="700" color={colors.destructive} center style={{ marginBottom: 8 }}>Thanh toán thất bại</Txt>
            <Txt size={16} lh={24} muted center style={{ marginBottom: 24 }}>{message}</Txt>
            <Link href="/checkout" asChild>
              <Pressable><Txt size={16} lh={24} weight="500" color={colors.primary}>Thử lại →</Txt></Pressable>
            </Link>
          </>
        ) : null}
      </View>
    </Screen>
  );
}
