# GreenFarmer – React Native (Expo) – chạy Web + iOS + Android

## Chạy thử
```bash
npm install
npx expo install --fix      # đồng bộ phiên bản gói với SDK Expo đang dùng
cp .env.example .env        # chỉnh EXPO_PUBLIC_API_URL nếu cần
npx expo start -c           # nhấn w = web, a = Android, i = iOS, hoặc quét QR bằng Expo Go
```

## Kết nối backend
App gọi backend NestJS giống bản web cũ (không cần `/api`).
- Web: mặc định `http://localhost:3000` → backend phải bật **CORS** cho origin `http://localhost:8081`.
- Điện thoại: tự lấy IP máy chạy Metro + cổng 3000 (điện thoại và máy cùng Wi-Fi).
- Đặt `EXPO_PUBLIC_API_URL` để chỉ định rõ.

## Tiến độ chuyển đổi
- [x] Nền tảng: theme, API/axios, auth, giỏ hàng, UI kit, upload ảnh, quét QR (web + native)
- [x] Giao diện khớp bản ReactJS: header cố định, footer, font Be Vietnam Pro, icon Lucide, gradient
- [x] Trang chủ `src/app/(shop)/index.tsx`
- [x] Đăng nhập / Đăng ký
- [x] Sản phẩm (danh sách, lọc, tìm kiếm, phân trang)
- [x] Chi tiết sản phẩm (kèm đánh giá, thêm vào giỏ)
- [x] Giỏ hàng
- [ ] Truy xuất, Giỏ hàng, Thanh toán, Đơn hàng, Hồ sơ
- [ ] Khu vực Seller, khu vực Admin
