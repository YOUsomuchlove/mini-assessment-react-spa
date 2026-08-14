# Mini Assessment SPA

Frontend React cho hệ thống **Mini Assessment**. Ứng dụng kết nối với Mini Assessment WordPress Plugin để hiển thị và quản lý bài đánh giá, câu hỏi và câu trả lời.

## 1. Tổng quan

| Thành phần | Công nghệ | Vai trò |
| --- | --- | --- |
| Frontend | React 19, Vite, Ant Design | Giao diện người dùng đa ngôn ngữ Việt/Anh |
| Backend | WordPress + Mini Assessment Plugin | REST API, dữ liệu, phân quyền và xác thực |
| Xác thực | JWT + refresh token HttpOnly | Đăng nhập an toàn, tự làm mới phiên |

Các chức năng chính:

- Xem Assessment công khai, tìm kiếm và phân trang.
- Xem Question và toàn bộ Answer của từng Question.
- Tạo Assessment, Question, Answer theo quyền role được cấu hình trong wp-admin.
- Hiển thị giao diện tiếng Việt tại `/vi` và tiếng Anh tại `/en`.
- Access token hết hạn sau 15 phút và tự gia hạn bằng refresh token; người dùng không phải đăng nhập lại khi refresh token còn hiệu lực.

## 2. Yêu cầu trước khi chạy

- Node.js 20 trở lên (khuyến nghị bản LTS).
- Một website WordPress đã cài và kích hoạt **Mini Assessment Plugin**.
- URL WordPress REST API, theo mẫu: `https://ten-mien-wordpress.com/wp-json`.

Kiểm tra Node.js và npm:

```bash
node --version
npm --version
```

## 3. Cấu hình môi trường

Dự án đã có sẵn tệp cấu hình mẫu. Không tự tạo lại từ đầu.

| Mục đích | Tệp mẫu | Tệp cần dùng |
| --- | --- | --- |
| Phát triển trên máy cá nhân | `.env.example` | `.env.local` |
| Build để triển khai thật | `.env.production.example` | `.env.production` |

Sao chép tệp mẫu rồi sửa một dòng duy nhất:

```text
VITE_API_BASE_URL=https://ten-mien-wordpress.com/wp-json
```

Lưu ý: các tệp `.env.local` và `.env.production` không được đưa lên GitHub.

## 4. Chạy môi trường phát triển

### Cách 1 — dùng `npm start`

```bash
npm install
npm start
```

Lệnh này khởi chạy Vite ở chế độ phát triển và cho phép thiết bị khác trong cùng mạng truy cập khi firewall cho phép.

### Cách 2 — dùng `npm run dev`

```bash
npm install
npm run dev
```

Sau khi chạy, mở URL Vite in ra trên terminal, thường là `http://localhost:5173`.

`npm start` và `npm run dev` chỉ dành cho phát triển/kiểm thử; không dùng làm dịch vụ production.

### Chạy đồng thời bằng Docker

Từ thư mục gốc chứa `docker-compose.yml`:

```bash
docker compose up -d db wordpress frontend
```

- WordPress: `http://localhost:8081`
- Frontend: `http://localhost:5173`

Lần đầu, đăng nhập WordPress, kích hoạt **Mini Assessment Plugin**, rồi cấu hình quyền trong **Mini Assessment** ở wp-admin.

Để dừng Docker:

```bash
docker compose down
```

Mật khẩu trong `docker-compose.yml` chỉ là cấu hình demo local. Không dùng các mật khẩu này trên máy chủ thật.

## 5. Build và kiểm tra trước khi bàn giao

```bash
npm ci
npm run lint
npm run build
```

- `npm ci`: cài đúng phiên bản thư viện đã khóa trong `package-lock.json`.
- `npm run lint`: kiểm tra chất lượng mã nguồn.
- `npm run build`: tạo bản release tối ưu trong thư mục `dist`.

Có thể kiểm tra bản build tại máy trước khi upload:

```bash
npm run preview -- --host 0.0.0.0
```

`npm run preview` chỉ để nghiệm thu bản build, không phải web server production lâu dài.

## 6. Triển khai môi trường thật

1. Sao chép `.env.production.example` thành `.env.production`.
2. Điền URL WordPress thật vào `VITE_API_BASE_URL`.
3. Chạy `npm ci` và `npm run build` trên máy build/CI.
4. Upload **toàn bộ nội dung bên trong** thư mục `dist` lên hosting tĩnh, CDN hoặc thư mục public của web server.
5. Cấu hình web server để mọi route SPA (`/vi`, `/en`, `/vi/assessment/123`, ...) trả về `index.html`.
6. Mở website, đăng nhập thử và kiểm tra tạo/hiển thị Assessment, Question, Answer.

Ví dụ Nginx tối thiểu cho SPA:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Sau khi triển khai, người dùng chỉ truy cập domain website. Không chạy `npm start`, `npm run dev` hoặc `npm run preview` trên máy chủ thật.

## 7. Cấu hình WordPress cho production

1. Cài và kích hoạt Mini Assessment Plugin.
2. Dùng HTTPS cho WordPress và cho website React.
3. Cấu hình URL frontend thật vào CORS của plugin. Ví dụ trong plugin/mu-plugin hoặc `functions.php`:

```php
add_filter( 'wp_assessment_allowed_origins', function() {
    return array( 'https://app.ten-mien-cua-ban.com' );
} );
```

4. Trong wp-admin, mở **Mini Assessment → Role permissions** để cấp quyền tạo/sửa/xóa Assessment, Question, Answer cho các role cần thiết.
5. Đặt `AUTH_KEY` duy nhất trong `wp-config.php`; không đưa khóa này vào mã frontend hoặc GitHub.

## 8. Cấu trúc thư mục

```text
src/
  api/          # Axios client, JWT và refresh token
  locales/      # Hai tệp ngôn ngữ en.js, vi.js
  pages/        # Danh sách, chi tiết Assessment và đăng nhập
  App.jsx       # Route /vi, /en và header
  index.css     # Giao diện dùng chung
public/         # Favicon và icon tĩnh
dist/           # Sinh ra sau npm run build; không commit
```

## 9. Xử lý lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Frontend không gọi được API | Kiểm tra `VITE_API_BASE_URL` và URL có kết thúc bằng `/wp-json`. |
| Lỗi CORS | Thêm đúng domain frontend vào `wp_assessment_allowed_origins` ở WordPress. |
| Đăng nhập không thành công | Kiểm tra tài khoản WordPress, plugin đã kích hoạt và URL API. |
| Vào thẳng `/vi/assessment/...` bị 404 | Kiểm tra cấu hình SPA fallback của hosting/Nginx. |
| Không thấy nút tạo/sửa/xóa | Kiểm tra role hiện tại và ma trận quyền trong wp-admin. |

## 10. Lệnh tham khảo nhanh

```bash
npm start                 # Dev server, mở cho mạng nội bộ
npm run dev               # Dev server trên máy hiện tại
npm run lint              # Kiểm tra mã nguồn
npm run build             # Tạo bản production: dist/
npm run preview           # Xem thử bản build tại máy
docker compose up -d      # Chạy local bằng Docker từ thư mục gốc
docker compose down       # Dừng Docker
```
