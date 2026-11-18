import bcrypt from 'bcryptjs';
import { userRepo } from '../repositories/index.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';

export const authService = {
  async register(data) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      const err = new Error('A user with this email address already exists');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser = await userRepo.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: passwordHash,
      phone: data.phone || '',
      role: data.role || 'student',
      department: data.department,
      avatarColor: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      isActive: true,
      tokenVersion: 1
    });

    const { password, ...safeUser } = newUser;
    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);

    return { user: safeUser, accessToken, refreshToken };
  },

  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('Account has been deactivated. Please contact campus facilities administration.');
      err.statusCode = 403;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const { password: pwd, ...safeUser } = user;
    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);

    return { user: safeUser, accessToken, refreshToken };
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      const err = new Error('Refresh token is required');
      err.statusCode = 401;
      throw err;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (e) {
      const err = new Error('Invalid or expired refresh token');
      err.statusCode = 401;
      throw err;
    }

    const user = await userRepo.findById(decoded.id);
    if (!user || !user.isActive) {
      const err = new Error('User not found or account deactivated');
      err.statusCode = 401;
      throw err;
    }

    const { password, ...safeUser } = user;
    const newAccessToken = generateAccessToken(safeUser);
    return { accessToken: newAccessToken, user: safeUser };
  },

  async getMe(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepo.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const err = new Error('Current password does not match');
      err.statusCode = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await userRepo.update(userId, {
      password: newHash,
      tokenVersion: (user.tokenVersion || 1) + 1
    });

    return { message: 'Password changed successfully' };
  },

  async updateAvailability(userId, isAvailable) {
    const user = await userRepo.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    const updated = await userRepo.update(userId, { isAvailable: Boolean(isAvailable) });
    const { password, ...safeUser } = updated;
    return safeUser;
  }
};

export default authService;

