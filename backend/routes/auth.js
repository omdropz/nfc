import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'crypto';
import rateLimit from 'express-rate-limit';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// ─────────────────────────────────────────────
// Rate limiter — 5 login attempts per 15 minutes
// ─────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
});

// ─────────────────────────────────────────────
// Helper: constant-time string comparison
// ─────────────────────────────────────────────
function safeCompare(a, b) {
  try {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) {
      // Still do a comparison to avoid timing leak on length difference
      timingSafeEqual(bufA, bufA);
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  const emailMatch = safeCompare(email, adminEmail);
  const passwordMatch = safeCompare(password, adminPassword);

  if (!emailMatch || !passwordMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  const payload = { email: adminEmail, role: 'admin' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  res.cookie('admin_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: sevenDaysMs,
    secure: process.env.NODE_ENV === 'production',
  });

  return res.json({ success: true, token });
});

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', { httpOnly: true, sameSite: 'strict' });
  return res.json({ success: true });
});

// ─────────────────────────────────────────────
// GET /api/auth/verify
// ─────────────────────────────────────────────
router.get('/verify', authMiddleware, (req, res) => {
  return res.json({ success: true, user: req.user });
});

export default router;
