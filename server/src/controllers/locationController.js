import fileStore from '../utils/fileStore.js';
import { locationRepo } from '../repositories/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getLocations = asyncHandler(async (req, res) => {
  const { campusId, building } = req.query;
  let locations = await locationRepo.findAll();

  if (campusId) {
    locations = locations.filter((l) => l.campusId === campusId);
  }
  if (building && building !== 'all') {
    locations = locations.filter((l) => l.building?.toLowerCase() === building.toLowerCase());
  }

  res.json({
    success: true,
    count: locations.length,
    data: locations
  });
});

export const getLocationById = asyncHandler(async (req, res) => {
  const location = await locationRepo.findById(req.params.id);
  if (!location) {
    return res.status(404).json({ success: false, message: 'Location not found' });
  }
  res.json({
    success: true,
    data: location
  });
});

export const createLocation = asyncHandler(async (req, res) => {
  const { building, floor, room, landmark, zone, campusId } = req.body;
  if (!building || !room) {
    return res.status(400).json({ success: false, message: 'Building and Room are required' });
  }

  const code = `LOC-${(campusId || 'MAIN').toUpperCase().replace(/[^A-Z]/g, '')}-${building.substring(0, 3).toUpperCase()}-${room.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`;
  const qrPayload = `https://ccmms.apex.edu/report?building=${encodeURIComponent(building)}&floor=${encodeURIComponent(floor || '')}&room=${encodeURIComponent(room)}`;

  const created = await locationRepo.create({
    campusId: campusId || 'apex-campus-main',
    code,
    building,
    floor: floor || 'Ground Floor',
    room,
    landmark: landmark || '',
    zone: zone || 'General Facilities',
    qrPayload
  });

  res.status(201).json({
    success: true,
    message: 'Location registered successfully',
    data: created
  });
});

export const getCampuses = asyncHandler(async (req, res) => {
  const campuses = await fileStore.read('campuses');
  res.json({
    success: true,
    data: campuses
  });
});

export default {
  getLocations,
  getLocationById,
  createLocation,
  getCampuses
};

