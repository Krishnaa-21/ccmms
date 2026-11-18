import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import {
  CAMPUS_ID,
  CATEGORIES_DATA,
  RAW_USERS,
  SETTINGS_DATA,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

/**
 * Calculates a past date relative to a reference anchor.
 * @param {number} daysAgo
 * @param {number} hoursAgo
 * @returns {string} ISO Date String
 */
function getDateAgo(daysAgo, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

/**
 * Generates 40 comprehensive realistic complaints
 */
function generateComplaints(users, categories) {
  const admin = users.find((u) => u.role === 'admin');
  const staffPlumbing = users.find((u) => u.id === 'usr_staff_plumb');
  const staffElec = users.find((u) => u.id === 'usr_staff_elec');
  const staffIt = users.find((u) => u.id === 'usr_staff_it');
  const staffGen = users.find((u) => u.id === 'usr_staff_gen');
  const complainants = users.filter((u) => u.role === 'student');

  const catPlumb = categories.find((c) => c.id === 'cat_plumbing');
  const catElec = categories.find((c) => c.id === 'cat_electrical');
  const catIt = categories.find((c) => c.id === 'cat_it');
  const catGen = categories.find((c) => c.id === 'cat_general');

  // Pre-configured 40 realistic complaint scenarios
  const specs = [
    // 1. Plumbing - In Progress (Urgent, Overdue)
    {
      trackingNumber: 'CMP-2024-001',
      title: 'Water leakage in Hostel Block B washroom 3A',
      description: 'Severe pipe rupture behind the third stall causing standing water on the 3rd floor corridor. Immediate isolation of the main riser needed.',
      category: catPlumb,
      subCategory: 'Leakage',
      priority: 'Urgent',
      status: 'In Progress',
      location: { building: 'Hostel Block B', floor: '3rd Floor', room: 'Washroom 3A', landmark: 'Near Staircase 2' },
      user: complainants[1], // Priya Nair
      staff: staffPlumbing,
      daysAgo: 4,
      isOverdue: true,
      slaHours: 4,
      hasAttachments: true
    },
    // 2. IT - Assigned (High, Overdue)
    {
      trackingNumber: 'CMP-2024-002',
      title: 'Projector not working in Room 204',
      description: 'Ceiling HDMI input and wireless projection module failure. Display lamp flashes red and power cycles every 30 seconds during lectures.',
      category: catIt,
      subCategory: 'Projector',
      priority: 'High',
      status: 'Assigned',
      location: { building: 'Main Academic Block', floor: '2nd Floor', room: 'Room 204', landmark: 'Opposite Seminar Hall' },
      user: complainants[4], // Prof. Vikram Sengupta
      staff: staffIt,
      daysAgo: 3,
      isOverdue: true,
      slaHours: 12,
      hasAttachments: true
    },
    // 3. IT - In Progress (Urgent, Overdue)
    {
      trackingNumber: 'CMP-2024-003',
      title: 'Wi-Fi down in Library 2nd floor digital section',
      description: 'Cisco access point AP-LIB-04 has amber error code. Over 60 students in the digital research area unable to access academic journals.',
      category: catIt,
      subCategory: 'Wi-Fi',
      priority: 'Urgent',
      status: 'In Progress',
      location: { building: 'Library', floor: '2nd Floor', room: 'Digital Resource Center', landmark: 'Rack 12-B' },
      user: complainants[7], // Kavita Joshi
      staff: staffIt,
      daysAgo: 2,
      isOverdue: true,
      slaHours: 4,
      hasAttachments: false
    },
    // 4. Electrical - Under Review (Urgent, Overdue)
    {
      trackingNumber: 'CMP-2024-004',
      title: 'Circuit breaker tripping frequently in Physics Lab',
      description: 'Main 3-phase MCB panel trips as soon as lasers and optics vacuum pumps are switched on. Potential load imbalance or short circuit.',
      category: catElec,
      subCategory: 'Short circuit',
      priority: 'Urgent',
      status: 'Under Review',
      location: { building: 'Physics Lab', floor: '1st Floor', room: 'Optics Darkroom', landmark: 'Distribution Board 3' },
      user: complainants[5], // Dr. Sunita Rao
      staff: null,
      daysAgo: 2,
      isOverdue: true,
      slaHours: 2,
      hasAttachments: true
    },
    // 5. General - Awaiting Parts (High, Overdue)
    {
      trackingNumber: 'CMP-2024-005',
      title: 'Broken bench in Seminar Hall Auditorium',
      description: 'Row D seats 14 through 18 have collapsed wooden supports. Poses injury hazard for upcoming national symposium delegates.',
      category: catGen,
      subCategory: 'Furniture',
      priority: 'High',
      status: 'Awaiting Parts',
      location: { building: 'Seminar Hall', floor: 'Ground Floor', room: 'Main Auditorium (500-seat)', landmark: 'Row D Center' },
      user: complainants[2], // Rohan Iyer
      staff: staffGen,
      daysAgo: 6,
      isOverdue: true,
      slaHours: 24,
      awaitingNotes: 'Waiting for custom teak wood bracket delivery from timber vendor.',
      hasAttachments: true
    },
    // 6. Electrical - Assigned (Urgent, Overdue)
    {
      trackingNumber: 'CMP-2024-006',
      title: 'Ceiling fan making noise and sparking in Lab 1',
      description: 'Fan unit 4 above workstation 18 has severe bearing friction and produced burning smell during morning lab session.',
      category: catElec,
      subCategory: 'Tube light/Fan',
      priority: 'Urgent',
      status: 'Assigned',
      location: { building: 'Computer Lab 1', floor: 'Ground Floor', room: 'Lab 1A - AI/ML', landmark: 'Ceiling Grid Sector B' },
      user: complainants[6], // Amit Deshmukh
      staff: staffElec,
      daysAgo: 3,
      isOverdue: true,
      slaHours: 2,
      hasAttachments: false
    },
    // 7. Plumbing - Awaiting Parts (Medium, Overdue)
    {
      trackingNumber: 'CMP-2024-007',
      title: 'Flush valve continuously running in Mess Restroom',
      description: 'Dual flush pneumatic valve diaphragm torn. Water overflowing into drainage gully non-stop, wasting thousands of liters daily.',
      category: catPlumb,
      subCategory: 'Tap/Flush repair',
      priority: 'Medium',
      status: 'Awaiting Parts',
      location: { building: 'Hostel Block A', floor: 'Ground Floor', room: 'Mess Hall', landmark: 'North Wing Washroom' },
      user: complainants[0], // Aarav Patel
      staff: staffPlumbing,
      daysAgo: 7,
      isOverdue: true,
      slaHours: 24,
      awaitingNotes: 'Order placed for Jaquar 40mm replacement dual flush cartridge.',
      hasAttachments: true
    },

    // 8. Submitted Status complaints (Freshly logged)
    {
      trackingNumber: 'CMP-2024-008',
      title: 'Canteen hand wash basin drain blocked',
      description: 'Leftmost stainless steel sink overflowing when diners rinse hands. Food waste trap appears clogged.',
      category: catPlumb,
      subCategory: 'Blocked drain',
      priority: 'Medium',
      status: 'Submitted',
      location: { building: 'Canteen', floor: 'Ground Floor', room: 'Main Dining Area', landmark: 'Washing Bay 1' },
      user: complainants[2],
      staff: null,
      daysAgo: 0,
      hoursAgo: 2,
      isOverdue: false,
      slaHours: 24,
      hasAttachments: false
    },
    {
      trackingNumber: 'CMP-2024-009',
      title: 'Fluorescent tube flickering on 3rd floor corridor',
      description: 'Tube light outside Room 305 blinks erratically, causing visual discomfort and headache to students studying in adjacent classrooms.',
      category: catElec,
      subCategory: 'Tube light/Fan',
      priority: 'Low',
      status: 'Submitted',
      location: { building: 'Main Academic Block', floor: '3rd Floor', room: 'Room 305', landmark: 'Corridor Pillar 14' },
      user: complainants[3], // Neha Gupta
      staff: null,
      daysAgo: 0,
      hoursAgo: 4,
      isOverdue: false,
      slaHours: 48,
      hasAttachments: false
    },
    {
      trackingNumber: 'CMP-2024-010',
      title: 'High-speed network port inactive in Lab 1B',
      description: 'Gigabit wall jack ETH-B-08 does not establish link with switch. Cannot connect server GPU rack for distributed training.',
      category: catIt,
      subCategory: 'Computer/Lab system',
      priority: 'High',
      status: 'Submitted',
      location: { building: 'Computer Lab 1', floor: 'Ground Floor', room: 'Lab 1B - Systems', landmark: 'Bench 4 Wall Jack' },
      user: complainants[6],
      staff: null,
      daysAgo: 0,
      hoursAgo: 6,
      isOverdue: false,
      slaHours: 12,
      hasAttachments: false
    },
    {
      trackingNumber: 'CMP-2024-011',
      title: 'Broken window latch allowing rain seepage in Room 104',
      description: 'East-facing window handle snapped off. During sudden downpours, water enters and damages study desks.',
      category: catGen,
      subCategory: 'Doors/Windows',
      priority: 'Medium',
      status: 'Submitted',
      location: { building: 'Main Academic Block', floor: 'Ground Floor', room: 'Room 104', landmark: 'East Window Bay' },
      user: complainants[4],
      staff: null,
      daysAgo: 0,
      hoursAgo: 8,
      isOverdue: false,
      slaHours: 48,
      hasAttachments: true
    },
    {
      trackingNumber: 'CMP-2024-012',
      title: 'Tap dripping continuously in Staff Two-Wheeler Shed',
      description: 'External garden tap valve gland packing damaged. Constant water puddle creating slippery moss on driveway.',
      category: catPlumb,
      subCategory: 'Tap/Flush repair',
      priority: 'Low',
      status: 'Submitted',
      location: { building: 'Parking Area', floor: 'Ground Level', room: 'Staff Two-Wheeler Shed', landmark: 'Water Pillar 2' },
      user: complainants[5],
      staff: null,
      daysAgo: 1,
      hoursAgo: 1,
      isOverdue: false,
      slaHours: 48,
      hasAttachments: false
    },

    // 13. Under Review complaints
    {
      trackingNumber: 'CMP-2024-013',
      title: 'Pest infestation sighted in Canteen dry store',
      description: 'Rodent droppings observed near flour sacks and grain barrels. Immediate professional pest eradication required before health inspection.',
      category: catGen,
      subCategory: 'Pest control',
      priority: 'High',
      status: 'Under Review',
      location: { building: 'Canteen', floor: 'Ground Floor', room: 'Kitchen Counter', landmark: 'Dry Provision Store' },
      user: complainants[7],
      staff: null,
      daysAgo: 1,
      hoursAgo: 5,
      isOverdue: false,
      slaHours: 24,
      hasAttachments: true
    },
    {
      trackingNumber: 'CMP-2024-014',
      title: 'EV Charging Station screen cracked and unreadable',
      description: 'Touchscreen display on Charger Unit 2 vandalized or shattered. RFID reader works but users cannot select kWh quota.',
      category: catElec,
      subCategory: 'Faulty switch',
      priority: 'Medium',
      status: 'Under Review',
      location: { building: 'Parking Area', floor: 'Ground Level', room: 'EV Charging Station', landmark: 'Bay 2 Pod' },
      user: complainants[0],
      staff: null,
      daysAgo: 1,
      hoursAgo: 9,
      isOverdue: false,
      slaHours: 24,
      hasAttachments: true
    },
    {
      trackingNumber: 'CMP-2024-015',
      title: 'Main water pump abnormal vibration at pump house',
      description: 'Secondary submersible motor generating excessive cavitation noise and warm bearing casing. Water pressure dropping in hostels.',
      category: catPlumb,
      subCategory: 'No water supply',
      priority: 'Urgent',
      status: 'Under Review',
      location: { building: 'Admin Office', floor: 'Ground Floor', room: 'Board Room', landmark: 'Adjacent Central Pump Station' },
      user: complainants[4],
      staff: null,
      daysAgo: 0,
      hoursAgo: 1,
      isOverdue: false,
      slaHours: 4,
      hasAttachments: false
    },

    // 16. Assigned complaints
    {
      trackingNumber: 'CMP-2024-016',
      title: 'Gymnasium treadmill power cord insulation stripped',
      description: 'Heavy duty rubber cable pinched under frame, copper conductor partially exposed. Potential shock hazard to student athletes.',
      category: catElec,
      subCategory: 'Faulty switch',
      priority: 'Urgent',
      status: 'Assigned',
      location: { building: 'Sports Complex', floor: 'Ground Floor', room: 'Gymnasium', landmark: 'Cardio Row Machine 3' },
      user: complainants[2],
      staff: staffElec,
      daysAgo: 0,
      hoursAgo: 3,
      isOverdue: false,
      slaHours: 2,
      hasAttachments: true
    },
    {
      trackingNumber: 'CMP-2024-017',
      title: 'Door lock jammed from inside in Faculty Room 212',
      description: 'Mortise lock cylinder stuck in engaged position. Faculty member had to use spare master key from outside. Needs lock replacement.',
      category: catGen,
      subCategory: 'Doors/Windows',
      priority: 'High',
      status: 'Assigned',
      location: { building: 'Main Academic Block', floor: '2nd Floor', room: 'Faculty Room 212', landmark: 'Near Staff Elevator' },
      user: complainants[4],
      staff: staffGen,
      daysAgo: 1,
      hoursAgo: 6,
      isOverdue: false,
      slaHours: 24,
      hasAttachments: false
    },
    {
      trackingNumber: 'CMP-2024-018',
      title: 'Laser printer leaving vertical black toner streaks',
      description: 'HP LaserJet Enterprise in Accounts section damaging official degree certificates and fee receipts. Drum unit needs inspection.',
      category: catIt,
      subCategory: 'Printer',
      priority: 'Medium',
      status: 'Assigned',
      location: { building: 'Admin Office', floor: '1st Floor', room: 'Accounts Section', landmark: 'Desk 4' },
      user: complainants[7],
      staff: staffIt,
      daysAgo: 1,
      hoursAgo: 8,
      isOverdue: false,
      slaHours: 24,
      hasAttachments: true
    },

    // 19. In Progress complaints
    {
      trackingNumber: 'CMP-2024-019',
      title: 'No water supply on 2nd floor of Hostel Block A',
      description: 'Overhead tank balance valve stuck closed. Showers and basins completely dry for 6 hours across all 18 student rooms.',
      category: catPlumb,
      subCategory: 'No water supply',
      priority: 'Urgent',
      status: 'In Progress',
      location: { building: 'Hostel Block A', floor: '2nd Floor', room: 'Washroom 2B', landmark: 'Overhead Distribution Riser' },
      user: complainants[0],
      staff: staffPlumbing,
      daysAgo: 1,
      hoursAgo: 2,
      isOverdue: false,
      slaHours: 4,
      hasAttachments: false
    },
    {
      trackingNumber: 'CMP-2024-020',
      title: 'Optics Darkroom ventilation exhaust fan dead',
      description: 'Chemical fumes from photographic developer and solvent cleaners lingering in darkroom without air exchange.',
      category: catElec,
      subCategory: 'Tube light/Fan',
      priority: 'High',
      status: 'In Progress',
      location: { building: 'Physics Lab', floor: '1st Floor', room: 'Optics Darkroom', landmark: 'North Wall Exhaust' },
      user: complainants[5],
      staff: staffElec,
      daysAgo: 1,
      hoursAgo: 7,
      isOverdue: false,
      slaHours: 8,
      hasAttachments: false
    },
    {
      trackingNumber: 'CMP-2024-021',
      title: 'Badminton Court wooden floor plank detached',
      description: 'Tongue and groove teak plank lifted by 2cm near baseline of Court 1. Tripping risk for university sports team practice.',
      category: catGen,
      subCategory: 'Furniture',
      priority: 'High',
      status: 'In Progress',
      location: { building: 'Sports Complex', floor: 'Ground Floor', room: 'Badminton Court 1', landmark: 'Right Service Line' },
      user: complainants[2],
      staff: staffGen,
      daysAgo: 2,
      hoursAgo: 4,
      isOverdue: false,
      slaHours: 24,
      hasAttachments: true
    },
    {
      trackingNumber: 'CMP-2024-022',
      title: 'Central Library circulation desk barcode scanner malfunctioning',
      description: 'Zebra wireless scanner dropping Bluetooth connection every few scans, causing long checkout queues.',
      category: catIt,
      subCategory: 'Computer/Lab system',
      priority: 'Medium',
      status: 'In Progress',
      location: { building: 'Library', floor: 'Ground Floor', room: 'Circulation Counter', landmark: 'Terminal 2' },
      user: complainants[7],
      staff: staffIt,
      daysAgo: 1,
      hoursAgo: 12,
      isOverdue: false,
      slaHours: 24,
      hasAttachments: false
    },

    // 23. Awaiting Parts complaints
    {
      trackingNumber: 'CMP-2024-023',
      title: 'Seminar Hall audio console microphone mixer channel burned',
      description: 'Yamaha 24-channel analog mixing desk channel 7-12 preamps damaged after thunderstorm power surge.',
      category: catElec,
      subCategory: 'Faulty switch',
      priority: 'High',
      status: 'Awaiting Parts',
      location: { building: 'Seminar Hall', floor: 'Ground Floor', room: 'AV Control Booth', landmark: 'Main Audio Rack' },
      user: complainants[4],
      staff: staffElec,
      daysAgo: 5,
      isOverdue: false,
      slaHours: 120,
      awaitingNotes: 'Replacement OEM input PCB board ordered from Yamaha authorized distributor.',
      hasAttachments: true
    },
    {
      trackingNumber: 'CMP-2024-024',
      title: 'Submersible water cooler compressor failed in Canteen',
      description: 'Blue Star 150L commercial cooler serving dining students blowing warm air. Condenser fan seized.',
      category: catPlumb,
      subCategory: 'Tap/Flush repair',
      priority: 'Medium',
      status: 'Awaiting Parts',
      location: { building: 'Canteen', floor: 'Ground Floor', room: 'Main Dining Area', landmark: 'Cooler Station 1' },
      user: complainants[1],
      staff: staffPlumbing,
      daysAgo: 4,
      isOverdue: false,
      slaHours: 96,
      awaitingNotes: 'Waiting for 1.5-ton rotary hermetic compressor delivery.',
      hasAttachments: false
    },

    // 25. Resolved complaints (Ready for student verification & review)
    {
      trackingNumber: 'CMP-2024-025',
      title: 'Water tap loose and spraying in Hostel Block B washroom 1B',
      description: 'Thread stripped on ceramic disc pillar tap. Water spraying onto light fixture.',
      category: catPlumb,
      subCategory: 'Tap/Flush repair',
      priority: 'High',
      status: 'Resolved',
      location: { building: 'Hostel Block B', floor: '1st Floor', room: 'Washroom 1B', landmark: 'Sink 3' },
      user: complainants[1],
      staff: staffPlumbing,
      daysAgo: 8,
      resolvedDaysAgo: 2,
      resolutionNotes: 'Replaced defective brass spindle and ceramic disc cartridge. Tested under full pressure for 15 minutes without leaks.',
      costIncurred: 350,
      hasAttachments: true,
      hasFeedback: true,
      feedbackRating: 5,
      feedbackComment: 'Prompt response! Rajesh arrived within an hour and replaced the tap efficiently.'
    },
    {
      trackingNumber: 'CMP-2024-026',
      title: 'Power socket sparked on laptop charger insertion in Room 108',
      description: '16A universal 3-pin socket faceplate cracked with visible char marks around earth pin.',
      category: catElec,
      subCategory: 'Faulty switch',
      priority: 'Urgent',
      status: 'Resolved',
      location: { building: 'Hostel Block A', floor: '1st Floor', room: 'Room 108', landmark: 'Study Desk Left' },
      user: complainants[0],
      staff: staffElec,
      daysAgo: 10,
      resolvedDaysAgo: 3,
      resolutionNotes: 'Replaced burnt Anchor modular 16A socket and refitted wire terminals with fire-retardant heat shrink sleeves.',
      costIncurred: 220,
      hasAttachments: true,
      hasFeedback: true,
      feedbackRating: 5,
      feedbackComment: 'Very courteous electrician. Cleaned up the wire clippings and tested with multimeter.'
    },
    {
      trackingNumber: 'CMP-2024-027',
      title: 'Lab 1A workstation 09 blue screen and reboot loop',
      description: 'Crucial RAM module failure causing kernel panic during student OS laboratory examination.',
      category: catIt,
      subCategory: 'Computer/Lab system',
      priority: 'High',
      status: 'Resolved',
      location: { building: 'Computer Lab 1', floor: 'Ground Floor', room: 'Lab 1A - AI/ML', landmark: 'Workstation 09' },
      user: complainants[6],
      staff: staffIt,
      daysAgo: 12,
      resolvedDaysAgo: 5,
      resolutionNotes: 'Ran MemTest86 diagnostic. Faulty 8GB DDR4 stick identified and replaced from lab spares inventory. Machine restored to active pool.',
      costIncurred: 0,
      hasAttachments: false,
      hasFeedback: true,
      feedbackRating: 4,
      feedbackComment: 'Handled before the next class started. Good job Ananya!'
    },
    {
      trackingNumber: 'CMP-2024-028',
      title: 'Classroom door hinge loose and dragging in Room 101',
      description: 'Heavy solid wood entrance door scraping granite floor tile, leaving deep scratch marks and unable to shut completely.',
      category: catGen,
      subCategory: 'Doors/Windows',
      priority: 'Medium',
      status: 'Resolved',
      location: { building: 'Main Academic Block', floor: 'Ground Floor', room: 'Room 101', landmark: 'Main Entrance Door' },
      user: complainants[3],
      staff: staffGen,
      daysAgo: 14,
      resolvedDaysAgo: 6,
      resolutionNotes: 'Chiseled wood recess, installed 5-inch heavy duty stainless steel ball-bearing hinges with 2.5-inch hardened steel screws.',
      costIncurred: 480,
      hasAttachments: true,
      hasFeedback: true,
      feedbackRating: 4,
      feedbackComment: 'Door operates smoothly now without any squeaking noise.'
    },
    {
      trackingNumber: 'CMP-2024-029',
      title: 'Drainage pipe blockage in Canteen dishwashing bay',
      description: 'Heavy grease accumulation causing foul odor and wastewater backup into the dish collection area.',
      category: catPlumb,
      subCategory: 'Blocked drain',
      priority: 'Urgent',
      status: 'Resolved',
      location: { building: 'Canteen', floor: 'Ground Floor', room: 'Kitchen Counter', landmark: 'Grease Trap 2' },
      user: complainants[2],
      staff: staffPlumbing,
      daysAgo: 15,
      resolvedDaysAgo: 7,
      resolutionNotes: 'Deployed manual rotary snake auger and industrial chemical degreaser. Cleared 15 feet of 4-inch PVC waste line.',
      costIncurred: 750,
      hasAttachments: true,
      hasFeedback: true,
      feedbackRating: 4,
      feedbackComment: 'Drain cleared and smell gone, but please remind canteen staff not to dump grease directly.'
    },
    {
      trackingNumber: 'CMP-2024-030',
      title: 'Ceiling tube light starter failure in Reading Hall A',
      description: 'Two twin-tube fixtures buzzing loudly with rapid stroboscopic flickering over reference desks.',
      category: catElec,
      subCategory: 'Tube light/Fan',
      priority: 'Low',
      status: 'Resolved',
      location: { building: 'Library', floor: '1st Floor', room: 'Reading Hall A', landmark: 'Aisle 4 Overhead' },
      user: complainants[7],
      staff: staffElec,
      daysAgo: 18,
      resolvedDaysAgo: 8,
      resolutionNotes: 'Replaced 4 electronic ballasts and installed energy-efficient 20W LED batten fittings in place of T8 fluorescent tubes.',
      costIncurred: 920,
      hasAttachments: false,
      hasFeedback: true,
      feedbackRating: 5,
      feedbackComment: 'Much brighter and silent now. Perfect for long reading hours.'
    },
    {
      trackingNumber: 'CMP-2024-031',
      title: 'Physics Lab balance table leveling screws stripped',
      description: 'Precision analytical balance table rocking by 3mm, invalidating gravimetric experiment readings.',
      category: catGen,
      subCategory: 'Furniture',
      priority: 'Medium',
      status: 'Resolved',
      location: { building: 'Physics Lab', floor: '1st Floor', room: 'General Physics Lab', landmark: 'Balance Station 3' },
      user: complainants[5],
      staff: staffGen,
      daysAgo: 20,
      resolvedDaysAgo: 10,
      resolutionNotes: 'Tapped new M12 threads into cast iron leg mounts and installed vibration-dampening rubber-padded leveling feet.',
      costIncurred: 600,
      hasAttachments: true,
      hasFeedback: true,
      feedbackRating: 5,
      feedbackComment: 'Dr. Sunita verified balance stability with spirit level. Excellent precision work.'
    },
    {
      trackingNumber: 'CMP-2024-032',
      title: 'Network printer drum replacement in Digital Resource Center',
      description: 'Printer error 57.03 - image transfer belt and drum exceeded manufacturer lifespan.',
      category: catIt,
      subCategory: 'Printer',
      priority: 'Medium',
      status: 'Resolved',
      location: { building: 'Library', floor: '2nd Floor', room: 'Digital Resource Center', landmark: 'Staff Print Station' },
      user: complainants[7],
      staff: staffIt,
      daysAgo: 22,
      resolvedDaysAgo: 12,
      resolutionNotes: 'Installed genuine Kyocera MK-1150 maintenance kit and recalibrated toner sensor.',
      costIncurred: 4500,
      hasAttachments: false,
      hasFeedback: true,
      feedbackRating: 4,
      feedbackComment: 'Prints crisp and clean now. Delivery took 3 days but installation was quick.'
    },
    {
      trackingNumber: 'CMP-2024-033',
      title: 'Hostel Block B room 205 shower rose leaking from joint',
      description: 'High pressure water spraying at 45 degree angle hitting bathroom ceiling.',
      category: catPlumb,
      subCategory: 'Leakage',
      priority: 'Low',
      status: 'Resolved',
      location: { building: 'Hostel Block B', floor: '2nd Floor', room: 'Room 205', landmark: 'Attached Bathroom' },
      user: complainants[1],
      staff: staffPlumbing,
      daysAgo: 25,
      resolvedDaysAgo: 14,
      resolutionNotes: 'Removed stripped Teflon tape, wrapped with Loctite 55 pipe sealing cord and tightened with pipe wrench.',
      costIncurred: 80,
      hasAttachments: false,
      hasFeedback: true,
      feedbackRating: 5,
      feedbackComment: 'Quick and clean fix.'
    },

    // 34. Closed complaints (Completed lifecycle + verified)
    {
      trackingNumber: 'CMP-2024-034',
      title: 'Broken window pane in Visitor Lounge from storm',
      description: 'High wind during monsoon squall shattered 4mm float glass pane into lounge seating.',
      category: catGen,
      subCategory: 'Doors/Windows',
      priority: 'Urgent',
      status: 'Closed',
      location: { building: 'Hostel Block B', floor: 'Ground Floor', room: 'Visitor Lounge', landmark: 'Garden Facing Window' },
      user: complainants[1],
      staff: staffGen,
      daysAgo: 45,
      resolvedDaysAgo: 40,
      closedDaysAgo: 38,
      resolutionNotes: 'Replaced broken glass with 6mm toughened safety glass and re-beaded frame with weather-resistant silicone.',
      costIncurred: 1850,
      hasAttachments: true,
      hasFeedback: true,
      feedbackRating: 5,
      feedbackComment: 'Safety glass installed promptly. Area vacuumed of all shards.'
    },
    {
      trackingNumber: 'CMP-2024-035',
      title: 'Auditorium central AC chiller temperature control stuck at 28C',
      description: 'Thermostat sensor calibrated incorrectly, cooling compressor not loading during 400-student convocation briefing.',
      category: catElec,
      subCategory: 'Faulty switch',
      priority: 'High',
      status: 'Closed',
      location: { building: 'Seminar Hall', floor: 'Ground Floor', room: 'Main Auditorium (500-seat)', landmark: 'BMS Panel Room' },
      user: complainants[4],
      staff: staffElec,
      daysAgo: 50,
      resolvedDaysAgo: 46,
      closedDaysAgo: 44,
      resolutionNotes: 'Replaced faulty PT100 temperature RTD sensor on return air duct and recalibrated Honeywell DDC controller.',
      costIncurred: 2400,
      hasAttachments: true,
      hasFeedback: true,
      feedbackRating: 5,
      feedbackComment: 'Auditorium cooled down within 20 minutes of repair. Great work by Suresh.'
    },
    {
      trackingNumber: 'CMP-2024-036',
      title: 'Core network switch fiber transceiver failure',
      description: 'SFP+ 10G optical module connecting Academic Block to Data Center went dark.',
      category: catIt,
      subCategory: 'Computer/Lab system',
      priority: 'Urgent',
      status: 'Closed',
      location: { building: 'Computer Lab 1', floor: 'Ground Floor', room: 'Server Room', landmark: 'Rack Alpha Switch 1' },
      user: complainants[6],
      staff: staffIt,
      daysAgo: 60,
      resolvedDaysAgo: 59,
      closedDaysAgo: 57,
      resolutionNotes: 'Hot-swapped failed Finisar 10G-LR transceiver and cleaned LC fiber patch connectors with click-cleaner.',
      costIncurred: 3200,
      hasAttachments: true,
      hasFeedback: true,
      feedbackRating: 5,
      feedbackComment: 'Downtime kept under 45 minutes. Network redundancy verified.'
    },
    {
      trackingNumber: 'CMP-2024-037',
      title: 'Main sewer line inspection chamber overflow near Canteen',
      description: 'Grease and tree roots obstructed the external 8-inch stoneware sewer pipe.',
      category: catPlumb,
      subCategory: 'Blocked drain',
      priority: 'Urgent',
      status: 'Closed',
      location: { building: 'Canteen', floor: 'Ground Floor', room: 'Kitchen Counter', landmark: 'Manhole 6 Rear' },
      user: complainants[2],
      staff: staffPlumbing,
      daysAgo: 70,
      resolvedDaysAgo: 68,
      closedDaysAgo: 65,
      resolutionNotes: 'Hired municipal jetting vacuum tanker truck. Jet pressure rodded 40 meters of pipe and cleared root ball.',
      costIncurred: 6500,
      hasAttachments: true,
      hasFeedback: true,
      feedbackRating: 4,
      feedbackComment: 'Major issue resolved thoroughly. Cleaned and disinfected area with bleaching powder.'
    },
    {
      trackingNumber: 'CMP-2024-038',
      title: 'Table Tennis Arena lighting insufficient due to burned ballasts',
      description: 'Two floodlights over Table 2 out, causing dark shadow across playing surface.',
      category: catElec,
      subCategory: 'Tube light/Fan',
      priority: 'Low',
      status: 'Closed',
      location: { building: 'Sports Complex', floor: '1st Floor', room: 'Table Tennis Arena', landmark: 'Table 2 Overhead' },
      user: complainants[2],
      staff: staffElec,
      daysAgo: 80,
      resolvedDaysAgo: 75,
      closedDaysAgo: 72,
      resolutionNotes: 'Installed new 50W LED high bay luminaires offering 500 lux illumination.',
      costIncurred: 2100,
      hasAttachments: false,
      hasFeedback: true,
      feedbackRating: 4,
      feedbackComment: 'Lighting is now tournament grade. Thanks!'
    },

    // 39. Rejected complaints (Policy violation / Out of scope)
    {
      trackingNumber: 'CMP-2024-039',
      title: 'Install private air conditioner in Hostel Room 214',
      description: 'Student requested procurement and installation of 1.5 ton split AC in student dormitory room.',
      category: catElec,
      subCategory: 'Power outage',
      priority: 'Low',
      status: 'Rejected',
      location: { building: 'Hostel Block A', floor: '2nd Floor', room: 'Room 214', landmark: 'Dorm Room' },
      user: complainants[0],
      staff: null,
      daysAgo: 20,
      rejectionReason: 'Hostel Bylaws Sec 4.2 strictly prohibit personal high-power appliances (ACs, heaters) in non-AC residential blocks.',
      hasAttachments: false
    },
    {
      trackingNumber: 'CMP-2024-040',
      title: 'Fix student personal gaming laptop display hinge',
      description: 'Student cracked laptop hinge while carrying backpack and requested campus hardware workshop repair.',
      category: catIt,
      subCategory: 'Computer/Lab system',
      priority: 'Low',
      status: 'Rejected',
      location: { building: 'Hostel Block B', floor: '3rd Floor', room: 'Room 318', landmark: 'Student Desk' },
      user: complainants[3],
      staff: null,
      daysAgo: 30,
      rejectionReason: 'Campus IT services exclusively support institute-owned hardware and infrastructure. Personal electronics repairs are not covered under campus maintenance policy.',
      hasAttachments: false
    }
  ];

  const complaints = [];
  const statusHistories = [];
  const feedbacks = [];
  const comments = [];
  const notifications = [];

  specs.forEach((spec, index) => {
    const complaintId = `cmp_${String(index + 1).padStart(3, '0')}`;
    const createdAt = getDateAgo(spec.daysAgo, spec.hoursAgo || 0);
    const updatedAt = getDateAgo(Math.max(0, spec.daysAgo - 1));

    // Calculate due date based on SLA
    const sla = spec.slaHours || spec.category.slaHours[spec.priority] || 24;
    const dueDateObj = new Date(createdAt);
    dueDateObj.setHours(dueDateObj.getHours() + sla);
    const dueDate = dueDateObj.toISOString();

    const attachments = spec.hasAttachments ? [
      {
        id: `att_${complaintId}_01`,
        filename: `${spec.subCategory.toLowerCase().replace(/[^a-z0-9]/g, '_')}_issue_photo.jpg`,
        size: '1.8 MB',
        mimeType: 'image/jpeg',
        url: `/uploads/sample_${spec.category.code.toLowerCase()}.jpg`,
        uploadedAt: createdAt
      }
    ] : [];

    // Resolution timestamps if resolved or closed
    let resolvedAt = null;
    let closedAt = null;
    if (spec.status === 'Resolved' || spec.status === 'Closed') {
      resolvedAt = getDateAgo(spec.resolvedDaysAgo || 2);
    }
    if (spec.status === 'Closed') {
      closedAt = getDateAgo(spec.closedDaysAgo || 1);
    }

    const complaint = {
      id: complaintId,
      campusId: CAMPUS_ID,
      trackingNumber: spec.trackingNumber,
      referenceNumber: spec.trackingNumber.replace('CMP-2024-', 'CCM-2026-'),
      title: spec.title,
      description: spec.description,
      categoryId: spec.category.id,
      categoryName: spec.category.name,
      categoryColor: spec.category.color,
      categoryIcon: spec.category.icon,
      subCategory: spec.subCategory,
      priority: spec.priority,
      status: spec.status,
      location: spec.location,
      contactPreference: 'Phone',
      createdBy: {
        id: spec.user.id,
        name: spec.user.name,
        email: spec.user.email,
        role: spec.user.role,
        department: spec.user.department
      },
      assignedTo: spec.staff ? {
        id: spec.staff.id,
        name: spec.staff.name,
        email: spec.staff.email,
        role: spec.staff.role,
        department: spec.staff.department,
        specialty: spec.staff.specialty
      } : null,
      createdAt,
      updatedAt,
      dueDate,
      isOverdue: Boolean(spec.isOverdue),
      escalationLevel: spec.isOverdue ? 1 : 0,
      escalatedAt: spec.isOverdue ? createdAt : null,
      upvotesCount: index === 0 ? 3 : (index === 1 ? 2 : 0),
      upvotedBy: index === 0 ? ['usr_stud_01', 'usr_stud_02', 'usr_stud_03'] : (index === 1 ? ['usr_stud_01', 'usr_stud_04'] : []),
      isDeleted: false,
      slaHours: sla,
      resolvedAt,
      closedAt,
      resolutionNotes: spec.resolutionNotes || null,
      rejectionReason: spec.rejectionReason || null,
      estimatedCost: spec.costIncurred || (spec.status === 'Resolved' || spec.status === 'Closed' ? 250 : 0),
      attachments
    };

    complaints.push(complaint);

    // Build realistic Status History Timeline
    const historySteps = [
      {
        status: 'Submitted',
        changedAt: createdAt,
        changedBy: { id: spec.user.id, name: spec.user.name, role: spec.user.role },
        notes: 'Complaint submitted via Campus Portal'
      }
    ];

    if (spec.status !== 'Submitted') {
      if (spec.status === 'Rejected') {
        historySteps.push({
          status: 'Rejected',
          changedAt: getDateAgo(Math.max(0, spec.daysAgo - 1)),
          changedBy: { id: admin.id, name: admin.name, role: admin.role },
          notes: spec.rejectionReason || 'Complaint rejected after administrative review'
        });
      } else {
        // Under Review
        historySteps.push({
          status: 'Under Review',
          changedAt: getDateAgo(Math.max(0, spec.daysAgo - 0.2)),
          changedBy: { id: admin.id, name: admin.name, role: admin.role },
          notes: 'Reviewed by Facilities Administrator and verified priority'
        });

        if (spec.status !== 'Under Review' && spec.staff) {
          // Assigned
          historySteps.push({
            status: 'Assigned',
            changedAt: getDateAgo(Math.max(0, spec.daysAgo - 0.4)),
            changedBy: { id: admin.id, name: admin.name, role: admin.role },
            notes: `Assigned task to ${spec.staff.name} (${spec.staff.specialty} Department)`
          });

          if (['In Progress', 'Awaiting Parts', 'Resolved', 'Closed'].includes(spec.status)) {
            // In Progress
            historySteps.push({
              status: 'In Progress',
              changedAt: getDateAgo(Math.max(0, spec.daysAgo - 0.6)),
              changedBy: { id: spec.staff.id, name: spec.staff.name, role: spec.staff.role },
              notes: 'Technician on site; diagnostic assessment initiated'
            });

            if (spec.status === 'Awaiting Parts') {
              historySteps.push({
                status: 'Awaiting Parts',
                changedAt: getDateAgo(Math.max(0, spec.daysAgo - 1.5)),
                changedBy: { id: spec.staff.id, name: spec.staff.name, role: spec.staff.role },
                notes: spec.awaitingNotes || 'Required spare components not in campus stock; purchase order initiated'
              });
            }

            if (['Resolved', 'Closed'].includes(spec.status)) {
              historySteps.push({
                status: 'Resolved',
                changedAt: resolvedAt,
                changedBy: { id: spec.staff.id, name: spec.staff.name, role: spec.staff.role },
                notes: spec.resolutionNotes || 'Repair work finished and tested successfully'
              });

              if (spec.status === 'Closed') {
                historySteps.push({
                  status: 'Closed',
                  changedAt: closedAt,
                  changedBy: { id: spec.user.id, name: spec.user.name, role: spec.user.role },
                  notes: 'Complainant confirmed resolution satisfactory; ticket closed automatically'
                });
              }
            }
          }
        }
      }
    }

    historySteps.forEach((step, sIdx) => {
      statusHistories.push({
        id: `sh_${complaintId}_${sIdx + 1}`,
        campusId: CAMPUS_ID,
        complaintId,
        trackingNumber: spec.trackingNumber,
        status: step.status,
        changedBy: step.changedBy,
        changedAt: step.changedAt,
        notes: step.notes
      });
    });

    // Create Feedback if resolved/closed
    if (spec.hasFeedback) {
      feedbacks.push({
        id: `fb_${complaintId}`,
        campusId: CAMPUS_ID,
        complaintId,
        trackingNumber: spec.trackingNumber,
        userId: spec.user.id,
        userName: spec.user.name,
        userRole: spec.user.role,
        rating: spec.feedbackRating || 5,
        comment: spec.feedbackComment || 'Work completed satisfactorily. Thank you!',
        timelinessRating: (spec.feedbackRating || 5) > 3 ? 5 : 3,
        cleanlinessRating: 5,
        technicianBehaviorRating: 5,
        createdAt: closedAt || resolvedAt
      });
    }

    // Add realistic Discussion Comments on selected complaints
    if (index % 3 === 0) {
      comments.push({
        id: `cmt_${complaintId}_1`,
        campusId: CAMPUS_ID,
        complaintId,
        trackingNumber: spec.trackingNumber,
        author: {
          id: spec.user.id,
          name: spec.user.name,
          role: spec.user.role,
          avatarColor: spec.user.avatarColor
        },
        content: `Hi maintenance team, please call my phone before visiting ${spec.location.room} so I can unlock the door.`,
        createdAt: getDateAgo(spec.daysAgo, (spec.hoursAgo || 0) + 1),
        isInternal: false
      });

      if (spec.staff) {
        comments.push({
          id: `cmt_${complaintId}_2`,
          campusId: CAMPUS_ID,
          complaintId,
          trackingNumber: spec.trackingNumber,
          author: {
            id: spec.staff.id,
            name: spec.staff.name,
            role: spec.staff.role,
            avatarColor: spec.staff.avatarColor
          },
          content: `Noted ${spec.user.name.split(' ')[0]}. I will be on site with tools around 2:30 PM today.`,
          createdAt: getDateAgo(Math.max(0, spec.daysAgo - 0.5)),
          isInternal: false
        });
      }
    }
  });

  // Generate realistic Notifications
  // 1. Admin notifications
  notifications.push(
    {
      id: 'notif_001',
      campusId: CAMPUS_ID,
      userId: admin.id,
      title: '🚨 SLA Alert: Urgent Ticket Overdue',
      message: 'Complaint CMP-2024-001 (Water leakage in Hostel Block B) has exceeded its 4-hour SLA window.',
      type: 'sla_breach',
      link: '/admin/complaints/cmp_001',
      isRead: false,
      createdAt: getDateAgo(0, 1)
    },
    {
      id: 'notif_002',
      campusId: CAMPUS_ID,
      userId: admin.id,
      title: 'New Complaint Submitted',
      message: 'CMP-2024-008: Canteen hand wash basin drain blocked submitted by Rohan Iyer.',
      type: 'new_complaint',
      link: '/admin/complaints/cmp_008',
      isRead: false,
      createdAt: getDateAgo(0, 2)
    },
    {
      id: 'notif_003',
      campusId: CAMPUS_ID,
      userId: admin.id,
      title: 'Work Verified & Closed',
      message: 'CMP-2024-034: Broken window pane in Visitor Lounge marked closed with 5-star rating.',
      type: 'ticket_closed',
      link: '/admin/complaints/cmp_034',
      isRead: true,
      createdAt: getDateAgo(1, 0)
    }
  );

  // 2. Staff notifications
  users.filter((u) => u.role === 'staff').forEach((staffMember, sIdx) => {
    notifications.push(
      {
        id: `notif_staff_${sIdx}_1`,
        campusId: CAMPUS_ID,
        userId: staffMember.id,
        title: 'New Work Order Assigned',
        message: `You have been assigned ticket CMP-2024-00${sIdx + 1} by Estate Office.`,
        type: 'task_assigned',
        link: `/staff/tasks`,
        isRead: false,
        createdAt: getDateAgo(1, sIdx)
      },
      {
        id: `notif_staff_${sIdx}_2`,
        campusId: CAMPUS_ID,
        userId: staffMember.id,
        title: 'User Comment Added',
        message: 'A student left a note regarding access timings for your active work order.',
        type: 'new_comment',
        link: `/staff/tasks`,
        isRead: true,
        createdAt: getDateAgo(2, sIdx)
      }
    );
  });

  // 3. Student notifications
  complainants.forEach((student, cIdx) => {
    notifications.push(
      {
        id: `notif_stud_${cIdx}_1`,
        campusId: CAMPUS_ID,
        userId: student.id,
        title: 'Complaint Status Updated',
        message: 'Your maintenance request status has been updated. Technician assigned.',
        type: 'status_update',
        link: `/student/complaints`,
        isRead: cIdx > 2,
        createdAt: getDateAgo(1, cIdx * 2)
      }
    );
  });

  return {
    complaints,
    statusHistories,
    feedbacks,
    comments,
    notifications
  };
}

/**
 * Resets and seeds all 9 JSON collections with realistic campus demo data.
 * Exported for reusable programmatic resets.
 */
export async function resetDemoData() {
  console.log('🔄 [Seed] Initializing Campus Complaint & Maintenance Management System demo data...');

  // Ensure /server/data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 1. Hash passwords for all users
  const defaultPassword = 'Password@123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const users = RAW_USERS.map((user) => ({
    ...user,
    password: passwordHash
  }));

  // 2. Categories
  const categories = CATEGORIES_DATA;

  // 3. Complaints, StatusHistories, Feedbacks, Comments, Notifications
  const {
    complaints,
    statusHistories,
    feedbacks,
    comments,
    notifications
  } = generateComplaints(users, categories);

  // 4. Settings
  const settings = SETTINGS_DATA;

  // 5. System Audit Log
  const auditLog = [
    {
      id: 'aud_001',
      campusId: CAMPUS_ID,
      action: 'SYSTEM_INITIALIZE',
      entityType: 'System',
      entityId: 'ccmms_root',
      actor: { id: 'sys_init', name: 'System Installer', role: 'system' },
      details: 'CCMMS Phase 1 initialized with full campus schema and security profiles.',
      timestamp: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'aud_002',
      campusId: CAMPUS_ID,
      action: 'SEED_DEMO_DATA',
      entityType: 'Database',
      entityId: 'file_store_collections',
      actor: { id: users[0].id, name: users[0].name, role: users[0].role },
      details: `Generated ${users.length} users, ${categories.length} categories, ${complaints.length} complaints, and ${feedbacks.length} verified ratings.`,
      timestamp: new Date().toISOString()
    }
  ];

  // 6. Simulated Sent Messages Log (Email / SMS)
  const sentMessages = notifications.map((n, idx) => {
    const user = users.find((u) => u.id === n.userId);
    const isEmail = idx % 2 === 0;
    return {
      id: `msg_${String(idx + 1).padStart(4, '0')}`,
      campusId: CAMPUS_ID,
      userId: n.userId,
      channel: isEmail ? 'EMAIL' : 'SMS',
      to: isEmail ? (user?.email || 'user@apex.edu') : (user?.phone || '+91 98765 00000'),
      recipientName: user?.name || 'Campus Resident',
      subject: n.title,
      body: n.message,
      status: 'DELIVERED',
      sentAt: n.createdAt
    };
  });

  // Map collections to data
  const collections = {
    'users.json': users,
    'categories.json': categories,
    'complaints.json': complaints,
    'statusHistory.json': statusHistories,
    'notifications.json': notifications,
    'sentMessages.json': sentMessages,
    'feedback.json': feedbacks,
    'comments.json': comments,
    'settings.json': settings,
    'auditLog.json': auditLog
  };

  // Write all collections atomically
  for (const [filename, data] of Object.entries(collections)) {
    const targetPath = path.join(DATA_DIR, filename);
    const tempPath = path.join(DATA_DIR, `${filename}.tmp.${Date.now()}`);
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, targetPath);
    console.log(`  ✓ Written ${filename.padEnd(20)} (${data.length} records)`);
  }

  console.log('✅ [Seed] Successfully seeded all collections into /server/data/');
  console.log(`   - Campus ID: ${CAMPUS_ID}`);
  console.log(`   - Total Users: ${users.length} (1 Admin, 4 Technicians, 8 Students/Staff)`);
  console.log(`   - Total Categories: ${categories.length}`);
  console.log(`   - Total Complaints: ${complaints.length} across 8 lifecycle statuses`);
  console.log(`   - SLA Overdue Complaints: ${complaints.filter(c => c.isOverdue).length}`);
  console.log(`   - Verified Ratings / Feedback: ${feedbacks.length}`);
  console.log(`   - Default Password: "${defaultPassword}"`);

  return {
    usersCount: users.length,
    categoriesCount: categories.length,
    complaintsCount: complaints.length,
    statusHistoryCount: statusHistories.length,
    notificationsCount: notifications.length,
    feedbackCount: feedbacks.length,
    commentsCount: comments.length,
    settingsCount: settings.length,
    auditLogCount: auditLog.length
  };
}

// Auto-run if executed directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetDemoData().catch((err) => {
    console.error('❌ [Seed] Fatal error running seed script:', err);
    process.exit(1);
  });
}
