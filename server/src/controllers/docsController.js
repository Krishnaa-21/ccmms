export const getApiDocs = (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CCMMS API Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 1100px; margin: 0 auto; padding: 30px 20px; background: #f8fafc; }
    h1 { color: #0f2942; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #1e3a5f; margin-top: 30px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-right: 6px; }
    .get { background: #dbeafe; color: #1e40af; }
    .post { background: #dcfce7; color: #166534; }
    .patch { background: #fef3c7; color: #92400e; }
    .delete { background: #fee2e2; color: #991b1b; }
    .role { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .endpoint-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .endpoint-header { display: flex; align-items: center; justify-content: space-between; font-family: monospace; font-size: 14px; }
    .desc { margin: 8px 0 4px; color: #475569; font-size: 13px; }
    pre { background: #0f172a; color: #e2e8f0; padding: 10px; border-radius: 6px; font-size: 12px; overflow-x: auto; margin-top: 8px; }
    .auth-banner { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 20px; font-size: 13px; }
  </style>
</head>
<body>
  <h1>🏛️ Campus Complaint & Maintenance Management System (CCMMS)</h1>
  <p><strong>Version:</strong> 2.0.0 (Phase 2 - Complete Working Backend) &bull; <strong>Campus:</strong> Apex Institute of Technology</p>
  
  <div class="auth-banner">
    <strong>Authentication:</strong> All protected endpoints require header: <code>Authorization: Bearer &lt;accessToken&gt;</code>.<br>
    Default test credentials for all seeded accounts: <code>Password@123</code> (Admin: <code>admin@apex.edu</code>, Staff: <code>plumbing@apex.edu</code>, Student: <code>aarav.cse@apex.edu</code>).
  </div>

  <h2>1. Authentication & Security (/api/auth)</h2>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge post">POST</span>/api/auth/register</span><span class="badge role">Public</span></div>
    <div class="desc">Register a student or staff requester account. Role is restricted to student.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge post">POST</span>/api/auth/login</span><span class="badge role">Public</span></div>
    <div class="desc">Login with email and password. Returns access token and sets httpOnly refresh token cookie.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge post">POST</span>/api/auth/logout</span><span class="badge role">Public</span></div>
    <div class="desc">Clears refresh cookie and ends session.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/auth/me</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">Fetches current user profile and role details.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge patch">PATCH</span>/api/auth/change-password</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">Updates password after verifying existing password.</div>
  </div>

  <h2>2. Users Management (/api/users)</h2>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/users</span><span class="badge role">Admin</span></div>
    <div class="desc">List users with pagination, search, and role/status filtering.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge post">POST</span>/api/users</span><span class="badge role">Admin</span></div>
    <div class="desc">Create new user of any role (admin, staff, student).</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/users/:id</span><span class="badge role">Admin</span></div>
    <div class="desc">Retrieve user details by ID.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge patch">PATCH</span>/api/users/:id</span><span class="badge role">Admin</span></div>
    <div class="desc">Edit user details, department, specialty, or availability.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge patch">PATCH</span>/api/users/:id/status</span><span class="badge role">Admin</span></div>
    <div class="desc">Toggle user active/deactivated state. Prevents deactivating the last active admin.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge delete">DELETE</span>/api/users/:id</span><span class="badge role">Admin</span></div>
    <div class="desc">Delete user. Checks for active work orders before deleting staff.</div>
  </div>

  <h2>3. Complaints Management (/api/complaints)</h2>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge post">POST</span>/api/complaints</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">Submit maintenance complaint with optional image uploads (up to 4 images, 5MB max). Includes auto-assignment & duplicate detection.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/complaints</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">Scattered by role: Students see own tickets; Staff see assigned tickets; Admin sees all. Supports search, status, priority, building, and overdue filters.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/complaints/:id</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">Full complaint dossier including timeline history, comments, SLA info, and attachments.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge patch">PATCH</span>/api/complaints/:id</span><span class="badge role">Admin</span></div>
    <div class="desc">Edit complaint title, description, category, or location.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge delete">DELETE</span>/api/complaints/:id</span><span class="badge role">Admin</span></div>
    <div class="desc">Soft deletes complaint with audit logging.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge post">POST</span>/api/complaints/:id/upvote</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">"Me too" upvote for active complaints. Auto-escalates priority at 3, 5, and 8 upvotes.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge post">POST</span>/api/complaints/suggest-priority</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">Smart rule engine analyzing keywords and category to suggest priority with explanation.</div>
  </div>

  <h2>4. Workflow Transitions (/api/complaints/:id/...)</h2>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge patch">PATCH</span>/api/complaints/:id/status</span><span class="badge role">Staff / Admin</span></div>
    <div class="desc">Transition complaint status following role state machine. Requires resolution notes for Resolved.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge patch">PATCH</span>/api/complaints/:id/assign</span><span class="badge role">Admin</span></div>
    <div class="desc">Reassign work order to a technician with reason.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge patch">PATCH</span>/api/complaints/:id/priority</span><span class="badge role">Admin</span></div>
    <div class="desc">Override priority level with audit trail.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge post">POST</span>/api/complaints/:id/reopen</span><span class="badge role">Student / Admin</span></div>
    <div class="desc">Reopen a resolved complaint with reason.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge post">POST</span>/api/complaints/:id/close</span><span class="badge role">Admin</span></div>
    <div class="desc">Close resolved complaint.</div>
  </div>

  <h2>5. Real-Time Notifications (/api/notifications)</h2>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/notifications/stream</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">Server-Sent Events (SSE) persistent stream pushing real-time notifications with heartbeat.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/notifications</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">List user notifications with unread filter and pagination.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge patch">PATCH</span>/api/notifications/:id/read</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">Mark notification as read.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge patch">PATCH</span>/api/notifications/read-all</span><span class="badge role">Any Authenticated</span></div>
    <div class="desc">Mark all notifications as read.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/notifications/sent-messages</span><span class="badge role">Admin</span></div>
    <div class="desc">Inspect simulated external Email / SMS message delivery log.</div>
  </div>

  <h2>6. Analytics & Reports (/api/analytics, /api/export)</h2>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/analytics/overview</span><span class="badge role">Admin</span></div>
    <div class="desc">Executive dashboard metrics: totals, resolution hours, SLA %, satisfaction, trend comparisons.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/analytics/by-category</span><span class="badge role">Admin</span></div>
    <div class="desc">Category resolution performance.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/analytics/by-building</span><span class="badge role">Admin</span></div>
    <div class="desc">Campus building hotspot rankings.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/analytics/staff-performance</span><span class="badge role">Admin</span></div>
    <div class="desc">Technician scorecards (resolution count, avg time, SLA %, ratings).</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/analytics/my-performance</span><span class="badge role">Staff</span></div>
    <div class="desc">Individual staff performance metrics and assigned task queue.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/export/complaints.csv</span><span class="badge role">Admin</span></div>
    <div class="desc">Export filtered complaints to CSV spreadsheet.</div>
  </div>
  <div class="endpoint-card">
    <div class="endpoint-header"><span><span class="badge get">GET</span>/api/export/analytics.pdf</span><span class="badge role">Admin</span></div>
    <div class="desc">Generate and download executive maintenance analytics report in PDF.</div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};

export default { getApiDocs };
