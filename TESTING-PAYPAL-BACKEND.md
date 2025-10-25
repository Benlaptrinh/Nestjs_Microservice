# 🧪 Cách Kiểm Tra PayPal Backend Hoạt Động

## ⚡ Kiểm tra nhanh (1 phút)

### Option 1: Dùng Test Script Tự động
```bash
node test-paypal.js
```

Script sẽ kiểm tra:
- ✅ Payment service có đang chạy không
- ✅ Auth service có đang chạy không  
- ✅ Database có kết nối được không
- ✅ Các API endpoints có hoạt động không

### Option 2: Test thủ công với curl

```bash
# 1. Kiểm tra service đang chạy
curl http://localhost:3008/payment/plans

# Response mong đợi: JSON array với 4 plans
[
  {"plan":"FREE","name":"Free","price":0,...},
  {"plan":"BASIC","name":"Basic","price":9.99,...},
  ...
]
```

Nếu nhận được response JSON ở trên → **Backend đang hoạt động tốt!**

---

## 🔍 Kiểm tra chi tiết từng endpoint

### Chuẩn bị

1. **Cài VS Code Extension:** REST Client (humao.rest-client)
2. **Mở file:** `test-paypal-backend.http`
3. **Lấy JWT Token:**
   - Chạy request `### 2. Login` trong file `.http`
   - Copy `access_token` từ response
   - Paste vào biến `@jwtToken` ở đầu file

### Test theo thứ tự

#### 1️⃣ Test Lấy Danh Sách Gói (Không cần auth)
```http
GET http://localhost:3008/payment/plans
```

**Kết quả mong đợi:**
- Status: 200 OK
- Body: Array of 4 subscription plans

**Nếu lỗi:**
- `ECONNREFUSED` → Payment service chưa chạy, run: `npm run start:dev payment`
- `500 Error` → Kiểm tra database connection

---

#### 2️⃣ Test Tạo PayPal Order (Cần JWT)
```http
POST http://localhost:3008/payment/create-order
Authorization: Bearer <YOUR_JWT_TOKEN>

{
  "plan": "PREMIUM"
}
```

**Kết quả mong đợi:**
```json
{
  "orderId": "5O190127TN364715T",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "amount": 19.99,
  "currency": "USD"
}
```

**Nếu lỗi:**
| Lỗi | Nguyên nhân | Giải pháp |
|------|------------|-----------|
| `401 Unauthorized` | JWT token không hợp lệ | Login lại để lấy token mới |
| `PayPal credentials not configured` | Chưa cấu hình PAYPAL_CLIENT_ID/SECRET | Xem `HOW-TO-GET-PAYPAL-CREDENTIALS.md` |
| `Failed to create PayPal order` | PayPal API error | Kiểm tra credentials đúng không, network OK không |

---

#### 3️⃣ Test Thanh Toán PayPal (Manual)

Sau khi tạo order thành công:

1. **Mở `approvalUrl`** trong browser
2. **Login PayPal Sandbox:**
   - Email: `sb-tvqwj41683258@personal.example.com`
   - Password: [Lấy từ PayPal Dashboard]
3. **Click "Pay Now"**
4. PayPal sẽ redirect về `APP_URL/payment/success?token=ORDER_ID`

---

#### 4️⃣ Test Capture Order (Hoàn tất thanh toán)
```http
POST http://localhost:3008/payment/capture-order
Authorization: Bearer <YOUR_JWT_TOKEN>

{
  "orderId": "5O190127TN364715T"
}
```

**Kết quả mong đợi:**
```json
{
  "transactionId": 1,
  "status": "COMPLETED",
  "subscription": {
    "plan": "PREMIUM",
    "startDate": "2025-10-25...",
    "endDate": "2025-11-24..."
  }
}
```

**Nếu lỗi:**
| Lỗi | Nguyên nhân | Giải pháp |
|------|------------|-----------|
| `Transaction not found` | OrderId sai hoặc không thuộc user | Kiểm tra orderId từ step 2 |
| `Transaction already completed` | Đã capture rồi | Order này đã hoàn tất, tạo order mới |
| `Failed to capture` | Chưa approve trên PayPal | Phải mở approvalUrl và click Pay Now trước |

---

#### 5️⃣ Test Xem Subscription Hiện Tại
```http
GET http://localhost:3008/payment/subscription
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Kết quả mong đợi:**
```json
{
  "plan": "PREMIUM",
  "status": "ACTIVE",
  "startDate": "2025-10-25...",
  "endDate": "2025-11-24...",
  "features": [...]
}
```

---

#### 6️⃣ Test Xem Lịch Sử Giao Dịch
```http
GET http://localhost:3008/payment/transactions
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**Kết quả mong đợi:**
```json
[
  {
    "id": 1,
    "paypalOrderId": "5O190127TN364715T",
    "amount": 19.99,
    "status": "COMPLETED",
    "createdAt": "...",
    ...
  }
]
```

---

## 🐛 Troubleshooting

### Payment service không khởi động được

```bash
# Kiểm tra lỗi
npm run start:dev payment

# Nếu lỗi "PayPal credentials not configured"
# → Kiểm tra .env.development có PAYPAL_CLIENT_ID và PAYPAL_CLIENT_SECRET
```

### Database connection failed

```bash
# Kiểm tra PostgreSQL đang chạy
pg_ctl status

# Kiểm tra credentials trong .env.development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=quiz_db
```

### PayPal API returns error

```bash
# Kiểm tra credentials có đúng không
# Vào https://developer.paypal.com/dashboard/applications/sandbox
# Copy lại Client ID và Secret

# Kiểm tra PAYPAL_MODE
PAYPAL_MODE=sandbox  # Phải là sandbox cho test
```

---

## ✅ Checklist Trước Khi Test Frontend

- [ ] Payment service đang chạy (`http://localhost:3008`)
- [ ] Auth service đang chạy (`http://localhost:3001`)
- [ ] Database PostgreSQL đang chạy
- [ ] Đã cấu hình PayPal credentials trong `.env.development`
- [ ] Đã test được endpoint `/payment/plans` (200 OK)
- [ ] Đã có JWT token hợp lệ
- [ ] Đã test tạo order thành công
- [ ] Đã có password của Personal sandbox account

---

## 🚀 Sẵn sàng cho Frontend

Khi tất cả tests pass, bạn có thể tích hợp frontend:

### API Base URL
```javascript
const PAYMENT_API = 'http://localhost:3008/payment';
```

### Flow tích hợp

```javascript
// 1. Lấy danh sách gói
const plans = await fetch(`${PAYMENT_API}/plans`).then(r => r.json());

// 2. User chọn gói và click "Upgrade"
const { orderId, approvalUrl } = await fetch(`${PAYMENT_API}/create-order`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ plan: 'PREMIUM' })
}).then(r => r.json());

// 3. Redirect user đến PayPal
window.location.href = approvalUrl;

// 4. Sau khi PayPal redirect về /payment/success?token=ORDER_ID
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('token');

// 5. Capture payment
await fetch(`${PAYMENT_API}/capture-order`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ orderId })
}).then(r => r.json());

// 6. Hiển thị thành công!
```

---

**💡 Tip:** Nếu bạn gặp lỗi ở Frontend, hãy:
1. Chạy lại `node test-paypal.js` để đảm bảo backend OK
2. Kiểm tra Network tab trong browser DevTools
3. Kiểm tra console logs của payment service
