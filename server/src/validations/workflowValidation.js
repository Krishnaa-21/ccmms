import { z } from 'zod';

export const statusChangeSchema = z.object({
  status: z.enum([
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Awaiting Parts',
    'Resolved',
    'Closed',
    'Rejected',
    'Reopened'
  ]),
  notes: z.string().trim().optional(),
  rejectionReason: z.string().trim().optional(),
  resolutionNotes: z.string().trim().optional(),
  costIncurred: z.number().nonnegative().optional(),
  partsReplaced: z.string().trim().optional()
});

export const assignSchema = z.object({
  staffId: z.string().min(1, 'Staff member ID is required'),
  reason: z.string().trim().optional()
});

export const priorityChangeSchema = z.object({
  priority: z.enum(['Urgent', 'High', 'Medium', 'Low']),
  reason: z.string().trim().min(3, 'Reason for priority override is required')
});

export const reopenSchema = z.object({
  reason: z.string().trim().min(5, 'Reopening reason must be at least 5 characters')
});

export const closeSchema = z.object({
  notes: z.string().trim().optional()
});

