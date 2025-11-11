## API Endpoint Examples

Generated from Postman collection. Success/error bodies are heuristic.

### [POST] {{base_url}}/api/auth/login - Login (get JWT)
Group: Auth

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "username": "{{admin_username}}",
  "password": "{{admin_password}}"
}
```

Success (200):
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

Errors:
- 400:
```json
{
  "message": "username and password required"
}
```
- 401:
```json
{
  "message": "Invalid credentials"
}
```

### [GET] {{base_url}}/api/unions?q=telecom&sector=Communication&page=1&per_page=10 - List unions (search & pagination)
Group: Unions

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/unions - Create union
Group: Unions

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "union_code": "ET01",
  "name_en": "Ethio Telecom Workers Union",
  "name_am": "የኢትዮ ቴሌኮም ሠራተኞች ህብረት",
  "sector": "Communication",
  "organization": "Ethio Telecom",
  "established_date": "2010-01-01",
  "terms_of_election": 3,
  "strategic_plan_in_place": true
}
```

Success (201):
```json
{
  "union_code": "ET01",
  "name_en": "Ethio Telecom Workers Union",
  "name_am": "የኢትዮ ቴሌኮም ሠራተኞች ህብረት",
  "sector": "Communication",
  "organization": "Ethio Telecom",
  "established_date": "2010-01-01",
  "terms_of_election": 3,
  "strategic_plan_in_place": true,
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/unions/1 - Get union by id
Group: Unions

Success (200):
```json
{
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/unions/1 - Update union
Group: Unions

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "name_en": "Updated Ethio Telecom Union",
  "terms_of_election": 4
}
```

Success (200):
```json
{
  "id": 1,
  "name_en": "Updated Ethio Telecom Union",
  "terms_of_election": 4
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/unions/1?confirm=true - Delete union (confirm)
Group: Unions

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/members?q=abebe&union_id=1&page=1&per_page=20 - List members
Group: Members

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/members - Create member
Group: Members

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "union_id": 1,
  "member_code": "M-1001",
  "first_name": "Abebe",
  "father_name": "Kebede",
  "surname": "Tadesse",
  "sex": "Male",
  "birthdate": "1990-05-10",
  "education": "Degree",
  "phone": "+251911000000",
  "email": "abebe@example.com",
  "salary": 3500,
  "registry_date": "2021-06-15"
}
```

Success (201):
```json
{
  "union_id": 1,
  "member_code": "M-1001",
  "first_name": "Abebe",
  "father_name": "Kebede",
  "surname": "Tadesse",
  "sex": "Male",
  "birthdate": "1990-05-10",
  "education": "Degree",
  "phone": "+251911000000",
  "email": "abebe@example.com",
  "salary": 3500,
  "registry_date": "2021-06-15",
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/members/1 - Get member by id
Group: Members

Success (200):
```json
{
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/members/1 - Update member
Group: Members

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "phone": "+251911111111",
  "email": "abebe.new@example.com"
}
```

Success (200):
```json
{
  "id": 1,
  "phone": "+251911111111",
  "email": "abebe.new@example.com"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/members/1?archive=true - Archive member (move to archives)
Group: Members

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "reason": "Left union"
}
```

Success (200):
```json
{
  "message": "Member archived"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/members/1?confirm=true - Delete member (hard delete confirm)
Group: Members

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/union-executives?union_id=1 - List union executives
Group: Union Executives

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/union-executives - Create union executive
Group: Union Executives

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "union_id": 1,
  "mem_id": 1,
  "position": "Vice Chairman",
  "appointed_date": "2023-01-01",
  "term_length_years": 3
}
```

Success (201):
```json
{
  "union_id": 1,
  "mem_id": 1,
  "position": "Vice Chairman",
  "appointed_date": "2023-01-01",
  "term_length_years": 3,
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/union-executives/1 - Get union executive by id
Group: Union Executives

Success (200):
```json
{
  "id": 1,
  "union_id": 1,
  "mem_id": 1,
  "position": "Vice Chairman",
  "appointed_date": "2023-01-01",
  "term_length_years": 3
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/union-executives/1 - Update union executive
Group: Union Executives

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "position": "Chairman",
  "term_length_years": 4
}
```

Success (200):
```json
{
  "id": 1,
  "position": "Chairman",
  "term_length_years": 4
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/union-executives/1?confirm=true - Delete union executive (confirm)
Group: Union Executives

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/cbas?union_id=1&status=signed - List CBAs
Group: CBAs

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/cbas/1 - Get CBA by id
Group: CBAs

Success (200):
```json
{
  "id": 1,
  "union_id": 1,
  "duration_years": 3,
  "status": "signed",
  "registration_date": "2022-07-01",
  "next_end_date": "2025-07-01",
  "round": "1st"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/cbas - Create CBA
Group: CBAs

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "union_id": 1,
  "duration_years": 3,
  "status": "signed",
  "registration_date": "2022-07-01",
  "next_end_date": "2025-07-01",
  "round": "1st"
}
```

Success (201):
```json
{
  "union_id": 1,
  "duration_years": 3,
  "status": "signed",
  "registration_date": "2022-07-01",
  "next_end_date": "2025-07-01",
  "round": "1st",
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/cbas/1 - Update CBA
Group: CBAs

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "status": "expired",
  "notes": "CBA expired, needs renewal"
}
```

Success (200):
```json
{
  "id": 1,
  "union_id": 1,
  "status": "expired",
  "notes": "CBA expired, needs renewal"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/cbas/1?confirm=true - Delete CBA (confirm)
Group: CBAs

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/terminated-unions - List terminated unions
Group: Terminated Unions

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/terminated-unions/1 - Get terminated union by id
Group: Terminated Unions

Success (200):
```json
{
  "id": 1,
  "union_id": 1,
  "name_en": "Old Union",
  "terminated_date": "2025-09-01",
  "termination_reason": "Merged"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/terminated-unions - Create terminated union (archive)
Group: Terminated Unions

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "union_id": 1,
  "name_en": "Old Union",
  "terminated_date": "2025-09-01",
  "termination_reason": "Merged"
}
```

Success (201):
```json
{
  "union_id": 1,
  "name_en": "Old Union",
  "terminated_date": "2025-09-01",
  "termination_reason": "Merged",
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/terminated-unions/1 - Update terminated union
Group: Terminated Unions

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "termination_reason": "Dissolved",
  "notes": "Updated termination reason"
}
```

Success (200):
```json
{
  "id": 1,
  "termination_reason": "Dissolved",
  "notes": "Updated termination reason"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/terminated-unions/1?confirm=true - Delete terminated union (confirm)
Group: Terminated Unions

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/login-accounts - List accounts (admin)
Group: Login Accounts (admin)

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/login-accounts - Create account (admin)
Group: Login Accounts (admin)

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "username": "user1",
  "password": "User1Pass!",
  "role": "member"
}
```

Success (201):
```json
{
  "username": "user1",
  "password": "User1Pass!",
  "role": "member",
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/login-accounts/1 - Get account by id (admin)
Group: Login Accounts (admin)

Success (200):
```json
{
  "id": 1,
  "username": "user1",
  "role": "member",
  "mem_id": 1,
  "must_change_password": false,
  "is_locked": false
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/login-accounts/1 - Update account (admin)
Group: Login Accounts (admin)

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "role": "admin",
  "must_change_password": false
}
```

Success (200):
```json
{
  "id": 1,
  "username": "user1",
  "role": "admin"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/login-accounts/reset/admin - Reset password (admin)
Group: Login Accounts (admin)

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "password": "NewPass123!"
}
```

Success (200):
```json
{
  "message": "Password reset"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "password required"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/login-accounts/1/lock - Lock/Unlock account (admin)
Group: Login Accounts (admin)

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "is_locked": true
}
```

Success (200):
```json
{
  "message": "Account locked"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/login-accounts/1?confirm=true - Delete account (admin confirm)
Group: Login Accounts (admin)

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/org-leaders - List org leaders
Group: Organization Leaders

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/org-leaders/1 - Get org leader by id
Group: Organization Leaders

Success (200):
```json
{
  "id": 1,
  "union_id": 1,
  "title": "Mr",
  "first_name": "Yared",
  "position": "CEO",
  "phone": "+251911222333",
  "email": "yared@org.com"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/org-leaders - Create org leader
Group: Organization Leaders

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "union_id": 1,
  "title": "Mr",
  "first_name": "Yared",
  "position": "CEO",
  "phone": "+251911222333",
  "email": "yared@org.com"
}
```

Success (201):
```json
{
  "union_id": 1,
  "title": "Mr",
  "first_name": "Yared",
  "position": "CEO",
  "phone": "+251911222333",
  "email": "yared@org.com",
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/org-leaders/1 - Update org leader
Group: Organization Leaders

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "phone": "+251911222444",
  "email": "yared.new@org.com"
}
```

Success (200):
```json
{
  "id": 1,
  "phone": "+251911222444",
  "email": "yared.new@org.com"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/org-leaders/1?confirm=true - Delete org leader (confirm)
Group: Organization Leaders

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/archives?q=john&page=1&per_page=20 - List archives
Group: Archives

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/archives/1 - Get archive by id
Group: Archives

Success (200):
```json
{
  "id": 1,
  "mem_id": 1,
  "union_id": 1,
  "member_code": "M-1001",
  "first_name": "Abebe",
  "father_name": "Kebede",
  "surname": "Tadesse",
  "resigned_date": "2025-09-01",
  "reason": "Retired"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/archives - Create archive (admin)
Group: Archives

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "mem_id": 1,
  "union_id": 1,
  "member_code": "M-1001",
  "first_name": "Abebe",
  "father_name": "Kebede",
  "surname": "Tadesse",
  "resigned_date": "2025-09-01",
  "reason": "Retired"
}
```

Success (201):
```json
{
  "id": 1,
  "mem_id": 1,
  "union_id": 1,
  "member_code": "M-1001",
  "first_name": "Abebe",
  "father_name": "Kebede",
  "surname": "Tadesse",
  "resigned_date": "2025-09-01",
  "reason": "Retired"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/archives/1?confirm=true - Delete archive (admin confirm)
Group: Archives

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/visitors?from=2025-09-01&to=2025-09-30 - List visitors (range)
Group: Visitors

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/visitors - Create/Increment visitor
Group: Visitors

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "visit_date": "2025-10-02",
  "increment": 1
}
```

Success (201):
```json
{
  "visit_date": "2025-10-02",
  "increment": 1,
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/contacts - Submit contact message (public)
Group: Contacts

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "name": "User",
  "email_or_phone": "user@example.com",
  "subject": "Inquiry",
  "message": "I need help with membership."
}
```

Success (201):
```json
{
  "name": "User",
  "email_or_phone": "user@example.com",
  "subject": "Inquiry",
  "message": "I need help with membership.",
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/contacts?q=inquiry&page=1&per_page=20 - List contact messages (admin)
Group: Contacts

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/contacts/1 - Get contact by id (admin)
Group: Contacts

Success (200):
```json
{
  "id": 1,
  "name": "User",
  "email_or_phone": "user@example.com",
  "subject": "Inquiry",
  "message": "I need help with membership."
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/contacts/1?confirm=true - Delete contact (admin confirm)
Group: Contacts

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/news?is_published=true&page=1&per_page=20 - List news
Group: News

Success (200):
```json
{
  "data": [
    {
      "id": 1,
      "title": "Federation Annual Report",
      "body": "Detailed report content...",
      "summary": "Annual summary",
      "published_at": "2025-10-02T08:00:00Z",
      "is_published": true,
      "image_filename": "news-1729265892123-456789012.jpg",
      "is_local": true,
      "image_url": "/uploads/news/news-1729265892123-456789012.jpg",
      "created_at": "2025-10-18T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/news/1 - Get news by id
Group: News

Success (200):
```json
{
  "id": 1,
  "title": "Federation Annual Report",
  "body": "Detailed report content...",
  "summary": "Annual summary",
  "published_at": "2025-10-02T08:00:00Z",
  "is_published": true,
  "image_filename": "news-1729265892123-456789012.jpg",
  "is_local": true,
  "image_url": "/uploads/news/news-1729265892123-456789012.jpg",
  "created_at": "2025-10-18T08:00:00.000Z"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/news - Create news (admin)
Group: News

**Note**: This endpoint supports TWO methods of adding images:
1. **File Upload** (multipart/form-data)
2. **URL String** (application/json)
3. **No Image** (optional)

#### Method 1: Upload File with News

Content-Type: `multipart/form-data`

Form Data:
- `image` (file): Image file (jpeg, jpg, png, gif, webp) - Max 5MB - **Optional**
- `title` (text): News title (required)
- `body` (text): News body content (optional)
- `summary` (text): News summary (optional)
- `published_at` (text): Publication date (optional, format: ISO 8601)
- `is_published` (text): "true" or "false" (optional)

Success (201):
```json
{
  "id": 1,
  "title": "Federation Annual Report",
  "body": "Detailed report content...",
  "summary": "Annual summary",
  "published_at": "2025-10-02T08:00:00.000Z",
  "is_published": true,
  "image_filename": "news-1729265892123-456789012.jpg",
  "is_local": true,
  "image_url": "/uploads/news/news-1729265892123-456789012.jpg",
  "created_at": "2025-10-18T08:00:00.000Z"
}
```

#### Method 2: Add with Image URL

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "title": "Federation Annual Report",
  "body": "Detailed report content...",
  "summary": "Annual summary",
  "published_at": "2025-10-02T08:00:00Z",
  "is_published": true,
  "image_url": "https://example.com/images/report.jpg"
}
```

Success (201):
```json
{
  "id": 1,
  "title": "Federation Annual Report",
  "body": "Detailed report content...",
  "summary": "Annual summary",
  "published_at": "2025-10-02T08:00:00.000Z",
  "is_published": true,
  "image_filename": "https://example.com/images/report.jpg",
  "is_local": false,
  "image_url": "https://example.com/images/report.jpg",
  "created_at": "2025-10-18T08:00:00.000Z"
}
```

#### Method 3: Create without Image

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "title": "Federation Annual Report",
  "body": "Detailed report content...",
  "summary": "Annual summary",
  "published_at": "2025-10-02T08:00:00Z",
  "is_published": true
}
```

Success (201):
```json
{
  "id": 1,
  "title": "Federation Annual Report",
  "body": "Detailed report content...",
  "summary": "Annual summary",
  "published_at": "2025-10-02T08:00:00.000Z",
  "is_published": true,
  "image_filename": null,
  "is_local": false,
  "created_at": "2025-10-18T08:00:00.000Z"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/news/1 - Update news (admin)
Group: News

**Note**: You can update the image using file upload, URL, or remove it.

#### Method 1: Update with New Image File

Content-Type: `multipart/form-data`

Form Data:
- `image` (file): New image file - **Optional**
- `title` (text): Updated title - Optional
- Other fields as needed

Success (200):
```json
{
  "id": 1,
  "title": "Updated Federation Report",
  "is_published": false,
  "image_filename": "news-1729265999123-987654321.jpg",
  "is_local": true,
  "image_url": "/uploads/news/news-1729265999123-987654321.jpg"
}
```

#### Method 2: Update with Image URL

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "title": "Updated Federation Report",
  "is_published": false,
  "image_url": "https://example.com/new-image.jpg"
}
```

Success (200):
```json
{
  "id": 1,
  "title": "Updated Federation Report",
  "is_published": false,
  "image_filename": "https://example.com/new-image.jpg",
  "is_local": false,
  "image_url": "https://example.com/new-image.jpg"
}
```

#### Method 3: Update and Remove Image

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "title": "Updated Federation Report",
  "is_published": false,
  "remove_image": true
}
```

Success (200):
```json
{
  "id": 1,
  "title": "Updated Federation Report",
  "is_published": false,
  "image_filename": null,
  "is_local": false
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/news/1?confirm=true - Delete news (admin confirm)
Group: News

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/galleries - List galleries
Group: Galleries & Photos

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/galleries - Create gallery
Group: Galleries & Photos

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "title": "Conference 2025",
  "description": "Photos from the annual conference"
}
```

Success (201):
```json
{
  "title": "Conference 2025",
  "description": "Photos from the annual conference",
  "id": 1
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/galleries/1 - Get gallery by id (with photos)
Group: Galleries & Photos

Success (200):
```json
{
  "gallery": {
    "id": 1,
    "title": "Conference 2025",
    "description": "Photos from the annual conference"
  },
  "photos": []
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/galleries/1 - Update gallery
Group: Galleries & Photos

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "title": "Conference 2025 - Updated",
  "description": "Updated description"
}
```

Success (200):
```json
{
  "id": 1,
  "title": "Conference 2025 - Updated",
  "description": "Updated description"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/galleries/1?confirm=true - Delete gallery (confirm)
Group: Galleries & Photos

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/photos?gallery_id=1&page=1&per_page=20 - List photos
Group: Galleries & Photos

Success (200):
```json
{
  "data": [],
  "meta": {
    "total": 0
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/photos/1 - Get photo by id
Group: Galleries & Photos

Success (200):
```json
{
  "id": 1,
  "gallery_id": 1,
  "filename": "conference-01.jpg",
  "caption": "Opening ceremony",
  "taken_at": "2025-09-20"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/photos - Upload photo file (admin)
Group: Galleries & Photos

**Note**: This endpoint supports TWO methods of adding photos:
1. **File Upload** (multipart/form-data)
2. **URL String** (application/json)

#### Method 1: Upload File

Content-Type: `multipart/form-data`

Form Data:
- `photo` (file): Image file (jpeg, jpg, png, gif, webp) - Max 5MB
- `gallery_id` (text): Gallery ID (required)
- `caption` (text): Photo caption (optional)
- `taken_at` (text): Date photo was taken (optional, format: YYYY-MM-DD)

Success (201):
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

#### Method 2: Add from URL

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "gallery_id": 1,
  "image_url": "https://example.com/image.jpg",
  "caption": "Opening ceremony",
  "taken_at": "2025-09-20"
}
```

Success (201):
```json
{
  "id": 1,
  "gallery_id": 1,
  "filename": "https://example.com/image.jpg",
  "caption": "Opening ceremony",
  "taken_at": "2025-09-20",
  "is_local": false
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Either upload a photo file or provide an image_url"
}
```
- 400 (File too large):
```json
{
  "message": "File size too large. Maximum 5MB allowed."
}
```
- 400 (Invalid file type):
```json
{
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [PUT] {{base_url}}/api/photos/1 - Update photo
Group: Galleries & Photos

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "caption": "Updated caption",
  "taken_at": "2025-09-21"
}
```

Success (200):
```json
{
  "id": 1,
  "caption": "Updated caption",
  "taken_at": "2025-09-21"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [DELETE] {{base_url}}/api/photos/1?confirm=true - Delete photo (confirm)
Group: Galleries & Photos

Success (200):
```json
{
  "message": "Deleted"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "Not found"
}
```
- 400:
```json
{
  "message": "To delete set ?confirm=true"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/reports/members-summary - Members summary (admin report)
Group: Reports

Success (200):
```json
{
  "totals": [
    {
      "sex": "M",
      "cnt": 100
    },
    {
      "sex": "F",
      "cnt": 80
    }
  ],
  "per_year": [
    {
      "year": 2023,
      "cnt": 120
    },
    {
      "year": 2024,
      "cnt": 160
    }
  ]
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/reports/unions-cba-expired - Unions with expired CBA (admin report)
Group: Reports

Success (200):
```json
{
  "data": [
    {
      "union_id": 1,
      "name_en": "Union A",
      "next_end_date": "2025-07-01"
    }
  ]
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [POST] {{base_url}}/api/reports/cache - Save report cache (admin)
Group: Reports

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "report_name": "members_by_year",
  "payload": {
    "2021": 120,
    "2022": 140
  }
}
```

Success (201):
```json
{
  "id": 1,
  "report_name": "members_by_year",
  "payload": {
    "2021": 120,
    "2022": 140
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```
- 500:
```json
{
  "message": "Server error"
}
```


 
 ## OSH (Occupational Safety and Health) Incidents

### [GET] {{base_url}}/api/osh-incidents?union_id=1&accident_category=People&injury_severity=Major&status=open&from_date=2024-01-01&to_date=2024-12-31&page=1&per_page=20 - List OSH incidents (public)
Group: OSH Incidents

Query Parameters:
- `union_id` (optional): Filter by union ID
- `accident_category` (optional): Filter by accident category (People, Property/Asset)
- `injury_severity` (optional): Filter by injury severity
- `damage_severity` (optional): Filter by damage severity
- `status` (optional): Filter by status (open, investigating, action_pending, closed)
- `from_date` (optional): Start date filter (YYYY-MM-DD)
- `to_date` (optional): End date filter (YYYY-MM-DD)
- `q` (optional): Search in description
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

Success (200):
```json
{
  "data": [
    {
      "id": 1,
      "unionId": 1,
      "accidentCategory": "People",
      "dateTimeOccurred": "2024-10-18T10:30:00.000Z",
      "locationSite": "Main Office Building",
      "locationBuilding": "Building A",
      "locationArea": "Ground Floor",
      "locationGpsLatitude": 9.0320,
      "locationGpsLongitude": 38.7469,
      "injurySeverity": "Minor",
      "damageSeverity": "None",
      "rootCauseUnsafeAct": true,
      "rootCauseEquipmentFailure": false,
      "rootCauseEnvironmental": false,
      "rootCauseOther": null,
      "description": "Employee slipped on wet floor in the cafeteria",
      "regulatoryReportRequired": false,
      "regulatoryReportDate": null,
      "status": "open",
      "reportedBy": "Safety Officer",
      "reportedDate": "2024-10-18T10:30:00.000Z",
      "investigationNotes": "Initial investigation completed",
      "correctiveActions": "Install non-slip mats",
      "preventiveMeasures": "Regular floor cleaning schedule",
      "createdAt": "2024-10-18T10:30:00.000Z",
      "updatedAt": "2024-10-18T10:30:00.000Z",
      "createdBy": 1,
      "updatedBy": 1,
      "rootCauses": ["Unsafe Act"]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20,
    "total_pages": 1
  }
}
```

### [GET] {{base_url}}/api/osh-incidents/1 - Get OSH incident by ID (public)
Group: OSH Incidents

Success (200):
```json
{
  "data": {
    "id": 1,
    "unionId": 1,
    "accidentCategory": "People",
    "dateTimeOccurred": "2024-10-18T10:30:00.000Z",
    "locationSite": "Main Office Building",
    "locationBuilding": "Building A",
    "locationArea": "Ground Floor",
    "locationGpsLatitude": 9.0320,
    "locationGpsLongitude": 38.7469,
    "injurySeverity": "Minor",
    "damageSeverity": "None",
    "rootCauseUnsafeAct": true,
    "rootCauseEquipmentFailure": false,
    "rootCauseEnvironmental": false,
    "rootCauseOther": null,
    "description": "Employee slipped on wet floor in the cafeteria",
    "regulatoryReportRequired": false,
    "regulatoryReportDate": null,
    "status": "open",
    "reportedBy": "Safety Officer",
    "reportedDate": "2024-10-18T10:30:00.000Z",
    "investigationNotes": "Initial investigation completed",
    "correctiveActions": "Install non-slip mats",
    "preventiveMeasures": "Regular floor cleaning schedule",
    "createdAt": "2024-10-18T10:30:00.000Z",
    "updatedAt": "2024-10-18T10:30:00.000Z",
    "createdBy": 1,
    "updatedBy": 1,
    "rootCauses": ["Unsafe Act"]
  }
}
```

Errors:
- 404:
```json
{
  "message": "OSH incident not found"
}
```

### [POST] {{base_url}}/api/osh-incidents - Create OSH incident (admin)
Group: OSH Incidents

Headers:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {{jwt_token}}"
}
```

Request Body:
```json
{
  "union_id": 1,
  "accident_category": "People",
  "date_time_occurred": "2024-10-18T10:30:00Z",
  "location_site": "Main Office Building",
  "location_building": "Building A",
  "location_area": "Ground Floor",
  "location_gps_latitude": 9.0320,
  "location_gps_longitude": 38.7469,
  "injury_severity": "Minor",
  "damage_severity": "None",
  "root_causes": ["Unsafe Act", "Equipment Failure"],
  "description": "Employee slipped on wet floor in the cafeteria",
  "regulatory_report_required": false,
  "status": "open",
  "reported_by": "Safety Officer",
  "investigation_notes": "Initial investigation completed",
  "corrective_actions": "Install non-slip mats",
  "preventive_measures": "Regular floor cleaning schedule"
}
```

Success (201):
```json
{
  "data": {
    "id": 1,
    "unionId": 1,
    "accidentCategory": "People",
    "dateTimeOccurred": "2024-10-18T10:30:00.000Z",
    "locationSite": "Main Office Building",
    "locationBuilding": "Building A",
    "locationArea": "Ground Floor",
    "locationGpsLatitude": 9.0320,
    "locationGpsLongitude": 38.7469,
    "injurySeverity": "Minor",
    "damageSeverity": "None",
    "rootCauseUnsafeAct": true,
    "rootCauseEquipmentFailure": true,
    "rootCauseEnvironmental": false,
    "rootCauseOther": null,
    "description": "Employee slipped on wet floor in the cafeteria",
    "regulatoryReportRequired": false,
    "regulatoryReportDate": null,
    "status": "open",
    "reportedBy": "Safety Officer",
    "reportedDate": "2024-10-18T10:30:00.000Z",
    "investigationNotes": "Initial investigation completed",
    "correctiveActions": "Install non-slip mats",
    "preventiveMeasures": "Regular floor cleaning schedule",
    "createdAt": "2024-10-18T10:30:00.000Z",
    "updatedAt": "2024-10-18T10:30:00.000Z",
    "createdBy": 1,
    "updatedBy": 1,
    "rootCauses": ["Unsafe Act", "Equipment Failure"]
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 400:
```json
{
  "message": "Validation error"
}
```

### [PUT] {{base_url}}/api/osh-incidents/1 - Update OSH incident (admin)
Group: OSH Incidents

Headers:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {{jwt_token}}"
}
```

Request Body:
```json
{
  "status": "investigating",
  "investigation_notes": "Updated investigation notes",
  "corrective_actions": "Updated corrective actions",
  "preventive_measures": "Updated preventive measures"
}
```

Success (200):
```json
{
  "data": {
    "id": 1,
    "unionId": 1,
    "accidentCategory": "People",
    "dateTimeOccurred": "2024-10-18T10:30:00.000Z",
    "locationSite": "Main Office Building",
    "locationBuilding": "Building A",
    "locationArea": "Ground Floor",
    "locationGpsLatitude": 9.0320,
    "locationGpsLongitude": 38.7469,
    "injurySeverity": "Minor",
    "damageSeverity": "None",
    "rootCauseUnsafeAct": true,
    "rootCauseEquipmentFailure": true,
    "rootCauseEnvironmental": false,
    "rootCauseOther": null,
    "description": "Employee slipped on wet floor in the cafeteria",
    "regulatoryReportRequired": false,
    "regulatoryReportDate": null,
    "status": "investigating",
    "reportedBy": "Safety Officer",
    "reportedDate": "2024-10-18T10:30:00.000Z",
    "investigationNotes": "Updated investigation notes",
    "correctiveActions": "Updated corrective actions",
    "preventiveMeasures": "Updated preventive measures",
    "createdAt": "2024-10-18T10:30:00.000Z",
    "updatedAt": "2024-10-18T10:30:00.000Z",
    "createdBy": 1,
    "updatedBy": 1,
    "rootCauses": ["Unsafe Act", "Equipment Failure"]
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "OSH incident not found"
}
```

### [DELETE] {{base_url}}/api/osh-incidents/1 - Delete OSH incident (admin)
Group: OSH Incidents

Headers:
```json
{
  "Authorization": "Bearer {{jwt_token}}"
}
```

Success (200):
```json
{
  "message": "OSH incident deleted successfully"
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 404:
```json
{
  "message": "OSH incident not found"
}
```

### [GET] {{base_url}}/api/osh-incidents/statistics?union_id=1&from_date=2024-01-01&to_date=2024-12-31 - Get OSH statistics (public)
Group: OSH Incidents

Query Parameters:
- `union_id` (optional): Filter by union ID
- `from_date` (optional): Start date filter (YYYY-MM-DD)
- `to_date` (optional): End date filter (YYYY-MM-DD)

Success (200):
```json
{
  "data": {
    "byCategory": [
      {
        "category": "People",
        "count": 5
      },
      {
        "category": "Property/Asset",
        "count": 2
      }
    ],
    "byInjurySeverity": [
      {
        "severity": "Minor",
        "count": 3
      },
      {
        "severity": "None",
        "count": 4
      }
    ],
    "byDamageSeverity": [
      {
        "severity": "Minor",
        "count": 2
      },
      {
        "severity": "None",
        "count": 5
      }
    ],
    "byStatus": [
      {
        "status": "open",
        "count": 3
      },
      {
        "status": "investigating",
        "count": 2
      },
      {
        "status": "closed",
        "count": 2
      }
    ],
    "monthlyTrends": [
      {
        "month": "2024-10",
        "count": 3
      },
      {
        "month": "2024-11",
        "count": 4
      }
    ],
    "total": 7
  }
}
```

## OSH Reports

### [GET] {{base_url}}/api/reports/osh-summary?union_id=1&from_date=2024-01-01&to_date=2024-12-31 - OSH Summary Report (admin)
Group: OSH Reports

Headers:
```json
{
  "Authorization": "Bearer {{jwt_token}}"
}
```

Query Parameters:
- `union_id` (optional): Filter by union ID
- `from_date` (optional): Start date filter (YYYY-MM-DD)
- `to_date` (optional): End date filter (YYYY-MM-DD)

Success (200):
```json
{
  "total_incidents": 7,
  "by_category": [
    {
      "category": "People",
      "count": 5
    },
    {
      "category": "Property/Asset",
      "count": 2
    }
  ],
  "by_injury_severity": [
    {
      "severity": "Minor",
      "count": 3
    },
    {
      "severity": "None",
      "count": 4
    }
  ],
  "by_damage_severity": [
    {
      "severity": "Minor",
      "count": 2
    },
    {
      "severity": "None",
      "count": 5
    }
  ],
  "by_status": [
    {
      "status": "open",
      "count": 3
    },
    {
      "status": "investigating",
      "count": 2
    },
    {
      "status": "closed",
      "count": 2
    }
  ]
}
```

### [GET] {{base_url}}/api/reports/osh-high-severity?union_id=1&from_date=2024-01-01&to_date=2024-12-31 - OSH High Severity Report (admin)
Group: OSH Reports

Headers:
```json
{
  "Authorization": "Bearer {{jwt_token}}"
}
```

Query Parameters:
- `union_id` (optional): Filter by union ID
- `from_date` (optional): Start date filter (YYYY-MM-DD)
- `to_date` (optional): End date filter (YYYY-MM-DD)

Success (200):
```json
{
  "count": 2,
  "data": [
    {
      "id": 1,
      "unionId": 1,
      "accidentCategory": "People",
      "dateTimeOccurred": "2024-10-18T10:30:00.000Z",
      "locationSite": "Main Office Building",
      "locationBuilding": "Building A",
      "locationArea": "Ground Floor",
      "injurySeverity": "Major",
      "damageSeverity": "Major",
      "rootCauseUnsafeAct": true,
      "rootCauseEquipmentFailure": false,
      "rootCauseEnvironmental": false,
      "rootCauseOther": null,
      "description": "Serious workplace accident",
      "regulatoryReportRequired": true,
      "regulatoryReportDate": "2024-10-19",
      "status": "investigating",
      "reportedBy": "Safety Officer",
      "reportedDate": "2024-10-18T10:30:00.000Z",
      "investigationNotes": "Under investigation",
      "correctiveActions": "Immediate safety measures",
      "preventiveMeasures": "Enhanced safety protocols",
      "createdAt": "2024-10-18T10:30:00.000Z",
      "updatedAt": "2024-10-18T10:30:00.000Z",
      "createdBy": 1,
      "updatedBy": 1,
      "rootCauses": ["Unsafe Act"]
    }
  ]
}
```

### [GET] {{base_url}}/api/reports/osh-regulatory-reports?union_id=1&from_date=2024-01-01&to_date=2024-12-31 - OSH Regulatory Reports (admin)
Group: OSH Reports

Headers:
```json
{
  "Authorization": "Bearer {{jwt_token}}"
}
```

Query Parameters:
- `union_id` (optional): Filter by union ID
- `from_date` (optional): Start date filter (YYYY-MM-DD)
- `to_date` (optional): End date filter (YYYY-MM-DD)

Success (200):
```json
{
  "count": 1,
  "data": [
    {
      "id": 1,
      "unionId": 1,
      "accidentCategory": "People",
      "dateTimeOccurred": "2024-10-18T10:30:00.000Z",
      "locationSite": "Main Office Building",
      "locationBuilding": "Building A",
      "locationArea": "Ground Floor",
      "injurySeverity": "Major",
      "damageSeverity": "Major",
      "rootCauseUnsafeAct": true,
      "rootCauseEquipmentFailure": false,
      "rootCauseEnvironmental": false,
      "rootCauseOther": null,
      "description": "Serious workplace accident requiring regulatory report",
      "regulatoryReportRequired": true,
      "regulatoryReportDate": "2024-10-19",
      "status": "investigating",
      "reportedBy": "Safety Officer",
      "reportedDate": "2024-10-18T10:30:00.000Z",
      "investigationNotes": "Under investigation",
      "correctiveActions": "Immediate safety measures",
      "preventiveMeasures": "Enhanced safety protocols",
      "createdAt": "2024-10-18T10:30:00.000Z",
      "updatedAt": "2024-10-18T10:30:00.000Z",
      "createdBy": 1,
      "updatedBy": 1,
      "rootCauses": ["Unsafe Act"]
    }
  ]
}
```

### [GET] {{base_url}}/api/reports/osh-monthly-trends?union_id=1&months=12 - OSH Monthly Trends (admin)
Group: OSH Reports

Headers:
```json
{
  "Authorization": "Bearer {{jwt_token}}"
}
```

Query Parameters:
- `union_id` (optional): Filter by union ID
- `months` (optional): Number of months to analyze (default: 12)

Success (200):
```json
{
  "period_months": 12,
  "data": [
    {
      "month": "2024-01",
      "People": 2,
      "Property/Asset": 1,
      "total": 3
    },
    {
      "month": "2024-02",
      "People": 1,
      "Property/Asset": 0,
      "total": 1
    },
    {
      "month": "2024-03",
      "People": 3,
      "Property/Asset": 2,
      "total": 5
    }
  ]
}
```

### [GET] {{base_url}}/api/reports/osh-root-causes?union_id=1&from_date=2024-01-01&to_date=2024-12-31 - OSH Root Causes Analysis (admin)
Group: OSH Reports

Headers:
```json
{
  "Authorization": "Bearer {{jwt_token}}"
}
```

Query Parameters:
- `union_id` (optional): Filter by union ID
- `from_date` (optional): Start date filter (YYYY-MM-DD)
- `to_date` (optional): End date filter (YYYY-MM-DD)

Success (200):
```json
{
  "total_incidents": 7,
  "root_causes": {
    "unsafe_act": 4,
    "equipment_failure": 2,
    "environmental": 1,
    "other": 0
  },
  "percentages": {
    "unsafe_act": "57.14",
    "equipment_failure": "28.57",
    "environmental": "14.29",
    "other": "0.00"
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/reports/organization-leaders-summary - Organization Leaders Summary
Group: Reports

Success (200):
```json
{
  "total_leaders": 0,
  "by_sector": [
    {
      "sector": "Communication",
      "count": 0
    }
  ],
  "by_organization": [
    {
      "organization": "Ethio Telecom",
      "count": 0
    }
  ]
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```

### [GET] {{base_url}}/api/reports/organization-leaders-list?sector=Communication&page=1&per_page=20 - Organization Leaders Filtered List
Group: Reports

Success (200):
```json
{
  "data": [
    {
      "id": 1,
      "union_id": 1,
      "title": "Mr",
      "first_name": "Yared",
      "father_name": "Kebede",
      "surname": "Tadesse",
      "position": "CEO",
      "phone": "+251911222333",
      "email": "yared@org.com",
      "sector": "Communication",
      "organization": "Ethio Telecom",
      "created_at": "2025-10-18T08:00:00.000Z",
      "union_name": "Ethio Telecom Workers Union"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20
  }
}
```

Errors:
- 401:
```json
{
  "message": "Unauthorized"
}
```
- 500:
```json
{
  "message": "Server error"
}
```