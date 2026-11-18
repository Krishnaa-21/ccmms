import express from 'express';
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser
} from '../controllers/userController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema
} from '../validations/userValidation.js';

const router = express.Router();

// All user management routes require admin role
router.use(requireAuth, requireAdmin);

router.get('/', getUsers);
router.post('/', validateBody(createUserSchema), createUser);
router.get('/:id', getUserById);
router.patch('/:id', validateBody(updateUserSchema), updateUser);
router.patch('/:id/status', validateBody(updateStatusSchema), updateUserStatus);
router.delete('/:id', deleteUser);

export default router;
