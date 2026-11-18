import bcrypt from 'bcryptjs';

export const CAMPUS_ID = 'apex-campus-main';

export const CAMPUS_LOCATIONS = [
  { building: 'Main Academic Block', floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'], rooms: ['Room 101', 'Room 104', 'Room 204', 'Faculty Room 212', 'HOD Office', 'Room 305'] },
  { building: 'Library', floors: ['Ground Floor', '1st Floor', '2nd Floor'], rooms: ['Reference Section', 'Reading Hall A', 'Reading Hall B', 'Digital Resource Center', 'Circulation Counter'] },
  { building: 'Hostel Block A', floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'], rooms: ['Room 108', 'Room 214', 'Room 302', 'Common Room', 'Mess Hall', 'Washroom 2B'] },
  { building: 'Hostel Block B', floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'], rooms: ['Room 112', 'Room 205', 'Room 318', 'Visitor Lounge', 'Washroom 3A', 'Washroom 1B'] },
  { building: 'Computer Lab 1', floors: ['Ground Floor'], rooms: ['Lab 1A - AI/ML', 'Lab 1B - Systems', 'Server Room', 'Instructor Cabin'] },
  { building: 'Physics Lab', floors: ['1st Floor'], rooms: ['Optics Darkroom', 'General Physics Lab', 'Research Instrumentation Room'] },
  { building: 'Seminar Hall', floors: ['Ground Floor'], rooms: ['Main Auditorium (500-seat)', 'Green Room', 'AV Control Booth'] },
  { building: 'Canteen', floors: ['Ground Floor'], rooms: ['Main Dining Area', 'Kitchen Counter', 'Faculty Dining Lounge'] },
  { building: 'Sports Complex', floors: ['Ground Floor', '1st Floor'], rooms: ['Badminton Court 1', 'Gymnasium', 'Table Tennis Arena', 'Locker Room'] },
  { building: 'Admin Office', floors: ['Ground Floor', '1st Floor'], rooms: ['Registrar Office', 'Finance Desk', 'Dean Office', 'Board Room', 'Accounts Section'] },
  { building: 'Parking Area', floors: ['Ground Level'], rooms: ['Staff Two-Wheeler Shed', 'Student Parking Bay C', 'EV Charging Station'] }
];

export const CATEGORIES_DATA = [
  {
    id: 'cat_plumbing',
    campusId: CAMPUS_ID,
    name: 'Plumbing',
    code: 'PLM',
    description: 'Water supply pipelines, drain blockages, washroom fixtures, flush tanks and taps',
    icon: 'Droplets',
    color: '#0284c7',
    subCategories: ['Leakage', 'Blocked drain', 'No water supply', 'Tap/Flush repair'],
    slaHours: { Urgent: 4, High: 12, Medium: 24, Low: 48 },
    isActive: true
  },
  {
    id: 'cat_electrical',
    campusId: CAMPUS_ID,
    name: 'Electrical',
    code: 'ELE',
    description: 'Power distribution, switchboards, ceiling fans, tube lights, UPS systems and short circuits',
    icon: 'Zap',
    color: '#d97706',
    subCategories: ['Power outage', 'Faulty switch', 'Tube light/Fan', 'Short circuit'],
    slaHours: { Urgent: 2, High: 8, Medium: 24, Low: 48 },
    isActive: true
  },
  {
    id: 'cat_it',
    campusId: CAMPUS_ID,
    name: 'IT',
    code: 'ITS',
    description: 'Campus Wi-Fi connectivity, classroom AV projectors, lab computers, network switches and printers',
    icon: 'Wifi',
    color: '#7c3aed',
    subCategories: ['Wi-Fi', 'Projector', 'Computer/Lab system', 'Printer'],
    slaHours: { Urgent: 4, High: 12, Medium: 24, Low: 48 },
    isActive: true
  },
  {
    id: 'cat_general',
    campusId: CAMPUS_ID,
    name: 'General',
    code: 'GEN',
    description: 'Classroom benches, broken glass, door locks, sanitation, pest control and carpentry work',
    icon: 'Wrench',
    color: '#059669',
    subCategories: ['Furniture', 'Cleaning', 'Doors/Windows', 'Pest control', 'Other'],
    slaHours: { Urgent: 6, High: 24, Medium: 48, Low: 72 },
    isActive: true
  }
];

export const RAW_USERS = [
  // 1 Admin
  {
    id: 'usr_admin_01',
    campusId: CAMPUS_ID,
    name: 'Dr. Ramesh Sundaram',
    email: 'admin@apex.edu',
    phone: '+91 98765 43210',
    role: 'admin',
    department: 'Campus Administration & Estate Office',
    designation: 'Dean of Campus Infrastructure',
    avatarColor: '#1e3a8a',
    isActive: true,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  // 4 Maintenance Staff
  {
    id: 'usr_staff_plumb',
    campusId: CAMPUS_ID,
    name: 'Rajesh Sharma',
    email: 'plumbing@apex.edu',
    phone: '+91 98765 11111',
    role: 'staff',
    department: 'Plumbing & Water Works',
    specialty: 'Plumbing',
    isAvailable: true,
    avatarColor: '#0284c7',
    isActive: true,
    createdAt: '2024-01-05T08:30:00.000Z'
  },
  {
    id: 'usr_staff_elec',
    campusId: CAMPUS_ID,
    name: 'Suresh Kumar',
    email: 'electrical@apex.edu',
    phone: '+91 98765 22222',
    role: 'staff',
    department: 'Electrical & Power Services',
    specialty: 'Electrical',
    isAvailable: true,
    avatarColor: '#d97706',
    isActive: true,
    createdAt: '2024-01-05T08:30:00.000Z'
  },
  {
    id: 'usr_staff_it',
    campusId: CAMPUS_ID,
    name: 'Ananya Verma',
    email: 'it.support@apex.edu',
    phone: '+91 98765 33333',
    role: 'staff',
    department: 'IT Infrastructure & Support',
    specialty: 'IT',
    isAvailable: true,
    avatarColor: '#7c3aed',
    isActive: true,
    createdAt: '2024-01-06T09:00:00.000Z'
  },
  {
    id: 'usr_staff_gen',
    campusId: CAMPUS_ID,
    name: 'Mohan Das',
    email: 'general.maint@apex.edu',
    phone: '+91 98765 44444',
    role: 'staff',
    department: 'Civil & Carpentry Maintenance',
    specialty: 'General',
    isAvailable: true,
    avatarColor: '#059669',
    isActive: true,
    createdAt: '2024-01-06T09:00:00.000Z'
  },
  // 8 Students / Staff (Complainants)
  {
    id: 'usr_stud_01',
    campusId: CAMPUS_ID,
    name: 'Aarav Patel',
    email: 'aarav.cse@apex.edu',
    phone: '+91 98111 00001',
    role: 'student',
    department: 'Computer Science (B.Tech 3rd Yr)',
    designation: 'Hostel Resident (Block A)',
    avatarColor: '#2563eb',
    isActive: true,
    createdAt: '2024-01-10T10:00:00.000Z'
  },
  {
    id: 'usr_stud_02',
    campusId: CAMPUS_ID,
    name: 'Priya Nair',
    email: 'priya.ece@apex.edu',
    phone: '+91 98111 00002',
    role: 'student',
    department: 'Electronics & Communication (B.Tech 2nd Yr)',
    designation: 'Hostel Resident (Block B)',
    avatarColor: '#db2777',
    isActive: true,
    createdAt: '2024-01-10T10:15:00.000Z'
  },
  {
    id: 'usr_stud_03',
    campusId: CAMPUS_ID,
    name: 'Rohan Iyer',
    email: 'rohan.mech@apex.edu',
    phone: '+91 98111 00003',
    role: 'student',
    department: 'Mechanical Engineering (B.Tech 4th Yr)',
    designation: 'Student Council Representative',
    avatarColor: '#ea580c',
    isActive: true,
    createdAt: '2024-01-11T11:00:00.000Z'
  },
  {
    id: 'usr_stud_04',
    campusId: CAMPUS_ID,
    name: 'Neha Gupta',
    email: 'neha.phy@apex.edu',
    phone: '+91 98111 00004',
    role: 'student',
    department: 'Physics (M.Sc 1st Yr)',
    designation: 'Day Scholar',
    avatarColor: '#9333ea',
    isActive: true,
    createdAt: '2024-01-12T09:30:00.000Z'
  },
  {
    id: 'usr_fac_01',
    campusId: CAMPUS_ID,
    name: 'Prof. Vikram Sengupta',
    email: 'vikram.cs@apex.edu',
    phone: '+91 98111 00005',
    role: 'student',
    department: 'Faculty of Computer Science',
    designation: 'Assistant Professor',
    avatarColor: '#0891b2',
    isActive: true,
    createdAt: '2024-01-08T09:00:00.000Z'
  },
  {
    id: 'usr_fac_02',
    campusId: CAMPUS_ID,
    name: 'Dr. Sunita Rao',
    email: 'sunita.rao@apex.edu',
    phone: '+91 98111 00006',
    role: 'student',
    department: 'Faculty of Applied Sciences',
    designation: 'Associate Professor',
    avatarColor: '#4f46e5',
    isActive: true,
    createdAt: '2024-01-08T09:30:00.000Z'
  },
  {
    id: 'usr_staff_lab',
    campusId: CAMPUS_ID,
    name: 'Amit Deshmukh',
    email: 'amit.lab@apex.edu',
    phone: '+91 98111 00007',
    role: 'student',
    department: 'Computer Systems Lab',
    designation: 'Senior Lab Technician',
    avatarColor: '#16a34a',
    isActive: true,
    createdAt: '2024-01-09T08:30:00.000Z'
  },
  {
    id: 'usr_staff_lib',
    campusId: CAMPUS_ID,
    name: 'Kavita Joshi',
    email: 'kavita.library@apex.edu',
    phone: '+91 98111 00008',
    role: 'student',
    department: 'Central Library Services',
    designation: 'Assistant Librarian',
    avatarColor: '#ca8a04',
    isActive: true,
    createdAt: '2024-01-09T09:15:00.000Z'
  }
];

export const SETTINGS_DATA = [
  {
    id: 'set_apex_main',
    campusId: CAMPUS_ID,
    campusName: 'Apex Institute of Technology',
    campusShortName: 'Apex Campus',
    campusCode: 'AIT-MAIN',
    address: 'Survey No. 42, Knowledge Park III, Tech Corridor, Bangalore 560100',
    contactEmail: 'campus.facilities@apex.edu',
    emergencyHelpline: '+91 80 2345 6789',
    workingHours: 'Monday - Saturday: 08:00 AM - 08:00 PM (Emergency 24/7)',
    slaThresholdHours: {
      Urgent: 4,
      High: 12,
      Medium: 24,
      Low: 48
    },
    autoAssignment: true,
    escalationEmail: 'dean.infra@apex.edu',
    currency: 'INR',
    maintenanceCategoriesCount: 4,
    systemVersion: '1.0.0-phase1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];
