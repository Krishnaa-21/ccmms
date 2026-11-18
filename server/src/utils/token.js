import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      campusId: user.campusId || ENV.CAMPUS_ID
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      tokenVersion: user.tokenVersion || 1
    },
    ENV.REFRESH_TOKEN_SECRET,
    { expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ENV.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);
}
