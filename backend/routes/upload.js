import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../supabase.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// ─────────────────────────────────────────────
// Multer — in-memory storage, image files only, max 5 MB
// ─────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  },
});

// ─────────────────────────────────────────────
// POST /api/upload/:pageId  (protected)
// ─────────────────────────────────────────────
router.post(
  '/:pageId',
  authMiddleware,
  (req, res, next) => {
    // Run multer as a one-off middleware so we can send proper JSON errors
    upload.single('logo')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File exceeds the 5 MB limit.' });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      return next();
    });
  },
  async (req, res, next) => {
    try {
      const { pageId } = req.params;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
      }

      const { buffer, originalname, mimetype } = req.file;
      const timestamp = Date.now();
      const storagePath = `${pageId}/${timestamp}-${originalname}`;

      // Upload to Supabase Storage bucket "logos"
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(storagePath, buffer, {
          contentType: mimetype,
          upsert: true,
        });

      if (uploadError) {
        return next(uploadError);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(storagePath);

      const logo_url = urlData.publicUrl;

      // Update the business_pages record
      const { error: updateError } = await supabase
        .from('business_pages')
        .update({ logo_url, updated_at: new Date().toISOString() })
        .eq('page_id', pageId);

      if (updateError) return next(updateError);

      return res.json({ success: true, logo_url });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
