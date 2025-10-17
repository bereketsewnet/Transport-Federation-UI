# Environment Configuration Templates

## Quick Start

### Step 1: Copy the template files to your project root

**For Development:**
```bash
cp env-templates/env.development.template .env.development
```

**For Production:**
```bash
cp env-templates/env.production.template .env.production
```

### Step 2: Edit `.env.production`

Open `.env.production` and replace `https://api.yourdomain.com` with your actual backend URL:

```env
VITE_API_BASE_URL=https://your-actual-backend-url.com
```

### Step 3: Build and Deploy

```bash
# Build for production
npm run build

# The dist/ folder will use your production backend URL
# Upload dist/ folder to your frontend hosting
```

---

## Example Configuration

If your setup is:
- Frontend: `https://transport.example.com`  
- Backend: `https://api-transport.example.com`

Your `.env.production` should be:
```env
VITE_API_BASE_URL=https://api-transport.example.com
```

---

## Where to Put These Files

```
Transport-Federation-UI/
├── .env.development        ← Copy env.development.template here
├── .env.production        ← Copy env.production.template here
├── env-templates/         ← Template files (don't modify)
│   ├── env.development.template
│   └── env.production.template
├── package.json
└── src/
```

---

## Important Notes

- ✅ `.env.development` is used when you run `npm run dev`
- ✅ `.env.production` is used when you run `npm run build`
- ✅ After changing `.env.production`, you must rebuild: `npm run build`
- ✅ The backend URL must include the protocol (`http://` or `https://`)
- ✅ No trailing slash at the end of the URL

---

## Verification

After deployment, verify images load correctly:

1. Go to Admin → Gallery → Photos
2. Upload a test image
3. Image should display in the photo grid
4. Go to public Gallery page
5. Images should display there too

If images don't load, check the browser console (F12) for errors.

