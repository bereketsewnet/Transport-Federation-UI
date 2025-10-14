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

Success (201):
```json
{
  "password": "NewPass123!",
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

### [GET] {{base_url}}/api/archives - List archives
Group: Archives

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

### [GET] {{base_url}}/api/contacts - List contact messages (admin)
Group: Contacts

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

### [GET] {{base_url}}/api/news?is_published=true - List news
Group: News

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

### [POST] {{base_url}}/api/news - Create news (admin)
Group: News

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
  "title": "Federation Annual Report",
  "body": "Detailed report content...",
  "summary": "Annual summary",
  "published_at": "2025-10-02T08:00:00Z",
  "is_published": true,
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

### [POST] {{base_url}}/api/photos - Add photo metadata (admin) - upload separately
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
  "gallery_id": 1,
  "filename": "conference-01.jpg",
  "caption": "Opening ceremony",
  "taken_at": "2025-09-20"
}
```

Success (201):
```json
{
  "gallery_id": 1,
  "filename": "conference-01.jpg",
  "caption": "Opening ceremony",
  "taken_at": "2025-09-20",
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

