import { z } from 'zod';

export const createComplaintSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Subcategory is required'),
  building: z.string().min(1, 'Building is required'),
  floor: z.string().min(1, 'Floor is required'),
  room: z.string().min(1, 'Room is required'),
  landmark: z.string().trim().optional(),
  priority: z.enum(['Urgent', 'High', 'Medium', 'Low']).optional(),
  contactPreference: z.enum(['Phone', 'Email', 'In-Person']).optional().default('Phone')
});

export const updateComplaintSchema = z.object({
  title: z.string().trim().min(5).max(150).optional(),
  description: z.string().trim().min(10).optional(),
  categoryId: z.string().optional(),
  subCategory: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  landmark: z.string().optional(),
  priority: z.enum(['Urgent', 'High', 'Medium', 'Low']).optional(),
  contactPreference: z.enum(['Phone', 'Email', 'In-Person']).optional()
});

export const suggestPrioritySchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  description: z.string().trim().min(5, 'Description is required'),
  categoryId: z.string().optional()
});
