# 🖼️ Upload Avatar & OAuth Integration Guide

## 📋 Tổng Quan

Đã thêm 2 tính năng mới:
1. **Upload ảnh avatar** lên Cloudinary
2. **Login bằng Google và GitHub** (OAuth 2.0)

---

## 🎨 1. Upload Avatar lên Cloudinary

### Setup Cloudinary

1. **Đăng ký Cloudinary:**
   - Truy cập: https://cloudinary.com/users/register_free
   - Lấy credentials từ Dashboard

2. **Cập nhật .env.development:**
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Test Upload Avatar

```bash
# Student upload avatar
curl -X POST http://localhost:3002/students/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "student@example.com",
  "fullName": "Student Name",
  "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/quiz-app/avatars/abc123.jpg",
  "role": "user"
}
```

### Validation Rules:
- ✅ File types: `.jpg`, `.jpeg`, `.png`, `.webp`
- ✅ Max size: 5MB
- ✅ Auto resize: 500x500px
- ✅ Auto optimize quality
- ✅ Delete old avatar khi upload mới

---

## 🔐 2. Login với Google & GitHub

### A. Setup Google OAuth

1. **Tạo Google OAuth App:**
   - Truy cập: https://console.cloud.google.com/
   - Chọn project hoặc tạo mới
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
   
2. **Lấy credentials và cập nhật .env:**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

### B. Setup GitHub OAuth

1. **Tạo GitHub OAuth App:**
   - Truy cập: https://github.com/settings/developers
   - New OAuth App
   - Application name: Quiz App
   - Homepage URL: `http://localhost:3001`
   - Authorization callback URL: `http://localhost:3001/auth/github/callback`
   
2. **Lấy credentials và cập nhật .env:**
```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
```

---

## 🚀 Test OAuth Login

### Google Login Flow:

**Step 1: Initiate Google Login**
```
Mở trình duyệt và truy cập:
http://localhost:3001/auth/google
```

**Step 2: User đăng nhập Google**
- Chọn tài khoản Google
- Authorize app

**Step 3: Callback và redirect**
```
Sau khi authorize, redirect về:
http://localhost:3000/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Step 4: Lưu token và sử dụng**
```javascript
// Frontend (React/Vue/Angular)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
localStorage.setItem('access_token', token);
```

### GitHub Login Flow:

**Step 1: Initiate GitHub Login**
```
Mở trình duyệt và truy cập:
http://localhost:3001/auth/github
```

**Step 2: User authorize GitHub**
- Click Authorize
- Confirm permissions

**Step 3: Callback và redirect**
```
http://localhost:3000/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Database Changes

### User Entity (Updated):
```typescript
@Entity('users')
export class User {
  // ... existing fields
  
  @Column({ nullable: true })
  googleId: string;        // Google OAuth ID
  
  @Column({ nullable: true })
  githubId: string;        // GitHub OAuth ID
  
  @Column({ nullable: true, default: 'local' })
  provider: string;        // 'local' | 'google' | 'github'
}
```

---

## 🔄 OAuth Login Logic

### Khi user login bằng OAuth:

1. **Nếu user đã tồn tại (same email hoặc OAuth ID):**
   - Update OAuth ID và avatar (nếu chưa có)
   - Trả về JWT token

2. **Nếu user chưa tồn tại:**
   - Tạo user mới với:
     - email từ OAuth provider
     - fullName từ OAuth profile
     - avatar từ OAuth profile
     - googleId hoặc githubId
     - provider: 'google' hoặc 'github'
     - role: USER (default)
     - password: '' (không cần password cho OAuth users)
   - Trả về JWT token

### JWT Token bao gồm:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 🧪 Testing Scenarios

### Test 1: New Google User
```
1. User chưa có account → Login Google
2. System tạo user mới với:
   - email: gmail address
   - fullName: Google profile name
   - avatar: Google profile picture
   - googleId: Google user ID
   - provider: 'google'
3. Trả về JWT token
```

### Test 2: Existing User Login with GitHub
```
1. User đã có account (email: user@example.com)
2. User login GitHub với same email
3. System update:
   - githubId: GitHub user ID
   - provider: 'github'
   - avatar: GitHub avatar (nếu chưa có)
4. Trả về JWT token
```

### Test 3: Upload Avatar sau OAuth Login
```
1. Login Google → có avatar từ Google
2. Upload custom avatar → replace Google avatar
3. Avatar mới lưu trên Cloudinary
```

---

## 📝 API Endpoints Summary

### Avatar Upload:
```
POST /students/avatar
Headers: 
  - Authorization: Bearer <JWT_TOKEN>
Body (multipart/form-data):
  - file: <image file>
```

### OAuth Login:
```
GET /auth/google          → Initiate Google OAuth
GET /auth/google/callback → Google callback (auto redirect)

GET /auth/github          → Initiate GitHub OAuth
GET /auth/github/callback → GitHub callback (auto redirect)
```

### Traditional Login (unchanged):
```
POST /auth/register
POST /auth/login
GET /auth/profile
```

---

## ⚙️ Environment Variables Checklist

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=quiz_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name        # ⚠️ REQUIRED
CLOUDINARY_API_KEY=your-api-key              # ⚠️ REQUIRED
CLOUDINARY_API_SECRET=your-api-secret        # ⚠️ REQUIRED

# Google OAuth
GOOGLE_CLIENT_ID=...apps.googleusercontent.com    # ⚠️ REQUIRED
GOOGLE_CLIENT_SECRET=...                          # ⚠️ REQUIRED
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=...                              # ⚠️ REQUIRED
GITHUB_CLIENT_SECRET=...                          # ⚠️ REQUIRED
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
```

---

## 🚨 Important Notes

### Security:
- ⚠️ OAuth callback URLs phải match chính xác với config trong Google/GitHub Console
- ⚠️ Không commit `.env` files lên Git
- ⚠️ Production: Đổi callback URLs sang HTTPS và domain chính thức

### Frontend Integration:
```javascript
// Redirect user to OAuth login
window.location.href = 'http://localhost:3001/auth/google';

// Or for GitHub
window.location.href = 'http://localhost:3001/auth/github';

// Handle callback (in /auth/callback route)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
  localStorage.setItem('access_token', token);
  // Redirect to dashboard
  window.location.href = '/dashboard';
}
```

### Avatar Upload Frontend Example:
```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:3002/students/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: formData
  });
  
  const data = await response.json();
  console.log('New avatar:', data.avatar);
};
```

---

## 🔧 Troubleshooting

### Error: "Cannot find module '@app/cloudinary'"
```bash
# Rebuild project
npm run build
```

### Error: "Unauthorized callback_uri"
- Kiểm tra callback URL trong Google/GitHub Console match với `.env`

### Error: "Invalid credentials" khi upload Cloudinary
- Kiểm tra CLOUDINARY_* credentials trong `.env`
- Test credentials tại: https://cloudinary.com/console

### OAuth không redirect về frontend:
- Kiểm tra controller callback có `@Res()` decorator
- Kiểm tra redirect URL trong response

---

## ✅ Migration Steps

### 1. Update Database:
```bash
# Stop services
# Sync=true sẽ tự động thêm columns mới:
# - googleId
# - githubId  
# - provider

# Restart auth service
npm run start:auth
```

### 2. Setup OAuth Apps:
- Tạo Google OAuth App
- Tạo GitHub OAuth App
- Update .env credentials

### 3. Setup Cloudinary:
- Đăng ký Cloudinary
- Update .env credentials

### 4. Test:
```bash
# Start services
npm run start:auth       # Port 3001
npm run start:student    # Port 3002

# Test Google login
Open: http://localhost:3001/auth/google

# Test GitHub login
Open: http://localhost:3001/auth/github

# Test avatar upload (cần JWT token trước)
curl -X POST http://localhost:3002/students/avatar \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@avatar.jpg"
```
