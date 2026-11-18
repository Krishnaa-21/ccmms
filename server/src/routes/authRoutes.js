import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
  refreshToken
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema
} from '../validations/authValidation.js';

const router = express.Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

router.get('/me', requireAuth, getMe);
router.patch('/change-password', requireAuth, validateBody(changePasswordSchema), changePassword);

export default router;
