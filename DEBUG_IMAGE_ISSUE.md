# 🔍 Debug Image Display Issue

## Steps to Debug

### 1. Open Browser Developer Tools
- Press **F12** or **Right-click → Inspect**
- Go to **Console** tab
- Clear the console (click the 🚫 icon)

### 2. Test in Admin Page
1. Go to `/admin/about-editor`
2. Look in the console for:
   ```
   Admin - Executives from API: [...]
   Admin - Experts from API: [...]
   Admin - Executives with images: [...]
   Admin - Experts with images: [...]
   ```

3. **Check what fields are in the API response:**
   - Is there an `image` field?
   - Is there a `photoUrl` field?
   - Is the value `null`, empty string, or a path?

4. **Upload a new image:**
   - Upload an executive or expert photo
   - Look in console for:
     ```
     Upload response: { message: "...", imageUrl: "..." }
     Full image URL: "http://localhost:4000/..."
     ```
   - Copy the full image URL and paste it in a new browser tab
   - Does the image load?

5. **Refresh the page:**
   - After upload, press F5 to refresh
   - Check the console logs again
   - Compare the `image` field before and after refresh

### 3. Test in Public Page
1. Go to `/about` (public page)
2. Look in the console for:
   ```
   Executives from API: [...]
   Experts from API: [...]
   Executives with images: [...]
   Experts with images: [...]
   ```

3. **Check the image URLs:**
   - Are they full URLs starting with `http://`?
   - Are they `null`?
   - Copy one and paste in a new browser tab - does it work?

### 4. Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Refresh the page
3. Look for the API calls:
   - `/api/cms/executives?type=executive`
   - `/api/cms/executives?type=expert`
4. Click on each request
5. Go to **Response** tab
6. Look at the actual data being returned
7. **Check what field name contains the image path**

---

## What to Look For

### ✅ Expected Results:

**Raw API Response should have:**
```json
{
  "id": 1,
  "nameEn": "John Doe",
  "image": "/uploads/cms/executives/executive-123.png",
  // OR
  "photoUrl": "/uploads/cms/executives/executive-123.png"
}
```

**Mapped data with images should have:**
```json
{
  "id": 1,
  "nameEn": "John Doe",
  "image": "http://localhost:4000/uploads/cms/executives/executive-123.png"
}
```

### ❌ Problem Signs:

1. **`image` is `null` in raw API response**
   - Backend is not saving the image path
   - Backend is not returning the image field

2. **`image` is empty string `""`**
   - Backend saved but returned empty

3. **`image` has relative path but no full URL after mapping**
   - `getImageUrl()` not working
   - Wrong field name being checked

4. **Upload works but reload doesn't show image**
   - Backend not persisting image path
   - Backend using different field name for get vs update

---

## Common Issues & Fixes

### Issue 1: Backend Field Name Mismatch
**Symptom:** API returns `photoUrl` but code expects `image` (or vice versa)

**Solution:** The code now checks both:
```tsx
image: (exec.image || exec.photoUrl) ? getImageUrl(exec.image || exec.photoUrl) : null
```

### Issue 2: Backend Not Returning Image Field
**Symptom:** API response doesn't include `image` or `photoUrl` at all

**Solution:** Backend needs to include the image field in the response. Check your backend SELECT query includes the image column.

### Issue 3: Image Path Not Saved After Upload
**Symptom:** Upload returns success but GET request shows null image

**Solution:** Backend upload endpoint needs to save the image path to the database.

### Issue 4: CORS or Base URL Issues
**Symptom:** Full URLs are generated but images still don't load

**Solution:** 
- Check `VITE_API_BASE_URL` in `.env` file
- Make sure backend serves static files from `/uploads` directory
- Check browser console for CORS errors

---

## Next Steps Based on Console Output

### If console shows `image: null` in raw API:
→ **Backend issue**: Backend is not returning the image path
→ **Fix**: Update backend to include image field in SQL SELECT

### If console shows relative path but not full URL:
→ **`getImageUrl()` issue**: Function not converting properly  
→ **Fix**: Check `VITE_API_BASE_URL` environment variable

### If console shows full URL but image doesn't display:
→ **Backend static file serving issue**
→ **Fix**: Backend needs to serve files from `/uploads` directory

### If upload response doesn't have `imageUrl`:
→ **Backend upload response issue**
→ **Fix**: Backend upload endpoint needs to return `imageUrl` field

---

## Share These Details

After checking the console, please share:

1. **What does the raw API response look like?**
   - Copy the first executive/expert object from console

2. **What does the mapped data look like?**
   - Copy the first executive/expert with images object

3. **What does the upload response look like?**
   - Copy the upload response object

4. **What is your `VITE_API_BASE_URL`?**
   - Check your `.env` file

5. **Can you access the image directly?**
   - Copy a full image URL from console
   - Paste in browser - does it load?

This information will help identify exactly where the problem is!

