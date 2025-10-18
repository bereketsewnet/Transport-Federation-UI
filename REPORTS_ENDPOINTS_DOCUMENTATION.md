# Transport Federation Reports API - Complete Documentation

## Overview
This document contains all 21+ report endpoints requested by the company. Each endpoint includes request format, success responses, and error responses.

**Authentication Required:** All endpoints require Admin JWT token in Authorization header.

**Base URL:** `http://localhost:4000/api/reports`

---

## Table of Contents

### Member Statistics (Reports 1-2)
1. [Members Summary](#1-members-summary)

### Union Statistics (Reports 3-4)
2. [Unions Summary](#2-unions-summary)

### Union Executives (Reports 5-7)
3. [Executives Remaining Days](#3-executives-remaining-days)
4. [Executives Expiring Before Date](#4-executives-expiring-before-date)
5. [Executives by Union](#5-executives-by-union)

### Age-Based Statistics (Reports 8-9)
6. [Members Under 35](#6-members-under-35)
7. [Members Above 35](#7-members-above-35)

### CBA Reports (Reports 10-15)
8. [Unions CBA Status](#8-unions-cba-status)
9. [Unions Without CBA](#9-unions-without-cba)
10. [Unions with Expired CBA](#10-unions-with-expired-cba)
11. [Unions with CBA Expiring Soon](#11-unions-with-cba-expiring-soon)
12. [Unions with Ongoing CBA](#12-unions-with-ongoing-cba)

### General Assembly (Reports 16-18, 21)
13. [General Assembly Status](#13-general-assembly-status)
14. [Unions Without General Assembly](#14-unions-without-general-assembly)
15. [Unions Assembly on Date](#15-unions-assembly-on-date)
16. [Unions with Recent Assembly](#16-unions-with-recent-assembly)

### Terminated Unions (Reports 19-20)
17. [Terminated Unions Count](#17-terminated-unions-count)
18. [Terminated Unions List](#18-terminated-unions-list)

---

## 1. Members Summary

**Reports:** 1 & 2 - Number of members (Male, Female, Total) and by year

**Endpoint:** `GET /api/reports/members-summary`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "summary": {
    "by_sex": [
      {
        "sex": "Male",
        "count": 450
      },
      {
        "sex": "Female",
        "count": 320
      }
    ],
    "grand_total": 770
  },
  "by_year": [
    {
      "year": 2020,
      "Male": 80,
      "Female": 60,
      "total": 140
    },
    {
      "year": 2021,
      "Male": 120,
      "Female": 85,
      "total": 205
    },
    {
      "year": 2022,
      "Male": 150,
      "Female": 100,
      "total": 250
    },
    {
      "year": 2023,
      "Male": 100,
      "Female": 75,
      "total": 175
    }
  ]
}
```

**Use Cases:**
- Display total member count dashboard
- Generate bar/line charts for member growth by year
- Show gender distribution pie chart
- Track member registration trends

**Error Responses:**
- **401 Unauthorized:**
```json
{
  "message": "No token provided" 
}
```

- **403 Forbidden:**
```json
{
  "message": "Requires admin role"
}
```

- **500 Server Error:**
```json
{
  "message": "Server error"
}
```

---

## 2. Unions Summary

**Reports:** 3 & 4 - Total unions and by sector/organization

**Endpoint:** `GET /api/reports/unions-summary`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "total_unions": 45,
  "by_sector": [
    {
      "sector": "Communication",
      "count": 18
    },
    {
      "sector": "Transport",
      "count": 22
    },
    {
      "sector": "Logistics",
      "count": 5
    }
  ],
  "by_organization": [
    {
      "organization": "Ethio Telecom",
      "count": 12
    },
    {
      "organization": "Ethiopian Airlines",
      "count": 8
    },
    {
      "organization": "Transport Authority",
      "count": 6
    }
  ]
}
```

**Use Cases:**
- Display union distribution by sector
- Generate pie charts for sector representation
- Show organizational breakdown
- Dashboard summary statistics

**Error Responses:** Same as Report 1

---

## 3. Executives Remaining Days

**Report:** 5 - List Union Executives with remaining days on position

**Endpoint:** `GET /api/reports/executives-remaining-days`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "union_id": 5,
      "union_name": "Ethio Telecom Workers Union",
      "mem_id": 123,
      "executive_name": "Abebe Kebede Tadesse",
      "sex": "Male",
      "position": "Chairman",
      "appointed_date": "2023-01-15",
      "term_end_date": "2025-11-30",
      "days_remaining": 42,
      "status": "Expiring Soon"
    },
    {
      "id": 2,
      "union_id": 3,
      "union_name": "Transport Union",
      "mem_id": 245,
      "executive_name": "Tigist Hailu Mamo",
      "sex": "Female",
      "position": "Vice Chairman",
      "appointed_date": "2022-06-01",
      "term_end_date": "2025-06-01",
      "days_remaining": -140,
      "status": "Expired"
    },
    {
      "id": 3,
      "union_id": 8,
      "union_name": "Logistics Union",
      "mem_id": 367,
      "executive_name": "Mulugeta Bekele Eshetu",
      "sex": "Male",
      "position": "Secretary",
      "appointed_date": "2024-01-01",
      "term_end_date": "2027-01-01",
      "days_remaining": 440,
      "status": "Active"
    }
  ]
}
```

**Status Values:**
- `Expired` - Term end date has passed
- `Expires Today` - Term ends today
- `Expiring Soon` - Less than or equal to 30 days remaining
- `Active` - More than 30 days remaining

**Use Cases:**
- Alert executives nearing end of term
- Plan for new elections
- Track executive turnover
- Generate term expiration reports

**Error Responses:** Same as Report 1

---

## 4. Executives Expiring Before Date

**Report:** 6 - List executives expiring before specific date

**Endpoint:** `GET /api/reports/executives-expiring-before`

**Authorization:** Bearer Token (Admin)

**Query Parameters:**
- `date` (required) - Target date in YYYY-MM-DD format

**Example Request:**
```
GET /api/reports/executives-expiring-before?date=2025-12-31
```

**Success Response (200):**
```json
{
  "target_date": "2025-12-31",
  "count": 15,
  "data": [
    {
      "id": 1,
      "union_id": 5,
      "union_name": "Ethio Telecom Workers Union",
      "mem_id": 123,
      "executive_name": "Abebe Kebede Tadesse",
      "sex": "Male",
      "position": "Chairman",
      "appointed_date": "2023-01-15",
      "term_end_date": "2025-11-30",
      "days_remaining": 42
    }
  ]
}
```

**Use Cases:**
- Plan elections before specific date
- Generate expiration forecasts
- Send batch notifications
- Quarterly planning reports

**Error Responses:**
- **400 Bad Request:**
```json
{
  "message": "date parameter required (YYYY-MM-DD)"
}
```
- **401, 403, 500:** Same as Report 1

---

## 5. Executives by Union

**Report:** 7 - Number of executives (Male, Female) for specific union

**Endpoint:** `GET /api/reports/executives-by-union`

**Authorization:** Bearer Token (Admin)

**Query Parameters:**
- `union_id` (required) - Union ID

**Example Request:**
```
GET /api/reports/executives-by-union?union_id=1
```

**Success Response (200):**
```json
{
  "union_id": 1,
  "union_name": "Ethio Telecom Workers Union",
  "executives_count": {
    "by_sex": [
      {
        "sex": "Male",
        "count": 8
      },
      {
        "sex": "Female",
        "count": 5
      }
    ],
    "total": 13
  }
}
```

**Use Cases:**
- Show gender balance in leadership
- Union-specific executive reports
- Compare executive committee sizes
- Diversity tracking

**Error Responses:**
- **400 Bad Request:**
```json
{
  "message": "union_id parameter required"
}
```
- **404 Not Found:**
```json
{
  "message": "Union not found"
}
```
- **401, 403, 500:** Same as Report 1

---

## 6. Members Under 35

**Report:** 8 - Number of youths under 35 (Male, Female, Total)

**Endpoint:** `GET /api/reports/members-under-35`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "category": "Under 35 years old",
  "by_sex": [
    {
      "sex": "Male",
      "count": 180
    },
    {
      "sex": "Female",
      "count": 145
    }
  ],
  "total": 325
}
```

**Use Cases:**
- Youth engagement programs
- Demographic analysis
- Target specific age groups
- Plan youth leadership programs

**Error Responses:** Same as Report 1

---

## 7. Members Above 35

**Report:** 9 - Number of members 35+ (Male, Female, Total)

**Endpoint:** `GET /api/reports/members-above-35`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "category": "35 years old and above",
  "by_sex": [
    {
      "sex": "Male",
      "count": 270
    },
    {
      "sex": "Female",
      "count": 175
    }
  ],
  "total": 445
}
```

**Use Cases:**
- Experience level analysis
- Retirement planning
- Demographic balance
- Succession planning

**Error Responses:** Same as Report 1

---

## 8. Unions CBA Status

**Reports:** 10 & 11 - Number of unions with/without CBA

**Endpoint:** `GET /api/reports/unions-cba-status`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "total_unions": 45,
  "with_cba": 38,
  "without_cba": 7,
  "percentage_with_cba": "84.44"
}
```

**Use Cases:**
- CBA coverage dashboard
- Track union compliance
- Identify unions needing support
- Generate CBA status reports

**Error Responses:** Same as Report 1

---

## 9. Unions Without CBA

**Report:** 12 - List unions without CBA

**Endpoint:** `GET /api/reports/unions-without-cba`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "count": 7,
  "data": [
    {
      "union_id": 12,
      "union_code": "TU012",
      "name_en": "Small Transport Union",
      "name_am": "ትንሽ የትራንስፖርት ህብረት",
      "sector": "Transport",
      "organization": "Regional Transport",
      "established_date": "2024-01-15"
    },
    {
      "union_id": 18,
      "union_code": "CU018",
      "name_en": "New Communication Union",
      "name_am": "አዲስ የመገናኛ ህብረት",
      "sector": "Communication",
      "organization": "Local Telecom",
      "established_date": "2024-06-20"
    }
  ]
}
```

**Use Cases:**
- Identify unions needing CBA support
- Priority list for CBA negotiations
- Follow-up action items
- Compliance tracking

**Error Responses:** Same as Report 1

---

## 10. Unions with Expired CBA

**Report:** 13 - List unions with expired CBA

**Endpoint:** `GET /api/reports/unions-cba-expired`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "count": 5,
  "data": [
    {
      "union_id": 3,
      "union_code": "ETU003",
      "name_en": "Regional Transport Union",
      "name_am": "ክልላዊ የትራንስፖርት ህብረት",
      "sector": "Transport",
      "organization": "Transport Authority",
      "cba_id": 7,
      "status": "expired",
      "registration_date": "2021-03-15",
      "next_end_date": "2024-03-15",
      "duration_years": 3,
      "days_expired": 217
    },
    {
      "union_id": 8,
      "union_code": "CTU008",
      "name_en": "Communication Workers Union",
      "name_am": "የመገናኛ ሠራተኞች ህብረት",
      "sector": "Communication",
      "organization": "Telecom Provider",
      "cba_id": 12,
      "status": "expired",
      "registration_date": "2020-07-01",
      "next_end_date": "2023-07-01",
      "duration_years": 3,
      "days_expired": 475
    }
  ]
}
```

**Use Cases:**
- Urgent renewal alerts
- CBA renewal priorities
- Compliance monitoring
- Negotiation scheduling

**Error Responses:** Same as Report 1

---

## 11. Unions with CBA Expiring Soon

**Report:** 14 - List unions with CBA reaching expiration

**Endpoint:** `GET /api/reports/unions-cba-expiring-soon`

**Authorization:** Bearer Token (Admin)

**Query Parameters:**
- `days` (optional) - Days threshold (default: 90)

**Example Request:**
```
GET /api/reports/unions-cba-expiring-soon?days=90
```

**Success Response (200):**
```json
{
  "threshold_days": 90,
  "count": 8,
  "data": [
    {
      "union_id": 5,
      "union_code": "ETU005",
      "name_en": "Ethio Telecom Workers Union",
      "name_am": "የኢትዮ ቴሌኮም ሠራተኞች ህብረት",
      "sector": "Communication",
      "organization": "Ethio Telecom",
      "cba_id": 9,
      "status": "ongoing",
      "registration_date": "2022-12-01",
      "next_end_date": "2025-12-01",
      "duration_years": 3,
      "days_remaining": 43
    },
    {
      "union_id": 11,
      "union_code": "TU011",
      "name_en": "Transport Workers Union",
      "name_am": "የትራንስፖርት ሠራተኞች ህብረት",
      "sector": "Transport",
      "organization": "Ethiopian Airlines",
      "cba_id": 15,
      "status": "ongoing",
      "registration_date": "2023-01-15",
      "next_end_date": "2026-01-15",
      "duration_years": 3,
      "days_remaining": 88
    }
  ]
}
```

**Use Cases:**
- Proactive renewal planning
- Early warning system
- Schedule negotiations
- Prevent CBA gaps

**Error Responses:** Same as Report 1

---

## 12. Unions with Ongoing CBA

**Report:** 15 - List unions with ongoing CBA

**Endpoint:** `GET /api/reports/unions-cba-ongoing`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "count": 33,
  "data": [
    {
      "union_id": 1,
      "union_code": "ETU001",
      "name_en": "Telecom Union A",
      "name_am": "ቴሌኮም ህብረት A",
      "sector": "Communication",
      "organization": "Ethio Telecom",
      "cba_id": 1,
      "status": "ongoing",
      "registration_date": "2023-06-01",
      "next_end_date": "2026-06-01",
      "duration_years": 3,
      "days_remaining": 590
    }
  ]
}
```

**Use Cases:**
- Show unions in good standing
- CBA compliance overview
- Status dashboard
- Active CBA tracking

**Error Responses:** Same as Report 1

---

## 13. General Assembly Status

**Report:** 16 - Number of unions conducting assembly vs not

**Endpoint:** `GET /api/reports/unions-general-assembly-status`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "total_unions": 45,
  "conducted_general_assembly": 38,
  "not_conducted": 7,
  "percentage_conducted": "84.44"
}
```

**Use Cases:**
- Assembly compliance tracking
- Identify non-compliant unions
- Dashboard statistics
- Governance monitoring

**Error Responses:** Same as Report 1

---

## 14. Unions Without General Assembly

**Report:** 17 - List unions not conducting assembly yet

**Endpoint:** `GET /api/reports/unions-no-general-assembly`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "count": 7,
  "data": [
    {
      "union_id": 12,
      "union_code": "TU012",
      "name_en": "New Transport Union",
      "name_am": "አዲስ የትራንስፖርት ህብረት",
      "sector": "Transport",
      "organization": "Regional Transport",
      "established_date": "2024-01-15",
      "general_assembly_date": null,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Use Cases:**
- Follow-up with new unions
- Compliance reminders
- Priority engagement list
- Governance support

**Error Responses:** Same as Report 1

---

## 15. Unions Assembly on Date

**Report:** 18 - List unions with assembly on specific date

**Endpoint:** `GET /api/reports/unions-assembly-on-date`

**Authorization:** Bearer Token (Admin)

**Query Parameters:**
- `date` (required) - Search date in YYYY-MM-DD format

**Example Request:**
```
GET /api/reports/unions-assembly-on-date?date=2024-01-01
```

**Success Response (200):**
```json
{
  "search_date": "2024-01-01",
  "count": 2,
  "data": [
    {
      "union_id": 5,
      "union_code": "ETU005",
      "name_en": "Ethio Telecom Workers Union",
      "name_am": "የኢትዮ ቴሌኮም ሠራተኞች ህብረት",
      "sector": "Communication",
      "organization": "Ethio Telecom",
      "established_date": "2010-05-15",
      "general_assembly_date": "2024-01-01"
    }
  ]
}
```

**Use Cases:**
- Historical assembly records
- Attendance tracking
- Schedule verification
- Meeting documentation

**Error Responses:**
- **400 Bad Request:**
```json
{
  "message": "date parameter required (YYYY-MM-DD)"
}
```
- **401, 403, 500:** Same as Report 1

---

## 16. Unions with Recent Assembly

**Report:** 21 - Unions with assembly less than 3 months ago

**Endpoint:** `GET /api/reports/unions-assembly-recent`

**Authorization:** Bearer Token (Admin)

**Query Parameters:**
- `months` (optional) - Months threshold (default: 3)

**Example Request:**
```
GET /api/reports/unions-assembly-recent?months=3
```

**Success Response (200):**
```json
{
  "threshold_months": 3,
  "count": 12,
  "data": [
    {
      "union_id": 7,
      "union_code": "ETU007",
      "name_en": "Communication Workers Union",
      "name_am": "የመገናኛ ሠራተኞች ህብረት",
      "sector": "Communication",
      "organization": "Telecom Provider",
      "general_assembly_date": "2025-09-15",
      "days_since_assembly": 33,
      "months_since_assembly": 1
    },
    {
      "union_id": 15,
      "union_code": "TU015",
      "name_en": "Transport Services Union",
      "name_am": "የትራንስፖርት አገልግሎት ህብረት",
      "sector": "Transport",
      "organization": "Transport Authority",
      "general_assembly_date": "2025-08-01",
      "days_since_assembly": 78,
      "months_since_assembly": 2
    }
  ]
}
```

**Use Cases:**
- Recent activity monitoring
- Engagement tracking
- Active unions identification
- Follow-up planning

**Error Responses:** Same as Report 1

---

## 17. Terminated Unions Count

**Report:** 19 - Number of terminated unions

**Endpoint:** `GET /api/reports/terminated-unions-count`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "total_terminated": 8,
  "by_sector": [
    {
      "sector": "Transport",
      "count": 5
    },
    {
      "sector": "Communication",
      "count": 2
    },
    {
      "sector": "Logistics",
      "count": 1
    }
  ]
}
```

**Use Cases:**
- Historical termination tracking
- Sector-wise analysis
- Attrition patterns
- Archive statistics

**Error Responses:** Same as Report 1

---

## 18. Terminated Unions List

**Report:** 20 - List all terminated unions

**Endpoint:** `GET /api/reports/terminated-unions-list`

**Authorization:** Bearer Token (Admin)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "count": 8,
  "data": [
    {
      "id": 1,
      "union_id": 99,
      "name_en": "Old Transport Union",
      "name_am": "አሮጌ የትራንስፖርት ህብረት",
      "sector": "Transport",
      "organization": "Defunct Transport Co",
      "established_date": "2005-03-10",
      "terminated_date": "2023-12-31",
      "termination_reason": "Merged with larger union",
      "archived_at": "2024-01-05T14:30:00.000Z"
    },
    {
      "id": 2,
      "union_id": 87,
      "name_en": "Regional Communication Union",
      "name_am": "ክልላዊ የመገናኛ ህብረት",
      "sector": "Communication",
      "organization": "Regional Telecom",
      "established_date": "2008-06-15",
      "terminated_date": "2024-03-15",
      "termination_reason": "Organization dissolved",
      "archived_at": "2024-03-20T09:15:00.000Z"
    }
  ]
}
```

**Use Cases:**
- Historical records
- Termination analysis
- Archive management
- Trend identification

**Error Responses:** Same as Report 1

---

## Report Cache Management

### Save Report Cache

**Endpoint:** `POST /api/reports/cache`

**Authorization:** Bearer Token (Admin)

**Request Body:**
```json
{
  "report_name": "members_summary_october_2025",
  "payload": {
    "generated_at": "2025-10-18T14:30:00Z",
    "data": {
      "total": 770,
      "male": 450,
      "female": 320
    }
  }
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "report_name": "members_summary_october_2025",
  "payload": {
    "generated_at": "2025-10-18T14:30:00Z",
    "data": {
      "total": 770,
      "male": 450,
      "female": 320
    }
  },
  "generated_at": "2025-10-18T14:30:15.000Z"
}
```

**Error Response (400):**
```json
{
  "message": "report_name and payload required"
}
```

---

### List Cached Reports

**Endpoint:** `GET /api/reports/cache`

**Authorization:** Bearer Token (Admin)

**Success Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "report_name": "members_summary_october_2025",
      "payload": {},
      "generated_at": "2025-10-18T14:30:15.000Z"
    }
  ]
}
```

---

### Get Cached Report

**Endpoint:** `GET /api/reports/cache/:id`

**Authorization:** Bearer Token (Admin)

**Success Response (200):**
```json
{
  "id": 1,
  "report_name": "members_summary_october_2025",
  "payload": {
    "generated_at": "2025-10-18T14:30:00Z",
    "data": {
      "total": 770,
      "male": 450,
      "female": 320
    }
  },
  "generated_at": "2025-10-18T14:30:15.000Z"
}
```

**Error Response (404):**
```json
{
  "message": "Not found"
}
```

---

### Delete Cached Report

**Endpoint:** `DELETE /api/reports/cache/:id?confirm=true`

**Authorization:** Bearer Token (Admin)

**Query Parameters:**
- `confirm=true` (required)

**Success Response (200):**
```json
{
  "message": "Deleted"
}
```

**Error Response (400):**
```json
{
  "message": "To delete set ?confirm=true"
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "message": "Requires admin role"
}
```

### 500 Server Error
```json
{
  "message": "Server error"
}
```

---

## Usage Tips

### 1. Authentication
All reports require admin authentication. First login to get JWT token:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "ChangeThisStrongAdminPass!"}'
```

Save the `token` from response.

### 2. Making Report Requests

```bash
curl -X GET http://localhost:4000/api/reports/members-summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Query Parameters

For reports with query parameters:

```bash
curl -X GET "http://localhost:4000/api/reports/executives-expiring-before?date=2025-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Caching Reports

Save frequently accessed reports to cache for faster retrieval:

```bash
curl -X POST http://localhost:4000/api/reports/cache \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report_name": "daily_summary",
    "payload": { /* your report data */ }
  }'
```

---

## Frontend Integration Examples

### React Example

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/reports';

// Get members summary
async function getMembersSummary() {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await axios.get(`${API_URL}/members-summary`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Members:', response.data);
    // Use response.data.summary and response.data.by_year for charts
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Unauthorized - please login');
    } else {
      console.error('Error:', error.response?.data?.message);
    }
  }
}

// Get CBA expiring soon with custom threshold
async function getCBAExpiringSoon(days = 90) {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await axios.get(
      `${API_URL}/unions-cba-expiring-soon`,
      {
        params: { days },
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    return response.data;
    
  } catch (error) {
    console.error('Error:', error.response?.data?.message);
    return null;
  }
}
```

---

## Summary

**Total Endpoints:** 22

**Categories:**
- Member Statistics: 2 endpoints
- Union Statistics: 1 endpoint
- Union Executives: 3 endpoints
- Age-Based Statistics: 2 endpoints
- CBA Reports: 5 endpoints
- General Assembly: 4 endpoints
- Terminated Unions: 2 endpoints
- Cache Management: 4 endpoints

All endpoints return JSON responses and require admin authentication.

**Need Help?** 
- Check authentication token is valid
- Verify query parameters are in correct format (YYYY-MM-DD for dates)
- Ensure you have admin role
- Check server console for detailed error logs

