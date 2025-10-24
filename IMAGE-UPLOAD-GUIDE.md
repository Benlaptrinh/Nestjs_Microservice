# 📸 Upload Images API Guide

## 🎯 2 Endpoints cho Upload

### 1. **Upload Single Avatar** (Existing)
```
POST /students/avatar
```
- Upload 1 ảnh duy nhất
- Tự động xóa avatar cũ
- Update vào `user.avatar` field

### 2. **Upload Multiple Images** (New - For Future)
```
POST /students/images
```
- Upload nhiều ảnh (max 10)
- Không update user.avatar
- Trả về list URLs để frontend xử lý

---

## 🧪 Test Cases

### Test 1: Upload Single Avatar

**Request:**
```bash
curl -X POST http://localhost:3002/students/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg"
```

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3002/students/avatar`
- Headers: `Authorization: Bearer <token>`
- Body → form-data:
  - Key: `file` (type: File)
  - Value: Chọn 1 ảnh

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "fullName": "User Name",
  "avatar": "https://res.cloudinary.com/mew/image/upload/v1234567890/quiz-app/avatars/abc123.jpg",
  "role": "user"
}
```

---

### Test 2: Upload Multiple Images

**Request:**
```bash
curl -X POST http://localhost:3002/students/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg"
```

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3002/students/images`
- Headers: `Authorization: Bearer <token>`
- Body → form-data:
  - Key: `files` (type: File) - Chọn nhiều ảnh
  - Key: `files` (type: File) - Thêm dòng mới với cùng key
  - Key: `files` (type: File) - Thêm dòng mới với cùng key
  - ... (max 10 files)

**Response:**
```json
{
  "userId": "user-uuid",
  "totalUploaded": 3,
  "images": [
    {
      "originalName": "image1.jpg",
      "url": "https://res.cloudinary.com/mew/image/upload/v1234567890/quiz-app/avatars/abc123.jpg",
      "publicId": "quiz-app/avatars/abc123",
      "size": 123456,
      "width": 500,
      "height": 500
    },
    {
      "originalName": "image2.jpg",
      "url": "https://res.cloudinary.com/mew/image/upload/v1234567891/quiz-app/avatars/def456.jpg",
      "publicId": "quiz-app/avatars/def456",
      "size": 234567,
      "width": 500,
      "height": 500
    },
    {
      "originalName": "image3.jpg",
      "url": "https://res.cloudinary.com/mew/image/upload/v1234567892/quiz-app/avatars/ghi789.jpg",
      "publicId": "quiz-app/avatars/ghi789",
      "size": 345678,
      "width": 500,
      "height": 500
    }
  ]
}
```

---

## 🔧 Validation Rules

### File Constraints:
- ✅ **Formats**: `.jpg`, `.jpeg`, `.png`, `.webp`
- ✅ **Max size per file**: 5MB
- ✅ **Max files** (multiple upload): 10 images

### Single Avatar:
- Replaces existing avatar automatically
- Only 1 file allowed with key `file`

### Multiple Images:
- Key must be `files` (plural)
- Can upload 1-10 images
- All files uploaded in parallel (fast)
- Does NOT update user.avatar (for flexibility)

---

## 🚀 Use Cases

### Use Case 1: User Profile Avatar
```
User clicks "Change Avatar"
→ Upload to /students/avatar
→ Old avatar deleted automatically
→ New avatar saved to user.avatar field
→ Display in profile immediately
```

### Use Case 2: Quiz Question Images (Future)
```
Admin creates quiz with images
→ Upload to /students/images (or create admin/images endpoint)
→ Get array of URLs
→ Save URLs to question.images field (JSON array)
→ Display multiple images in quiz
```

### Use Case 3: Gallery/Portfolio (Future)
```
User uploads portfolio images
→ Upload to /students/images
→ Save URLs to user.gallery field (JSON array)
→ Display image gallery
```

### Use Case 4: Chat Attachments (Future)
```
User sends images in chat
→ Upload to /students/images
→ Get URLs
→ Send URLs in chat message
```

---

## 📊 Database Design for Future

### Option 1: JSON Array in User Entity
```typescript
@Entity('users')
export class User {
  // ... existing fields
  
  @Column({ type: 'jsonb', nullable: true })
  gallery: string[];  // Array of image URLs
}
```

### Option 2: Separate Images Entity (Recommended)
```typescript
@Entity('user_images')
export class UserImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  imageUrl: string;

  @Column()
  publicId: string;  // Cloudinary public_id for deletion

  @Column({ nullable: true })
  type: string;  // 'avatar' | 'gallery' | 'quiz' | 'chat'

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;
}
```

---

## 🎨 Frontend Integration Examples

### React - Single Avatar Upload:
```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:3002/students/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  setUserAvatar(data.avatar);
};

// Usage in component
<input 
  type="file" 
  accept="image/*" 
  onChange={(e) => uploadAvatar(e.target.files[0])} 
/>
```

### React - Multiple Images Upload:
```javascript
const uploadMultipleImages = async (files) => {
  const formData = new FormData();
  
  // Append all files with same key 'files'
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch('http://localhost:3002/students/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  console.log(`Uploaded ${data.totalUploaded} images`);
  
  // Save URLs to state or send to backend
  const imageUrls = data.images.map(img => img.url);
  setGalleryImages(imageUrls);
};

// Usage in component
<input 
  type="file" 
  accept="image/*" 
  multiple 
  onChange={(e) => uploadMultipleImages(e.target.files)} 
/>
```

---

## 🔐 Security Considerations

### Current Implementation:
- ✅ JWT authentication required
- ✅ Only USER role can upload
- ✅ File type validation
- ✅ File size validation (5MB max)
- ✅ Max 10 files per request

### Future Enhancements:
- [ ] Rate limiting (prevent spam)
- [ ] Virus scanning
- [ ] Image content moderation (AI)
- [ ] Watermarking
- [ ] CDN caching

---

## 📝 API Summary

| Endpoint | Method | Body Key | Max Files | Updates DB | Use Case |
|----------|--------|----------|-----------|------------|----------|
| `/students/avatar` | POST | `file` | 1 | Yes (user.avatar) | Profile avatar |
| `/students/images` | POST | `files` | 10 | No | Gallery, attachments |

---

## 🛠️ Future Extensions

### 1. Delete Multiple Images
```typescript
@Delete('images')
@UseGuards(JwtAuthGuard)
async deleteImages(@Body() publicIds: string[]) {
  await this.cloudinaryService.deleteMultipleImages(publicIds);
  return { deleted: publicIds.length };
}
```

### 2. Get User Images
```typescript
@Get('images')
@UseGuards(JwtAuthGuard)
async getUserImages(@CurrentUser() user: any) {
  // Return user's uploaded images from database
}
```

### 3. Image Optimization Options
```typescript
// Small thumbnail
transformation: [{ width: 150, height: 150, crop: 'thumb' }]

// Large banner
transformation: [{ width: 1920, height: 1080, crop: 'fill' }]

// Auto format (WebP for modern browsers)
transformation: [{ fetch_format: 'auto', quality: 'auto' }]
```

---

## ✅ Testing Checklist

- [ ] Upload 1 avatar → Check old avatar deleted
- [ ] Upload invalid file type → Should get error
- [ ] Upload file > 5MB → Should get error
- [ ] Upload without auth token → 401 Unauthorized
- [ ] Upload 5 images at once → All uploaded successfully
- [ ] Upload 11 images → Should get "Maximum 10 images" error
- [ ] Upload multiple with 1 invalid file → All should fail

---

## 🚨 Troubleshooting

### Error: "File is required"
- Check form-data key is exactly `file` (single) or `files` (multiple)

### Error: "Maximum 10 images allowed"
- Reduce number of files to 10 or less

### Error: "File size must be less than 5MB"
- Compress image before upload
- Or increase limit in validation code

### Upload timeout:
- Try smaller images
- Check internet connection
- Check Cloudinary quota

### Old avatar not deleted:
- Check if `user.avatar` contains 'cloudinary'
- Check `extractPublicId()` returns correct public_id
