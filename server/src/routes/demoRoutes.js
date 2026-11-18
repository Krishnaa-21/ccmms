import express from 'express';
import {
  getSummary,
  getCategories,
  getComplaints,
  getUsers,
  resetData
} from '../controllers/demoController.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/categories', getCategories);
router.get('/complaints', getComplaints);
router.get('/users', getUsers);
router.post('/reset', resetData);

export default router;
