# Campus Complaint & Maintenance Management System (CCMMS)

A centralized web platform for university campuses to submit, assign, track, resolve, and analyze maintenance complaints with automated workflows, SLA monitoring, and role-based portals.

**Campus:** Apex Institute of Technology (Main Campus)  
**Current Release:** **Phase 3 - Public Website, Authentication & Student/Staff Experience**  
**Storage Architecture:** ACID-inspired JSON File-Store with in-memory caching, atomic file writes (temp -> rename), and keyed mutex concurrency locks (Zero external DB server required).

---

## 🚀 Quick Start

### 1. Installation & Monorepo Setup
Install all dependencies across monorepo (root, server, client):
```bash
npm run install:all
```

### 2. Environment Configuration
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Seed Realistic Campus Demo Data
Populate all 10 collections (`users.json`, `categories.json`, `complaints.json`, `statusHistory.json`, `notifications.json`, `sentMessages.json`, `feedback.json`, `comments.json`, `settings.json`, `auditLog.json`):
```bash
npm run seed
```

### 4. Run the Full Stack Application
Runs both Node.js Express backend (`http://localhost:5000`) and Vite React client (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Visit the application in your browser:
- **Public Portal & Landing Page:** [http://localhost:5173](http://localhost:5173)
- **Student / Requester Dashboard:** [http://localhost:5173/student/dashboard](http://localhost:5173/student/dashboard)
- **Backend Health & API Status:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Interactive REST Documentation:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
```

- **Backend API Root**: `http://localhost:5000`
- **Interactive API Documentation**: `http://localhost:5000/api/docs`
- **Health Check & Storage Metrics**: `http://localhost:5000/api/health`

### 5. Run Automated Tests & Live Verification
```bash
# Run Jest + Supertest comprehensive test suite (34 tests across 5 test suites)
npm --prefix server test

# Run Live End-to-End Endpoint Verification Script
npm --prefix server run verify
```

---

## 🔐 Default Demo Accounts

All pre-seeded demo user accounts share the standard password: `Password@123`

| Role | Name | Department / Specialty | Email | Default Phone |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Ramesh Sundaram | Dean of Campus Infrastructure | `admin@apex.edu` | +91 98765 43210 |
| **Staff (Plumbing)** | Rajesh Sharma | Plumbing & Water Works | `plumbing@apex.edu` | +91 98765 11111 |
| **Staff (Electrical)** | Suresh Kumar | Electrical & Power Distribution | `electrical@apex.edu` | +91 98765 22222 |
| **Staff (IT & Net)** | Ananya Verma | IT Infrastructure & Network | `it.support@apex.edu` | +91 98765 33333 |
| **Staff (General)** | Mohan Das | Civil & Carpentry Maintenance | `general.maint@apex.edu` | +91 98765 44444 |
| **Student (Hostel A)** | Aarav Patel | CSE (B.Tech 3rd Yr) | `aarav.cse@apex.edu` | +91 98111 00001 |
| **Student (Hostel B)** | Priya Nair | ECE (B.Tech 2nd Yr) | `priya.ece@apex.edu` | +91 98111 00002 |
| **Faculty (Academic)** | Prof. Vikram Sengupta | Assistant Professor (CS) | `vikram.cs@apex.edu` | +91 98111 00005 |

---

## 📖 Complete API Reference

All protected endpoints require an `Authorization` header formatted as:  
`Authorization: Bearer <accessToken>`

---

### 1. Authentication & Security (`/api/auth`)

#### `POST /api/auth/register`
- **Access**: Public (Students / Staff Requesters only)
- **Request Body**:
  ```json
  {
    "name": "Karan Sharma",
    "email": "karan.sharma@apex.edu",
    "password": "Password@123",
    "phone": "+91 98765 99999",
    "department": "Computer Science (B.Tech 1st Yr)"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "rec_1795014863_abc",
        "name": "Karan Sharma",
        "email": "karan.sharma@apex.edu",
        "role": "student",
        "department": "Computer Science (B.Tech 1st Yr)",
        "isActive": true
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@apex.edu",
    "password": "Password@123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { "id": "usr_admin_01", "name": "Dr. Ramesh Sundaram", "role": "admin" },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
  *(Also sets httpOnly cookie `refreshToken` with 7-day expiration)*

#### `POST /api/auth/logout`
- **Access**: Public (clears httpOnly cookie)

#### `GET /api/auth/me`
- **Access**: Authenticated (Any role)
- **Response** (`200 OK`): Returns safe user profile object.

#### `PATCH /api/auth/change-password`
- **Access**: Authenticated (Any role)
- **Request Body**:
  ```json
  {
    "currentPassword": "Password@123",
    "newPassword": "NewSecurePassword@2026"
  }
  ```

---

### 2. User Management (`/api/users`) - Admin Only

#### `GET /api/users`
- **Query Params**: `search`, `role` (`admin`|`staff`|`student`), `status` (`active`|`false`), `page`, `limit`.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [ ...safeUserObjects ],
    "pagination": { "total": 13, "page": 1, "limit": 20, "totalPages": 1 }
  }
  ```

#### `POST /api/users`
- **Request Body**:
  ```json
  {
    "name": "Ravi Shastri",
    "email": "ravi.shastri@apex.edu",
    "password": "Password@123",
    "role": "staff",
    "department": "HVAC Services",
    "specialty": "Electrical",
    "isAvailable": true
  }
  ```

#### `PATCH /api/users/:id/status`
- **Request Body**: `{ "isActive": false }`
- **Rule**: Invariant enforced preventing deactivation of the last active administrator.

#### `DELETE /api/users/:id`
- **Rule**: Invariant enforced preventing deletion of staff with active assigned tasks without reassignment.

---

### 3. Complaints Management (`/api/complaints`)

#### `POST /api/complaints`
- **Access**: Authenticated (Student, Staff, Admin)
- **Enctype**: `multipart/form-data` or `application/json` (with Multer supporting up to 4 images max 5 MB).
- **Fields**:
  - `title` (string, min 5 chars)
  - `description` (string, min 10 chars)
  - `categoryId` (string, e.g. `cat_plumbing`)
  - `subCategory` (string, e.g. `Leakage`)
  - `building` (string, e.g. `Hostel Block B`)
  - `floor` (string, e.g. `2nd Floor`)
  - `room` (string, e.g. `Washroom 2B`)
  - `landmark` (optional string)
  - `priority` (optional: `Urgent`|`High`|`Medium`|`Low` - auto-suggested if omitted)
  - `contactPreference` (optional: `Phone`|`Email`|`In-Person`)
  - `images` (optional file attachments: jpg, png, webp)
- **Features Handled Automatically**:
  1. **Smart Priority Suggestion**: Detects safety hazards ("fire", "spark", "burst pipe") -> `Urgent`.
  2. **Duplicate Detection**: Searches active tickets in the same building & category.
  3. **Auto-Assignment**: Selects available maintenance staff matching category specialty with lowest current weighted workload score.
  4. **SLA Calculation**: Calculates `dueDate` from category configuration.
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Complaint submitted successfully",
    "data": {
      "id": "rec_1795014863_xyz",
      "referenceNumber": "CCM-2026-0042",
      "trackingNumber": "CMP-2026-042",
      "title": "Burst pipe flooding washroom corridor",
      "status": "Assigned",
      "priority": "Urgent",
      "assignedTo": {
        "id": "usr_staff_plumb",
        "name": "Rajesh Sharma",
        "specialty": "Plumbing"
      },
      "dueDate": "2026-11-18T19:14:23.961Z"
    },
    "meta": {
      "prioritySuggestion": { "priority": "Urgent", "reason": "Hazard keyword detected" },
      "possibleDuplicates": []
    }
  }
  ```

#### `GET /api/complaints`
- **Access**: Role-Scoped
  - Students only see their own complaints.
  - Technicians only see complaints assigned to them.
  - Administrators see all campus complaints.
- **Query Filters**: `search`, `status`, `category`, `priority`, `building`, `assignee`, `overdueOnly`, `escalatedOnly`, `fromDate`, `toDate`, `page`, `limit`, `sortBy`, `sortOrder`.

#### `GET /api/complaints/:id`
- **Access**: Requester, Assigned Staff, or Admin.
- **Includes**: Complaint detail, chronological `statusHistory`, `comments` (internal notes hidden from student), `feedback`, and `slaInfo` (time remaining, overdue flag, escalation level).

#### `POST /api/complaints/:id/upvote` ("Me Too")
- **Access**: Authenticated.
- Increments `upvotesCount`. Automatically escalates ticket priority when reaching thresholds (>= 3 -> Medium, >= 5 -> High, >= 8 -> Urgent).

#### `POST /api/complaints/suggest-priority`
- **Access**: Authenticated.
- **Request Body**: `{ "title": "...", "description": "...", "categoryId": "..." }`
- **Returns**: `{ priority, reason, estimatedResolutionHours }`

---

### 4. Workflow Engine Transitions (`/api/complaints/:id/...`)

| Current Status | Allowed Target Status | Permitted Roles | Conditions / Payload |
| :--- | :--- | :--- | :--- |
| `Submitted` | `Under Review`, `Assigned`, `Rejected` | Admin | Rejection requires reason |
| `Submitted` | `Rejected` | Student (Owner) | Cancels own complaint |
| `Under Review` | `Assigned`, `Rejected` | Admin | Select technician |
| `Assigned` | `In Progress` | Staff, Admin | Technician arrives on site |
| `In Progress` | `Awaiting Parts`, `Resolved` | Staff, Admin | `Resolved` requires `resolutionNotes` |
| `Awaiting Parts`| `In Progress`, `Resolved` | Staff, Admin | Spare parts delivered |
| `Resolved` | `Closed` | Admin | Final closure |
| `Resolved` | `Reopened` | Student (Owner), Admin | Reopening requires reason |

#### Endpoints:
- `PATCH /api/complaints/:id/status` `{ "status": "In Progress", "notes": "..." }`
- `PATCH /api/complaints/:id/assign` `{ "staffId": "...", "reason": "..." }`
- `PATCH /api/complaints/:id/priority` `{ "priority": "Urgent", "reason": "..." }`
- `POST /api/complaints/:id/reopen` `{ "reason": "Issue recurred after load test" }`
- `POST /api/complaints/:id/close` `{ "notes": "Inspected by facilities supervisor" }`

---

### 5. Comments & Threaded Discussion

#### `POST /api/complaints/:id/comments`
- **Request Body**:
  ```json
  {
    "content": "Please call before visiting Room 302.",
    "isInternal": false
  }
  ```
  *(Setting `isInternal: true` is restricted to staff & admin; hidden from student)*

#### `GET /api/complaints/:id/comments`
- **Returns**: Chronological list of comments.

---

### 6. User Feedback & Star Ratings

#### `POST /api/complaints/:id/feedback`
- **Access**: Requester only.
- **Rules**: Only allowed when status is `Resolved` or `Closed`. Only allowed once per complaint.
- **Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "Outstanding speed and very clean repair work!",
    "timelinessRating": 5,
    "cleanlinessRating": 5,
    "technicianBehaviorRating": 5
  }
  ```

#### `GET /api/feedback`
- **Access**: Admin only (with filters for `rating`, `categoryId`, `staffId`).

---

### 7. Real-Time Notifications & Simulated Message Log

#### `GET /api/notifications/stream` (SSE)
- **Access**: Authenticated.
- Persistent Server-Sent Events HTTP stream (`text/event-stream`) pushing real-time notification events to browser/client with automatic 25s keepalive pings.

#### `GET /api/notifications`
- **Query Params**: `unreadOnly=true`, `page`, `limit`.

#### `PATCH /api/notifications/:id/read` & `PATCH /api/notifications/read-all`

#### `GET /api/notifications/sent-messages` (Admin)
- Inspects simulated external SMS and Email dispatches with delivery statuses and timestamps.

---

### 8. SLA Monitor Cron & Automated Escalation

- Configurable SLA thresholds: Urgent (24h), High (48h), Medium (120h), Low (240h).
- Automated Background Cron (`node-cron`) runs every 15 minutes:
  - Detects overdue breaches (`isOverdue: true`).
  - Sends reminder alerts to assigned technicians.
  - Escalates to Level 1 when breach exceeds 25% of SLA window.
  - Escalates to Level 2 (Critical) when breach exceeds 50% of SLA window (alerts campus Dean).
- `POST /api/admin/trigger-sla-scan`: Immediate manual trigger endpoint for testing and auditing.

---

### 9. Analytics & Reporting (`/api/analytics`, `/api/export`) - Admin & Staff

- `GET /api/analytics/overview`: Totals, open vs resolved, new this week, avg resolution hours, SLA compliance %, average rating, and trend percentages (`+12%`, `-5%`).
- `GET /api/analytics/by-category`: Resolution rate, pending count, and ratings per category.
- `GET /api/analytics/by-building`: Ranked campus building hotspots.
- `GET /api/analytics/by-status` & `GET /api/analytics/by-priority`
- `GET /api/analytics/monthly-trend`: 6-month historical intake vs resolution curve.
- `GET /api/analytics/top-recurring-issues`: High recurrence failure modes.
- `GET /api/analytics/staff-performance`: Technician scorecard with resolved counts, SLA compliance %, and user feedback averages.
- `GET /api/analytics/my-performance`: Technician's personal queue and metrics.
- `GET /api/export/complaints.csv`: Download RFC 4180 CSV spreadsheet.
- `GET /api/export/analytics.pdf`: Stream and download executive maintenance report in PDF format generated with PDFKit.

---

### 10. Settings, Audit Trail & Demo Utilities

- `GET /api/settings`: Campus operational parameters, SLA limits, auto-assign flag.
- `PATCH /api/settings`: Update SLA thresholds and campus metadata (Admin).
- `POST /api/settings/categories`: Create new maintenance specialty category (Admin).
- `GET /api/audit-log`: Complete system immutable audit trail (Admin).
- `POST /api/admin/reset-demo-data`: Resets JSON file-store back to original 40 seed complaints and 13 demo users (Admin).

---

## 🧪 Automated Test Suite

Run all unit and integration tests:
```bash
npm --prefix server test
```

### Coverage Overview:
- `auth.test.js` (7 tests): Registration, email collision checks, Zod validation, credential hashing, login, token expiry, profile retrieval.
- `complaints.test.js` (9 tests): Keyword priority suggestion (Urgent/High/Low), auto-assignment by specialty & workload, role scoping (student/staff/admin), "Me Too" community upvoting, duplicate upvote prevention.
- `workflow.test.js` (6 tests): Allowed transitions (Assigned -> In Progress -> Resolved), mandatory resolution notes check, role barrier enforcement, student reopening with reason, admin closure.
- `feedback.test.js` (3 tests): Premature feedback rejection, non-requester rejection, successful 1-5 rating submission, duplicate feedback prevention.
- `sla_and_analytics.test.js` (9 tests): SLA scanning and escalation, manual trigger endpoint, overview calculations & trend percentages, category breakdowns, building hotspots, technician scorecards, CSV export, PDF export.

**Result:** 34 tests passing across 5 suites (100% pass rate).
