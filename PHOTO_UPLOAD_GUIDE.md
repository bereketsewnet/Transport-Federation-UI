# Photo Upload System Guide

The Transport Federation API now supports **dual-mode photo uploads**: both **local file uploads** and **external URL strings**.

## 🎯 Overview

The photo upload system allows you to:
- ✅ Upload image files directly (stored locally on server)
- ✅ Reference external images via URL (stored as string)
- ✅ Automatic file naming with timestamps
- ✅ File type validation (jpeg, jpg, png, gif, webp)
- ✅ File size limit (5MB max)
- ✅ Automatic cleanup on delete

## 📁 Directory Structure

```
Transport-Federation-API/
├── uploads/
│   └── photos/           # Uploaded photos stored here
│       └── .gitkeep      # Keeps directory in git
├── src/
│   ├── middlewares/
│   │   └── upload.middleware.js  # Multer configuration
│   ├── controllers/
│   │   └── photos.controller.js  # Photo handling logic
│   └── migrations/
│       └── add_is_local_to_photos.sql  # Database migration
```

## 🗄️ Database Schema

The `photos` table includes:
```sql
CREATE TABLE photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gallery_id INT,
  filename VARCHAR(255),        -- Either local filename or external URL
  caption TEXT,
  taken_at DATE,
  is_local BOOLEAN DEFAULT FALSE, -- TRUE for uploads, FALSE for URLs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Run Migration

To add the `is_local` column to existing database:

**Using npm script (recommended for all platforms):**
```bash
npm run migrate:photos
```

**Or using MySQL directly (Linux/Mac):**
```bash
mysql -u your_user -p your_database < src/migrations/add_is_local_to_photos.sql
```

**Or using MySQL directly (Windows PowerShell):**
```powershell
Get-Content src/migrations/add_is_local_to_photos.sql | mysql -u your_user -p your_database
```

## 🚀 Usage

### Method 1: Upload Local File

**Endpoint**: `POST /api/photos`  
**Content-Type**: `multipart/form-data`  
**Authentication**: Required (Admin only)

**Form Data:**
```
photo: [file] - Image file (required)
gallery_id: 1
caption: "Opening ceremony"
taken_at: "2025-09-20"
```

**Example with cURL:**
```bash
curl -X POST http://localhost:4000/api/photos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo=@/path/to/image.jpg" \
  -F "gallery_id=1" \
  -F "caption=Opening ceremony" \
  -F "taken_at=2025-09-20"
```

**Response:**
```json
{
  "id": 1,
  "gallery_id": 1,
  "filename": "photo-1729178564123-987654321.jpg",
  "caption": "Opening ceremony",
  "taken_at": "2025-09-20",
  "is_local": true,
  "image_url": "/uploads/photos/photo-1729178564123-987654321.jpg"
}
```

### Method 2: Add External URL

**Endpoint**: `POST /api/photos`  
**Content-Type**: `application/json`  
**Authentication**: Required (Admin only)

**Request Body:**
```json
{
  "gallery_id": 1,
  "image_url": "https://example.com/photo.jpg",
  "caption": "External photo",
  "taken_at": "2025-09-20"
}
```

**Example with cURL:**
```bash
curl -X POST http://localhost:4000/api/photos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gallery_id": 1,
    "image_url": "https://example.com/photo.jpg",
    "caption": "External photo",
    "taken_at": "2025-09-20"
  }'
```

**Response:**
```json
{
  "id": 2,
  "gallery_id": 1,
  "filename": "https://example.com/photo.jpg",
  "caption": "External photo",
  "taken_at": "2025-09-20",
  "is_local": false
}
```

## 📋 Features

### File Upload Features
- **Automatic naming**: Files renamed to `photo-{timestamp}-{random}.{ext}`
- **Type validation**: Only images allowed (jpeg, jpg, png, gif, webp)
- **Size limit**: Maximum 5MB per file
- **Error handling**: File deleted if database insert fails
- **Static serving**: Access uploaded files at `/uploads/photos/{filename}`

### URL String Features
- **Flexible**: Any valid URL string accepted
- **No storage**: URLs stored as-is in database
- **External hosting**: Images can be hosted anywhere

### Common Features
- **Gallery association**: All photos belong to a gallery
- **Optional metadata**: Caption and date fields
- **Tracking**: `is_local` field distinguishes upload type
- **Cleanup**: Local files deleted when photo record deleted

## 🛡️ Security & Validation

### File Upload Validation
```javascript
// Allowed file types
const allowedTypes = /jpeg|jpg|png|gif|webp/;

// Max file size
const maxSize = 5 * 1024 * 1024; // 5MB

// File naming prevents overwrites
const filename = `photo-${timestamp}-${random}${ext}`;
```

### Error Responses

**Missing photo/URL:**
```json
{
  "message": "Either upload a photo file or provide an image_url"
}
```

**File too large:**
```json
{
  "message": "File size too large. Maximum 5MB allowed."
}
```

**Invalid file type:**
```json
{
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```

## 📱 Frontend Integration

### React Example (File Upload)

```javascript
const uploadPhoto = async (file, galleryId, caption) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('gallery_id', galleryId);
  formData.append('caption', caption);
  formData.append('taken_at', new Date().toISOString().split('T')[0]);

  const response = await fetch('http://localhost:4000/api/photos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

### React Example (URL String)

```javascript
const addPhotoFromURL = async (url, galleryId, caption) => {
  const response = await fetch('http://localhost:4000/api/photos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gallery_id: galleryId,
      image_url: url,
      caption: caption,
      taken_at: new Date().toISOString().split('T')[0]
    })
  });

  return await response.json();
};
```

### Displaying Photos

```javascript
const PhotoDisplay = ({ photo }) => {
  const imageUrl = photo.is_local 
    ? `http://localhost:4000${photo.image_url}`
    : photo.filename;

  return <img src={imageUrl} alt={photo.caption} />;
};
```

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:
```env
# Upload settings (optional - uses defaults if not set)
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=jpeg,jpg,png,gif,webp
```

### Multer Configuration

Location: `src/middlewares/upload.middleware.js`

Customize:
- Upload directory
- File size limits
- Allowed file types
- Filename generation logic

## 🧪 Testing with Postman

1. **Import Collection**: Import `postman_endpoint.json`
2. **Set Variables**:
   - `base_url`: http://localhost:4000
   - `jwt_token`: Your JWT token
3. **Test File Upload**:
   - Go to "Upload photo file (admin)"
   - Select file in Body > form-data > photo
   - Send request
4. **Test URL Upload**:
   - Go to "Add photo from URL (admin)"
   - Modify URL in request body
   - Send request

## 📊 API Endpoints Summary

| Method | Endpoint | Purpose | Body Type |
|--------|----------|---------|-----------|
| POST | `/api/photos` | Upload file | multipart/form-data |
| POST | `/api/photos` | Add URL | application/json |
| GET | `/api/photos` | List photos | - |
| GET | `/api/photos/:id` | Get photo | - |
| PUT | `/api/photos/:id` | Update metadata | application/json |
| DELETE | `/api/photos/:id?confirm=true` | Delete photo | - |
| GET | `/uploads/photos/:filename` | Serve image | - |

## ⚠️ Important Notes

1. **Disk Space**: Monitor uploads directory size
2. **Backup**: Regularly backup `uploads/photos/` directory
3. **Production**: Use cloud storage (S3, Cloudinary) for production
4. **CORS**: Ensure CORS allows file uploads from your frontend
5. **Nginx**: Configure nginx for serving static files in production

## 🚨 Troubleshooting

### "File too large" error
- Check MAX_FILE_SIZE in multer config
- Increase nginx client_max_body_size if using nginx

### Files not accessible
- Check uploads directory permissions
- Verify static file serving is configured in app.js
- Check path: `/uploads/photos/{filename}`

### Database error on upload
- Run migration to add `is_local` column
- Check gallery_id exists before uploading

### Files remain after delete
- Check file permissions
- Verify cleanup logic in controller
- Manual cleanup: `rm -rf uploads/photos/*` (except .gitkeep)

## 📚 Additional Resources

- [Multer Documentation](https://github.com/expressjs/multer)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [File Upload Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

## 🎉 Success!

Your API now supports both file uploads and URL strings for photos! Use whichever method suits your needs:
- **File upload** for user-generated content
- **URL string** for external/CDN-hosted images

