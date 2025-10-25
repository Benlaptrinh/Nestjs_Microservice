# Hướng dẫn Tích hợp PayPal Payment - VIP/Premium System

## 🎯 Tổng quan
Hệ thống thanh toán PayPal cho phép người dùng nâng cấp lên các gói VIP/Premium với các tính năng cao cấp.

## 📦 Các gói đăng ký (Subscription Plans)

| Gói | Giá | Thời hạn | Tính năng |
|-----|-----|----------|-----------|
| **FREE** | $0 | Vô thời hạn | Basic quiz access, Limited attempts |
| **BASIC** | $9.99 | 30 ngày | Unlimited quiz attempts, Basic statistics, Remove ads |
| **PREMIUM** | $19.99 | 30 ngày | All Basic + Advanced statistics, Custom quizzes, Priority support |
| **VIP** | $49.99 | 30 ngày | All Premium + Exclusive content, Personal tutor, 1-on-1 support, Certificate |

## 🔑 Bước 1: Lấy PayPal API Credentials

### 1.1 Tạo hoặc chọn App
1. Truy cập: https://developer.paypal.com/dashboard/applications/sandbox
2. Click **"Create App"** hoặc chọn **"Default Application"**
3. Đặt tên app (ví dụ: "Quiz VIP System")

### 1.2 Lấy Client ID và Secret
1. Trong app details, scroll xuống **"API Credentials"**
2. Copy **Client ID** (dạng: `AXX...`)
3. Click **"Show"** để xem **Secret**, rồi copy

### 1.3 Cấu hình .env.development
Mở file `.env.development` và thay thế:
```bash
PAYPAL_CLIENT_ID=AXXxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Client ID của bạn
PAYPAL_CLIENT_SECRET=EXXxxxxxxxxxxxxxxxxxxxxxxxxx  # Secret của bạn
PAYPAL_MODE=sandbox  # Giữ nguyên cho test
APP_URL=http://localhost:3000
```

## 🧪 Bước 2: Sử dụng Sandbox Test Accounts

Bạn đã có sẵn 2 test accounts:

### Business Account (Nhận tiền)
```
Email: sb-ijqht41728252@business.example.com
```

### Personal Account (Trả tiền - dùng để test)
```
Email: sb-tvqwj41683258@personal.example.com
Password: [Xem trong PayPal Dashboard > Testing Tools > Sandbox accounts]
```

**Lưu ý:** Click vào account trong dashboard để xem password!

## 🚀 Bước 3: Khởi chạy Payment Service

### 3.1 Cài đặt dependencies
```bash
npm install
```

### 3.2 Chạy Payment service
```bash
npm run start:dev payment
```

Service sẽ chạy tại: `http://localhost:3008`

## 📡 API Endpoints

### 1. Xem tất cả gói đăng ký
```http
GET http://localhost:3008/payment/plans
```

**Response:**
```json
[
  {
    "plan": "FREE",
    "name": "Free",
    "price": 0,
    "duration": 0,
    "features": ["Basic quiz access", "Limited attempts"]
  },
  {
    "plan": "BASIC",
    "name": "Basic",
    "price": 9.99,
    "duration": 30,
    "features": [...]
  },
  ...
]
```

### 2. Xem subscription hiện tại của user
```http
GET http://localhost:3008/payment/subscription
Authorization: Bearer <JWT_TOKEN>
```

### 3. Tạo PayPal Order (Bắt đầu thanh toán)
```http
POST http://localhost:3008/payment/create-order
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "plan": "PREMIUM",
  "description": "Upgrade to Premium Plan"
}
```

**Response:**
```json
{
  "orderId": "5O190127TN364715T",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T",
  "amount": 19.99,
  "currency": "USD"
}
```

### 4. Capture Payment (Hoàn tất thanh toán)
```http
POST http://localhost:3008/payment/capture-order
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "orderId": "5O190127TN364715T"
}
```

### 5. Xem lịch sử giao dịch
```http
GET http://localhost:3008/payment/transactions
Authorization: Bearer <JWT_TOKEN>
```

## 🧪 Quy trình Test Payment

### Bước 1: Tạo Order
```bash
curl -X POST http://localhost:3008/payment/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan": "PREMIUM"}'
```

### Bước 2: Mở ApprovalUrl
- Copy `approvalUrl` từ response
- Mở trong browser
- Đăng nhập bằng **Personal sandbox account**: `sb-tvqwj41683258@personal.example.com`
- Click **"Pay Now"**

### Bước 3: Capture Payment
Sau khi PayPal redirect về, capture payment:
```bash
curl -X POST http://localhost:3008/payment/capture-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "5O190127TN364715T"}'
```

## 🎨 Tích hợp Frontend (React/Next.js)

### Component: PaymentButton.tsx
\`\`\`tsx
import { useState } from 'react';
import axios from 'axios';

export default function PaymentButton({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Tạo order
      const { data } = await axios.post(
        'http://localhost:3008/payment/create-order',
        { plan },
        {
          headers: {
            Authorization: \`Bearer \${localStorage.getItem('token')}\`
          }
        }
      );

      // 2. Redirect đến PayPal
      window.location.href = data.approvalUrl;
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Thanh toán thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Đang xử lý...' : \`Nâng cấp lên \${plan}\`}
    </button>
  );
}
\`\`\`

### Success Page (app/payment/success/page.tsx)
\`\`\`tsx
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // PayPal orderId

  useEffect(() => {
    if (token) {
      capturePayment(token);
    }
  }, [token]);

  const capturePayment = async (orderId: string) => {
    try {
      await axios.post(
        'http://localhost:3008/payment/capture-order',
        { orderId },
        {
          headers: {
            Authorization: \`Bearer \${localStorage.getItem('token')}\`
          }
        }
      );
      alert('Thanh toán thành công!');
    } catch (error) {
      console.error('Capture failed:', error);
      alert('Xác nhận thanh toán thất bại!');
    }
  };

  return <div>Đang xử lý thanh toán...</div>;
}
\`\`\`

## 🔒 Bảo mật

### Middleware kiểm tra subscription
\`\`\`typescript
// libs/auth/src/guards/subscription.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '@app/database/entities';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    // Check if subscription is expired
    if (subscription?.endDate && new Date() > subscription.endDate) {
      return false;
    }

    return !!subscription;
  }
}
\`\`\`

### Sử dụng Guard
\`\`\`typescript
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Get('premium-content')
async getPremiumContent() {
  return { message: 'VIP content only!' };
}
\`\`\`

## 📊 Database Schema

Đã tạo sẵn 2 tables:

### `subscriptions`
- `id`: Primary key
- `userId`: User ID (foreign key)
- `plan`: FREE | BASIC | PREMIUM | VIP
- `status`: ACTIVE | EXPIRED | CANCELLED | PENDING
- `startDate`: Ngày bắt đầu
- `endDate`: Ngày hết hạn
- `price`: Giá đã trả
- `paypalSubscriptionId`: PayPal subscription ID

### `transactions`
- `id`: Primary key
- `userId`: User ID (foreign key)
- `subscriptionId`: Subscription ID (foreign key)
- `paypalOrderId`: PayPal order ID
- `paypalCaptureId`: PayPal capture ID
- `amount`: Số tiền
- `currency`: Đơn vị tiền tệ
- `status`: PENDING | COMPLETED | FAILED | REFUNDED
- `metadata`: JSON data (chứa plan, v.v.)

## 🔍 Testing & Debugging

### 1. Kiểm tra logs
```bash
# Xem logs của payment service
npm run start:dev payment
```

### 2. Test với curl
```bash
# 1. Login để lấy JWT token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# 2. Tạo order
curl -X POST http://localhost:3008/payment/create-order \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"plan": "BASIC"}'
```

### 3. Xem transactions trong database
```sql
SELECT * FROM transactions ORDER BY "createdAt" DESC;
SELECT * FROM subscriptions WHERE "userId" = 1;
```

## 🚨 Troubleshooting

### Lỗi: "PayPal credentials not configured"
➡️ Kiểm tra `.env.development` đã có `PAYPAL_CLIENT_ID` và `PAYPAL_CLIENT_SECRET`

### Lỗi: "Transaction not found"
➡️ OrderId không đúng hoặc không thuộc về user hiện tại

### Lỗi: "Failed to create PayPal order"
➡️ Kiểm tra Client ID/Secret có đúng không, hoặc network issue

## 📚 Tài liệu tham khảo

- PayPal Developer Docs: https://developer.paypal.com/docs/api/overview/
- PayPal SDK: https://www.npmjs.com/package/@paypal/paypal-server-sdk
- Sandbox Testing: https://developer.paypal.com/docs/api-basics/sandbox/

## ✅ Checklist hoàn thành

- [x] Tạo Payment microservice
- [x] Cài đặt PayPal SDK
- [x] Tạo database schema (Subscription, Transaction)
- [x] Implement Payment service với create/capture order
- [x] Tạo API endpoints
- [ ] Lấy PayPal credentials và cấu hình .env
- [ ] Test payment flow
- [ ] Tích hợp frontend
- [ ] Deploy lên production

---

**Lưu ý:** Nhớ thay thế placeholder credentials trong `.env.development` bằng credentials thật từ PayPal Dashboard!
