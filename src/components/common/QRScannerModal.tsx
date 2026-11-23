import { useEffect, useRef } from "react";
import { Modal, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Button } from "@/components/ui/Button";

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

/** Quét QR bằng camera (iOS / Android). Bản web nằm ở QRScannerModal.web.tsx */
export function QRScannerModal({ onScan, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission, requestPermission]);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.black }}>
        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => {
              if (handled.current) return; // chỉ xử lý một lần
              handled.current = true;
              onScan(data);
            }}
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
            <Txt color={colors.white} center>
              {permission && !permission.canAskAgain
                ? "Bạn chưa cấp quyền camera. Hãy bật quyền camera cho GreenFarmer trong Cài đặt."
                : "Đang yêu cầu quyền truy cập camera..."}
            </Txt>
          </View>
        )}

        {/* khung ngắm */}
        {permission?.granted ? (
          <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 240, height: 240, borderWidth: 3, borderColor: colors.primaryGlow, borderRadius: 20 }} />
            <Txt color={colors.white} variant="small" style={{ marginTop: 16 }}>Đưa mã QR trên bao bì vào khung hình để quét.</Txt>
          </View>
        ) : null}

        <View style={{ position: "absolute", top: 48, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Txt variant="h3" color={colors.white}>Quét mã QR</Txt>
          <Button title="Đóng" variant="secondary" small onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
