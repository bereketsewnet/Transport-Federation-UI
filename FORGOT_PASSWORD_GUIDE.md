# Forgot Password Guide

## Overview

The Transport Federation API includes a complete forgot password system that allows users to reset their passwords using security questions. This is a 2-step process that's secure and user-friendly.

## 🔐 How It Works

### Step 1: User enters username → System shows their security questions
### Step 2: User answers questions + sets new password → Password is reset

## 📋 Prerequisites

Before users can use forgot password, they must have:
1. **Security questions set** (3 questions with answers)
2. **Valid account** in the system

Security questions are set either:
- During first login (if `must_change_password` is true)
- Via admin password reset
- During normal password change

## 🛠️ API Endpoints

### 1. Get Available Security Questions (Public)

**Endpoint:** `GET /api/auth/security-questions`

**Description:** Returns all available security questions that users can choose from.

**Request:**
```bash
curl -X GET http://localhost:4000/api/auth/security-questions
```

**Response (200):**
```json
{
  "questions": [
    {
      "id": 1,
      "question": "What was the name of your first pet?"
    },
    {
      "id": 2,
      "question": "What city were you born in?"
    },
    {
      "id": 3,
      "question": "What was your mother's maiden name?"
    },
    {
      "id": 4,
      "question": "What was the name of your elementary school?"
    },
    {
      "id": 5,
      "question": "What was your childhood nickname?"
    }
    // ... more questions
  ]
}
```

**Use Case:** Frontend can use this to show a dropdown of available questions when users are setting up their security questions.

---

### 2. Step 1: Get User's Security Questions (Public)

**Endpoint:** `POST /api/auth/forgot-password/step1`

**Description:** User enters their username, system returns the 3 security questions they previously set.

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/forgot-password/step1 \
  -H "Content-Type: application/json" \
  -d '{"username": "admin"}'
```

**Request Body:**
```json
{
  "username": "admin"
}
```

**Success Response (200):**
```json
{
  "username": "admin",
  "securityQuestions": [
    {
      "questionId": 1,
      "question": "What was the name of your first pet?"
    },
    {
      "questionId": 2,
      "question": "What city were you born in?"
    },
    {
      "questionId": 3,
      "question": "What was your mother's maiden name?"
    }
  ],
  "message": "Please answer all 3 security questions"
}
```

**Error Responses:**

**User doesn't exist (404):**
```json
{
  "message": "If this account exists, security questions will be shown."
}
```

**Security questions not set (400):**
```json
{
  "message": "Security questions not set. Please contact administrator to reset password."
}
```

**Server error (500):**
```json
{
  "message": "Server error"
}
```

---

### 3. Step 2: Verify Answers & Reset Password (Public)

**Endpoint:** `POST /api/auth/forgot-password/step2`

**Description:** User provides their answers to the 3 security questions and sets a new password.

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/forgot-password/step2 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "answers": ["Fluffy", "New York", "Smith"],
    "newPassword": "NewPassword123!"
  }'
```

**Request Body:**
```json
{
  "username": "admin",
  "answers": ["Fluffy", "New York", "Smith"],
  "newPassword": "NewPassword123!"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

**Error Responses:**

**Missing fields (400):**
```json
{
  "message": "username, 3 answers, and newPassword required"
}
```

**Password too short (400):**
```json
{
  "message": "Password must be at least 6 characters"
}
```

**Wrong answers (401):**
```json
{
  "message": "Security answers do not match"
}
```

**User not found (404):**
```json
{
  "message": "Invalid request"
}
```

**Security questions not configured (400):**
```json
{
  "message": "Security questions not properly configured"
}
```

## 🎨 Frontend Implementation Examples

### React Component Example

```jsx
import React, { useState } from 'react';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState(['', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Get security questions
  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if (response.ok) {
        setSecurityQuestions(data.securityQuestions);
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, answers, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password reset successful! You can now login.');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password">
      <h2>Forgot Password</h2>
      
      {step === 1 && (
        <form onSubmit={handleStep1}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2}>
          <h3>Answer your security questions:</h3>
          
          {securityQuestions.map((q, index) => (
            <div key={index}>
              <label>{q.question}</label>
              <input
                type="text"
                value={answers[index]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[index] = e.target.value;
                  setAnswers(newAnswers);
                }}
                required
              />
            </div>
          ))}

          <div>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default ForgotPassword;
```

### Vue.js Component Example

```vue
<template>
  <div class="forgot-password">
    <h2>Forgot Password</h2>
    
    <!-- Step 1: Enter Username -->
    <form v-if="step === 1" @submit.prevent="handleStep1">
      <div>
        <label>Username:</label>
        <input
          v-model="username"
          type="text"
          required
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Loading...' : 'Continue' }}
      </button>
    </form>

    <!-- Step 2: Answer Questions -->
    <form v-if="step === 2" @submit.prevent="handleStep2">
      <h3>Answer your security questions:</h3>
      
      <div v-for="(question, index) in securityQuestions" :key="index">
        <label>{{ question.question }}</label>
        <input
          v-model="answers[index]"
          type="text"
          required
        />
      </div>

      <div>
        <label>New Password:</label>
        <input
          v-model="newPassword"
          type="password"
          minlength="6"
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Resetting...' : 'Reset Password' }}
      </button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      step: 1,
      username: '',
      securityQuestions: [],
      answers: ['', '', ''],
      newPassword: '',
      loading: false,
      error: ''
    };
  },
  methods: {
    async handleStep1() {
      this.loading = true;
      this.error = '';

      try {
        const response = await fetch('/api/auth/forgot-password/step1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username })
        });

        const data = await response.json();

        if (response.ok) {
          this.securityQuestions = data.securityQuestions;
          this.step = 2;
        } else {
          this.error = data.message;
        }
      } catch (err) {
        this.error = 'Network error. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async handleStep2() {
      this.loading = true;
      this.error = '';

      try {
        const response = await fetch('/api/auth/forgot-password/step2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            answers: this.answers,
            newPassword: this.newPassword
          })
        });

        const data = await response.json();

        if (response.ok) {
          alert('Password reset successful! You can now login.');
          this.$router.push('/login');
        } else {
          this.error = data.message;
        }
      } catch (err) {
        this.error = 'Network error. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

### Plain JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Forgot Password</title>
    <style>
        .container { max-width: 500px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; margin-bottom: 10px; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .error { color: red; margin-top: 10px; }
        .step { display: none; }
        .step.active { display: block; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Forgot Password</h2>
        
        <!-- Step 1: Username -->
        <div id="step1" class="step active">
            <form id="usernameForm">
                <div class="form-group">
                    <label>Username:</label>
                    <input type="text" id="username" required>
                </div>
                <button type="submit" id="step1Btn">Continue</button>
            </form>
        </div>

        <!-- Step 2: Security Questions -->
        <div id="step2" class="step">
            <form id="questionsForm">
                <h3>Answer your security questions:</h3>
                <div id="questions"></div>
                
                <div class="form-group">
                    <label>New Password:</label>
                    <input type="password" id="newPassword" minlength="6" required>
                </div>
                
                <button type="submit" id="step2Btn">Reset Password</button>
            </form>
        </div>

        <div id="error" class="error"></div>
    </div>

    <script>
        let currentStep = 1;
        let securityQuestions = [];

        // Step 1: Get security questions
        document.getElementById('usernameForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const btn = document.getElementById('step1Btn');
            
            btn.disabled = true;
            btn.textContent = 'Loading...';
            clearError();

            try {
                const response = await fetch('/api/auth/forgot-password/step1', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });

                const data = await response.json();

                if (response.ok) {
                    securityQuestions = data.securityQuestions;
                    showStep2();
                } else {
                    showError(data.message);
                }
            } catch (err) {
                showError('Network error. Please try again.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Continue';
            }
        });

        // Step 2: Reset password
        document.getElementById('questionsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const newPassword = document.getElementById('newPassword').value;
            const answers = securityQuestions.map((_, index) => 
                document.getElementById(`answer${index}`).value
            );
            const btn = document.getElementById('step2Btn');
            
            btn.disabled = true;
            btn.textContent = 'Resetting...';
            clearError();

            try {
                const response = await fetch('/api/auth/forgot-password/step2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, answers, newPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Password reset successful! You can now login.');
                    window.location.href = '/login';
                } else {
                    showError(data.message);
                }
            } catch (err) {
                showError('Network error. Please try again.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Reset Password';
            }
        });

        function showStep2() {
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            
            const questionsDiv = document.getElementById('questions');
            questionsDiv.innerHTML = '';
            
            securityQuestions.forEach((q, index) => {
                const div = document.createElement('div');
                div.className = 'form-group';
                div.innerHTML = `
                    <label>${q.question}</label>
                    <input type="text" id="answer${index}" required>
                `;
                questionsDiv.appendChild(div);
            });
        }

        function showError(message) {
            document.getElementById('error').textContent = message;
        }

        function clearError() {
            document.getElementById('error').textContent = '';
        }
    </script>
</body>
</html>
```

## 🧪 Testing with Postman

### Test 1: Get Available Security Questions

1. **Method:** GET
2. **URL:** `http://localhost:4000/api/auth/security-questions`
3. **Headers:** None needed
4. **Expected Response:** List of all available security questions

### Test 2: Step 1 - Get User's Security Questions

1. **Method:** POST
2. **URL:** `http://localhost:4000/api/auth/forgot-password/step1`
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "username": "admin"
   }
   ```
5. **Expected Response:** User's 3 security questions

### Test 3: Step 2 - Reset Password

1. **Method:** POST
2. **URL:** `http://localhost:4000/api/auth/forgot-password/step2`
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "username": "admin",
     "answers": ["answer1", "answer2", "answer3"],
     "newPassword": "NewPassword123!"
   }
   ```
5. **Expected Response:** Success message

## 🔒 Security Features

### 1. **No Username Enumeration**
- Same response whether username exists or not
- Prevents attackers from discovering valid usernames

### 2. **Hashed Security Answers**
- All security answers are bcrypt hashed
- Even if database is compromised, answers are protected

### 3. **Case-Insensitive Answers**
- Answers are converted to lowercase before comparison
- User-friendly (doesn't matter if they type "New York" or "new york")

### 4. **All Questions Required**
- Must answer all 3 questions correctly
- Can't reset with partial information

### 5. **Password Validation**
- New password must be at least 6 characters
- Prevents weak passwords

### 6. **Temporary Tokens**
- Uses temporary tokens for password changes
- Tokens expire after 30 minutes

## ⚠️ Error Handling

### Common Error Scenarios:

1. **Username doesn't exist**
   - Response: "If this account exists, security questions will be shown."
   - Action: User should check username spelling

2. **Security questions not set**
   - Response: "Security questions not set. Please contact administrator to reset password."
   - Action: Admin must set security questions for user

3. **Wrong answers**
   - Response: "Security answers do not match"
   - Action: User should try again or contact admin

4. **Password too short**
   - Response: "Password must be at least 6 characters"
   - Action: User must enter longer password

5. **Network/server errors**
   - Response: "Server error"
   - Action: Try again later or contact support

## 🎯 User Flow

### Complete User Journey:

1. **User clicks "Forgot Password"**
2. **User enters username**
3. **System shows 3 security questions**
4. **User answers all 3 questions**
5. **User enters new password**
6. **System resets password**
7. **User can login with new password**

### Admin Setup Flow:

1. **Admin creates user account**
2. **User logs in for first time**
3. **System requires password change**
4. **User sets new password + security questions**
5. **User can now use forgot password feature**

## 📱 Mobile-Friendly

The API is designed to work well with mobile apps:

- Simple JSON requests/responses
- No complex file uploads
- Clear error messages
- Works with any HTTP client

## 🔧 Integration Notes

### For Frontend Developers:

1. **Store username between steps** - Don't lose it between step 1 and 2
2. **Handle loading states** - Show loading indicators during API calls
3. **Validate on frontend** - Check password length before sending
4. **Clear error messages** - Show user-friendly error messages
5. **Redirect after success** - Take user to login page after successful reset

### For Mobile Developers:

1. **Use HTTP client** - Any HTTP library works (axios, fetch, etc.)
2. **Handle network errors** - Show appropriate messages for network issues
3. **Store state** - Keep username and questions in app state
4. **Validate inputs** - Check password requirements before API call

## ✅ Summary

The forgot password system is **fully implemented and ready to use**:

- ✅ **Step 1:** Get user's security questions
- ✅ **Step 2:** Verify answers and reset password
- ✅ **Security:** Proper hashing, validation, and error handling
- ✅ **User-friendly:** Clear messages and simple flow
- ✅ **Mobile-ready:** Works with any HTTP client
- ✅ **Admin-friendly:** Easy to set up for new users

**Endpoints:**
- `GET /api/auth/security-questions`
- `POST /api/auth/forgot-password/step1`
- `POST /api/auth/forgot-password/step2`

**Ready to integrate into your frontend!** 🚀
