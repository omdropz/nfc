import jwt from 'jsonwebtoken';

/**
 * Authentication middleware.
 * Accepts a JWT from:
 *   1. Authorization: Bearer <token>  header
 *   2. admin_token                    httpOnly cookie
 *
 * On success attaches req.user = decoded JWT payload.
 * On failure responds with 401 JSON.
 */
const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    // 2. Fall back to httpOnly cookie
    if (!token && req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

export default authMiddleware;
