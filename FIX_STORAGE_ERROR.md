# 🔧 Fix "undefined" JSON Parse Error

## ⚠️ The Problem
Your browser's `localStorage` has invalid data stored (`"undefined"` as a string), causing the JSON parse error.

---

## ✅ **SOLUTION - Choose One Method:**

### **Method 1: Use Browser Console (Fastest)**

1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Copy and paste this command:
   ```javascript
   localStorage.clear(); location.reload();
   ```
4. Press **Enter**

✅ **Done!** Page will reload with clean storage.

---

### **Method 2: Clear Manually**

1. Press **F12** to open DevTools
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. In left sidebar, expand **Local Storage**
4. Click on `http://localhost:5173`
5. Right-click in the table → **Clear** or **Delete All**
6. Refresh page (**F5**)

---

### **Method 3: Clear Specific Items**

1. Press **F12** → **Application** → **Local Storage**
2. Click `http://localhost:5173`
3. Find and delete these items:
   - `jwt_token`
   - `user`
4. Refresh page (**F5**)

---

## 🧪 **After Fixing - Test Login**

### **Test Admin Login**:
```
Username: admin
Password: ChangeThisStrongAdminPass!
```

### **Test Member Login**:

**First, create a member:**
1. Login as admin
2. Go to `/admin/members` → **Add Member**
3. Set `member_code` to: `M-TEST-001`
4. Fill other fields
5. Click **Create**

**Then login as member:**
```
Username: M-TEST-001
Password: M-TEST-001
```

You'll be asked to change password on first login.

---

## 🎯 **What Was Fixed in Code**

✅ **`src/api/client.ts`**:
- `getUser()` - Now checks for invalid strings and catches JSON errors
- `setUser()` - Prevents storing undefined/null values
- `setAuthToken()` - Prevents storing undefined tokens

✅ These changes prevent future occurrences of this error!

---

## 🐛 **If Error Persists**

1. Try **incognito/private mode**
2. Try a **different browser**
3. Check console for new errors
4. Verify backend is running: `http://localhost:4000`

---

## 📞 **Need Help?**

The error occurs when:
- First time visiting the site
- Token/user was set to `undefined` instead of valid data
- Previous version stored bad data

**Solution is simple**: Clear localStorage and start fresh! 🚀

