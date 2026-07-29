# Kết nối trang quản trị với website Vercel

Sau khi hoàn tất, trang `/admin` có thể thêm, sửa, ẩn và xóa căn hộ. Trang
chính đọc cùng dữ liệu nên cập nhật ngay, không cần sửa mã nguồn cho từng căn.

## 1. Tạo kho dữ liệu Supabase

1. Đăng nhập tại https://supabase.com và tạo một project.
2. Mở **SQL Editor**.
3. Sao chép toàn bộ nội dung trong `supabase/setup.sql`, dán vào SQL Editor và
   chọn **Run**.
4. Mở **Authentication → Users → Add user** để tạo email và mật khẩu quản trị.

## 2. Lấy thông tin kết nối

Trong Supabase, mở **Project Settings → Data API** và sao chép:

- Project URL
- Publishable/anon key

Không dùng `service_role` key trong website.

## 3. Thêm thông tin vào Vercel

Trong project Vercel, mở **Settings → Environment Variables** và thêm:

- `VITE_SUPABASE_URL`: Project URL của Supabase
- `VITE_SUPABASE_ANON_KEY`: Publishable/anon key của Supabase

Áp dụng hai biến cho Production, Preview và Development, sau đó redeploy.

## 4. Sử dụng

- Website chính: `/`
- Trang quản trị: `/admin`

Đăng nhập bằng tài khoản đã tạo trong Supabase. Dữ liệu do admin đăng được lưu
trong bảng `apartments`; hình ảnh được lưu trong bucket `apartment-images`.

