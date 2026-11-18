# 5-Minute Evaluator Presentation & Demo Walkthrough Script

**Project:** Campus Complaint & Maintenance Management System (CCMMS)  
**Institution:** Apex Institute of Technology (Main Campus)  
**Total Presentation Time:** 5 Minutes (300 seconds)  
**Target Audience:** University Leadership, Evaluators, Engineering Panel  

---

## ⏱️ Demo Timeline Breakdown

```mermaid
timeline
    title 5-Minute Product Walkthrough
    0:00 - 0:45 : Act 1 - The Problem & Public Transparency Board
    0:45 - 1:45 : Act 2 - Student Experience, QR Scan & Duplicate Detection
    1:45 - 3:15 : Act 3 - Admin Control, Triage, Duplicates Merge & Predictive Engine
    3:15 - 4:15 : Act 4 - Maintenance Staff Field Execution & Spare Parts
    4:15 - 5:00 : Act 5 - Architecture, PWA, Test Suite & Wrap-Up
```

---

## 🎬 Act 1: The Problem & Public Transparency Board (0:00 – 0:45)
**URL:** `http://localhost:5173/` and `http://localhost:5173/issues`

### 1. The Opening Hook (15s)
> *"Welcome! Every university campus faces a common operational dilemma: complaints get lost in WhatsApp chats, paper register forms, or unlogged phone calls. Students assume nobody is working on their issues, while facilities teams fight fires reactively without accountability. Today, we present **CCMMS** — a centralized, transparent operations platform built for Apex Institute of Technology."*

### 2. Show the Public Website & Issues Board (30s)
1. Navigate to the **Landing Page** (`/`). Point out the university portal aesthetic (deep navy, refined teal, institutional crest, no generic AI neon gradients).
2. Click **"Campus Issues Board"** in the navigation bar (`/issues`).
3. Point out:
   - **Transparency Metrics Counters:** Total Active Issues (28), Resolved This Semester (16), Average Resolution Time (2.3 days), and Student Satisfaction (94.8%).
   - **Campus Building Selector Grid:** Click on **"Hostel Block B"** or **"Main Academic Block"** to show instant zero-reload filtering of active issues.
   - **Privacy Scrubbing:** Notice that student PII (phone numbers, email addresses) is strictly hidden from the public feed.
   - Click the **"Me Too"** button as a guest: notice the friendly prompt inviting the user to authenticate to verify their endorsement.

---

## 🎬 Act 2: Student Experience, QR Codes & Duplicate Upvoting (0:45 – 1:45)
**Persona:** Student Aarav Patel (`aarav.cse@apex.edu` / `Password@123`)

### 1. Simulated Physical QR Code Scan (20s)
> *"Imagine a student sitting in Computer Lab 1 or walking down Hostel Block B. On the door or fixture is a laminated QR label."*
1. Type the deep-link in the browser bar:  
   `http://localhost:5173/report?building=Hostel%20Block%20B&floor=3rd%20Floor&room=Washroom%203A`
2. Show 1-Click Demo Login as **Student (Aarav Patel)**.
3. Observe: The wizard immediately opens with **Hostel Block B**, **3rd Floor**, and **Washroom 3A** already pre-filled and locked in!

### 2. Live Duplicate Detection & "Me Too" Upvoting (40s)
1. Select Category: **Plumbing**.
2. Start typing the Title: `"Severe water leakage near washroom stall"`
3. **Point out the Alert Banner that appears in real-time:**
   > *"Possible Duplicate Issue Detected in this Building: Ticket #CCM-2026-0001 (Water leakage in Hostel Block B washroom 3A)."*
4. Explain: Instead of creating a duplicate work order that clutters the technician's queue, the student can click **"Me Too (3 upvotes)"**.
5. Click **"Me Too"**: Observe instant confirmation toast, priority escalation trigger, and navigation to the live ticket tracker!

---

## 🎬 Act 3: Administrator Command Center & Smart Automation (1:45 – 3:15)
**Persona:** Administrator Dr. Ramesh Sundaram (`admin@apex.edu` / `Password@123`)

### 1. Executive Dashboard & Predictive Insights (30s)
1. Log in or switch to **Admin**.
2. Point out:
   - **Row of Stat Cards:** Total complaints, open vs resolved, SLA compliance (92.5%), and average resolution time.
   - **Predictive Facilities Insights Panel:** Show rule-based cards:
     - *"Recurring Failures: Main Academic Block (Room 204)"* with 6 tickets this month.
     - *"Volume Surge in Plumbing (+45%)"* following monsoon season.
     - Click **"Schedule Preventive Plan"** or **"Rebalance Workload"** to demonstrate direct administrative action triggers.

### 2. Duplicate Merging Demonstration (30s)
1. Navigate to **Complaints** (`/admin/complaints`).
2. Select two open complaints in the table using the row checkboxes.
3. Observe the floating dark bar that slides up: **"2 Selected"**.
4. Click **"Merge Duplicates"** (Amber button with GitMerge icon).
5. In the modal, select the Master Parent Ticket, review child tickets that will follow it, and click **"Confirm & Merge Tickets"**.
6. Show that the child ticket immediately transitions to status **"Merged"** and child ticket subscribers receive automated status updates!

### 3. Location QR Code Generator & Label Print (30s)
1. Click **"QR Asset Codes"** (`/admin/qr-codes`) in the sidebar.
2. Show the campus rooms grid with real-time QR generation.
3. Click **"Preview"** on a room to show the institutional sticker format.
4. Click **"Print Sticker Sheet"**: Show the browser print preview with clean 3-column sticker sheet layout (`@media print`) ready for sticker paper printing!

---

## 🎬 Act 4: Maintenance Staff Execution & Spare Parts Allocation (3:15 – 4:15)
**Persona:** Maintenance Technician Rajesh Sharma (`plumbing@apex.edu` / `Password@123`)

### 1. Technician Queue & Capacity Meter (30s)
1. Log in as **Staff (Rajesh Sharma)**.
2. Observe the **Availability Toggle Pill** in the top bar: toggle from *"Available"* to *"Off-Duty"* to show real-time dispatch state.
3. In **My Work Orders** (`/staff/tasks`), pick an assigned task.
4. Click **"Start Work"** (transitions from `Assigned` $\rightarrow$ `In Progress`).

### 2. Spare Parts Allocation & Certified Resolution (30s)
1. Click **"Resolve Work Order"**.
2. Point out:
   - Mandatory resolution notes (ensures accountability).
   - Enter: *"Replaced ruptured 15mm copper pipe fitting with heavy-duty brass bib tap. Tested pressure to 4 bar with zero leakage."*
   - Enter time spent: `2.5 hours`.
3. Submit: Notice the ticket moves to `Resolved`, automated notification pings the student for a 5-star review, and the child duplicate tickets automatically resolve in tandem!

---

## 🎬 Act 5: Architecture, PWA, Test Suite & Wrap-Up (4:15 – 5:00)
**Presenter / Developer Mode**

### 1. Global Command Palette (`Ctrl+K`) & PWA (20s)
1. Press `Ctrl+K` (or `Cmd+K` on Mac): Show the spotlight command palette instantly jumping between admin pages, triggering SLA scans, or toggling themes.
2. Point out the installable PWA banner and responsive mobile bottom navigation (`MobileBottomNav`).

### 2. Engineering Architecture & Test Suite (25s)
1. Switch to terminal:
   ```bash
   npm --prefix server test
   ```
   Highlight: **34/34 Jest tests passing** across 5 test suites (Auth, Complaints, Workflow, Feedback, SLA/Analytics).
2. Run the Phase 5 End-to-End Verification script:
   ```bash
   node server/src/scripts/verifyPhase5EndToEnd.js
   ```
   Highlight: **10/10 automated integration checks passing** with 100% success.
3. Emphasize:
   - **Zero Database Server:** 100% ACID-compliant JSON file-store with atomic temporary-file-to-rename writes and keyed mutex concurrency locks.
   - **Ready for Production:** Fully prepared repository abstraction for PostgreSQL / Prisma migration when needed.

---

## 💡 Summary Punchline
> *"CCMMS replaces paper trails and opaque delays with a fast, accountable, and transparent facilities management ecosystem for university campuses. Thank you, and we welcome your questions!"*
