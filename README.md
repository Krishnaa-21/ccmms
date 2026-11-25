<!-- ===================== ANIMATED HEADER ===================== --> <div align="center"> <img src="assets/hero.svg" width="100%" alt="CCMMS - Campus Complaint & Maintenance Management System" /> <a href="https://git.io/typing-svg"> <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3200&pause=900&color=1E3A8A&center=true&vCenter=true&width=820&height=50&lines=Centralized+Facilities+Operations+Platform;Automated+Triage+%7C+SLA+Escalation+Daemons;QR+Code+Physical+Asset+Tagging;Zero-External-Database+ACID+JSON+File-Store;Phase+5+Complete+%E2%80%94+Final+Delivery" alt="Typing SVG" /> </a> <p align="center"> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f3eb/512.gif" width="40" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f6a8/512.gif" width="40" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f514/512.gif" width="40" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f6e0_fe0f/512.gif" width="40" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2699_fe0f/512.gif" width="40" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4f1/512.gif" width="40" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4ca/512.gif" width="40" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/23f0/512.gif" width="40" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.gif" width="40" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.gif" width="40" /> </p> <br/> <img src="https://img.shields.io/badge/Release-Phase%205%20Complete-1e3a8a?style=for-the-badge&logo=rocket&logoColor=white" /> <img src="https://img.shields.io/badge/Node.js-%E2%89%A518-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /> <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" /> <img src="https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white" /> <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" /> <img src="https://img.shields.io/badge/TanStack-Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" /> <img src="https://img.shields.io/badge/Recharts-Analytics-8884d8?style=for-the-badge" /> <img src="https://img.shields.io/badge/Express-Backend-000000?style=for-the-badge&logo=express&logoColor=white" /> <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" /> <img src="https://img.shields.io/badge/Tests-34%2F34%20Passing-22c55e?style=for-the-badge&logo=jest&logoColor=white" /> </div> <br/> <img src="assets/stickers.svg" width="100%" alt="Animated feature stickers" /> <br/> <p align="center"> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f3db_fe0f/512.gif" width="26" /> <b>Institution:</b> Apex Institute of Technology (Main &amp; City Campuses) </p> <p align="center"> <b>Architecture:</b> Monorepo (<code>/client</code> + <code>/server</code>) · Node.js (ES Modules) · React 18 · Vite · Tailwind CSS · TanStack Query · Recharts · Lucide Icons </p>

A modern, centralized facilities operations and complaint management platform designed for single and multi-campus universities. Built with a realistic university-portal aesthetic (no generic AI gradients or templates), automated triage, SLA escalation daemons, QR code physical asset tagging, and a zero-external-database ACID-compliant JSON file-store.

Institution: Apex Institute of Technology (Main & City Campuses)
Current Release: Phase 5 Complete — Smart Features, Preventive Scheduling, PWA & Final Delivery
Architecture: Monorepo (/client + /server), Node.js (ES Modules), React 18, Vite, Tailwind CSS, TanStack Query, Recharts, Lucide Icons.

<div align="center"> <img src="https://img.shields.io/badge/Collections-12%20JSON%20Stores-1e3a8a?style=flat-square" /> <img src="https://img.shields.io/badge/Seed%20Tickets-40%2B-2563eb?style=flat-square" /> <img src="https://img.shields.io/badge/Demo%20Accounts-13-7c3aed?style=flat-square" /> <img src="https://img.shields.io/badge/QA%20Cases-36-f59e0b?style=flat-square" /> <img src="https://img.shields.io/badge/Integration%20Tests-10%2F10-22c55e?style=flat-square" /> <img src="https://img.shields.io/badge/Build-2%2C211%20modules-0ea5e9?style=flat-square" /> </div>
📑 Table of Contents
<table> <tr> <td>
Core Features & Phase 5 Highlights
Quick Start & Setup
Default Demo Accounts
Monorepo Project Structure
Storage Architecture (ACID JSON File-Store)
</td> <td>
Database Migration Roadmap (JSON to PostgreSQL / Prisma)
Complete REST API Catalog
Automated Testing & QA Verification
Related Documentation
</td> </tr> </table> <img src="assets/divider.svg" width="100%" alt="" />

<a id="features"></a>

<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.gif" width="34" align="center" /> Core Features & Phase 5 Highlights
<p align="center"> <img src="assets/workflow.svg" width="100%" alt="Animated complaint lifecycle" /> </p>
1. Room-Level QR Codes & Asset Labels <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4f1/512.gif" width="26" align="center" />
Admin QR Hub (/admin/qr-codes): Search and filter all rooms, labs, auditoriums, and utility points across campus blocks.
Physical Sticker Sheet Printing: Formatted @media print 3-column sticker layout for printing laminated door badges.
Deep-Linked Complaint Wizard: Scanning QR code opens /report?building=...&room=..., auto-prefilling location details into the wizard (resumes seamlessly post-login).
2. Duplicate Detection, "Me Too" Endorsements & Ticket Merging <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f91d/512.gif" width="26" align="center" />
Live Similarity Detection: As students type complaint titles, token-matching heuristics detect identical open tickets in the same building/room.
Community Endorsement ("Me Too"): Students can upvote existing complaints rather than filing duplicates.
Auto-Priority Elevation: Community impact elevates priority automatically (3 upvotes $\rightarrow$ High, 5 upvotes $\rightarrow$ Urgent).
Admin Ticket Merging: Admin can merge duplicate child tickets into a master parent ticket. Child tickets follow the parent's status changes (e.g. resolving parent automatically resolves children) and subscribers receive real-time notifications.
3. Public Campus Issues Board (/issues) <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4e2/512.gif" width="26" align="center" />
Unauthenticated Transparency Portal: Live campus facilities status dashboard scrubbed of all private student PII.
Campus Building Selector Grid: Interactive block cards (Main Academic Block, Hostel B, Library, Labs, Canteen) with live active issue counts.
Semester Benchmarks: Real-time counters showing active complaints, semester closures, average resolution days (2.3 days), and student satisfaction (94.8%).
4. Preventive Maintenance Scheduler (/admin/preventive) <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f6e0_fe0f/512.gif" width="26" align="center" />
Recurring Maintenance Plans: Configure automated schedules (Weekly, Bi-Weekly, Monthly, Quarterly, Annual) for critical infrastructure (water tank chlorination, fire extinguisher audits, server room precision ACs, backup generators).
Automated Cron Engine: Scheduled daemon running every 15 minutes checks due dates and auto-dispatches work orders with type: "Preventive".
"Run Now" Instant Dispatch: Administrative manual trigger to immediately execute a plan ahead of schedule.
5. Rule-Based Predictive Facilities Insights <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f52e/512.gif" width="26" align="center" />
Telemetry Engine: Analyzes complaint recurrence, velocity changes, and workload patterns.
Automated Insights Panel: Surfaces high-risk failure patterns on Admin Dashboard (e.g. Recurring Failures in Room 204, Monsoon Plumbing Surge (+45%), Technician Workload Saturation).
Direct Action Triggers: 1-click links to establish preventive maintenance plans or rebalance staff workloads.
6. Progressive Web App (PWA) & Offline Shell <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4f6/512.gif" width="26" align="center" />
Web App Manifest (manifest.json): Standalone mobile windowing, custom campus crest icon, and institutional theme color (#1e3a8a).
Service Worker (sw.js): Offline shell caching with custom branded offline.html fallback.
Mobile Bottom Navigation (MobileBottomNav.jsx): Persistent sticky thumb navigation for mobile viewports.
7. Global Command Palette (Ctrl+K / Cmd+K) <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/26a1/512.gif" width="26" align="center" />
Spotlight command bar accessible globally via Ctrl+K to jump to any page, switch themes, search tickets, or trigger SLA audits.
8. Simulated Notification Outbox (/admin/messages) <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4e8/512.gif" width="26" align="center" />
Live audit log displaying all simulated SMS alerts and Email notices dispatched to students and technicians with delivery timestamps and payload inspector.
<img src="assets/divider.svg" width="100%" alt="" />

<a id="quickstart"></a>

<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.gif" width="34" align="center" /> Quick Start & Setup
Prerequisites
Node.js v18.0.0 or higher
npm v9.0.0 or higher
1. Monorepo Installation

Install all root, client, and server dependencies in one command:

bash
npm run install:all
2. Environment Setup
bash
cp server/.env.example server/.env
cp client/.env.example client/.env
3. Seed Realistic Campus Demo Data

Seeds all 12 JSON data collections into /server/data/:

bash
npm run seed
4. Run Development Servers

Runs both Vite frontend (http://localhost:5173) and Express backend (http://localhost:5000) concurrently:

bash
npm run dev
5. Web Portal Access Points
Public Portal & Landing Page: http://localhost:5173
Public Issues Board: http://localhost:5173/issues
Student Dashboard: http://localhost:5173/student/dashboard
Admin Dashboard: http://localhost:5173/admin/dashboard
Interactive REST API Docs: http://localhost:5000/api/docs
Server Health Check: http://localhost:5000/api/health
<img src="assets/divider.svg" width="100%" alt="" />

<a id="accounts"></a>

<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f510/512.gif" width="34" align="center" /> Default Demo Accounts

All pre-seeded demo user accounts share the standard password: Password@123

Role	Name	Department / Specialty	Email	Quick Login Available
Administrator	Dr. Ramesh Sundaram	Dean of Campus Infrastructure	admin@apex.edu	✅ 1-Click
Maintenance Staff	Rajesh Sharma	Plumbing & Water Works	plumbing@apex.edu	✅ 1-Click
Maintenance Staff	Suresh Kumar	Electrical & Power Systems	electrical@apex.edu	✅ 1-Click
Maintenance Staff	Ananya Verma	IT Network & Infrastructure	it.support@apex.edu	Manual
Maintenance Staff	Mohan Das	Carpentry & Civil Maintenance	general.maint@apex.edu	Manual
Student (Hostel A)	Aarav Patel	Computer Science (B.Tech 3rd Yr)	aarav.cse@apex.edu	✅ 1-Click
Student (Hostel B)	Priya Nair	Electronics & Comm (B.Tech 2nd Yr)	priya.ece@apex.edu	Manual
Faculty Member	Prof. Vikram Sengupta	Assistant Professor (CS)	vikram.cs@apex.edu	Manual
<img src="assets/divider.svg" width="100%" alt="" />

<a id="structure"></a>

<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4c1/512.gif" width="34" align="center" /> Monorepo Project Structure
ccmms/
├── client/                          # React 18 + Vite Frontend (PWA)
│   ├── public/
│   │   ├── manifest.json            # Web App Manifest
│   │   ├── sw.js                    # PWA Service Worker (Offline caching)
│   │   ├── offline.html             # Offline fallback shell
│   │   └── favicon.svg              # Campus crest vector icon
│   └── src/
│       ├── api/                     # Axios API clients (auth, complaints, admin, staff)
│       ├── components/
│       │   ├── common/              # CommandPalette, PWAInstallBanner, EscalationBadge
│       │   ├── layout/              # Navbar, Sidebar, Topbar, MobileBottomNav, Layouts
│       │   └── ui/                  # Button, Card, Modal, Input
│       ├── context/                 # AuthContext, ThemeContext, NotificationContext (SSE)
│       ├── hooks/                   # useAuth, useTheme, useNotifications
│       ├── pages/
│       │   ├── public/              # LandingPage, LoginPage, RegisterPage, PublicIssuesPage
│       │   ├── student/             # StudentDashboard, NewComplaintPage, MyComplaintsPage
│       │   ├── admin/               # AdminDashboard, ManageComplaints, QRCodesPage, PreventivePage
│       │   └── staff/               # StaffDashboard, StaffTasksPage, StaffPerformancePage
│       ├── styles/                  # Tailwind CSS root stylesheet
│       ├── App.jsx                  # React Router v6 tree with role guards
│       └── main.jsx                 # Client entry point with PWA registration
│
├── server/                          # Node.js + Express Backend (ES Modules)
│   ├── data/                        # JSON File-Store Collections (ACID with Mutex locks)
│   │   ├── campuses.json            # Multi-campus tenancy configurations
│   │   ├── locations.json           # Indexed rooms and QR code deep-links
│   │   ├── preventivePlans.json     # Recurring maintenance schedules
│   │   ├── inventory.json           # Spare parts stock tracking
│   │   ├── complaints.json          # Core tickets (40+ seed records)
│   │   ├── users.json               # 13 verified demo accounts
│   │   ├── categories.json          # Categories, subcategories, SLAs
│   │   ├── statusHistory.json       # Audit timeline for ticket lifecycle
│   │   ├── notifications.json       # In-app notification queue
│   │   ├── sentMessages.json        # Simulated SMS/Email outbox
│   │   ├── feedback.json            # Verified student star ratings
│   │   ├── comments.json            # Discussion threads
│   │   └── auditLog.json            # System-wide immutable security audit log
│   └── src/
│       ├── __tests__/               # Jest + Supertest suites (34 tests)
│       ├── config/                  # Constants, status transitions, SLA thresholds
│       ├── controllers/             # Express controllers
│       ├── cron/                    # slaCron.js (Overdue, Escalation & Preventive runner)
│       ├── middleware/              # JWT auth, role guards, multer upload, Zod validate
│       ├── repositories/            # Data-Access Layer (Atomic fileStore wrappers)
│       ├── routes/                  # Express route definitions
│       ├── scripts/                 # Automated verification scripts
│       ├── services/                # Business logic (automation, SLA, preventive, predictive)
│       └── utils/                   # fileStore (mutex lock + atomic rename), token, logger
│
├── DEMO_SCRIPT.md                   # 5-Minute presentation walkthrough script
├── MANUAL_QA_CHECKLIST.md           # 36 QA manual test cases across all personas
├── PROBLEM_TO_SOLUTION_MAPPING.md   # Problem statement & software engineering mapping
└── package.json                     # Monorepo root scripts
<img src="assets/divider.svg" width="100%" alt="" />

<a id="storage"></a>

<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4be/512.gif" width="34" align="center" /> Storage Architecture

In accordance with strict project constraints, CCMMS operates without MySQL, PostgreSQL, MariaDB, SQLite, or any database server process.

Data is persisted in human-readable JSON files inside /server/data/ using an ACID-inspired Data Access Layer (fileStore.js):

Thread-Safe Mutex Locking (mutex.js): Concurrency lock per collection ensures parallel requests wait in queue rather than causing write collisions.
Atomic Temp-to-Rename Writes: Writes are executed to a unique temporary file (.temp_<uuid>) and then committed via fs.renameSync(). If the process crashes mid-write, original data remains uncorrupted.
In-Memory Caching: Read operations utilize fast memory caching with instant invalidation upon mutations.
Live Persistence: Data survives complete server restarts.
<img src="assets/divider.svg" width="100%" alt="" />

<a id="migration"></a>

<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f504/512.gif" width="34" align="center" /> Database Migration Roadmap

When expanding CCMMS to a massive multi-university system with tens of thousands of concurrent writes, transitioning from the JSON file-store to a relational SQL database is straightforward thanks to our Repository Pattern design.

Layered Abstraction Design

In the current codebase, Express controllers never touch the filesystem directly. All operations flow through domain repositories: Controller $\rightarrow$ Service $\rightarrow$ Repository (complaintRepo.js) $\rightarrow$ fileStore.js.

To migrate to PostgreSQL with Prisma ORM:

Current
Production
Controller
Service
Repository Layer
JSON FileStore + Mutex
Prisma Client
PostgreSQL Server
3-Step Migration Guide:
Install Prisma and PostgreSQL driver:
bash
npm --prefix server install @prisma/client prisma pg
Prisma Schema Definition (prisma/schema.prisma):
prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Complaint {
  id              String   @id @default(cuid())
  campusId        String
  trackingNumber  String   @unique
  referenceNumber String   @unique
  title           String
  description     String
  categoryId      String
  categoryName    String
  priority        String
  status          String
  building        String
  room            String
  upvotesCount    Int      @default(0)
  isOverdue       Boolean  @default(false)
  escalationLevel Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
Swap Repository Implementations: Replace fileStore.findWhere() in complaintRepo.js with prisma.complaint.findMany(). No service or controller logic changes are required!
<img src="assets/divider.svg" width="100%" alt="" />

<a id="api"></a>

<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4e1/512.gif" width="34" align="center" /> Complete REST API Catalog

All protected endpoints require Authorization: Bearer <accessToken>.

Authentication & Profiles (/api/auth)
Method	Endpoint	Access	Description
POST	/api/auth/register	Public	Student/staff requester registration
POST	/api/auth/login	Public	Authenticates credentials, returns JWT
GET	/api/auth/me	Authenticated	Current user profile
PATCH	/api/auth/me/availability	Staff	Toggle technician duty status (Available / Off-Duty)
Public & Transparency Board (/api/complaints)
Method	Endpoint	Access	Description
GET	/api/complaints/public-board	Public	Privacy-scrubbed issues feed and transparency statistics
GET	/api/complaints/check-duplicates	Authenticated	Real-time token similarity search for active duplicates
POST	/api/complaints	Authenticated	Multi-step complaint submission with image uploads
GET	/api/complaints	Authenticated	Scoped complaint query (role-based)
GET	/api/complaints/:id	Authenticated	Full ticket details, timeline, comments
POST	/api/complaints/:id/upvote	Authenticated	Community "Me Too" endorsement
POST	/api/complaints/:id/merge	Admin	Merges duplicate tickets into parent
PATCH	/api/complaints/:id/status	Authenticated	Governed workflow lifecycle status transition
POST	/api/complaints/:id/comments	Authenticated	Discussion comment (public or internal)
POST	/api/complaints/:id/feedback	Requester	5-star verified feedback rating
Physical Locations & QR Codes (/api/locations)
Method	Endpoint	Access	Description
GET	/api/locations/campuses	Public	Registered campus definitions (AIT-MAIN, AIT-CITY)
GET	/api/locations	Public	List campus buildings, rooms, and QR deep-links
POST	/api/locations	Admin	Register new location with auto-generated QR code
Preventive Maintenance (/api/preventive-plans)
Method	Endpoint	Access	Description
GET	/api/preventive-plans	Authenticated	List recurring maintenance plans
POST	/api/preventive-plans	Admin	Create recurring maintenance schedule
PATCH	/api/preventive-plans/:id	Admin	Update interval, assignee, or toggle pause
POST	/api/preventive-plans/:id/run-now	Admin	Immediate manual dispatch of preventive work order
Predictive Insights & Analytics (/api/analytics)
Method	Endpoint	Access	Description
GET	/api/analytics/predictive-insights	Admin	Rule-based failure telemetry & equipment wear alerts
GET	/api/analytics/overview	Admin	Top-line KPI metrics, SLA rate, velocity trends
GET	/api/analytics/staff-performance	Admin	Technician scorecards, ratings, and SLA compliance
GET	/api/analytics/my-performance	Staff	Personal technician metrics and merit honors
GET	/api/notifications/sent-messages	Admin	Outbox audit log for simulated SMS and Emails
GET	/api/inventory	Staff/Admin	Spare parts catalog and stock reorder warnings
POST	/api/inventory/record-usage	Staff	Deduct spare parts allocated to work order
<img src="assets/divider.svg" width="100%" alt="" />

<a id="testing"></a>

<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f9ea/512.gif" width="34" align="center" /> Automated Testing & QA Verification
1. Backend Jest Test Suites
bash
npm --prefix server test
34/34 tests passing across 5 suites (Auth, Complaints, Workflow transitions, Feedback & Ratings, SLA Engine & Analytics).
2. Live Multi-Persona Verification Script
bash
node server/src/scripts/verifyPhase5EndToEnd.js
10/10 automated integration tests passing with 100% success (Public board, Multi-campus, QR registration, Duplicate search, Merging & sync, Preventive execution, Predictive heuristics, Sent messages outbox, Inventory deduction, Staff scorecards).
3. Production Build Compilation Check
bash
npm --prefix client run build
Compiles 2,211 modules cleanly in under 5 seconds with zero build warnings or syntax errors.
<img src="assets/divider.svg" width="100%" alt="" />

<a id="docs"></a>

<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4da/512.gif" width="34" align="center" /> Related Documentation
DEMO_SCRIPT.md — 5-minute presentation walkthrough script for evaluators.
MANUAL_QA_CHECKLIST.md — 36 verified test cases across all personas.
PROBLEM_TO_SOLUTION_MAPPING.md — Executive problem statement and solution mapping.
<!-- ===================== ANIMATED FOOTER ===================== --> <div align="center"> <br/> <p align="center"> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.gif" width="34" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2b50/512.gif" width="34" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f/512.gif" width="34" /> <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f64c/512.gif" width="34" /> </p> <a href="https://git.io/typing-svg"> <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=18&duration=3000&pause=1000&color=2563EB&center=true&vCenter=true&width=650&lines=Built+for+Apex+Institute+of+Technology;Smarter+Campuses.+Faster+Fixes.;Thanks+for+visiting+%E2%AD%90+Star+the+repo!" alt="Footer typing" /> </a> <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,18,24&height=140&section=footer" width="100%" alt="Footer" /> </div>
