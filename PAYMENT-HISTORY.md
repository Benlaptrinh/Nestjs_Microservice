# Lịch Sử Thanh Toán (Payment History)

## 📊 Thông tin lưu trữ

Hệ thống lưu **đầy đủ thông tin** mỗi giao dịch thanh toán để có thể tra cứu lịch sử:

### Transaction Entity

```typescript
{
  id: number;                    // ID giao dịch trong hệ thống
  userId: string;                // ID người dùng
  paypalOrderId: string;         // PayPal Order ID (unique)
  paypalCaptureId: string;       // PayPal Capture ID khi hoàn tất
  payerId: string;               // PayPal Payer ID
  payerEmail: string;            // Email người thanh toán
  payerName: string;             // Tên người thanh toán
  paymentMethod: 'PAYPAL';       // Phương thức thanh toán
  amount: number;                // Số tiền (19.99)
  currency: string;              // Loại tiền tệ (USD)
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  description: string;           // Mô tả (e.g., "Premium Subscription")
  errorMessage: string;          // Lỗi nếu thanh toán thất bại
  metadata: {                    // Thông tin bổ sung
    plan: 'PREMIUM'              // Gói đã mua
  };
  paypalResponse: object;        // Full response từ PayPal
  createdAt: Date;               // Thời gian tạo order
  completedAt: Date;             // Thời gian hoàn thành thanh toán
  refundedAt: Date;              // Thời gian hoàn tiền (nếu có)
}
```

## 🔍 API Endpoints

### 1. Lấy lịch sử giao dịch

**GET** `/payment/transactions`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
[
  {
    "id": 1,
    "orderId": "7BC341116P248353N",
    "captureId": "5TK12345ABC67890",
    "amount": 19.99,
    "currency": "USD",
    "status": "COMPLETED",
    "paymentMethod": "PAYPAL",
    "description": "Premium Subscription",
    "plan": "PREMIUM",
    "payerEmail": "buyer@example.com",
    "payerName": "John Doe",
    "createdAt": "2025-10-24T20:02:32.450Z",
    "completedAt": "2025-10-24T20:05:15.123Z",
    "refundedAt": null,
    "errorMessage": null
  },
  {
    "id": 2,
    "orderId": "3T8668063H536251U",
    "captureId": null,
    "amount": 9.99,
    "currency": "USD",
    "status": "PENDING",
    "paymentMethod": "PAYPAL",
    "description": "Basic Subscription",
    "plan": "BASIC",
    "payerEmail": null,
    "payerName": null,
    "createdAt": "2025-10-24T19:50:00.000Z",
    "completedAt": null,
    "refundedAt": null,
    "errorMessage": null
  }
]
```

### 2. Trạng thái giao dịch

| Status | Ý nghĩa | Mô tả |
|--------|---------|-------|
| `PENDING` | Đang chờ | Order đã tạo nhưng chưa thanh toán |
| `COMPLETED` | Hoàn thành | Đã thanh toán thành công |
| `FAILED` | Thất bại | Thanh toán thất bại |
| `REFUNDED` | Hoàn tiền | Đã được hoàn tiền |

## 💡 Use Cases

### 1. Hiển thị lịch sử thanh toán cho user

```javascript
// Frontend code
async function getPaymentHistory() {
  const response = await fetch('http://localhost:3008/payment/transactions', {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  
  const transactions = await response.json();
  
  // Display in table
  transactions.forEach(tx => {
    console.log(`${tx.createdAt}: $${tx.amount} - ${tx.status} - ${tx.plan}`);
  });
}
```

### 2. Filter theo trạng thái

```javascript
// Chỉ lấy giao dịch thành công
const completedTransactions = transactions.filter(tx => tx.status === 'COMPLETED');

// Tính tổng tiền đã chi
const totalSpent = completedTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
console.log(`Total spent: $${totalSpent.toFixed(2)}`);
```

### 3. Hiển thị chi tiết từng giao dịch

```javascript
function TransactionDetail({ transaction }) {
  return (
    <div className="transaction-card">
      <h3>Transaction #{transaction.id}</h3>
      <div className="details">
        <p><strong>Order ID:</strong> {transaction.orderId}</p>
        <p><strong>Amount:</strong> ${transaction.amount} {transaction.currency}</p>
        <p><strong>Plan:</strong> {transaction.plan}</p>
        <p><strong>Status:</strong> 
          <span className={`status-${transaction.status.toLowerCase()}`}>
            {transaction.status}
          </span>
        </p>
        {transaction.payerEmail && (
          <p><strong>Paid by:</strong> {transaction.payerName} ({transaction.payerEmail})</p>
        )}
        <p><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleString()}</p>
        {transaction.completedAt && (
          <p><strong>Completed:</strong> {new Date(transaction.completedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
```

## 🎯 Flow hoàn chỉnh

```
1. User tạo order
   → Transaction created với status = PENDING
   → Lưu: userId, amount, plan, description

2. User approve trên PayPal
   → PayPal redirect về /payment/success

3. Frontend gọi /payment/capture-order
   → Transaction updated:
      - status = COMPLETED
      - paypalCaptureId
      - payerEmail, payerName (từ PayPal)
      - completedAt = now
      - paypalResponse = full PayPal data

4. User xem lịch sử
   → GET /payment/transactions
   → Hiển thị tất cả giao dịch với đầy đủ thông tin
```

## 📝 Test Script

Test lịch sử thanh toán:

```bash
# Test full flow và xem history
node test-full-payment-flow.js

# Output sẽ hiển thị:
# ✅ Found 1 transaction(s):
#    Transaction #1:
#    - ID: 2
#    - Order ID: 7BC341116P248353N
#    - Amount: $19.99 USD
#    - Plan: PREMIUM
#    - Status: PENDING
#    - Payment Method: PAYPAL
#    - Description: Premium Subscription
#    - Created At: 2025-10-24T20:02:32.450Z
```

## 🔐 Security Notes

- Transaction history **chỉ trả về giao dịch của user đang login**
- Sử dụng JWT authentication để bảo vệ endpoint
- PayPal response đầy đủ được lưu trong `paypalResponse` để audit
- Lưu cả `errorMessage` khi thanh toán thất bại để debug

## 📊 Database Schema

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  paypalOrderId VARCHAR UNIQUE NOT NULL,
  paypalCaptureId VARCHAR NULL,
  payerId VARCHAR NULL,
  payerEmail VARCHAR NULL,
  payerName VARCHAR NULL,
  paymentMethod VARCHAR NOT NULL DEFAULT 'PAYPAL',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR NOT NULL DEFAULT 'PENDING',
  description TEXT NULL,
  errorMessage TEXT NULL,
  metadata JSON NULL,
  paypalResponse JSON NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  completedAt TIMESTAMP NULL,
  refundedAt TIMESTAMP NULL,
  subscriptionId INT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🎨 Frontend UI Example

```jsx
// Payment History Component
function PaymentHistory() {
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  async function fetchTransactions() {
    const res = await fetch('/payment/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setTransactions(await res.json());
  }
  
  return (
    <div className="payment-history">
      <h2>Payment History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
              <td>{tx.description}</td>
              <td>${tx.amount}</td>
              <td>
                <StatusBadge status={tx.status} />
              </td>
              <td>
                <button onClick={() => showDetails(tx)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## ✅ Kết luận

Hệ thống đã lưu **đầy đủ thông tin** để:

- ✅ Tra cứu lịch sử thanh toán
- ✅ Hiển thị chi tiết từng giao dịch
- ✅ Biết ai đã thanh toán (email, tên)
- ✅ Tracking các giao dịch thất bại
- ✅ Audit trail với PayPal response đầy đủ
- ✅ Hỗ trợ refund trong tương lai
