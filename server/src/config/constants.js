export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student'
};

export const COMPLAINT_STATUS = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  AWAITING_PARTS: 'Awaiting Parts',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
  REOPENED: 'Reopened'
};

export const COMPLAINT_PRIORITY = {
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const DEFAULT_SLA_HOURS = {
  Urgent: 24,       // 24 hours
  High: 48,         // 48 hours
  Medium: 120,      // 5 days
  Low: 240          // 10 days
};

export const STATUS_TRANSITIONS = {
  student: {
    Submitted: ['Rejected'], // Cancel own complaint
    Resolved: ['Reopened'],  // Reopen resolved complaint with reason
    Closed: ['Reopened']     // Reopen closed complaint if issue recurred
  },
  staff: {
    Assigned: ['In Progress'],
    'In Progress': ['Awaiting Parts', 'Resolved'],
    'Awaiting Parts': ['In Progress', 'Resolved'],
    Reopened: ['In Progress']
  },
  admin: {
    Submitted: ['Under Review', 'Assigned', 'Rejected'],
    'Under Review': ['Assigned', 'Rejected'],
    Assigned: ['In Progress', 'Under Review', 'Rejected'],
    'In Progress': ['Awaiting Parts', 'Resolved', 'Assigned'],
    'Awaiting Parts': ['In Progress', 'Resolved'],
    Resolved: ['Closed', 'Reopened'],
    Reopened: ['Assigned', 'In Progress', 'Under Review'],
    Closed: ['Reopened'],
    Rejected: ['Under Review']
  }
};

export const PRIORITY_WEIGHTS = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

export const PRIORITY_KEYWORDS = {
  Urgent: ['fire', 'spark', 'short circuit', 'gas', 'flooding', 'flood', 'electric shock', 'burst pipe', 'explosion', 'hazard', 'smoke'],
  High: ['no water', 'power cut', 'power outage', 'blackout', 'leak', 'leakage', 'lift stuck', 'elevator stuck', 'sewage', 'choked drain', 'server down', 'exam'],
  Medium: ['fan', 'light', 'tube light', 'projector', 'printer', 'door lock', 'switch', 'cooling', 'ac', 'wifi', 'internet'],
  Low: ['paint', 'bench', 'cosmetic', 'chair', 'cleaning', 'dust', 'mirror', 'aesthetic', 'signboard']
};
