import { userService } from '../services/userService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query);
  res.json({
    success: true,
    data: result.users,
    users: result.users,
    pagination: result.pagination
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({
    success: true,
    data: user
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const newUser = await userService.createUser(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const updated = await userService.updateUser(req.params.id, req.body, req.user);
  res.json({
    success: true,
    message: 'User updated successfully',
    data: updated
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const updated = await userService.updateUserStatus(req.params.id, isActive, req.user);
  res.json({
    success: true,
    message: `User status changed to ${isActive ? 'Active' : 'Deactivated'}`,
    data: updated
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user);
  res.json({
    success: true,
    message: result.message
  });
});

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser
};

