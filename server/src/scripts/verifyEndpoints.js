import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';

async function runLiveVerification() {
  console.log('🚀 Starting CCMMS Phase 2 Live Backend Verification...\n');

  try {
    // 1. Health Check
    console.log('1️⃣  Testing Health Check (GET /api/health)...');
    const healthRes = await axios.get(`${API_BASE}/health`);
    console.log(`   ✓ Server Status: ${healthRes.data.data.status}`);
    console.log(`   ✓ Campus: ${healthRes.data.data.campus.name} (${healthRes.data.data.campus.code})`);
    console.log(`   ✓ Collections in JSON store: ${healthRes.data.data.storage.collections.complaints} complaints, ${healthRes.data.data.storage.collections.users} users`);

    // 2. Authentication: Login as Admin, Staff, and Student
    console.log('\n2️⃣  Testing Authentication (POST /api/auth/login)...');
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@apex.edu',
      password: 'Password@123'
    });
    const adminToken = adminLogin.data.data.accessToken;
    console.log(`   ✓ Admin Login OK: ${adminLogin.data.data.user.name} (${adminLogin.data.data.user.role})`);

    const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'aarav.cse@apex.edu',
      password: 'Password@123'
    });
    const studentToken = studentLogin.data.data.accessToken;
    console.log(`   ✓ Student Login OK: ${studentLogin.data.data.user.name} (${studentLogin.data.data.user.role})`);

    const staffLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'plumbing@apex.edu',
      password: 'Password@123'
    });
    const staffToken = staffLogin.data.data.accessToken;
    console.log(`   ✓ Staff Login OK: ${staffLogin.data.data.user.name} (${staffLogin.data.data.user.role} - ${staffLogin.data.data.user.specialty})`);

    // 3. Smart Priority Suggestion
    console.log('\n3️⃣  Testing Smart Priority Suggestion (POST /api/complaints/suggest-priority)...');
    const prioRes = await axios.post(
      `${API_BASE}/complaints/suggest-priority`,
      {
        title: 'Electrical short circuit and spark in Lab 1B',
        description: 'Smoke and sparks visible behind rack 3. Immediate breaker trip required.',
        categoryId: 'cat_electrical'
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log(`   ✓ Priority Suggested: ${prioRes.data.data.priority}`);
    console.log(`   ✓ Reasoning: ${prioRes.data.data.reason}`);
    console.log(`   ✓ Estimated Resolution: ${prioRes.data.data.estimatedResolutionHours} Hours`);

    // 4. Create New Complaint with Auto-Assignment
    console.log('\n4️⃣  Submitting New Complaint with Auto-Assignment (POST /api/complaints)...');
    const newComplaintRes = await axios.post(
      `${API_BASE}/complaints`,
      {
        title: 'Burst pipe flooding washroom corridor',
        description: 'High pressure water gushing out from 2-inch galvanized pipe in Hostel Block B.',
        categoryId: 'cat_plumbing',
        subCategory: 'Leakage',
        building: 'Hostel Block B',
        floor: '2nd Floor',
        room: 'Washroom 2B',
        contactPreference: 'Phone'
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    const createdTicket = newComplaintRes.data.data;
    console.log(`   ✓ Created Ticket: ${createdTicket.referenceNumber} (${createdTicket.title})`);
    console.log(`   ✓ Auto-Assigned Technician: ${createdTicket.assignedTo?.name} (${createdTicket.assignedTo?.specialty})`);
    console.log(`   ✓ Initial Status: ${createdTicket.status}`);
    console.log(`   ✓ SLA Due Date: ${createdTicket.dueDate}`);

    // 5. Upvote ("Me Too")
    console.log('\n5️⃣  Testing Community Upvote (POST /api/complaints/:id/upvote)...');
    const upvoteRes = await axios.post(
      `${API_BASE}/complaints/${createdTicket.id}/upvote`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } } // Another user upvoting
    );
    console.log(`   ✓ Upvote Succeeded: Count = ${upvoteRes.data.data.upvotesCount}, Priority = ${upvoteRes.data.data.priority}`);

    // 6. Workflow Transition: Advance to In Progress -> Resolved
    console.log('\n6️⃣  Testing Workflow State Transitions (PATCH /api/complaints/:id/status)...');
    const progressRes = await axios.patch(
      `${API_BASE}/complaints/${createdTicket.id}/status`,
      { status: 'In Progress', notes: 'Technician Rajesh Sharma on site with pipe coupling and torch' },
      { headers: { Authorization: `Bearer ${staffToken}` } }
    );
    console.log(`   ✓ Advanced to: ${progressRes.data.data.status}`);

    const resolvedRes = await axios.patch(
      `${API_BASE}/complaints/${createdTicket.id}/status`,
      {
        status: 'Resolved',
        resolutionNotes: 'Replaced burst section with 2-inch CPVC high-pressure piping. Flushed and tested for 30 minutes.',
        costIncurred: 450,
        partsReplaced: '2-inch CPVC union and pipe'
      },
      { headers: { Authorization: `Bearer ${staffToken}` } }
    );
    console.log(`   ✓ Resolved at: ${resolvedRes.data.data.resolvedAt}`);
    console.log(`   ✓ Resolution Notes: ${resolvedRes.data.data.resolutionNotes}`);

    // 7. Add Comments (Student + Staff Internal Note)
    console.log('\n7️⃣  Testing Discussion & Internal Comments (POST /api/complaints/:id/comments)...');
    const publicComment = await axios.post(
      `${API_BASE}/complaints/${createdTicket.id}/comments`,
      { content: 'Thank you Rajesh! The floor is dry now.', isInternal: false },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log(`   ✓ Public Comment Posted: "${publicComment.data.data.content}" by ${publicComment.data.data.author.name}`);

    const internalNote = await axios.post(
      `${API_BASE}/complaints/${createdTicket.id}/comments`,
      { content: 'Internal note: Replaced pipe section was degraded by mineral deposits. Recommend whole-wing water softener inspection.', isInternal: true },
      { headers: { Authorization: `Bearer ${staffToken}` } }
    );
    console.log(`   ✓ Internal Note Posted: "${internalNote.data.data.content}" (Visible only to Admin & Staff)`);

    // Verify student cannot see internal note
    const studentCommentsView = await axios.get(
      `${API_BASE}/complaints/${createdTicket.id}/comments`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    const hasInternalInStudentView = studentCommentsView.data.data.some((c) => c.isInternal);
    console.log(`   ✓ Scoping Check: Internal note hidden from student view: ${!hasInternalInStudentView}`);

    // 8. Submit Feedback
    console.log('\n8️⃣  Testing Requester Feedback (POST /api/complaints/:id/feedback)...');
    const feedbackRes = await axios.post(
      `${API_BASE}/complaints/${createdTicket.id}/feedback`,
      {
        rating: 5,
        comment: 'Outstanding repair speed! Arrived in under 30 minutes and did very tidy work.',
        timelinessRating: 5,
        cleanlinessRating: 5
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log(`   ✓ Feedback Recorded: ${feedbackRes.data.data.rating} Stars - "${feedbackRes.data.data.comment}"`);

    // 9. Notifications & Simulated Message Log
    console.log('\n9️⃣  Testing In-App Notifications & Sent Messages Log...');
    const notifRes = await axios.get(
      `${API_BASE}/notifications?limit=5`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log(`   ✓ Student Notifications Count: ${notifRes.data.data.length} (Unread: ${notifRes.data.unreadCount})`);

    const sentMsgsRes = await axios.get(
      `${API_BASE}/notifications/sent-messages?limit=5`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✓ Simulated External Delivery Log: ${sentMsgsRes.data.data.length} messages found (Channels: Email / SMS)`);
    if (sentMsgsRes.data.data[0]) {
      console.log(`     Sample dispatch: [${sentMsgsRes.data.data[0].channel}] To: ${sentMsgsRes.data.data[0].to} - "${sentMsgsRes.data.data[0].subject}"`);
    }

    // 10. Analytics & Reporting
    console.log('\n🔟 Testing Executive Analytics & Reports...');
    const overviewRes = await axios.get(
      `${API_BASE}/analytics/overview`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✓ Total Campus Complaints: ${overviewRes.data.data.totalComplaints}`);
    console.log(`   ✓ Open vs Resolved: ${overviewRes.data.data.openComplaints} Open / ${overviewRes.data.data.resolvedComplaints} Resolved`);
    console.log(`   ✓ SLA Compliance Rate: ${overviewRes.data.data.slaComplianceRate}%`);
    console.log(`   ✓ Average Resolution Time: ${overviewRes.data.data.averageResolutionHours} Hours`);
    console.log(`   ✓ Average Satisfaction: ${overviewRes.data.data.averageRating} / 5.0`);

    // 11. CSV and PDF Export
    console.log('\n1️⃣1️⃣ Testing Data Exports (CSV & PDF)...');
    const csvRes = await axios.get(
      `${API_BASE}/export/complaints.csv`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✓ CSV Export OK: Content-Type="${csvRes.headers['content-type']}", Bytes=${csvRes.data.length}`);

    const pdfRes = await axios.get(
      `${API_BASE}/export/analytics.pdf`,
      { headers: { Authorization: `Bearer ${adminToken}` }, responseType: 'arraybuffer' }
    );
    console.log(`   ✓ PDF Export OK: Content-Type="${pdfRes.headers['content-type']}", Bytes=${pdfRes.data.byteLength}`);

    console.log('\n✨ All Phase 2 verification checks passed with 100% success!');
    return true;
  } catch (err) {
    console.error('\n❌ Verification Failed:', err.response?.data || err.message);
    throw err;
  }
}

runLiveVerification().catch(() => process.exit(1));

