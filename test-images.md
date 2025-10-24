# 🧪 Test UserImage Entity

## ✅ Service Started Successfully
```
🚀 Student Service is running on port 3002
```

## 📋 Available Endpoints

### 1. Upload Multiple Images
```http
POST http://localhost:3002/students/images
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data

Body: 
- files: [image1.jpg, image2.png] (hoặc file: image.jpg)
- type: gallery (optional: avatar, gallery, quiz, chat, other)
```

### 2. Get All User Images
```http
GET http://localhost:3002/students/images
Authorization: Bearer <your-jwt-token>
```

Response:
```json
{
  "totalImages": 2,
  "images": [
    {
      "id": "uuid",
      "url": "cloudinary-url",
      "type": "gallery",
      "originalName": "test.jpg",
      "size": 123456,
      "width": 1920,
      "height": 1080,
      "createdAt": "2025-10-24T..."
    }
  ]
}
```

### 3. Delete Images by IDs
```http
DELETE http://localhost:3002/students/images
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

Body:
{
  "imageIds": ["uuid1", "uuid2"]
}
```

### 4. Get User Profile (includes totalImages)
```http
GET http://localhost:3002/students/profile
Authorization: Bearer <your-jwt-token>
```

Response:
```json
{
  "id": "uuid",
  "email": "test@test.com",
  "fullName": "User Name",
  "avatar": "url",
  "totalImages": 5
}
```

## 🧪 Test Flow

### Step 1: Get JWT Token
Login as USER role and copy token

### Step 2: Upload 2-3 Images
```bash
curl -X POST http://localhost:3002/students/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "type=gallery"
```

### Step 3: Get All Images
```bash
curl http://localhost:3002/students/images \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Copy some `id` values from response

### Step 4: Delete 1 Image
```bash
curl -X DELETE http://localhost:3002/students/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageIds": ["uuid-from-step-3"]}'
```

### Step 5: Verify in Profile
```bash
curl http://localhost:3002/students/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Check `totalImages` count decreased

## 🎯 Expected Results

✅ Upload returns new images with metadata (size, dimensions, type)
✅ Get images returns array sorted by createdAt DESC
✅ Delete removes from both Cloudinary and database
✅ Profile shows correct totalImages count
✅ Images scoped to logged-in user only

## 🗄️ Database Schema Created

```sql
CREATE TABLE user_images (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR NOT NULL,
  public_id VARCHAR NOT NULL,
  original_name VARCHAR,
  type VARCHAR CHECK (type IN ('avatar', 'gallery', 'quiz', 'chat', 'other')),
  description TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_images_user_id ON user_images(user_id);
CREATE INDEX idx_user_images_type ON user_images(type);
```

## 📝 Notes

- **Key change**: DELETE now uses `imageIds` instead of `imageUrls`
- **Flexible upload**: Can use `file` or `files` field name
- **Type categorization**: avatar, gallery, quiz, chat, other
- **Metadata tracked**: size, dimensions, upload date
- **Cascade delete**: Images auto-deleted when user deleted
- **Scoped queries**: Each user sees only their images

## 🚀 Ready to Test!

Service đã chạy thành công và UserImage entity đã được sync với database.
Bây giờ có thể test qua Postman hoặc curl.
