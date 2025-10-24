# 🗂️ Entity Relationship & Service Logic

## 📚 Entities trong Project

### 1. **User Entity** (Bảng: `users`)
```typescript
class User {
  id: string;              // UUID
  email: string;           // Unique
  password: string;        // Hashed
  fullName: string;
  avatar: string;          // Nullable
  role: UserRole;          // USER | ADMIN | BOSS
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  quizAttempts: QuizAttempt[];
}
```

**Quan hệ:**
- `OneToMany` với `QuizAttempt` (1 user có nhiều lần làm quiz)

---

### 2. **Quiz Entity** (Bảng: `quizzes`)
```typescript
class Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;        // phút
  isActive: boolean;
  
  // Relations
  questions: Question[];
  quizAttempts: QuizAttempt[];
}
```

**Quan hệ:**
- `OneToMany` với `Question` (1 quiz có nhiều câu hỏi)
- `OneToMany` với `QuizAttempt` (1 quiz được làm nhiều lần)

---

### 3. **Question Entity** (Bảng: `questions`)
```typescript
class Question {
  id: string;
  quizId: string;
  questionText: string;
  options: string[];       // JSON array: ["A", "B", "C", "D"]
  correctAnswer: string;
  
  // Relations
  quiz: Quiz;
  answers: Answer[];
}
```

**Quan hệ:**
- `ManyToOne` với `Quiz`
- `OneToMany` với `Answer`

---

### 4. **QuizAttempt Entity** (Bảng: `quiz_attempts`)
```typescript
class QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt: Date;
  
  // Relations
  user: User;
  quiz: Quiz;
  answers: Answer[];
}
```

**Quan hệ:**
- `ManyToOne` với `User`
- `ManyToOne` với `Quiz`
- `OneToMany` với `Answer`

---

### 5. **Answer Entity** (Bảng: `answers`)
```typescript
class Answer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  
  // Relations
  attempt: QuizAttempt;
  question: Question;
}
```

**Quan hệ:**
- `ManyToOne` với `QuizAttempt`
- `ManyToOne` với `Question`

---

## 🔄 Services và Entities

### **Student Service** (Port 3002)
**Mục đích:** Xử lý logic cho users với `role = USER`

**Entities sử dụng:**
```typescript
@InjectRepository(User)           // Đọc/ghi thông tin user
@InjectRepository(QuizAttempt)    // Đọc lịch sử làm quiz
```

**Chức năng:**
- ✅ Xem profile (từ `User`)
- ✅ Update profile: fullName, avatar (vào `User`)
- ✅ Xem lịch sử làm quiz (từ `QuizAttempt` join `Quiz`)
- ❌ KHÔNG update: password, role, email

---

### **Admin Service** (Port 3006)
**Mục đích:** Quản lý hệ thống cho `role = ADMIN`

**Entities sử dụng:**
```typescript
@InjectRepository(User)           // Quản lý users
@InjectRepository(Quiz)           // CRUD quizzes
@InjectRepository(Question)       // Delete questions
```

**Chức năng:**
- ✅ Xem tất cả users
- ✅ Thay đổi role của users
- ✅ Kích hoạt/vô hiệu hóa user
- ✅ CRUD quizzes và questions
- ✅ Xem thống kê cơ bản

---

### **Boss Service** (Port 3007)
**Mục đích:** Analytics và báo cáo cho `role = BOSS`

**Entities sử dụng:**
```typescript
@InjectRepository(User)           // Analytics users
@InjectRepository(Quiz)           // Analytics quizzes
@InjectRepository(QuizAttempt)    // Phân tích kết quả
```

**Chức năng:**
- ✅ Dashboard tổng quan
- ✅ User analytics
- ✅ Quiz analytics
- ✅ Top performers
- ✅ Full report

---

### **Quiz Service** (Port 3003)
**Mục đích:** Quản lý quiz và questions

**Entities sử dụng:**
```typescript
@InjectRepository(Quiz)
@InjectRepository(Question)
```

**Chức năng:**
- ✅ CRUD quizzes
- ✅ CRUD questions
- ✅ List active quizzes

---

### **Answer Service** (Port 3004)
**Mục đích:** Xử lý việc làm quiz và chấm điểm

**Entities sử dụng:**
```typescript
@InjectRepository(QuizAttempt)
@InjectRepository(Answer)
@InjectRepository(Question)
```

**Chức năng:**
- ✅ Start quiz (tạo QuizAttempt)
- ✅ Submit answers (tạo Answer)
- ✅ Calculate score
- ✅ Complete quiz

---

## 📝 Update Logic

### 1. **Update Profile (fullName, avatar)**

**Service:** Student Service

```typescript
// Student tự update profile của mình
PUT /students/profile
Authorization: Bearer <USER_TOKEN>
{
  "fullName": "Tên Mới",
  "avatar": "https://example.com/new-avatar.jpg"
}

// Logic trong StudentService:
async updateProfile(userId: string, updateData: Partial<User>) {
  const user = await userRepository.findOne({
    where: { id: userId, role: UserRole.USER }
  });
  
  // Bảo vệ: không cho update role và password
  delete updateData.role;
  delete updateData.password;
  
  Object.assign(user, updateData);
  await userRepository.save(user);  // Lưu vào bảng users
}
```

**Luồng:**
```
Student → Student Service → User Entity → Database (bảng users)
```

---

### 2. **Update Password**

**⚠️ Hiện tại CHƯA có API update password!**

**Nên tạo service riêng:**

```typescript
// Trong Auth Service
PUT /auth/change-password
Authorization: Bearer <TOKEN>
{
  "oldPassword": "123456",
  "newPassword": "new123456"
}

// Logic:
async changePassword(userId, oldPassword, newPassword) {
  const user = await userRepository.findOne({ where: { id: userId } });
  
  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) throw new UnauthorizedException();
  
  // Hash new password
  user.password = await bcrypt.hash(newPassword, 10);
  await userRepository.save(user);
}
```

---

### 3. **Admin Update User Role**

**Service:** Admin Service

```typescript
PUT /admin/users/:userId/role
Authorization: Bearer <ADMIN_TOKEN>
{
  "role": "admin"
}

// Logic:
async updateUserRole(userId: string, newRole: UserRole) {
  const user = await userRepository.findOne({ where: { id: userId } });
  user.role = newRole;
  await userRepository.save(user);  // Update vào bảng users
}
```

**Luồng:**
```
Admin → Admin Service → User Entity → Database (bảng users)
```

---

## 🔐 Bảo Mật Update

### Student Service Update Rules:
```typescript
// ✅ ĐƯỢC PHÉP update:
- fullName
- avatar

// ❌ KHÔNG ĐƯỢC update:
- role       (chỉ admin mới được)
- password   (cần API riêng với verify old password)
- email      (immutable)
- id         (immutable)
- isActive   (chỉ admin mới được)
```

### Admin Service Update Rules:
```typescript
// ✅ ĐƯỢC PHÉP update:
- role của bất kỳ user nào
- isActive của bất kỳ user nào
- Xóa quiz, question

// ❌ KHÔNG ĐƯỢC update:
- password của user khác (vì lý do bảo mật)
```

---

## 📊 Database Schema

```
users
├── id (UUID)
├── email (UNIQUE)
├── password (HASHED)
├── fullName
├── avatar
├── role (ENUM: user, admin, boss)
├── isActive
└── timestamps

quizzes
├── id
├── title
├── description
├── duration
├── isActive
└── timestamps

questions
├── id
├── quizId (FK → quizzes)
├── questionText
├── options (JSON)
├── correctAnswer
└── timestamps

quiz_attempts
├── id
├── userId (FK → users)
├── quizId (FK → quizzes)
├── score
├── status
├── startedAt
├── completedAt
└── timestamps

answers
├── id
├── attemptId (FK → quiz_attempts)
├── questionId (FK → questions)
├── selectedAnswer
├── isCorrect
└── timestamps
```

---

## ✅ Kết Luận

### User vs Student:
- **KHÔNG DƯ THỪA**
- `User` = Entity (bảng trong DB)
- `Student Service` = Service xử lý logic cho users có role = USER
- Tương tự: `Admin Service` xử lý cho role = ADMIN

### Khi Update:
1. **Profile (tên, ảnh)**: Student Service → User Entity
2. **Password**: Nên tạo API riêng trong Auth Service
3. **Role**: Admin Service → User Entity
4. **Quiz History**: Read-only từ QuizAttempt Entity

### Entities Ownership:
- **Student Service**: User + QuizAttempt (read-only)
- **Admin Service**: User + Quiz + Question
- **Boss Service**: User + Quiz + QuizAttempt (read-only)
- **Quiz Service**: Quiz + Question
- **Answer Service**: QuizAttempt + Answer + Question
