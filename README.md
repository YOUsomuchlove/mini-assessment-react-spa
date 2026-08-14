# Mini Assessment SPA

Giao diện React cho hệ thống Mini Assessment.

## Dành cho lập trình viên (môi trường phát triển)

1. Chạy `npm install`.
2. Sao chép `.env.example` thành `.env.local`.
3. Chạy `npm run dev`.

`npm run dev` chỉ dùng để lập trình và kiểm tra trên máy cá nhân.

## Dành cho triển khai thật

1. Sao chép `.env.production.example` thành `.env.production`.
2. Trong `.env.production`, thay `VITE_API_BASE_URL` bằng URL API WordPress thật của khách hàng, ví dụ `https://api.example.com/wp-json`.
3. Chạy:

   ```bash
   npm ci
   npm run build
   ```

4. Upload **toàn bộ nội dung bên trong** thư mục `dist` lên hosting/CDN của website.

Sau bước này người dùng chỉ truy cập website đã triển khai; không cần, và không nên, chạy `npm run dev` trên máy chủ thật.

## Lưu ý

- `.env.local` và `.env.production` là cấu hình theo từng môi trường, không đưa lên GitHub.
- Tên miền website React cần được cho phép trong cấu hình CORS của WordPress trước khi đưa vào sử dụng thật.
