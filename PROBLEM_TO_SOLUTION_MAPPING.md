# Problem to Solution Mapping: Campus Complaint & Maintenance Management System (CCMMS)

**Institution:** Apex Institute of Technology (Main & City Campuses)  
**System:** Centralized Facility Maintenance & Operations Platform (CCMMS)  
**Author:** Senior Full-Stack Engineer & Campus Facilities Designer  

---

## 1. Executive Problem Statement

University campuses function as self-contained micro-cities with thousands of students, faculty, and administrative staff relying daily on electrical, plumbing, HVAC, civil, and network infrastructure.

Traditionally, facilities management in colleges operates across fragmented manual channels:
- Paper maintenance slips deposited at hostel warden desks.
- WhatsApp groups and unlogged phone calls to maintenance supervisors.
- Spreadsheets updated sporadically with no concurrency control or real-time status visibility.

### Concrete Consequences of the Legacy Manual Process:
1. **Zero Tracking & Status Transparency:** Students and faculty submit complaints without tracking IDs, leaving them in the dark regarding who owns the issue or when a repair is expected.
2. **Operational Inefficiency & Dispatch Latency:** Supervisors manually assign tasks based on memory or availability guesswork, causing delays, lost complaints, and unattended critical safety hazards.
3. **Accountability Deficit:** Technicians lack objective performance tracking; unresolved issues languish without supervisor alerts or escalation.
4. **Data Silos & Reactive Fire-Fighting:** Management cannot analyze failure patterns, location hotspots, or recurring equipment breakdowns. Maintenance remains purely reactive instead of preventive.
5. **Student & Faculty Dissatisfaction:** Lack of communication and perceived administrative inertia erode institutional trust.

---

## 2. CCMMS End-to-End Problem to Solution Matrix

The following table comprehensively maps each historical campus facilities pain point to the concrete software engineering solution implemented in CCMMS.

| # | Legacy Problem / Operational Bottleneck | CCMMS Implemented Solution | Architecture & Technical Mechanism | Phase |
| :- | :--- | :--- | :--- | :- |
| **1** | **Untracked complaints & lost paper forms** | Centralized 5-step digital complaint submission with tracking numbers (`CMP-2026-XXX`) and university reference IDs (`CCM-2026-XXXX`). | Zod-validated REST endpoints, multi-image uploads (5MB max), localStorage draft auto-save, and instant tracking confirmation modal. | Phase 2 & 3 |
| **2** | **"Is anyone working on this?" (No transparency)** | Real-time multi-stage lifecycle tracker (`Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Assigned` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Closed`). | ACID-compliant status history logging (`statusHistory.json`) recording actor, timestamp, and notes for every state transition. | Phase 2, 3, 4 |
| **3** | **Slow manual triage and technician dispatch** | Rule-based automatic triage and auto-assignment based on specialty, workload capacity, and technician availability. | `automationService.js` analyzes category specialty match (`cat_plumbing` $\rightarrow$ Rajesh Sharma) and selects technician with lowest active task count. | Phase 2 & 4 |
| **4** | **Safety hazards treated with same urgency as cosmetic wear** | Keyword-driven priority suggestion engine (Urgent, High, Medium, Low) with automated SLA time windows. | Scans title/description for hazard triggers (`fire`, `gas`, `spark`, `burst pipe` $\rightarrow$ 24h SLA) vs cosmetic (`paint`, `chair` $\rightarrow$ 240h SLA). | Phase 2 & 3 |
| **5** | **Complaints forgotten until students escalate or protest** | Automated background SLA monitoring daemon with two-tier escalation alerts (L1 and L2). | `node-cron` daemon running every 15 minutes, auto-flagging overdue tickets, elevating priority, and notifying Dean / Head of Facilities. | Phase 2 & 5 |
| **6** | **Repeated duplicate reporting of same common area fault** | Real-time similarity detection during reporting + 1-click "Me Too" community upvoting + Admin ticket merging. | Token-based text similarity matching (`automationService.findDuplicates`), community upvotes auto-bumping priority, and child ticket status synchronization. | Phase 3 & 5 |
| **7** | **Technicians claiming work is done without verification** | Mandatory resolution notes and image capture, followed by student verification and 5-star feedback rating. | Status transition to `Resolved` strictly enforces resolution documentation; requesters can Reopen ticket with explanation if unresolved. | Phase 2, 3, 4 |
| **8** | **Supervisors blind to technician workload distribution** | Visual Staff Workload Balancer with capacity gauges, active ticket counters, and 1-click rebalancing drag/select. | Real-time capacity computation (`activeCount / maxCapacity * 100`), availability toggles (`isAvailable`), and reassign drawer. | Phase 4 |
| **9** | **Need to log into a portal just to report a broken tap** | Room-level QR Codes printed on physical door/equipment labels (`@media print` sticker sheet). | Scanning QR code opens `/report?building=...&room=...` prefilling location directly into the wizard. | Phase 5 |
| **10** | **Public skepticism on facilities team responsiveness** | Public Campus Issues & Transparency Board (`/issues`) accessible without authentication. | Privacy-scrubbed live feed of open campus issues, building map grid, semester turnaround metrics, and guest endorsement prompt. | Phase 5 |
| **11** | **Equipment breakdowns happening repeatedly without warning** | Recurring Preventive Maintenance Scheduler and Rule-Based Predictive Facilities Insights. | Recurring plans auto-dispatching work orders (water tanks, fire hydrants, UPS batteries) and pattern heuristics detecting repeat failure hotspots. | Phase 5 |
| **12** | **Mobile web unfriendliness for students and field staff** | Progressive Web App (PWA) with offline shell caching, install prompt, and sticky mobile bottom navigation. | Web App Manifest (`manifest.json`), service worker (`sw.js`), and responsive mobile layout (`MobileBottomNav.jsx`). | Phase 5 |
| **13** | **Multiple branches or multi-campus institutions** | Multi-Campus Tenancy Architecture with Admin Campus Switcher (`AIT-MAIN` vs `AIT-CITY`). | Tenancy identifier (`campusId`) bound to all records, allowing seamless filtering and future multi-campus scaling. | Phase 5 |

---

## 3. Future Scope & Extensibility Roadmap

While Phase 1 through 5 deliver an end-to-end operational platform, the architecture is intentionally structured for future enterprise integrations:

1. **IoT Sensor & Telemetry Integration:**
   - Integrate smart water tank level sensors, electrical power quality monitors, and vibration sensors directly into the `POST /api/complaints` ingestion API to auto-trigger work orders before human occupants notice failure.
2. **Campus RFID & NFC Tagging:**
   - Complement QR stickers with physical NFC chips on laboratory benches and electrical switchgear for tap-to-inspect technician check-ins.
3. **WhatsApp Business API Gateway:**
   - Connect the simulated SMS/Email outbox dispatcher to the official Meta WhatsApp Cloud API for conversational ticket logging and voice note transcription.
4. **Computer Vision Damage Assessment:**
   - Integrate a lightweight vision model to automatically categorize photo uploads (e.g. classifying water stain severity or broken glass) and auto-tag required spare parts.
5. **Database Server Migration:**
   - Seamless transition from ACID JSON file-store to PostgreSQL or CockroachDB using the abstraction provided by the repository pattern.
