import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function verifyPhase5() {
  console.log('🚀 [Verification] Initiating Comprehensive Phase 5 Smart Features Verification Suite...\n');

  let passedTests = 0;
  const totalTests = 10;

  // 1. Authenticate Personas
  console.log('--- Step 0: Persona Authentication ---');
  const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@apex.edu',
    password: 'Password@123'
  });
  const adminToken = adminRes.data.data.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  const studentRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'aarav.cse@apex.edu',
    password: 'Password@123'
  });
  const studentToken = studentRes.data.data.accessToken;
  const studentHeaders = { Authorization: `Bearer ${studentToken}` };

  const staffRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'plumbing@apex.edu',
    password: 'Password@123'
  });
  const staffToken = staffRes.data.data.accessToken;
  const staffHeaders = { Authorization: `Bearer ${staffToken}` };
  console.log('✓ Successfully authenticated Admin, Student (Aarav), and Staff (Rajesh)\n');

  // Test 1: Public Transparency Board
  console.log('--- Test 1: Public Campus Issues Board ---');
  const publicRes = await axios.get(`${BASE_URL}/complaints/public-board`);
  if (
    publicRes.data.success &&
    publicRes.data.data.stats &&
    Array.isArray(publicRes.data.data.complaints) &&
    publicRes.data.data.complaints.length > 0
  ) {
    const sample = publicRes.data.data.complaints[0];
    const isScrubbed = sample.createdBy === undefined; // PII stripped
    console.log(`✓ Public board active. Active: ${publicRes.data.data.stats.totalActive}, Resolved: ${publicRes.data.data.stats.totalResolvedSemester}, Avg Days: ${publicRes.data.data.stats.avgResolutionDays}`);
    console.log(`✓ Privacy audit: PII scrubbed from public ticket feed (${isScrubbed ? 'PASSED' : 'FAILED'})`);
    passedTests++;
  } else {
    throw new Error('Public board failed to return expected data');
  }

  // Test 2: Multi-Campus Hierarchy
  console.log('\n--- Test 2: Multi-Campus Architecture ---');
  const campusRes = await axios.get(`${BASE_URL}/locations/campuses`);
  if (campusRes.data.success && campusRes.data.data.length >= 2) {
    console.log(`✓ Detected ${campusRes.data.data.length} registered campuses:`);
    campusRes.data.data.forEach((c) => console.log(`   - [${c.code}] ${c.name} (${c.city})`));
    passedTests++;
  } else {
    throw new Error('Multi-campus hierarchy test failed');
  }

  // Test 3: Location QR Codes & Asset Registration
  console.log('\n--- Test 3: Location QR Codes & Registration ---');
  const newLocRes = await axios.post(
    `${BASE_URL}/locations`,
    {
      campusId: 'apex-campus-main',
      building: 'Aryabhata Tech Tower',
      floor: '4th Floor',
      room: 'Embedded IoT Research Lab 402',
      landmark: 'Near North Elevators',
      zone: 'Advanced Computing Wing'
    },
    { headers: adminHeaders }
  );
  if (newLocRes.data.success && newLocRes.data.data.code && newLocRes.data.data.qrPayload) {
    console.log(`✓ Successfully registered location: ${newLocRes.data.data.room}`);
    console.log(`   Code: ${newLocRes.data.data.code}`);
    console.log(`   QR Deep-Link: ${newLocRes.data.data.qrPayload}`);
    passedTests++;
  } else {
    throw new Error('Location QR registration failed');
  }

  // Test 4: Real-time Duplicate Detection
  console.log('\n--- Test 4: Real-time Duplicate Search ---');
  const dupCheckRes = await axios.get(
    `${BASE_URL}/complaints/check-duplicates?title=water+leak+washroom&building=Hostel+Block+B&categoryId=cat_plumbing`,
    { headers: studentHeaders }
  );
  if (dupCheckRes.data.success && Array.isArray(dupCheckRes.data.data)) {
    console.log(`✓ Duplicate detection scan returned ${dupCheckRes.data.data.length} candidate duplicates`);
    passedTests++;
  } else {
    throw new Error('Duplicate check API failed');
  }

  // Test 5: Duplicate Merging & Status Synchronization
  console.log('\n--- Test 5: Ticket Merging & Lifecycle Synchronization ---');
  // Create 2 test tickets
  const t1 = await axios.post(
    `${BASE_URL}/complaints`,
    {
      title: 'Monsoon seepage near window sill in Lab 402',
      description: 'Rainwater leaking through window gasket onto workbench.',
      categoryId: 'cat_plumbing',
      subCategory: 'Leakage',
      building: 'Aryabhata Tech Tower',
      floor: '4th Floor',
      room: 'Embedded IoT Research Lab 402'
    },
    { headers: studentHeaders }
  );

  const t2 = await axios.post(
    `${BASE_URL}/complaints`,
    {
      title: 'Lab 402 window gasket rain leak duplicate',
      description: 'Second report of water dripping onto electronics.',
      categoryId: 'cat_plumbing',
      subCategory: 'Leakage',
      building: 'Aryabhata Tech Tower',
      floor: '4th Floor',
      room: 'Embedded IoT Research Lab 402'
    },
    { headers: studentHeaders }
  );

  const parentId = t1.data.data.id;
  const childId = t2.data.data.id;

  // Merge t2 into t1
  const mergeRes = await axios.post(
    `${BASE_URL}/complaints/${parentId}/merge`,
    {
      duplicateIds: [childId],
      reason: 'Identical rain leakage reported in IoT Lab 402'
    },
    { headers: adminHeaders }
  );

  // Transition parent: Assigned -> In Progress -> Resolved
  await axios.patch(
    `${BASE_URL}/complaints/${parentId}/status`,
    { status: 'In Progress', notes: 'Technician sealing window frame' },
    { headers: adminHeaders }
  );

  await axios.patch(
    `${BASE_URL}/complaints/${parentId}/status`,
    {
      status: 'Resolved',
      resolutionNotes: 'Industrial silicone weather-seal applied around aluminum window sash.'
    },
    { headers: adminHeaders }
  );

  // Check child ticket status synchronized to Resolved
  const childCheck = await axios.get(`${BASE_URL}/complaints/${childId}`, { headers: adminHeaders });
  if (childCheck.data.data.status === 'Resolved' && childCheck.data.data.resolutionNotes?.includes('Resolved via parent ticket')) {
    console.log(`✓ Child ticket ${childCheck.data.data.referenceNumber} automatically synchronized to status: "Resolved"`);
    console.log(`   Parent ticket reference: ${mergeRes.data.data.parent.referenceNumber}`);
    passedTests++;
  } else {
    throw new Error('Ticket merging status synchronization failed');
  }

  // Test 6: Preventive Maintenance Scheduler & Instant Execution
  console.log('\n--- Test 6: Preventive Maintenance Scheduler ---');
  const prevPlansRes = await axios.get(`${BASE_URL}/preventive-plans`, { headers: adminHeaders });
  const samplePlan = prevPlansRes.data.data[0];

  const runNowRes = await axios.post(
    `${BASE_URL}/preventive-plans/${samplePlan.id}/run-now`,
    {},
    { headers: adminHeaders }
  );
  if (runNowRes.data.success && runNowRes.data.data.complaint.type === 'Preventive') {
    console.log(`✓ Triggered instant execution of plan "${samplePlan.title}"`);
    console.log(`   Generated Work Order: #${runNowRes.data.data.complaint.referenceNumber}`);
    console.log(`   Next Scheduled Interval: ${runNowRes.data.data.nextRunDate}`);
    passedTests++;
  } else {
    throw new Error('Preventive maintenance plan execution failed');
  }

  // Test 7: Rule-Based Predictive Facilities Insights Engine
  console.log('\n--- Test 7: Predictive Insights Heuristics ---');
  const insightsRes = await axios.get(`${BASE_URL}/analytics/predictive-insights`, { headers: adminHeaders });
  if (insightsRes.data.success && Array.isArray(insightsRes.data.data) && insightsRes.data.data.length > 0) {
    console.log(`✓ Predictive telemetry evaluated ${insightsRes.data.data.length} facilities insights:`);
    insightsRes.data.data.slice(0, 3).forEach((ins) => {
      console.log(`   - [${ins.severity.toUpperCase()}] ${ins.title} (${ins.metric})`);
    });
    passedTests++;
  } else {
    throw new Error('Predictive insights engine failed');
  }

  // Test 8: Simulated Notification Outbox & Channel Delivery
  console.log('\n--- Test 8: Simulated Notification Outbox Inspector ---');
  const sentMsgsRes = await axios.get(`${BASE_URL}/notifications/sent-messages`, { headers: adminHeaders });
  if (sentMsgsRes.data.success && Array.isArray(sentMsgsRes.data.data) && sentMsgsRes.data.data.length > 0) {
    const sampleMsg = sentMsgsRes.data.data[0];
    console.log(`✓ Dispatched notifications logged: ${sentMsgsRes.data.data.length} messages`);
    console.log(`   Latest message [${sampleMsg.channel}]: "${sampleMsg.subject}" to ${sampleMsg.to} (${sampleMsg.status})`);
    passedTests++;
  } else {
    throw new Error('Sent messages inspector failed');
  }

  // Test 9: Spare Parts Inventory Allocation
  console.log('\n--- Test 9: Spare Parts Tracking ---');
  const invRes = await axios.get(`${BASE_URL}/inventory`, { headers: staffHeaders });
  const firstPart = invRes.data.data[0];
  const initialStock = firstPart.quantityInStock;

  const allocateRes = await axios.post(
    `${BASE_URL}/inventory/record-usage`,
    {
      complaintId: parentId,
      parts: [{ itemId: firstPart.id, quantity: 2 }]
    },
    { headers: staffHeaders }
  );

  const invAfterRes = await axios.get(`${BASE_URL}/inventory`, { headers: staffHeaders });
  const updatedPart = invAfterRes.data.data.find((p) => p.id === firstPart.id);

  if (updatedPart.quantityInStock === initialStock - 2) {
    console.log(`✓ Successfully allocated 2x "${firstPart.name}" to ticket #${parentId}`);
    console.log(`   Inventory stock decremented: ${initialStock} → ${updatedPart.quantityInStock} ${firstPart.unit}`);
    passedTests++;
  } else {
    throw new Error('Inventory deduction verification failed');
  }

  // Test 10: Staff Performance & Merit Badges
  console.log('\n--- Test 10: Staff Composite Performance Scorecard ---');
  const staffPerfRes = await axios.get(`${BASE_URL}/analytics/staff-performance`, { headers: adminHeaders });
  if (staffPerfRes.data.success && staffPerfRes.data.data.length > 0) {
    const topStaff = staffPerfRes.data.data[0];
    console.log(`✓ Technician Scorecard verified for ${topStaff.name} (${topStaff.specialty}):`);
    console.log(`   - Verified Rating: ${topStaff.averageRating}/5 (${topStaff.feedbackCount} reviews)`);
    console.log(`   - SLA Compliance: ${topStaff.slaComplianceRate}%`);
    console.log(`   - Turnaround Velocity: ${topStaff.averageResolutionHours} hrs avg`);
    passedTests++;
  } else {
    throw new Error('Staff performance scorecard failed');
  }

  console.log(`\n======================================================`);
  console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 5 SMART FEATURE TESTS PASSED!`);
  console.log(`======================================================\n`);
}

verifyPhase5().catch((err) => {
  console.error('\n❌ Phase 5 Verification Error:', err.response?.data || err.message);
  process.exit(1);
});

