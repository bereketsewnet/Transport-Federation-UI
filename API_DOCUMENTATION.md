# API Documentation

Complete documentation of all API endpoints used in the Transport Federation UI frontend.

## Base Configuration

- **Base URL**: `http://localhost:4000` (development)
- **Auth Type**: JWT Bearer Token
- **Token Storage**: `localStorage` with key `jwt_token`

---

## Authentication Endpoints

### Login
- **Endpoint**: `POST /api/auth/login`
- **Public**: Yes
- **Payload**: 
  ```typescript
  {
    username: string;
    password: string;
  }
  ```
- **Response**: 
  ```typescript
  {
    token?: string;
    tempToken?: string;
    requirePasswordChange?: boolean;
    requireSecurityQuestions?: boolean;
    message?: string;
    user?: {
      id: number;
      mem_id?: number;
      username: string;
      role: string;
    }
  }
  ```

### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Auth**: Required

### Change Password
- **Endpoint**: `POST /api/auth/change-password`
- **Auth**: Required
- **Payload**: 
  ```typescript
  {
    newPassword: string;
    securityQuestions?: Array<{ questionId: number; answer: string }>;
  }
  ```

### Get Security Questions
- **Endpoint**: `GET /api/auth/security-questions`
- **Auth**: Required
- **Response**: `{ questions: SecurityQuestion[] }`

### Forgot Password Step 1
- **Endpoint**: `POST /api/auth/forgot-password/step1`
- **Public**: Yes
- **Payload**: `{ username: string }`
- **Response**: Returns security questions for the user

### Forgot Password Step 2
- **Endpoint**: `POST /api/auth/forgot-password/step2`
- **Public**: Yes
- **Payload**: 
  ```typescript
  {
    username: string;
    answers: string[];  // Array of 3 answers
    newPassword: string;
  }
  ```

---

## Unions Endpoints

### Get All Unions
- **Endpoint**: `GET /api/unions`
- **Params**: `{ page?: number; per_page?: number; q?: string; sector?: string }`
- **Response**: `{ data: Union[]; meta: { total, page, per_page, total_pages } }`

### Get Single Union
- **Endpoint**: `GET /api/unions/:union_id`
- **Note**: Uses `union_id` not `id` parameter

### Create Union
- **Endpoint**: `POST /api/unions`

### Update Union
- **Endpoint**: `PUT /api/unions/:id`

### Delete Union
- **Endpoint**: `DELETE /api/unions/:id?confirm=true`

**Union Interface**:
```typescript
{
  id: number;
  union_id: number;  // Primary key
  union_code: string;
  name_en: string;
  name_am: string;
  sector: string;
  organization: string;
  established_date: string;
  terms_of_election: number;
  strategic_plan_in_place: boolean;
}
```

---

## Members Endpoints

### Get All Members
- **Endpoint**: `GET /api/members`
- **Params**: `{ page?, per_page?, q?, union_id?, sex? }`

### Get Single Member
- **Endpoint**: `GET /api/members/:mem_id`
- **Note**: Uses `mem_id` not `id`

### Create Member
- **Endpoint**: `POST /api/members`

### Update Member
- **Endpoint**: `PUT /api/members/:mem_id`

### Archive Member
- **Endpoint**: `DELETE /api/members/:mem_id?archive=true`
- **Data**: `{ reason?: string }`

### Delete Member
- **Endpoint**: `DELETE /api/members/:mem_id?confirm=true`

**Member Interface**:
```typescript
{
  mem_id: number;  // Primary key
  union_id: number;
  member_code: string;
  first_name: string;
  father_name: string;
  surname: string;
  sex: string;
  birthdate: string;
  education: string;
  phone: string;
  email: string;
  salary: number;
  registry_date: string;
}
```

---

## Union Executives Endpoints

### Get All Executives
- **Endpoint**: `GET /api/union-executives`
- **Params**: `{ union_id?, page?, per_page? }`

### Get Single Executive
- **Endpoint**: `GET /api/union-executives/:id`

### Create Executive
- **Endpoint**: `POST /api/union-executives`

### Update Executive
- **Endpoint**: `PUT /api/union-executives/:id`

### Delete Executive
- **Endpoint**: `DELETE /api/union-executives/:id?confirm=true`

**Executive Interface**:
```typescript
{
  id: number;
  union_id: number;
  mem_id: number;
  position: string;
  appointed_date: string;
  term_length_years: number;
}
```

---

## CBAs (Collective Bargaining Agreements) Endpoints

### Get All CBAs
- **Endpoint**: `GET /api/cbas`
- **Params**: `{ union_id?, status?, page?, per_page? }`

### Get Single CBA
- **Endpoint**: `GET /api/cbas/:id`

### Create CBA
- **Endpoint**: `POST /api/cbas`

### Update CBA
- **Endpoint**: `PUT /api/cbas/:id`

### Delete CBA
- **Endpoint**: `DELETE /api/cbas/:id?confirm=true`

**CBA Interface**:
```typescript
{
  id: number;
  union_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  status: string;
  document_url?: string;
  notes?: string;
  registration_date: string;
  next_end_date: string;
  round: string;
}
```

---

## News Endpoints

### Get All News
- **Endpoint**: `GET /api/news`
- **Params**: `{ is_published?, page?, per_page? }`

### Get Single News Item
- **Endpoint**: `GET /api/news/:id`

### Create News
- **Endpoint**: `POST /api/news`
- **Form Data**: Can send image file or image_url

### Update News
- **Endpoint**: `PUT /api/news/:id`

### Delete News
- **Endpoint**: `DELETE /api/news/:id?confirm=true`

**News Interface**:
```typescript
{
  id: number;
  title: string;
  body: string;
  summary: string;
  published_at: string;
  is_published: boolean;
  image_filename?: string | null;
  is_local?: boolean;
  image_url?: string | null;
}
```

---

## Galleries & Photos Endpoints

### Get All Galleries
- **Endpoint**: `GET /api/galleries`
- **Params**: `{ page?, per_page? }`

### Create Gallery
- **Endpoint**: `POST /api/galleries`

### Get Photos
- **Endpoint**: `GET /api/photos`
- **Params**: `{ gallery_id?, page?, per_page? }`

### Upload Photo
- **Endpoint**: `POST /api/photos`
- **Form Data**: `{ photo: File, gallery_id, caption?, taken_at? }`

### Create Photo from URL
- **Endpoint**: `POST /api/photos`
- **Data**: `{ gallery_id, image_url, caption?, taken_at? }`

### Update Photo
- **Endpoint**: `PUT /api/photos/:id`
- **Data**: `{ caption?, taken_at? }`

### Delete Photo
- **Endpoint**: `DELETE /api/photos/:id?confirm=true`

---

## Archives Endpoints

### Get All Archives
- **Endpoint**: `GET /api/archives`
- **Params**: `{ page?, per_page?, q?, category?, document_type?, is_public?, tags?, sortBy?, sortOrder? }`

### Get Single Archive
- **Endpoint**: `GET /api/archives/:id`

### Create Archive
- **Endpoint**: `POST /api/archives`

### Update Archive
- **Endpoint**: `PUT /api/archives/:id`

### Delete Archive
- **Endpoint**: `DELETE /api/archives/:id?confirm=true`

### Upload Archive File
- **Endpoint**: `POST /api/archives/upload`
- **Form Data**: `{ file: File }`
- **Response**: `{ file_url, file_name, file_size }`

**Archive Interface**:
```typescript
{
  id: number;
  title: string;
  description?: string;
  category: string;
  document_type: string;
  file_url: string;
  file_size?: number;
  file_name?: string;
  tags?: string[];
  is_public: boolean;
  created_by?: number;
}
```

---

## Terminated Unions Endpoints

### Get All Terminated Unions
- **Endpoint**: `GET /api/terminated-unions`
- **Params**: `{ page?, per_page?, q?, union_id?, termination_reason?, date_from?, date_to?, sortBy?, sortOrder? }`

### Get Single Terminated Union
- **Endpoint**: `GET /api/terminated-unions/:id`

### Create Terminated Union
- **Endpoint**: `POST /api/terminated-unions`

### Update Terminated Union
- **Endpoint**: `PUT /api/terminated-unions/:id`

### Delete Terminated Union
- **Endpoint**: `DELETE /api/terminated-unions/:id?confirm=true`

---

## OSH (Occupational Safety and Health) Incidents Endpoints

### Get All Incidents
- **Endpoint**: `GET /api/osh-incidents`
- **Public**: Yes
- **Params**: `{ page?, per_page?, union_id?, accident_category?, injury_severity?, damage_severity?, status?, from_date?, to_date?, q? }`
- **Note**: API returns data in **camelCase** format

### Get Single Incident
- **Endpoint**: `GET /api/osh-incidents/:id`
- **Public**: Yes

### Create Incident
- **Endpoint**: `POST /api/osh-incidents`

### Update Incident
- **Endpoint**: `PUT /api/osh-incidents/:id`

### Delete Incident
- **Endpoint**: `DELETE /api/osh-incidents/:id`

### Get Statistics
- **Endpoint**: `GET /api/osh-incidents/statistics`
- **Public**: Yes
- **Params**: `{ union_id?, from_date?, to_date? }`

**OSHIncident Interface (API returns camelCase)**:
```typescript
{
  id: number;
  unionId: number;  // Note: camelCase, not union_id
  union?: {         // Populated union data
    union_id: number;
    name_en: string;
    name_am: string;
    union_code: string;
  };
  accidentCategory: 'People' | 'Property' | 'Environment' | 'Process' | '';
  dateTimeOccurred: string;  // ISO date string
  locationSite: string;
  locationBuilding?: string;
  locationArea?: string;
  locationGpsLatitude?: number;
  locationGpsLongitude?: number;
  injurySeverity: 'None' | 'Minor' | 'Major' | 'Fatal';
  damageSeverity: 'None' | 'Minor' | 'Major' | 'Severe';
  rootCauses: string[];
  description: string;
  regulatoryReportRequired: boolean;
  regulatoryReportDate?: string;
  status: 'open' | 'investigating' | 'closed';
  reportedBy: string;
  reportedDate?: string;
  investigationNotes?: string;
  correctiveActions?: string;
  preventiveMeasures?: string;
}
```

---

## OSH Reports Endpoints

### Summary Report
- **Endpoint**: `GET /api/reports/osh-summary`
- **Params**: `{ union_id?, from_date?, to_date? }`

### High Severity Report
- **Endpoint**: `GET /api/reports/osh-high-severity`
- **Params**: `{ union_id?, from_date?, to_date? }`

### Regulatory Reports
- **Endpoint**: `GET /api/reports/osh-regulatory-reports`
- **Params**: `{ union_id?, from_date?, to_date? }`

### Monthly Trends
- **Endpoint**: `GET /api/reports/osh-monthly-trends`
- **Params**: `{ union_id?, months? }`

### Root Causes Analysis
- **Endpoint**: `GET /api/reports/osh-root-causes`
- **Params**: `{ union_id?, from_date?, to_date? }`

---

## Reports Endpoints

### Members Summary
- **Endpoint**: `GET /api/reports/members-summary`

### Unions Summary
- **Endpoint**: `GET /api/reports/unions-summary`

### Unions CBA Expired
- **Endpoint**: `GET /api/reports/unions-cba-expired`

### Executives Remaining Days
- **Endpoint**: `GET /api/reports/executives-remaining-days`

### Executives Expiring Before
- **Endpoint**: `GET /api/reports/executives-expiring-before`
- **Params**: `{ date: string }`

### Members Under 35
- **Endpoint**: `GET /api/reports/members-under-35`

### Members Above 35
- **Endpoint**: `GET /api/reports/members-above-35`

### Unions CBA Status
- **Endpoint**: `GET /api/reports/unions-cba-status`

### Unions Without CBA
- **Endpoint**: `GET /api/reports/unions-without-cba`

### Unions CBA Expiring Soon
- **Endpoint**: `GET /api/reports/unions-cba-expiring-soon`
- **Params**: `{ days=90 }`

### Unions CBA Ongoing
- **Endpoint**: `GET /api/reports/unions-cba-ongoing`

### General Assembly Status
- **Endpoint**: `GET /api/reports/unions-general-assembly-status`

### Unions No General Assembly
- **Endpoint**: `GET /api/reports/unions-no-general-assembly`

### Unions Assembly On Date
- **Endpoint**: `GET /api/reports/unions-assembly-on-date`
- **Params**: `{ date: string }`

### Unions Assembly Recent
- **Endpoint**: `GET /api/reports/unions-assembly-recent`
- **Params**: `{ months=3 }`

### Terminated Unions Count
- **Endpoint**: `GET /api/reports/terminated-unions-count`

### Terminated Unions List
- **Endpoint**: `GET /api/reports/terminated-unions-list`

---

## CMS Endpoints

### Home Content
- **GET**: `GET /api/cms/home-content` (public)
- **UPDATE**: `PUT /api/cms/home-content`
- **UPLOAD IMAGE**: `POST /api/cms/home-content/hero-image`

### About Content
- **GET**: `GET /api/cms/about-content` (public)
- **UPDATE**: `PUT /api/cms/about-content`

### Executives
- **GET ALL**: `GET /api/cms/executives?type=executive|expert`
- **GET ONE**: `GET /api/c大家都在忙着处理这个请求啊...



/cms/executives/:id`
- **CREATE**: `POST /api/cms/executives`
- **UPDATE**: `PUT /api/cms/executives/:id`
- **DELETE**: `DELETE /api/cms/executives/:id`
- **UPLOAD IMAGE**: `POST /api/cms/executives/:id/image`

### Contact Info
- **GET**: `GET /api/cms/contact-info` (public)
- **UPDATE**: `PUT /api/cms/contact-info`

---

## Contacts Endpoints

### Submit Contact
- **Endpoint**: `POST /api/contacts`
- **Data**: `{ name, email_or_phone, subject, message }`

### Get All Contacts
- **Endpoint**: `GET /api/contacts`
- **Auth**: Required
- **Params**: `{ page?, per_page? }`

---

## Visitors Endpoints

### Get Visitors
- **Endpoint**: `GET /api/visitors`
- **Params**: `{ from?, to? }`

### Increment Visitor
- **Endpoint**: `POST /api/visitors`
- **Data**: `{ visit_date, increment }`

---

## Organization Leaders Endpoints

### Get All Leaders
- **Endpoint**: `GET /api/org-leaders`
- **Params**: `{ page?, per_page? }`

### Create Leader
- **Endpoint**: `POST /api/org-leaders`

---

## Login Accounts Endpoints

### Get All Accounts
- **Endpoint**: `GET /api/login-accounts`
- **Auth**: Required
- **Params**: `{ page?, per_page? }`

### Create Account
- **Endpoint**: `POST /api/login-accounts`
- **Data**: `{ username, password, role }`

### Reset Password
- **Endpoint**: `POST /api/login-accounts/reset/:username`
- **Data**: `{ password }`

---

## Important Notes

### 1. Field Naming Convention
- **Union**: API uses `union_id` as primary key, not `id`
- **Member**: API uses `mem_id` as primary key, not `id`
- **OSH**: API returns all fields in **camelCase** format (e.g., `unionId`, `accidentCategory`, `dateTimeOccurred`)

### 2. Pagination
Most list endpoints support pagination with:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default varies)

### 3. Deletion
Delete endpoints require `confirm=true` query parameter for safety.

### 4. Authentication
Protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### 5. File Uploads
File upload endpoints use `multipart/form-data` content type.

### 6. Date Formats
All dates are ISO 8601 format strings: `YYYY-MM-DDTHH:mm:ss.sssZ`

---

## Error Handling

The API client automatically handles:
- **401**: Clears token and redirects to login
- **403**: Shows permission error toast
- **404**: Shows not found error toast
- **422/400**: Shows validation error message
- **500**: Shows server error toast
- **Network Errors**: Shows connection error toast

---

## Usage Example

```typescript
import { getOSHIncidents, createOSHIncident } from '@api/endpoints';

// Get all incidents
const response = await getOSHIncidents({ page: 1, per_page: 20 });
console.log(response.data.data); // Array of incidents

// Create new incident
const newIncident = await createOSHIncident({
  unionId: 256,
  accidentCategory: 'People',
  dateTimeOccurred: new Date().toISOString(),
  locationSite: 'Addis Ababa',
  injurySeverity: 'Minor',
  damageSeverity: 'None',
  description: 'Sample incident',
  regulatoryReportRequired: false,
  status: 'open',
  reportedBy: 'John Doe',
  rootCauses: ['Unsafe act']
});
```

