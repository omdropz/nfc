import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Allowed characters for page_id: alphanumeric and hyphens only
const PAGE_ID_REGEX = /^[a-zA-Z0-9-]+$/;

// Validate that a URL starts with http:// or https://
function isValidUrl(url) {
  if (!url || url === '') return true; // empty is acceptable (feature disabled)
  return /^https?:\/\/.+/.test(url);
}

// Validate whatsapp_number: optional leading +, then digits only
function isValidWhatsapp(num) {
  if (!num || num === '') return true;
  return /^\+?\d+$/.test(num);
}

// ─────────────────────────────────────────────
// GET /api/pages  (protected) — list all pages
// ─────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('business_pages')
      .select('page_id, business_name, logo_url, created_at')
      .order('created_at', { ascending: false });

    if (error) return next(error);
    return res.json({ success: true, pages: data });
  } catch (err) {
    return next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/pages/:pageId  (public) — get one page
// ─────────────────────────────────────────────
router.get('/:pageId', async (req, res, next) => {
  try {
    const { pageId } = req.params;

    const { data, error } = await supabase
      .from('business_pages')
      .select('*')
      .eq('page_id', pageId)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }

    return res.json({ success: true, page: data });
  } catch (err) {
    return next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/pages  (protected) — create a page
// ─────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { page_id, business_name } = req.body;

    if (!page_id || !business_name) {
      return res.status(400).json({ success: false, message: 'page_id and business_name are required.' });
    }

    if (!PAGE_ID_REGEX.test(page_id)) {
      return res.status(400).json({
        success: false,
        message: 'page_id may only contain letters, numbers, and hyphens.',
      });
    }

    const newRecord = {
      id: uuidv4(),
      page_id,
      business_name,
      logo_url: '',
      welcome_message: 'Welcome! Tap a button to connect with us.',
      footer_brand: 'NFC Cards',
      google_review_enabled: true,
      google_review_url: '',
      google_review_text: 'Leave a Review',
      whatsapp_enabled: true,
      whatsapp_number: '',
      whatsapp_message: 'Hello! I found you via your NFC card.',
      whatsapp_text: 'Chat on WhatsApp',
      instagram_enabled: true,
      instagram_url: '',
      instagram_text: 'Follow on Instagram',
      bg_color: '#f8fafc',
      btn_color: '#6366f1',
      btn_style: 'solid',
      text_color: '#1e293b',
      font: 'Inter',
      border_radius: 'rounded-2xl',
      layout: 'centered',
      theme: 'light',
    };

    const { data, error } = await supabase
      .from('business_pages')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'A page with that page_id already exists.' });
      }
      return next(error);
    }

    return res.status(201).json({ success: true, page: data });
  } catch (err) {
    return next(err);
  }
});

// ─────────────────────────────────────────────
// PUT /api/pages/:pageId  (protected) — update a page
// ─────────────────────────────────────────────
router.put('/:pageId', authMiddleware, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const updates = { ...req.body };

    // Strip fields that must not be overwritten via this endpoint
    delete updates.id;
    delete updates.page_id;
    delete updates.created_at;

    // Validate URLs
    const urlFields = ['google_review_url', 'instagram_url'];
    for (const field of urlFields) {
      if (field in updates && !isValidUrl(updates[field])) {
        return res.status(400).json({
          success: false,
          message: `${field} must start with http:// or https://.`,
        });
      }
    }

    // Validate whatsapp number
    if ('whatsapp_number' in updates && !isValidWhatsapp(updates.whatsapp_number)) {
      return res.status(400).json({
        success: false,
        message: 'whatsapp_number must contain only digits and an optional leading +.',
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('business_pages')
      .update(updates)
      .eq('page_id', pageId)
      .select()
      .single();

    if (error || !data) {
      if (!data) return res.status(404).json({ success: false, message: 'Page not found.' });
      return next(error);
    }

    return res.json({ success: true, page: data });
  } catch (err) {
    return next(err);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/pages/:pageId  (protected)
// ─────────────────────────────────────────────
router.delete('/:pageId', authMiddleware, async (req, res, next) => {
  try {
    const { pageId } = req.params;

    const { error } = await supabase
      .from('business_pages')
      .delete()
      .eq('page_id', pageId);

    if (error) return next(error);

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
