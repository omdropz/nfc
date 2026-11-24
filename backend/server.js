import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.js';
import pagesRouter from './routes/pages.js';
import uploadRouter from './routes/upload.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ─────────────────────────────────────────────
// Body parsing & cookies
// ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// Auth — login / logout / verify (rate-limiting applied inside the router)
app.use('/api/auth', authRouter);

// Pages — GET /:pageId is public; all others are protected via authMiddleware
// Protection is applied per-method inside the router itself.
app.use('/api/pages', pagesRouter);

// Upload — all routes protected (applied inside the router)
app.use('/api/upload', uploadRouter);

// ─────────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message || 'An unexpected error occurred.';

  res.status(status).json({ success: false, message });
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 NFC Backend running on http://localhost:${PORT}`);
  console.log(`   Frontend origin : ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`   Environment     : ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
