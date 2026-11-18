import { verifyAccessToken } from '../utils/token.js';
import { userRepo } from '../repositories/index.js';

/**
 * Authentication Middleware: verifies Bearer token from header or cookie
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token provided.',
        errors: null
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid authorization token',
        errors: null
      });
    }

    const user = await userRepo.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
        errors: null
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact campus facilities administration.',
        errors: null
      });
    }

    // Attach full user object (excluding password)
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-Based Access Control Middleware
 * @param  {...string} roles (e.g. 'admin', 'staff', 'student')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: null
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of the following roles: [${roles.join(', ')}]`,
        errors: null
      });
    }

    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireStaff = requireRole('staff', 'admin');
export const requireStudent = requireRole('student', 'admin');

/**
 * Checks if a user has permission to view/interact with a specific complaint
 */
export function canAccessComplaint(user, complaint) {
  if (!user || !complaint) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'staff' && complaint.assignedTo?.id === user.id) return true;
  if (user.role === 'student' && complaint.createdBy?.id === user.id) return true;
  return false;
}

