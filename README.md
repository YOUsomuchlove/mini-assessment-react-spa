# Mini Assessment SPA

Giao diện React cho hệ thống Mini Assessment.

## Khởi chạy nhanh

1. Cài đặt thư viện:

   ```bash
   npm install
   ```

2. Sao chép tệp cấu hình mẫu `.env.example` và đổi tên bản sao thành `.env.local`.

3. Mở `.env.local` và chỉ sửa giá trị `VITE_API_BASE_URL` thành đường dẫn WordPress/API của bạn. Nếu dùng Docker đi kèm dự án, giữ nguyên giá trị mẫu.

4. Chạy ứng dụng:

   ```bash
   npm run dev
   ```

Mở địa chỉ mà Vite hiển thị trên terminal, thường là `http://localhost:5173`.

## Ghi chú

- Không cần tự tạo tệp cấu hình; luôn bắt đầu bằng `.env.example`.
- Không đưa `.env.local` lên GitHub vì đây là cấu hình của từng môi trường.
