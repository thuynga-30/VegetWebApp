# GreenFarmer – React Native (Expo) – chạy Web + iOS + Android

## Chạy thử
```bash
npm install
npx expo install --fix      # đồng bộ phiên bản gói với SDK Expo đang dùng
cp .env.example .env        # chỉnh EXPO_PUBLIC_API_URL nếu cần
npx expo start -c           # nhấn w = web, a = Android, i = iOS, hoặc quét QR bằng Expo Go
```

## Kết nối backend
App gọi backend NestJS giống bản web cũ (không cần `/api`). **Không cần đặt `EXPO_PUBLIC_API_URL`** trong hầu hết trường hợp:
- Web mở bằng `localhost` hoặc IP (vd `https://192.168.2.131:5173`) → tự gọi `<cùng giao thức>://<cùng host>:3000`.
- Điện thoại → IP máy đang chạy Metro + cổng 3000 (cùng Wi-Fi).
- Web chạy trên tên miền thật → `<origin>/api` (reverse proxy như bản Vite cũ).
- Muốn ghi đè: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_PORT`, `EXPO_PUBLIC_API_PROTOCOL` (xem `.env.example`).

Lưu ý: trang https gọi API http sẽ bị trình duyệt chặn (mixed content). Mở web bằng https thì backend cũng phải https,
hoặc đặt `EXPO_PUBLIC_API_PROTOCOL=http` nếu trình duyệt cho phép. Backend cần bật CORS cho origin của web.

## Tiến độ chuyển đổi
- [x] Nền tảng: theme, API/axios, auth, giỏ hàng, UI kit, upload ảnh, quét QR (web + native)
- [x] Giao diện khớp bản ReactJS: header cố định, footer, font Be Vietnam Pro, icon Lucide, gradient
- [x] Trang chủ `src/app/(shop)/index.tsx`
- [x] Đăng nhập / Đăng ký
- [x] Sản phẩm (danh sách, lọc, tìm kiếm, phân trang)
- [x] Chi tiết sản phẩm (kèm đánh giá, thêm vào giỏ)
- [x] Giỏ hàng
- [x] Thanh toán (COD + VNPay)
- [x] Đơn hàng của tôi, Chi tiết đơn, Kết quả thanh toán VNPay
- [x] Truy xuất QR (nhập mã + quét camera web/app)
- [x] Hồ sơ cá nhân (sửa thông tin, đổi ảnh đại diện, đăng xuất)
- [x] Toàn bộ khu vực khách hàng (public) đã chuyển xong
- [x] Seller: khung (sidebar + header) và Tổng quan
- [ ] Seller: Trang trại, Lô hàng, Đơn hàng
- [ ] Khu vực Admin

## Thanh toán VNPay
- **Web:** chuyển hẳn sang trang VNPay, VNPay quay về `/payment/vnpay/return` (cấu hình như bản cũ).
- **App:** mở VNPay trong trình duyệt của ứng dụng. Khi đóng trình duyệt, app chuyển tới chi tiết đơn để xem trạng thái thanh toán.
  Muốn app tự nhận kết quả ngay, backend cần redirect về deep link `greenfarmer://payment/vnpay/return?...` sau khi xác thực.
