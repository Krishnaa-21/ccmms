import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment content cannot be empty').max(2000),
  isInternal: z.boolean().optional().default(false)
});

export const createFeedbackSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().trim().min(3, 'Feedback comment must be at least 3 characters').max(1000),
  timelinessRating: z.number().int().min(1).max(5).optional(),
  cleanlinessRating: z.number().int().min(1).max(5).optional(),
  technicianBehaviorRating: z.number().int().min(1).max(5).optional()
});

export const updateSettingsSchema = z.object({
  campusName: z.string().trim().min(2).optional(),
  campusShortName: z.string().trim().optional(),
  contactEmail: z.string().trim().email().optional(),
  emergencyHelpline: z.string().trim().optional(),
  workingHours: z.string().trim().optional(),
  slaThresholdHours: z.object({
    Urgent: z.number().positive().optional(),
    High: z.number().positive().optional(),
    Medium: z.number().positive().optional(),
    Low: z.number().positive().optional()
  }).optional(),
  autoAssignment: z.boolean().optional(),
  escalationEmail: z.string().trim().email().optional()
});
