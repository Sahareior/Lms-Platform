import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

/**
 * Middleware that verifies the JWT token from the Authorization header.
 * On success, attaches `req.user = { userId, email, role }` and calls next().
 * On failure, responds with 401 Unauthorized.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token. Access denied.' });
  }
}

/**
 * Middleware that checks if the authenticated user has the required role(s).
 * Must be used AFTER `authenticate`.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    next();
  };
}

/**
 * Middleware that allows admins, or a user acting on their own account.
 *
 * Looks for a userId in req.params / req.query / req.body (in that order),
 * matching the `field` name (default 'userId'). If none is present the request
 * is treated as self-scoped (e.g. routes that use the token only).
 * Must be used AFTER `authenticate`.
 */
export function requireSelfOrAdmin(field = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (req.user.role === 'admin') {
      return next();
    }

    const targetId =
      req.params?.[field] ?? req.query?.[field] ?? req.body?.[field] ?? req.user.userId;

    if (String(targetId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You can only access your own data.' });
    }
    next();
  };
}

/**
 * Middleware that blocks non-admins from reading another user's data via a
 * userId embedded in a resource (e.g. attempt._id). Extracts the owner from
 * `req.resource` if present (set by controllers) — see usage in controllers
 * that resolve a resource before responding.
 */
export function requireResourceOwner() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (req.user.role === 'admin') {
      return next();
    }
    const ownerId = req.resourceOwner;
    if (!ownerId || String(ownerId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You can only access your own data.' });
    }
    next();
  };
}
