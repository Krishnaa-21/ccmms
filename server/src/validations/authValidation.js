import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().trim().optional().default(''),
  department: z.string().trim().min(2, 'Department is required'),
  role: z.enum(['student', 'staff']).optional().default('student')
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long')
});

