# 🧪 Hướng Dẫn Test API - Quiz Microservices

## Chuẩn Bị

### 1. Kiểm tra tất cả services đang chạy

```bash
# Terminal 1: Auth Service
npm run start:auth

# Terminal 2: Student Service  
npm run start:student

# Terminal 3: Quiz Service
npm run start:quiz

# Terminal 4: Answer Service
npm run start:answer

# Terminal 5: Statistic Service
npm run start:statistic
```

### 2. Kiểm tra PostgreSQL
```bash
# Kiểm tra database đã được tạo chưa
docker-compose ps
```

---

## 📝 Test Flow - Thực Hành Từng Bước

### BƯỚC 1: Đăng ký User mới

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "123456",
    "fullName": "Nguyen Van A"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "student1@example.com",
    "fullName": "Nguyen Van A"
  }
}
```

**✅ Lưu lại `access_token` này để dùng cho các request tiếp theo!**

---

### BƯỚC 2: Đăng nhập (nếu đã có account)

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "123456"
  }'
```

---

### BƯỚC 3: Xem Profile của mình

```bash
# Thay YOUR_TOKEN bằng access_token nhận được ở bước 1
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "id": "uuid",
  "email": "student1@example.com",
  "fullName": "Nguyen Van A"
}
```

---

### BƯỚC 4: Tạo Quiz mới (Admin/Teacher)

```bash
curl -X POST http://localhost:3003/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "JavaScript Cơ Bản",
    "description": "Test kiến thức JavaScript cho người mới bắt đầu",
    "duration": 30,
    "totalPoints": 100
  }'
```

**Expected Response:**
```json
{
  "id": "quiz-uuid-123",
  "title": "JavaScript Cơ Bản",
  "description": "Test kiến thức JavaScript cho người mới bắt đầu",
  "duration": 30,
  "totalPoints": 100,
  "isActive": true,
  "createdAt": "2025-10-24T..."
}
```

**✅ Lưu lại `quiz-id` này!**

---

### BƯỚC 5: Thêm câu hỏi vào Quiz

```bash
# Câu hỏi 1
curl -X POST http://localhost:3003/quizzes/QUIZ_ID/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questionText": "JavaScript là gì?",
    "options": [
      "Ngôn ngữ lập trình",
      "Framework",
      "Database",
      "Operating System"
    ],
    "correctAnswer": "Ngôn ngữ lập trình",
    "points": 10
  }'
```

```bash
# Câu hỏi 2
curl -X POST http://localhost:3003/quizzes/QUIZ_ID/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questionText": "var, let, const khác nhau như thế nào?",
    "options": [
      "Không khác gì",
      "Khác scope và hoisting",
      "Chỉ khác tên",
      "Không biết"
    ],
    "correctAnswer": "Khác scope và hoisting",
    "points": 10
  }'
```

```bash
# Câu hỏi 3
curl -X POST http://localhost:3003/quizzes/QUIZ_ID/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questionText": "Promise dùng để làm gì?",
    "options": [
      "Xử lý bất đồng bộ",
      "Tạo biến",
      "Tạo function",
      "Không biết"
    ],
    "correctAnswer": "Xử lý bất đồng bộ",
    "points": 10
  }'
```

---

### BƯỚC 6: Xem danh sách tất cả Quiz

```bash
curl -X GET http://localhost:3003/quizzes
```

**Expected Response:**
```json
[
  {
    "id": "quiz-uuid-123",
    "title": "JavaScript Cơ Bản",
    "description": "Test kiến thức...",
    "duration": 30,
    "totalPoints": 100,
    "isActive": true
  }
]
```

---

### BƯỚC 7: Xem chi tiết Quiz và các câu hỏi

```bash
curl -X GET http://localhost:3003/quizzes/QUIZ_ID
```

**Expected Response:**
```json
{
  "id": "quiz-uuid-123",
  "title": "JavaScript Cơ Bản",
  "duration": 30,
  "totalPoints": 100,
  "questions": [
    {
      "id": "question-1",
      "questionText": "JavaScript là gì?",
      "options": ["Ngôn ngữ lập trình", "Framework", "Database", "Operating System"],
      "points": 10
    },
    {
      "id": "question-2",
      "questionText": "var, let, const khác nhau như thế nào?",
      "options": ["Không khác gì", "Khác scope và hoisting", "Chỉ khác tên", "Không biết"],
      "points": 10
    }
  ]
}
```

**⚠️ Chú ý: Câu trả lời đúng KHÔNG được trả về để tránh gian lận!**

---

### BƯỚC 8: Xem Profile Student

```bash
curl -X GET http://localhost:3002/students/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### BƯỚC 9: Update Profile

```bash
curl -X PUT http://localhost:3002/students/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullName": "Nguyen Van A Updated",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

---

### BƯỚC 10: Xem lịch sử làm Quiz

```bash
curl -X GET http://localhost:3002/students/quiz-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (ban đầu sẽ rỗng):**
```json
[]
```

---

## 🎯 Test với Postman hoặc Thunder Client

### Import Collection

1. Mở Postman/Thunder Client
2. Import file dưới đây

### Test Variables

```
BASE_URL_AUTH=http://localhost:3001
BASE_URL_STUDENT=http://localhost:3002
BASE_URL_QUIZ=http://localhost:3003
TOKEN=your-token-here
```

---

## 🔍 Debug & Troubleshooting

### Kiểm tra logs của từng service

```bash
# Xem logs của Auth Service
# Check terminal đang chạy auth service

# Kiểm tra database có dữ liệu chưa
docker exec -it quiz-postgres psql -U postgres -d quiz_db
```

### SQL Queries để check database

```sql
-- Xem users
SELECT * FROM users;

-- Xem quizzes
SELECT * FROM quizzes;

-- Xem questions
SELECT * FROM questions;

-- Xem quiz attempts
SELECT * FROM quiz_attempts;
```

---

## 📊 Test Data Samples

### Tạo thêm Users

```bash
# User 2
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student2@example.com",
    "password": "123456",
    "fullName": "Tran Thi B"
  }'

# User 3
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student3@example.com",
    "password": "123456",
    "fullName": "Le Van C"
  }'
```

### Tạo thêm Quizzes

```bash
# Quiz 2: Python Basics
curl -X POST http://localhost:3003/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Python Cơ Bản",
    "description": "Kiểm tra kiến thức Python",
    "duration": 45,
    "totalPoints": 100
  }'
```

---

## ✅ Checklist Testing

- [ ] Đăng ký user thành công
- [ ] Đăng nhập và nhận token
- [ ] Xem profile với token
- [ ] Tạo quiz mới
- [ ] Thêm câu hỏi vào quiz
- [ ] Xem danh sách quizzes
- [ ] Xem chi tiết quiz
- [ ] Update profile
- [ ] Xem lịch sử quiz

---

## 🚀 Next Steps

Sau khi test xong các API cơ bản, bạn có thể:

1. **Implement Answer Service** để submit câu trả lời và tính điểm
2. **Implement Statistic Service** để xem thống kê
3. **Build API Gateway** để tập trung các request
4. **Add validation** và error handling
5. **Add pagination** cho list APIs
6. **Add search & filter** cho quizzes

Bạn muốn tôi hướng dẫn implement phần nào tiếp theo?
