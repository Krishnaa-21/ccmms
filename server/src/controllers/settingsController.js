import { settingsService } from '../services/settingsService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getSettings = asyncHandler(async (req, res) => {
  const result = await settingsService.getSettings();
  res.json({
    success: true,
    data: result
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const updated = await settingsService.updateSettings(req.body, req.user);
  res.json({
    success: true,
    message: 'Campus settings updated successfully',
    data: updated
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await settingsService.createCategory(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const updated = await settingsService.updateCategory(req.params.id, req.body, req.user);
  res.json({
    success: true,
    message: 'Category updated successfully',
    data: updated
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await settingsService.deleteCategory(req.params.id, req.user);
  res.json({
    success: true,
    message: result.message
  });
});

export default {
  getSettings,
  updateSettings,
  createCategory,
  updateCategory,
  deleteCategory
};
