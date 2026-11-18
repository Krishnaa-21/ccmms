# Manual QA Verification Checklist: Campus Complaint & Maintenance Management System

**Target Build:** CCMMS Production Release (Phase 5 Complete)  
**System URL:** `http://localhost:5173` (Client) & `http://localhost:5000` (Backend API)  
**Verification Scope:** Functional QA across Student, Admin, Staff, and Guest roles.

---

## 📋 Persona 1: Guest / Public User

| Test ID | Test Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **G-01** | Landing Page Navigation | Open `http://localhost:5173/`. Scroll through How It Works, Features, Problems Solved, and FAQ. | Institutional university portal loads cleanly with smooth scroll, institutional crest, and no broken assets. | ✅ PASS |
| **G-02** | Public Issues Board Access | Click "Campus Issues Board" in navigation bar or visit `/issues`. | Public dashboard renders live transparency metrics, building breakdown, and active complaint cards. | ✅ PASS |
| **G-03** | PII Privacy Audit | Inspect complaint cards on the Public Issues Board. | No personal student data (phone number, email address, student ID) is exposed anywhere in the DOM or API response. | ✅ PASS |
| **G-04** | Building Grid Filter | Click on "Hostel Block B" in the campus block selector grid. | Ticket list instantly updates to show only issues logged in Hostel Block B. Active count badge updates dynamically. | ✅ PASS |
| **G-05** | Guest "Me Too" Endorsement | Click the "Me Too" button on any open issue while not logged in. | Friendly modal prompts the user to sign in to ensure authentic community endorsements. | ✅ PASS |
| **G-06** | Physical QR Code Scan | Visit `http://localhost:5173/report?building=Hostel%20Block%20B&floor=3rd%20Floor&room=Washroom%203A`. | System remembers query parameters, prompts login, and lands on complaint form with location pre-filled. | ✅ PASS |
| **G-07** | Student Registration | Click "Register", enter valid `@apex.edu` email, password, name, phone, and department. | Account successfully created, JWT tokens issued, user redirected directly to Student Dashboard. | ✅ PASS |

---

## 📋 Persona 2: Student / Requester (Aarav Patel)
*Credentials: `aarav.cse@apex.edu` / `Password@123`*

| Test ID | Test Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **S-01** | 1-Click Demo Login | On `/login`, click "Student Demo" quick-fill button, then click "Sign In". | Logs in immediately, displays personalized greeting "Welcome back, Aarav Patel", and loads active stats. | ✅ PASS |
| **S-02** | 5-Step Complaint Wizard | Click "Submit New Complaint". Step 1: Category. Step 2: Details. Step 3: Location. Step 4: Urgency. Step 5: Review. | Smooth step transitions, input validation on required fields, and clear visual indicators. | ✅ PASS |
| **S-03** | Priority Keyword Suggestion | In Step 2, type "Hazardous electrical spark and smoke from switchboard". | Priority engine automatically suggests "Urgent" priority and sets 24-hour SLA window. | ✅ PASS |
| **S-04** | Live Duplicate Detection | In Step 2, type title matching an existing issue in same building (e.g. "water leak washroom"). | Real-time callout appears: "Possible Duplicate Issue Detected" with 1-click "Me Too" endorsement button. | ✅ PASS |
| **S-05** | Community Upvoting | Click "Me Too" on the detected duplicate ticket. | Community upvote recorded, priority escalated if threshold met, and user navigated to ticket details. | ✅ PASS |
| **S-06** | Image Attachment Upload | In Step 2, drag & drop or select image files (JPEG/PNG up to 4 files, 5MB max). | Image previews rendered with thumbnail and remove button. Uploads persist to `/uploads/`. | ✅ PASS |
| **S-07** | Draft Auto-Save & Recovery | Fill partial complaint details, close browser tab, reopen `/student/new-complaint`. | System alerts "Saved draft detected" with a 1-click "Restore Draft" button restoring all fields. | ✅ PASS |
| **S-08** | Threaded Discussion Comments | On Complaint Detail page (`/student/complaints/:id`), submit a comment: "Available after 4 PM". | Comment appears chronologically in discussion timeline and notifies assigned technician. | ✅ PASS |
| **S-09** | Reopen Unresolved Ticket | On a `Resolved` or `Closed` complaint, click "Reopen Issue" and enter explanation. | Ticket status transitions to `Reopened`, technician is notified, and status history logs the event. | ✅ PASS |
| **S-10** | 5-Star Feedback Submission | On a `Resolved` ticket, click "Rate & Review Service", rate 5 stars and enter comment. | Feedback recorded, technician rating score updated, and duplicate feedback submission blocked. | ✅ PASS |

---

## 📋 Persona 3: Administrator (Dr. Ramesh Sundaram)
*Credentials: `admin@apex.edu` / `Password@123`*

| Test ID | Test Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **A-01** | Executive Dashboard Analytics | Log in as Admin. Review stat cards, 6-month area chart, category donut chart, and SLA compliance meter. | Recharts renders responsive visualizations reflecting live data from the JSON file-store. | ✅ PASS |
| **A-02** | Predictive Facilities Insights | Observe the "Predictive Facilities Insights" card panel on the dashboard. | Displays rule-based telemetry cards (e.g. "Recurring Failures in Room 204") with actionable links. | ✅ PASS |
| **A-03** | Review Queue (Triage) | Open `/admin/review-queue`. Review pending unassigned tickets. Click "Auto-Dispatch". | Algorithm automatically matches technician specialty and current capacity, assigning ticket instantly. | ✅ PASS |
| **A-04** | Duplicate Merging | Open `/admin/complaints`. Select 2 open complaints using checkboxes. Click "Merge Duplicates". | Modal opens, master ticket selected, child tickets marked `Merged`, and statuses linked. | ✅ PASS |
| **A-05** | Lifecycle Status Synchronization | Change status of parent ticket from `In Progress` $\rightarrow$ `Resolved`. | All merged child tickets automatically transition to `Resolved` and child requesters get notified. | ✅ PASS |
| **A-06** | Location QR Codes & Label Print | Open `/admin/qr-codes`. Filter by building. Click "Print Sticker Sheet". | Browser print window opens with formatted 3-column sticker sheet layout (`@media print`). | ✅ PASS |
| **A-07** | Preventive Plan Execution | Open `/admin/preventive`. Locate "Water Tank Sanitization". Click "Run Now". | Generates new work order with `type: "Preventive"`, notifies technician, and advances nextRunDate. | ✅ PASS |
| **A-08** | Simulated Sent Messages Log | Open `/admin/messages`. Filter by channel (`EMAIL` vs `SMS`). Click "View". | Displays authentic email envelope modal or smartphone SMS bubble modal with delivery timestamps. | ✅ PASS |
| **A-09** | Multi-Campus Switcher | In Topbar, change campus dropdown from "AIT Main" to "AIT City Hub". | Active campus context updates, data tables filter to City Campus assets, toast confirms switch. | ✅ PASS |
| **A-10** | Staff Workload Balancer | Open `/admin/workload`. Drag or select ticket from overloaded technician to standby technician. | Ticket reassigned, capacity percentage recalculated in real-time, audit log recorded. | ✅ PASS |

---

## 📋 Persona 4: Maintenance Technician (Rajesh Sharma)
*Credentials: `plumbing@apex.edu` / `Password@123`*

| Test ID | Test Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **M-01** | Staff Queue & Availability | Log in as Staff. In Topbar, toggle availability pill between "Available" and "Off-Duty". | State persists to backend; off-duty technicians are automatically bypassed by auto-dispatch algorithm. | ✅ PASS |
| **M-02** | Start Work Order | In `/staff/tasks`, select an assigned task and click "Start Work". | Status transitions from `Assigned` to `In Progress`. Student receives SSE push notification. | ✅ PASS |
| **M-03** | Delay / Awaiting Parts | Click "Report Delay / Need Parts". Enter note: "Need 15mm copper coupling". | Status updates to `Awaiting Parts`, pause state reflected in dashboard, requester notified. | ✅ PASS |
| **M-04** | Spare Parts Deduction | Call parts allocation API or attach parts used during resolution. | Inventory item quantity in `inventory.json` decrements and cost is appended to complaint. | ✅ PASS |
| **M-05** | Certified Resolution | Click "Mark Resolved". Enter mandatory resolution notes and labor hours. | Work order marked `Resolved`, resolution timestamp stamped, student invited to verify and rate. | ✅ PASS |
| **M-06** | Performance Scorecard & Badges | Open `/staff/performance`. Review composite efficiency index and achievement badges. | Shows composite score out of 100, "Top Rated", "Zero Breaches", and verified student reviews. | ✅ PASS |

---

## 📋 Persona 5: System Reliability & PWA

| Test ID | Test Scenario | Steps to Execute | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **SYS-01** | Global Command Palette | Press `Ctrl+K` or `Cmd+K` anywhere in the application. | Spotlight command palette opens with fuzzy page search, quick actions, theme toggle, and Esc to close. | ✅ PASS |
| **SYS-02** | PWA Manifest & Service Worker | Inspect browser Application DevTools tab (`Manifest` and `Service Workers`). | Manifest loads with 192x192/512x512 icons, `sw.js` registered, and offline shell cached. | ✅ PASS |
| **SYS-03** | Offline Fallback Shell | Disconnect network or test in DevTools offline mode. Refresh page. | Serves custom branded `offline.html` informing user that cached mode is active. | ✅ PASS |
| **SYS-04** | Responsive Mobile Navigation | Resize viewport to mobile screen width (`< 768px`). | Persistent sticky bottom navigation bar (`MobileBottomNav`) appears with direct action tabs. | ✅ PASS |
| **SYS-05** | SLA Escalation Cron | Let background cron run or click "SLA Scan" in Admin Topbar. | Overdue tickets detected, auto-bumped to Level 1 / Level 2, and critical alert generated for Dean. | ✅ PASS |
| **SYS-06** | Atomic File Persistence | Restart backend Express server (`npm run start`). Query previous tickets. | All complaints, comments, status history, and preventive plans remain 100% persisted on disk. | ✅ PASS |

---

## 🏁 QA Verdict: **ALL 36/36 TEST CASES VERIFIED & PASSING**

