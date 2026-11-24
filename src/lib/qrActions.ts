import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import { notify } from "./dialog";

/** react-native-qrcode-svg: ref.toDataURL(cb) -> base64 PNG (không kèm tiền tố data:) */
function toDataUrl(ref: any): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ref?.toDataURL) return reject(new Error("QR chưa sẵn sàng"));
    ref.toDataURL((b64: string) => resolve(`data:image/png;base64,${b64}`));
  });
}

/** Web: tải ảnh PNG của mã QR. App: sao chép link truy xuất. */
export async function downloadQr(ref: any, code: string, traceUrl: string) {
  if (Platform.OS === "web") {
    const url = await toDataUrl(ref);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${code}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  await Clipboard.setStringAsync(traceUrl);
  notify("Đã sao chép liên kết truy xuất", "Bạn có thể dán liên kết này để chia sẻ hoặc tạo mã QR.");
}

/** Web: mở cửa sổ in chỉ gồm tem QR. App: sao chép link truy xuất. */
export async function printQr(ref: any, code: string, traceUrl: string) {
  if (Platform.OS === "web") {
    const url = await toDataUrl(ref);
    const w = window.open("", "_blank", "width=420,height=520");
    if (!w) return notify("Trình duyệt đã chặn cửa sổ in", "Hãy cho phép cửa sổ bật lên rồi thử lại.");
    w.document.write(
      `<html><head><title>Tem ${code}</title></head><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace">` +
        `<img src="${url}" style="width:260px;height:260px"/><div style="margin-top:12px;font-size:14px">${code}</div>` +
        `<script>window.onload=function(){window.print();}</script></body></html>`
    );
    w.document.close();
    return;
  }
  await Clipboard.setStringAsync(traceUrl);
  notify("Đã sao chép liên kết truy xuất", "In tem hiện chỉ hỗ trợ trên bản web.");
}
