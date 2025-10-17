# Production Setup Guide

## Image Upload & Display - Production Configuration

### Overview
The gallery photo upload and display system now properly handles:
- ✅ Local file uploads (saved to backend server)
- ✅ External URL images (from internet)
- ✅ Proper image URL construction for both development and production

### How It Works

#### Backend Storage
- Files are uploaded to: `uploads/photos/photo-{timestamp}-{random}.{ext}`
- Example: `uploads\photos\photo-1760716516911-107582687.png`

#### Frontend Display
The frontend automatically constructs full URLs:
```javascript
// Local file
getImageUrl("uploads\\photos\\photo-123.png", true)
// Returns: http://localhost:4000/uploads/photos/photo-123.png

// External URL
getImageUrl("https://example.com/image.jpg", false)
// Returns: https://example.com/image.jpg
```

### Production Configuration

#### Option 1: Different Subdomains (Recommended)
Frontend: `https://app.yourdomain.com`  
Backend: `https://api.yourdomain.com`

**Frontend Configuration:**
1. Create `.env.production` file:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

2. Build frontend:
```bash
npm run build
```

3. Deploy `dist/` folder to frontend server

**Backend Configuration:**
1. Ensure backend is accessible at `https://api.yourdomain.com`
2. Enable CORS for frontend domain:
```javascript
// backend/server.js
app.use(cors({
  origin: 'https://app.yourdomain.com',
  credentials: true
}));
```

3. Ensure `uploads/` folder is publicly accessible via backend URL

#### Option 2: Same Domain, Path-based
Frontend: `https://yourdomain.com`  
Backend: `https://yourdomain.com/api`

**Frontend Configuration:**
```env
# .env.production
VITE_API_BASE_URL=https://yourdomain.com/api
```

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files
    location /uploads/ {
        proxy_pass http://localhost:4000/uploads/;
    }
}
```

#### Option 3: Different Ports on Same Domain
Frontend: `https://yourdomain.com`  
Backend: `https://yourdomain.com:4000`

```env
# .env.production
VITE_API_BASE_URL=https://yourdomain.com:4000
```

### Backend Static File Serving

Ensure your backend serves the `uploads/` folder as static files:

```javascript
// backend/server.js or app.js
const express = require('express');
const path = require('path');
const app = express();

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Your API routes
app.use('/api', apiRoutes);
```

### Testing Image Display

After deployment, test that images load correctly:

1. **Admin Panel:**
   - Go to Gallery → Photos
   - Upload a test image
   - Verify image appears in the photo grid

2. **Public Gallery:**
   - Go to public gallery page
   - Select a gallery
   - Verify photos display correctly
   - Click a photo to test lightbox

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for any CORS errors
   - Look for any 404 errors on image URLs

### Common Issues & Solutions

#### Issue: Images upload but don't display
**Cause:** API_BASE_URL not configured correctly  
**Solution:** Check `.env.production` file has correct `VITE_API_BASE_URL`

#### Issue: CORS errors in browser console
**Cause:** Backend not allowing frontend domain  
**Solution:** Add frontend domain to CORS whitelist in backend

#### Issue: 404 errors on image URLs
**Cause:** Backend not serving static files  
**Solution:** Add static file middleware to backend:
```javascript
app.use('/uploads', express.static('uploads'));
```

#### Issue: Mixed content warnings (HTTPS/HTTP)
**Cause:** Frontend is HTTPS but API URL is HTTP  
**Solution:** Use HTTPS for both or configure properly

### Environment Variables Reference

Create these files in your frontend root:

**`.env.development`** (for local development):
```env
VITE_API_BASE_URL=http://localhost:4000
```

**`.env.production`** (for production):
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Checklist

- [ ] Backend is deployed and accessible at configured URL
- [ ] CORS is enabled for frontend domain
- [ ] Static file serving is enabled for `/uploads/`
- [ ] `.env.production` file is created with correct API URL
- [ ] Frontend is built with `npm run build`
- [ ] `dist/` folder is deployed to web server
- [ ] Test image upload in admin panel
- [ ] Test image display in public gallery
- [ ] No CORS or 404 errors in browser console

### Support

If images still don't load after following this guide:

1. Check browser DevTools console for errors
2. Verify API URL is correct: `console.log(import.meta.env.VITE_API_BASE_URL)`
3. Test API directly: `https://api.yourdomain.com/uploads/photos/test.jpg`
4. Check backend logs for upload and file serving errors

