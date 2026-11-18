import express from 'express';
import {
  getLocations,
  getLocationById,
  createLocation,
  getCampuses
} from '../controllers/locationController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Campuses can be fetched openly or authenticated
router.get('/campuses', getCampuses);

// Locations listing
router.get('/', getLocations);
router.get('/:id', getLocationById);
router.post('/', requireAuth, requireAdmin, createLocation);

export default router;
