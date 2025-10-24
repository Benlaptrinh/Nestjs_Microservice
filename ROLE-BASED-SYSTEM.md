# 🔐 Role-Based Access Control System

## 📋 Tổng Quan

Hệ thống có 3 roles:

### 1. **USER** (Student) - Port 3002
- Role mặc định khi đăng ký
- Quyền hạn: Xem quiz, làm quiz, xem profile, xem lịch sử

### 2. **ADMIN** - Port 3006  
- Quản lý user, quiz, questions
- Thay đổi role của user
- Xem thống kê cơ bản

### 3. **BOSS** - Port 3007
- Xem toàn bộ analytics và reports
- Dashboard tổng quan hệ thống
- Top performers, recent activities

---

## 🚀 Test Role System

### 1. Tạo User với role USER (mặc định)

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "123456",
    "fullName": "Student User"
  }'
```

### 2. Tạo User với role ADMIN

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456",
    "fullName": "Admin User",
    "role": "admin"
  }'
```

### 3. Tạo User với role BOSS

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "boss@example.com",
    "password": "123456",
    "fullName": "Boss User",
    "role": "boss"
  }'
```

---

## 🔑 Test với mỗi Role

### USER/Student APIs (Port 3002)

```bash
# Login as student
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "123456"
  }'

# Lưu token vào biến
TOKEN_STUDENT="your-student-token-here"

# Get student profile
curl -X GET http://localhost:3002/students/profile \
  -H "Authorization: Bearer $TOKEN_STUDENT"

# Update profile
curl -X PUT http://localhost:3002/students/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_STUDENT" \
  -d '{
    "fullName": "Updated Student Name",
    "avatar": "https://example.com/avatar.jpg"
  }'

# Get quiz history
curl -X GET http://localhost:3002/students/quiz-history \
  -H "Authorization: Bearer $TOKEN_STUDENT"
```

### ADMIN APIs (Port 3006)

```bash
# Login as admin
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456"
  }'

# Lưu token
TOKEN_ADMIN="your-admin-token-here"

# Get all users
curl -X GET http://localhost:3006/admin/users \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Get user by ID
curl -X GET http://localhost:3006/admin/users/USER_ID \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Change user role
curl -X PUT http://localhost:3006/admin/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{
    "role": "admin"
  }'

# Toggle user status (active/inactive)
curl -X PATCH http://localhost:3006/admin/users/USER_ID/toggle-status \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Get all quizzes (with questions)
curl -X GET http://localhost:3006/admin/quizzes \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Update quiz
curl -X PUT http://localhost:3006/admin/quizzes/QUIZ_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{
    "title": "Updated Quiz Title",
    "duration": 45
  }'

# Delete quiz
curl -X DELETE http://localhost:3006/admin/quizzes/QUIZ_ID \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Delete question
curl -X DELETE http://localhost:3006/admin/questions/QUESTION_ID \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Get system stats
curl -X GET http://localhost:3006/admin/stats \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

### BOSS APIs (Port 3007)

```bash
# Login as boss
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "boss@example.com",
    "password": "123456"
  }'

# Lưu token
TOKEN_BOSS="your-boss-token-here"

# Dashboard overview
curl -X GET http://localhost:3007/boss/dashboard \
  -H "Authorization: Bearer $TOKEN_BOSS"

# User analytics
curl -X GET http://localhost:3007/boss/analytics/users \
  -H "Authorization: Bearer $TOKEN_BOSS"

# Quiz analytics
curl -X GET http://localhost:3007/boss/analytics/quizzes \
  -H "Authorization: Bearer $TOKEN_BOSS"

# Top 10 performers
curl -X GET http://localhost:3007/boss/top-performers?limit=10 \
  -H "Authorization: Bearer $TOKEN_BOSS"

# Recent activities
curl -X GET http://localhost:3007/boss/recent-activities?limit=20 \
  -H "Authorization: Bearer $TOKEN_BOSS"

# Full report (all analytics)
curl -X GET http://localhost:3007/boss/report/full \
  -H "Authorization: Bearer $TOKEN_BOSS"
```

---

## 🔒 Access Control

### Student (USER) có thể:
- ✅ Xem profile của mình
- ✅ Cập nhật profile của mình
- ✅ Xem quiz
- ✅ Làm quiz
- ✅ Xem lịch sử làm quiz của mình
- ❌ KHÔNG thể xem thông tin user khác
- ❌ KHÔNG thể tạo/sửa/xóa quiz
- ❌ KHÔNG thể xem analytics

### Admin có thể:
- ✅ Tất cả quyền của Student
- ✅ Xem danh sách tất cả users
- ✅ Thay đổi role của users
- ✅ Kích hoạt/vô hiệu hóa user
- ✅ Xem, sửa, xóa tất cả quizzes
- ✅ Xóa questions
- ✅ Xem thống kê cơ bản
- ❌ KHÔNG thể xem analytics chi tiết (Boss only)

### Boss có thể:
- ✅ Tất cả quyền của Admin
- ✅ Xem dashboard tổng quan
- ✅ Xem user analytics
- ✅ Xem quiz analytics
- ✅ Xem top performers
- ✅ Xem recent activities
- ✅ Export full report

---

## 🧪 Test Role Guards

### Test 1: Student cố gắng access Admin endpoint
```bash
# Sẽ trả về 403 Forbidden
curl -X GET http://localhost:3006/admin/users \
  -H "Authorization: Bearer $TOKEN_STUDENT"
```

### Test 2: Admin cố gắng access Boss endpoint
```bash
# Sẽ trả về 403 Forbidden
curl -X GET http://localhost:3007/boss/dashboard \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

### Test 3: Không có token
```bash
# Sẽ trả về 401 Unauthorized
curl -X GET http://localhost:3002/students/profile
```

---

## 📊 Response Examples

### Admin Stats Response:
```json
{
  "users": {
    "total": 25,
    "active": 23,
    "byRole": [
      { "role": "user", "count": "20" },
      { "role": "admin", "count": "3" },
      { "role": "boss", "count": "2" }
    ]
  },
  "quizzes": {
    "total": 10,
    "active": 8
  }
}
```

### Boss Dashboard Response:
```json
{
  "overview": {
    "totalUsers": 25,
    "totalQuizzes": 10,
    "totalAttempts": 150,
    "completedAttempts": 130,
    "averageScore": 75.5
  }
}
```

### Boss Top Performers:
```json
{
  "topPerformers": [
    {
      "rank": 1,
      "userId": "uuid-123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "totalAttempts": 15,
      "averageScore": "92.50",
      "totalScore": 1388
    }
  ]
}
```

---

## 🔄 Workflow

### 1. Tạo Quiz (Admin)
```
Admin → Create Quiz → Add Questions
```

### 2. Student làm Quiz
```
Student → View Quizzes → Start Quiz → Submit Answers → Get Score
```

### 3. Boss xem báo cáo
```
Boss → View Dashboard → See Analytics → Check Top Performers
```

### 4. Admin quản lý users
```
Admin → View Users → Change Role / Toggle Status
```

---

## 📝 Notes

- **Default role**: Khi đăng ký không truyền `role`, mặc định là `USER`
- **Role immutable**: Student không thể tự thay đổi role của mình
- **Password**: Student không thể update password qua profile API (cần API riêng)
- **Token includes role**: JWT token chứa role để validate quyền hạn

---

## ⚙️ Chạy Services

```bash
# Start all services
npm run start:auth       # Port 3001
npm run start:student    # Port 3002
npm run start:quiz       # Port 3003
npm run start:answer     # Port 3004
npm run start:statistic  # Port 3005
npm run start:admin      # Port 3006
npm run start:boss       # Port 3007
```

Hoặc chạy tất cả cùng lúc:
```bash
npm install -D concurrently
npm run start:all
```
