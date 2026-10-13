# CỔNG TRA CỨU THỦ TỤC HÀNH CHÍNH ĐẤT ĐAI TP. HỒ CHÍ MINH

Ứng dụng web tra cứu thủ tục hành chính lĩnh vực Đất đai và hệ thống văn bản quy phạm pháp luật tại TP. Hồ Chí Minh theo:
- **Quyết định số 5548/QĐ-UBND** ngày 26/08/2026 của UBND TP.HCM.
- **Luật Đất đai 2024** (Luật số 31/2024/QH15).
- Các Nghị định: 101/2024/NĐ-CP, 102/2024/NĐ-CP, 103/2024/NĐ-CP, 88/2024/NĐ-CP, 123/2024/NĐ-CP.
- Nghị quyết số 254/2025/QH15 & Nghị định 49/2026/NĐ-CP.

---

## 🚀 Tính năng nổi bật
1. **Tra cứu 46 thủ tục hành chính**: Phân loại chi tiết **30 thủ tục cấp Tỉnh** và **16 thủ tục cấp Xã**.
2. **Tìm kiếm thời gian thực**: Tìm theo từ khóa, mã TTHC, thẩm quyền, cơ quan thụ lý.
3. **Xem chi tiết thủ tục**: Trình tự thực hiện, thời hạn giải quyết, căn cứ pháp lý áp dụng.
4. **Tiện ích công vụ**: Hỗ trợ in phiếu hướng dẫn (chuẩn in Print), sao chép thông tin nhanh.
5. **Thư viện pháp luật**: Danh mục tóm tắt các Luật, Nghị định và Quyết định cốt lõi.

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI LÊN VERCEL

### Cách 1: Triển khai qua GitHub (Khuyên dùng - Nhanh & Tự động cập nhật)

1. **Tạo repository mới trên GitHub**:
   - Truy cập [github.com/new](https://github.com/new)
   - Đặt tên repository (ví dụ: `tra-cuu-tthc-dat-dai-hcm`), chọn **Public** hoặc **Private**, rồi bấm **Create repository**.

2. **Đẩy mã nguồn từ máy lên GitHub**:
   Mở terminal tại thư mục dự án và chạy các lệnh:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```

3. **Deploy lên Vercel**:
   - Đăng nhập vào [vercel.com](https://vercel.com).
   - Nhấn nút **Add New...** $\rightarrow$ Chọn **Project**.
   - Bấm **Import** bên cạnh repository vừa tạo.
   - Nhấn nút **Deploy**.
   - Sau khoảng 30 giây, website sẽ hoạt động online với tên miền miễn phí dạng:  
     `https://tra-cuu-tthc-dat-dai-hcm.vercel.app`

---

### Cách 2: Triển khai trực tiếp qua Vercel CLI

Nếu bạn muốn deploy trực tiếp từ dòng lệnh mà không qua GitHub:
1. Mở PowerShell và chạy lệnh cài đặt Vercel CLI:
   ```powershell
   npm install -g vercel
   ```
2. Đăng nhập Vercel:
   ```powershell
   vercel login
   ```
3. Triển khai dự án:
   ```powershell
   vercel --prod
   ```
   Làm theo các bước hỏi mặc định (bấm Enter), Vercel sẽ tự động tải lên và cấp link website trực tiếp.
