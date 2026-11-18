import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().trim().optional().default(''),
  role: z.enum(['admin', 'staff', 'student']),
  department: z.string().trim().min(2, 'Department is required'),
  specialty: z.string().trim().optional(),
  isAvailable: z.boolean().optional().default(true)
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: z.string().trim().optional(),
  role: z.enum(['admin', 'staff', 'student']).optional(),
  department: z.string().trim().min(2).optional(),
  specialty: z.string().trim().optional(),
  isAvailable: z.boolean().optional()
});

export const updateStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean flag is required' })
});

