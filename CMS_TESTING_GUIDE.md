# 🧪 CMS Testing Guide

## Quick Testing Steps

### 1. Test Home Editor
1. Navigate to `/admin/home-editor`
2. Change hero title (English & Amharic)
3. Upload a new hero image
4. Change statistics values and labels
5. Click **Save Changes**
6. ✅ Should see success toast
7. Visit `/` (public home page)
8. ✅ Should see your changes

### 2. Test About Editor
1. Navigate to `/admin/about-editor`
2. Edit mission statement
3. Add/remove a value or objective
4. Add a new executive with photo
5. Click **Save Changes**
6. ✅ Should see success toast
7. Visit `/about` (public about page)
8. ✅ Should see your changes

### 3. Test Contact Info Editor
1. Navigate to `/admin/contact-info-editor`
2. Edit address (English & Amharic)
3. Change phone numbers
4. Update social media links
5. Click **Save Changes**
6. ✅ Should see success toast
7. Visit `/contact` (public contact page)
8. ✅ Should see your changes

## Expected Behavior

### Admin Pages Should:
- ✅ Load existing content on page load
- ✅ Show loading spinner while fetching data
- ✅ Allow editing all fields
- ✅ Upload images successfully
- ✅ Save changes to database
- ✅ Show success/error toasts
- ✅ Update form after save

### Public Pages Should:
- ✅ Load content from database
- ✅ Show loading spinner while fetching
- ✅ Display bilingual content correctly
- ✅ Show uploaded images
- ✅ Handle missing data gracefully
- ✅ Switch languages properly (EN/AM)

## Common Issues & Solutions

### Issue: Public pages not updating
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Check if backend API is running
- Check browser console for errors

### Issue: Contact editor shows blank
**Solution:**
- Verify `/api/contact-info` endpoint works
- Check browser console for errors
- Ensure backend returns data (even if null)

### Issue: Arrays not displaying (values, objectives, etc.)
**Solution:**
- This was fixed with `parseArray()` helper
- Ensure backend returns valid JSON strings for arrays
- Check browser console for parsing errors

### Issue: Images not uploading
**Solution:**
- Check file size (backend may have limits)
- Check file format (should be image/*)
- Check `/api/upload/*` endpoints are working
- Look for CORS errors in console

## Browser Console Checks

Open Developer Tools (F12) and check:

### Network Tab:
- API calls should return 200 status
- Check request/response payloads
- Verify endpoints match backend

### Console Tab:
- No red error messages
- No 404 errors
- No CORS errors

## API Response Format

### Expected responses:

**GET /api/home-content:**
```json
{
  "heroTitleEn": "Welcome",
  "heroTitleAm": "እንኳን በደህና መጡ",
  "stat1Value": "1000",
  "stat1LabelEn": "Members",
  ...
}
```

**GET /api/about-content:**
```json
{
  "missionEn": "Our mission...",
  "valuesEn": "[\"Value 1\", \"Value 2\"]",
  "objectivesEn": "[\"Objective 1\"]",
  ...
}
```

**GET /api/executives:**
```json
[
  {
    "id": 1,
    "nameEn": "John Doe",
    "positionEn": "President",
    "photoUrl": "/uploads/john.jpg"
  }
]
```

**GET /api/contact-info:**
```json
{
  "addressEn": "123 Main St",
  "phone": "+251911234567",
  "email": "info@example.com",
  "facebookUrl": "https://facebook.com/...",
  ...
}
```

## Test Checklist

### Admin Functionality:
- [ ] Home editor loads existing data
- [ ] Home editor saves changes
- [ ] Home editor uploads hero image
- [ ] About editor loads existing data
- [ ] About editor saves changes
- [ ] About editor manages executives
- [ ] About editor uploads executive photos
- [ ] Contact editor loads existing data
- [ ] Contact editor saves changes
- [ ] All forms show success toasts
- [ ] All forms show error toasts on failure

### Public Display:
- [ ] Home page displays hero from DB
- [ ] Home page displays stats from DB
- [ ] About page displays all sections
- [ ] About page displays executives
- [ ] About page displays experts
- [ ] Contact page displays address
- [ ] Contact page displays phone/email
- [ ] Contact page displays social media
- [ ] Contact page displays map
- [ ] Language switching works (EN/AM)

### Edge Cases:
- [ ] Works when no data in database
- [ ] Works when fields are null
- [ ] Works when arrays are empty
- [ ] Shows loading states properly
- [ ] Handles API errors gracefully
- [ ] Handles network failures

## Performance Check

- [ ] Pages load within 2 seconds
- [ ] Images are optimized
- [ ] No unnecessary API calls
- [ ] Loading states appear immediately
- [ ] No layout shift while loading

## Browser Compatibility

Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Responsiveness

Test on:
- [ ] Mobile phone
- [ ] Tablet
- [ ] Desktop

## Security Check

- [ ] Admin pages require authentication
- [ ] Public pages are accessible without auth
- [ ] Image uploads validate file types
- [ ] API endpoints use proper authentication

## Final Verification

1. **As Admin:**
   - Make changes in all 3 editors
   - Verify all save successfully
   - Check database records updated

2. **As Public User:**
   - Visit all 3 public pages
   - Verify all content displays
   - Switch languages
   - Check all links work

3. **Edge Cases:**
   - Logout and check public pages
   - Clear cache and reload
   - Test with slow network
   - Test with offline mode

## Success Criteria

✅ **Your CMS is working if:**
- Admins can edit all content
- Changes save to database
- Public pages show updated content
- No console errors
- Good user experience (loading states, toasts)
- Works in all browsers
- Mobile responsive

## If Everything Works

Congratulations! 🎉 Your CMS is fully functional and ready for production use!

## If Something Doesn't Work

1. Check this guide's troubleshooting section
2. Check browser console for specific errors
3. Verify backend API is running and accessible
4. Check network tab for failed requests
5. Test API endpoints directly (Postman/curl)

---

**Note:** This system is now production-ready with:
- Full CRUD operations
- Bilingual support
- Image uploads
- Safe error handling
- User feedback
- Responsive design

