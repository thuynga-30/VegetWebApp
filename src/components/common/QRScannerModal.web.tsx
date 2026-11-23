import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Html5Qrcode } from "html5-qrcode";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

/** Quét QR trên trình duyệt (cần HTTPS hoặc localhost) bằng html5-qrcode */
export function QRScannerModal({ onScan, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Vùng hiển thị riêng cho mỗi lần bật camera (tránh xung đột khi effect chạy 2 lần)
    const target = document.createElement("div");
    target.id = `qr-reader-${Math.random().toString(36).slice(2)}`;
    container.appendChild(target);

    const scanner = new Html5Qrcode(target.id);
    let handled = false;

    const starting = scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (w: number, h: number) => {
            const size = Math.floor(Math.min(w, h) * 0.7);
            return { width: size, height: size };
          },
        },
        (decodedText: string) => {
          if (handled) return;
          handled = true;
          onScanRef.current(decodedText);
        },
        () => {
          /* bỏ qua lỗi từng khung hình không đọc được */
        }
      )
      .catch((err: unknown) => {
        const msg = String(err);
        if (/permission|denied|NotAllowed/i.test(msg)) {
          setError("Bạn chưa cấp quyền truy cập camera. Hãy cho phép camera trong trình duyệt rồi thử lại.");
        } else if (/NotFound|no camera|Requested device not found/i.test(msg)) {
          setError("Không tìm thấy camera trên thiết bị này.");
        } else {
          setError("Không mở được camera. Trang cần chạy trên HTTPS hoặc localhost.");
        }
      });

    return () => {
      starting
        .then(() => scanner.stop())
        .catch(() => {
          /* camera chưa chạy thì bỏ qua */
        })
        .finally(() => target.remove());
    };
  }, []);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: colors.overlay, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Pressable onPress={() => {}} style={{ width: "100%", maxWidth: 440, backgroundColor: colors.card, borderRadius: radius.xl, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Txt variant="h3">Quét mã QR</Txt>
            <Pressable onPress={onClose} accessibilityLabel="Đóng">
              <Icon name="x" size={20} />
            </Pressable>
          </View>

          {/* Vùng DOM cho html5-qrcode */}
          <div ref={containerRef} style={{ width: "100%", minHeight: 240, overflow: "hidden", borderRadius: 12, background: "#000" }} />

          {error ? (
            <Txt variant="small" color={colors.destructive} center>{error}</Txt>
          ) : (
            <Txt variant="small" muted center>Đưa mã QR trên bao bì vào khung hình để quét.</Txt>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
