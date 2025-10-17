# Member Authentication System Guide

## 🎯 Overview

The Transport Federation API now features a comprehensive member authentication system with:

- ✅ **Automatic Login Account Creation** - When a member is created, a login account is automatically generated
- ✅ **First-Time Login Flow** - Users must change password and set security questions on first login  
- ✅ **Security Questions** - 3 security questions for password recovery
- ✅ **Forgot Password** - Self-service password reset using security questions
- ✅ **Admin Password Reset** - Admins can reset member passwords
- ✅ **Password Requirements** - Minimum 6 characters
- ✅ **Account Security** - Passwords hashed with bcrypt, answers hashed separately

## 🗄️ Database Structure

### Security Question Fields Added to `login_accounts` Table:

```sql
security_question_1_id INT              -- ID of question from predefined list
security_answer_1_hash TEXT             -- Hashed answer
security_question_2_id INT              
security_answer_2_hash TEXT
security_question_3_id INT
security_answer_3_hash TEXT
password_reset_required BOOLEAN         -- TRUE when admin resets password
```

### Migration

Run the migration:
```bash
npm run migrate:security
```

## 🔐 Authentication Flow

### 1. Member Creation → Auto Login Account

When a member is created via `POST /api/members`:

**Request:**
```json
{
  "union_id": 1,
  "member_code": "M-1001",
  "first_name": "John",
  "father_name": "Smith",
  "phone": "0911234567",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "mem_id": 1,
  "member_code": "M-1001",
  "first_name": "John",
  "loginCredentials": {
    "username": "M-1001",
    "defaultPassword": "M-1001",
    "message": "Login account created. User must change password and set security questions on first login."
  }
}
```

**Username Generation Logic:**
1. Uses `member_code` if available
2. Falls back to email prefix (before @)
3. Falls back to `member_{mem_id}`

**Default Password Logic:**
1. Uses `member_code` if available
2. Falls back to last 6 digits of phone
3. Falls back to `123456`

### 2. First Login → Password Change Required

**Login Request:**
```json
POST /api/auth/login
{
  "username": "M-1001",
  "password": "M-1001"
}
```

**First Login Response:**
```json
{
  "tempToken": "eyJhbGciOiJ...",
  "requirePasswordChange": true,
  "requireSecurityQuestions": true,
  "message": "Password change required. Please change your password and set security questions."
}
```

The `tempToken` is valid for 30 minutes and can only be used to change password.

### 3. Change Password & Set Security Questions

**Get Available Questions:**
```json
GET /api/auth/security-questions

Response:
{
  "questions": [
    { "id": 1, "question": "What was the name of your first school?" },
    { "id": 2, "question": "What is your mother's maiden name?" },
    { "id": 3, "question": "What was the name of your first pet?" },
    ...
  ]
}
```

**Change Password:**
```json
POST /api/auth/change-password
Authorization: Bearer {tempToken}

{
  "newPassword": "MyNewSecurePassword123!",
  "securityQuestions": [
    { "questionId": 1, "answer": "Lincoln Elementary" },
    { "questionId": 5, "answer": "The Matrix" },
    { "questionId": 8, "answer": "Main Street" }
  ]
}
```

**Success Response:**
```json
{
  "token": "eyJhbGciOiJ...",
  "user": {
    "id": 1,
    "mem_id": 1,
    "username": "M-1001",
    "role": "member"
  },
  "message": "Password changed successfully. You can now use the system."
}
```

Now the user has a full-access token and can use the system normally.

### 4. Normal Login (After Setup)

```json
POST /api/auth/login
{
  "username": "M-1001",
  "password": "MyNewSecurePassword123!"
}

Response:
{
  "token": "eyJhbGciOiJ...",
  "user": {
    "id": 1,
    "mem_id": 1,
    "username": "M-1001",
    "role": "member"
  },
  "message": "Login successful"
}
```

## 🔑 Password Reset Flows

### Option 1: Self-Service (Forgot Password)

**Step 1: Get Security Questions**
```json
POST /api/auth/forgot-password/step1
{
  "username": "M-1001"
}

Response:
{
  "username": "M-1001",
  "securityQuestions": [
    { "questionId": 1, "question": "What was the name of your first school?" },
    { "questionId": 5, "question": "What is your favorite book or movie?" },
    { "questionId": 8, "question": "What street did you grow up on?" }
  ],
  "message": "Please answer all 3 security questions"
}
```

**Step 2: Answer Questions & Reset Password**
```json
POST /api/auth/forgot-password/step2
{
  "username": "M-1001",
  "answers": [
    "Lincoln Elementary",
    "The Matrix",
    "Main Street"
  ],
  "newPassword": "MyNewPassword456!"
}

Response:
{
  "message": "Password reset successful. You can now login with your new password."
}
```

### Option 2: Admin Reset

**Admin Resets Member Password:**
```json
POST /api/login-accounts/reset/M-1001
Authorization: Bearer {adminToken}

{
  "password": "TempPassword123!"
}

Response:
{
  "message": "Password reset successfully. User will be required to change password and set security questions on next login.",
  "username": "M-1001"
}
```

When the member logs in:
- They receive a `tempToken`
- `requirePasswordChange: true`
- `requireSecurityQuestions: false` (if already set)
- Must change password before accessing system

## 📋 API Endpoints Summary

### Public Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Login (returns token or password change requirement) |
| GET | `/api/auth/security-questions` | Get list of available security questions |
| POST | `/api/auth/forgot-password/step1` | Get user's security questions |
| POST | `/api/auth/forgot-password/step2` | Answer questions and reset password |

### Protected Endpoints

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/auth/change-password` | Temp Token | Change password & set security questions |
| POST | `/api/members` | Admin | Create member (auto-creates login) |
| GET | `/api/members/:id` | Any | Get member (includes login account info) |
| POST | `/api/login-accounts/reset/:username` | Admin | Reset member password |

## 🛡️ Security Features

### Password Security
- **Hashing**: bcrypt with cost factor 12
- **Minimum Length**: 6 characters
- **No Maximum**: Users can create long secure passwords
- **Forced Change**: First login and admin resets

### Security Questions
- **Count**: Exactly 3 required
- **Answer Handling**: 
  - Converted to lowercase
  - Trimmed of whitespace
  - Hashed separately from password
- **Verification**: All 3 must match to reset password

### Token Security
- **Temporary Tokens**: 30-minute expiry for password changes
- **Full Access Tokens**: 24-hour expiry (configurable)
- **Flags**: Temp tokens marked with `temp: true` and `requirePasswordChange: true`

### Account Locking
- **Admin Control**: Admins can lock/unlock accounts
- **Locked Response**: `403 - Account locked. Contact administrator.`

## 🔄 Complete User Journey

### New Member Created
```
1. Admin creates member → Login account auto-created
2. Member receives username + default password
3. Member logs in → Receives temp token
4. Member changes password + sets 3 security questions
5. Member receives full access token
6. Member can now use system normally
```

### Member Forgets Password
```
1. Member clicks "Forgot Password"
2. Enters username → Receives 3 security questions
3. Answers all 3 questions → Sets new password
4. Can now login with new password
```

### Admin Resets Member Password
```
1. Admin resets password via API
2. Member logs in with new password → Receives temp token
3. Member must change password (security questions already set)
4. Member receives full access token
```

## 💻 Frontend Integration Examples

### Login Flow
```javascript
async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (data.requirePasswordChange) {
    // Redirect to password change page
    localStorage.setItem('tempToken', data.tempToken);
    window.location.href = '/change-password';
  } else {
    // Normal login - store token
    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard';
  }
}
```

### Change Password Flow
```javascript
async function changePassword(newPassword, securityQuestions) {
  const tempToken = localStorage.getItem('tempToken');
  
  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tempToken}`
    },
    body: JSON.stringify({
      newPassword,
      securityQuestions: [
        { questionId: 1, answer: "answer1" },
        { questionId: 3, answer: "answer2" },
        { questionId: 7, answer: "answer3" }
      ]
    })
  });
  
  const data = await response.json();
  
  // Store full access token
  localStorage.setItem('token', data.token);
  localStorage.removeItem('tempToken');
  window.location.href = '/dashboard';
}
```

### Forgot Password Flow
```javascript
// Step 1: Get security questions
async function getSecurityQuestions(username) {
  const response = await fetch('/api/auth/forgot-password/step1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  
  const data = await response.json();
  return data.securityQuestions;
}

// Step 2: Reset password
async function resetPassword(username, answers, newPassword) {
  const response = await fetch('/api/auth/forgot-password/step2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      answers,
      newPassword
    })
  });
  
  const data = await response.json();
  // Redirect to login
  window.location.href = '/login';
}
```

## 🧪 Testing

### Test Scenario 1: New Member Creation
```bash
# Create member
curl -X POST http://localhost:4000/api/members \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "union_id": 1,
    "member_code": "M-TEST-001",
    "first_name": "Test",
    "father_name": "User",
    "phone": "0911234567",
    "email": "test@example.com"
  }'

# Note the username and defaultPassword from response

# Login with default credentials
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "M-TEST-001",
    "password": "M-TEST-001"
  }'

# Note the tempToken from response
```

### Test Scenario 2: Password Change
```bash
# Get security questions
curl -X GET http://localhost:4000/api/auth/security-questions

# Change password
curl -X POST http://localhost:4000/api/auth/change-password \
  -H "Authorization: Bearer TEMP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "MyNewPassword123!",
    "securityQuestions": [
      {"questionId": 1, "answer": "My School"},
      {"questionId": 2, "answer": "Smith"},
      {"questionId": 3, "answer": "Fluffy"}
    ]
  }'

# Login with new password
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type": application/json" \
  -d '{
    "username": "M-TEST-001",
    "password": "MyNewPassword123!"
  }'
```

### Test Scenario 3: Forgot Password
```bash
# Step 1: Get questions
curl -X POST http://localhost:4000/api/auth/forgot-password/step1 \
  -H "Content-Type: application/json" \
  -d '{"username": "M-TEST-001"}'

# Step 2: Reset password
curl -X POST http://localhost:4000/api/auth/forgot-password/step2 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "M-TEST-001",
    "answers": ["My School", "Smith", "Fluffy"],
    "newPassword": "ResetPassword456!"
  }'
```

## ⚙️ Configuration

### Environment Variables

Add to `.env`:
```env
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
```

### Security Questions

Customize in `src/config/securityQuestions.js`:
```javascript
const SECURITY_QUESTIONS = [
  { id: 1, question: "Your custom question here?" },
  // Add more questions...
];
```

## 🎉 Benefits

### For Members
- ✅ Automatic account creation
- ✅ Simple first-time setup
- ✅ Self-service password reset
- ✅ Secure authentication

### For Administrators
- ✅ No manual account creation needed
- ✅ Can reset member passwords when needed
- ✅ Members forced to secure their accounts
- ✅ Clear audit trail (last_login tracking)

### For System Security
- ✅ Strong password hashing (bcrypt)
- ✅ Multi-factor recovery (3 questions)
- ✅ Forced password changes
- ✅ Token-based authentication
- ✅ Account locking capability

## 📚 Next Steps

1. **Run Migration**: `npm run migrate:security`
2. **Create Test Member**: Use POST `/api/members`
3. **Test Login Flow**: Login → Change Password → Login Again
4. **Test Password Reset**: Forgot Password Flow
5. **Test Admin Reset**: Admin resets member password

Your comprehensive member authentication system is ready! 🎊


