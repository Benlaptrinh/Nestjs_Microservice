# 🎯 Hướng dẫn Lấy PayPal API Credentials

## Bước 1: Truy cập PayPal Developer Dashboard

1. Mở trình duyệt và truy cập: https://developer.paypal.com/dashboard/accounts
2. Đăng nhập bằng tài khoản PayPal của bạn

## Bước 2: Lấy Client ID và Secret

### Cách 1: Sử dụng Default Application (Khuyến nghị cho test)

1. Click vào tab **"Apps & Credentials"** ở menu bên trái
2. Đảm bảo đang ở tab **"Sandbox"** (để test)
3. Tìm app **"Default Application"** trong danh sách
4. Click vào tên app để mở chi tiết

### Cách 2: Tạo App mới

1. Click vào tab **"Apps & Credentials"**
2. Click nút **"Create App"**
3. Điền thông tin:
   - App Name: `Quiz VIP System` (hoặc tên tùy ý)
   - App Type: `Merchant`
4. Click **"Create App"**

## Bước 3: Copy Credentials

Sau khi mở app (Default hoặc app mới tạo):

### Client ID
- Tìm section **"API Credentials"**
- **Client ID** hiển thị ngay, copy nó
- Dạng: `AXXxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Client Secret
- Click nút **"Show"** bên cạnh "Secret"
- Copy **Secret** hiển thị
- Dạng: `EXXxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Bước 4: Cấu hình trong Project

Mở file `.env.development` trong project và thay thế:

\`\`\`bash
PAYPAL_CLIENT_ID=paste-client-id-here
PAYPAL_CLIENT_SECRET=paste-client-secret-here
PAYPAL_MODE=sandbox
\`\`\`

**Ví dụ:**
\`\`\`bash
PAYPAL_CLIENT_ID=AZG3lbfiXG6Dscm2SwH0qtN4i4O9e718ZCM1SDDMSno9oOxHQyrnmAQ8P752TOyT35VPhiTSp2Dmeo9w
PAYPAL_CLIENT_SECRET=ENt1Q1amKHNQerj8aotWywMt8EQhlxyNMNRkhWa8sHr-8x6LxxcJ7WZOpqg4rIhULXyXvDshaPFB8EAY
PAYPAL_MODE=sandbox
\`\`\`

## Bước 5: Lấy Test Account Credentials (để test thanh toán)

1. Vào **"Testing Tools" > "Sandbox accounts"**
2. Bạn đã có 2 sandbox accounts:
   - **Business** (nhận tiền): `sb-ijqht41728252@business.example.com`
   - **Personal** (trả tiền): `sb-tvqwj41683258@personal.example.com`

3. Để xem mật khẩu:
   - Click vào dấu **3 chấm (...)** bên phải account
   - Click **"View/Edit account"**
   - Mật khẩu hiển thị ở mục **"System Generated Password"**

## Bước 6: Test Payment Flow

### 1. Khởi chạy service
\`\`\`bash
npm run start:dev payment
\`\`\`

### 2. Tạo order (dùng Postman/curl)
\`\`\`bash
curl -X POST http://localhost:3008/payment/create-order \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"plan": "PREMIUM"}'
\`\`\`

### 3. Mở `approvalUrl` từ response
- Đăng nhập bằng **Personal account**: `sb-tvqwj41683258@personal.example.com`
- Click **"Pay Now"**

### 4. Capture payment
\`\`\`bash
curl -X POST http://localhost:3008/payment/capture-order \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"orderId": "ORDER_ID_FROM_STEP_2"}'
\`\`\`

## ⚠️ Lưu ý quan trọng

### Sandbox vs Live (Production)

- **Sandbox**: Dùng để test, không giao dịch thật
  - URL: https://www.sandbox.paypal.com
  - Credentials: Lấy từ tab "Sandbox" trong dashboard
  
- **Live**: Dùng khi deploy production, giao dịch thật
  - URL: https://www.paypal.com
  - Credentials: Lấy từ tab "Live" trong dashboard
  - Thay `PAYPAL_MODE=production` trong .env

### Bảo mật

- **KHÔNG BAO GIỜ** commit file `.env.development` lên git
- File `.env.development` đã được thêm vào `.gitignore`
- Chỉ sử dụng `.env.example` để hướng dẫn, không chứa secrets thật

### Khắc phục lỗi

1. **"PayPal credentials not configured"**
   - Kiểm tra `.env.development` có `PAYPAL_CLIENT_ID` và `PAYPAL_CLIENT_SECRET`
   - Restart service sau khi thay đổi .env

2. **"Failed to create PayPal order"**
   - Kiểm tra Client ID/Secret có đúng không
   - Kiểm tra `PAYPAL_MODE=sandbox` (hoặc `production`)
   - Kiểm tra network connection

3. **Không thể thanh toán trong sandbox**
   - Sử dụng **Personal sandbox account** để trả tiền
   - Kiểm tra account có đủ tiền ảo (PayPal tự động nạp cho sandbox accounts)

## 📚 Tài liệu tham khảo

- PayPal Developer Dashboard: https://developer.paypal.com/dashboard
- PayPal API Documentation: https://developer.paypal.com/docs/api/overview/
- PayPal SDK: https://www.npmjs.com/package/@paypal/paypal-server-sdk

## ✅ Checklist

- [ ] Đã lấy được Client ID
- [ ] Đã lấy được Client Secret  
- [ ] Đã cấu hình vào `.env.development`
- [ ] Đã lấy được password của Personal sandbox account
- [ ] Đã test thành công payment flow
- [ ] Đã đọc hướng dẫn trong `PAYPAL-INTEGRATION-GUIDE.md`

---

**Chúc bạn tích hợp thành công! 🎉**
