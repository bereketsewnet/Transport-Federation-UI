# General Assembly Management - Complete Documentation

## Overview

The General Assembly Date (`general_assembly_date`) field is part of the Unions table. Admin users can perform full CRUD operations on this field through the Unions endpoints, and detailed reports are available for General Assembly statistics.

---

## 🔐 CRUD Operations (Admin Only)

### 1. CREATE Union with General Assembly Date
**Endpoint:** `POST /api/unions` (Admin Only)

**Request:**
```json
{
  "union_code": "TCWF-001",
  "name_en": "Transport Workers Union",
  "name_am": "የትራንስፖርት ሰራተኞች ማኅበር",
  "sector": "Transport",
  "organization": "Ethio Transport PLC",
  "established_date": "2000-05-15",
  "terms_of_election": 4,
  "general_assembly_date": "2024-06-15",
  "strategic_plan_in_place": true,
  "external_audit_date": "2024-03-10"
}
```

**Response:** Union object with `general_assembly_date`

---

### 2. READ General Assembly Date
**Endpoint:** `GET /api/unions/:id`

**Response:**
```json
{
  "union_id": 1,
  "union_code": "TCWF-001",
  "name_en": "Transport Workers Union",
  "sector": "Transport",
  "general_assembly_date": "2024-06-15",
  ...
}
```

---

### 3. UPDATE General Assembly Date
**Endpoint:** `PUT /api/unions/:id` (Admin Only)

**Request:**
```json
{
  "general_assembly_date": "2025-06-20"
}
```

**Response:** Updated union object

---

### 4. DELETE Union (including General Assembly data)
**Endpoint:** `DELETE /api/unions/:id?confirm=true` (Admin Only)

---

## 📊 General Assembly Reports (Admin Only)

### Report 16: Number of Unions Conducting vs Not Conducting GAM

**Endpoint:** `GET /api/reports/unions-general-assembly-status`

**Query Parameters:** None

**Response:**
```json
{
  "total_unions": 25,
  "conducted_general_assembly": 18,
  "not_conducted": 7,
  "percentage_conducted": "72.00"
}
```

**Description:**
- Shows total count of unions
- Count of unions that have conducted General Assembly (have a date set)
- Count of unions that have not conducted General Assembly (date is null)
- Percentage of unions that have conducted GAM

---

### Report 17: List Unions Without General Assembly

**Endpoint:** `GET /api/reports/unions-no-general-assembly`

**Query Parameters:** None

**Response:**
```json
{
  "count": 7,
  "data": [
    {
      "union_id": 1,
      "union检察院": "TCWF-001",
      "name_en": "Transport Workers Union",
      "name_am": "የትራንስፖርት ሰራተኞች ማኅበር",
      "sector": "Transport",
      "organization": "Ethio Transport PLC",
      "general_assembly_date": null,
      ...
    }
  ]
}
```

**Description:**
- Lists all unions that have NOT conducted a General Assembly Meeting yet
- `general_assembly_date` will be `null` for all records

---

### Report 18: List Unions with GAM on Specific Date

**Endpoint:** `GET /api/reports/unions-assembly-on-date?date=YYYY-MM-DD`

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Example:** `GET /api/reports/unions-assembly-on-date?date=2024-06-15`

**Response:**
```json
{
  "search_date": "2024-06-15",
  "count": 3,
  "data": [
    {
      "union_id": 1,
      "union_code": "TCWF-001",
      "name_en": "Transport Workers Union",
      "sector": "Transport",
      "general_assembly_date": "2024-06-15",
      ...
    }
  ]
}
```

**Description:**
- Finds all unions whose last congress/general assembly meeting was held on a specific date
- Useful for planning future assemblies or tracking historical events

---

### Bonus Report: Recent General Assemblies

**Endpoint:** `GET /api/reports/unions-assembly-recent?months=3`

**Query Parameters:**
- `months` (optional): Number of months to look back (default: 3)

**Example:** `GET /api/reports/unions-assembly-recent?months=6`

**Response:**
```json
{
  "threshold_months": 6,
  "count": 5,
  "data": [
    {
      "union_id": 1,
      "union_code": "TCWF-001",
      "name_en": "Transport Workers Union",
      "sector": "Transport",
      "general_assembly_date": "2024-06-15",
      "days_since_assembly": 45,
      "months_since_assembly": 2
    }
  ]
}
```

**Description:**
- Lists unions that conducted their last General Assembly within the specified number of months
- Includes days and months since the assembly for easy reference

---

## 🔗 Postman Collection

### Unions CRUD Endpoints

**List all unions (Read):**
```
GET {{base_url}}/api/unions
Headers: Authorization: Bearer {{jwt_token}}
```

**Create union (with General Assembly date):**
```
POST {{base_url}}/api/unions
Headers: Authorization: Bearer {{jwt_token}}
Content-Type: application/json
Body: { "name_en": "...", "general_assembly_date": "2024-06-15", ... }
```

**Update General Assembly date:**
```
PUT {{base_url}}/api/unions/1
Headers: Authorization: Bearer {{jwt_token}}
Content-Type: application/json
Body: { "general_assembly_date": "2025-06-20" }
```

**Delete union:**
```
DELETE {{base_url}}/api/unions/1?confirm=true
Headers: Authorization: Bearer {{jwt_token}}
```

### General Assembly Reports

**Get GAM status statistics:**
```
GET {{base_url}}/api/reports/unions-general-assembly-status
Headers: Authorization: Bearer {{jwt_token}}
```

**List unions without GAM:**
```
GET {{base_url}}/api/reports/unions-no-general-assembly
Headers: Authorization: Bearer {{jwt_token}}
```

**Find unions with GAM on specific date:**
```
GET {{base_url}}/api/reports/unions-assembly-on-date?date=2024-06-15
Headers: Authorization: Bearer {{jwt_token}}
```

**List recent GAMs:**
```
GET {{base_url}}/api/reports/unions-assembly-recent?months=3
Headers: Authorization: Bearer {{jwt_token}}
```

---

## 🎯 Use Cases

### 1. Tracking Compliance
- Use Report 16 to check how many unions have conducted their General Assembly
- Identify non-compliant unions using Report 17

### 2. Historical Analysis
- Use Report 18 to find unions that conducted assemblies on specific dates
- Track assembly patterns across different dates

### 3. Scheduling
- Update `general_assembly_date` when a union schedules their next assembly
- Use Report 21 (recent) to track recently held assemblies

### 4. Auditing
- Run reports to generate compliance reports
- Track which unions need to schedule assemblies

---

## 📋 Summary

### Available Operations:
- ✅ **CREATE** - Add General Assembly date when creating union
- ✅ **READ** - View General Assembly date in union details
- ✅ **UPDATE** - Update General Assembly date for existing union
- ✅ **DELETE** - Remove union (and its GAM date)
- ✅ **REPORTS** - 4 comprehensive reports for analysis

### Data Field:
- `general_assembly_date` (DATE) - Stored in `unions` table
- Can be set during union creation
- Can be updated at any time
- Nullable (allows tracking of unions without GAM)

### Access Control:
- All CRUD operations: Admin only
- All Reports: Admin only
- Protected endpoints require JWT Bearer token

### Reports Answer:
1. ✅ How many unions conducted GAM? (Report 16)
2. ✅ Which unions have NOT conducted GAM? (Report 17)
3. ✅ Which unions conducted GAM on a specific date? (Report 18)

---

## 🚀 Quick Start

1. **Login as admin:**
   ```
   POST /api/auth/login
   Body: { "username": "admin", "password": "Admin@2024" }
   ```

2. **Create union with GAM date:**
   ```
   POST /api/unions
   Body: { "name_en": "...", "general_assembly_date": "2024-12-31" }
   ```

3. **Get GAM statistics:**
   ```
   GET /api/reports/unions-general-assembly-status
   ```

4. **Find unions without GAM:**
   ```
   GET /api/reports/unions-no-general-assembly
   ```

5. **Search unions by GAM date:**
   ```
   GET /api/reports/unions-assembly-on-date?date=2024-06-15
   ```

All endpoints are ready to use! 🎉

