# 🏷️ NFC Business Card Platform

A premium, multi-tenant NFC business card landing page system with admin dashboard.

## Features

- 🌐 **Public Landing Page** — Beautiful, mobile-first card page per business
- 🔒 **Hidden Admin Access** — Triple-tap footer to open admin login
- 🎨 **Full Customization** — Colors, fonts, layout, theme, all social links
- 👁️ **Live Preview** — See changes instantly before saving
- 🏢 **Multi-tenant** — Unlimited business pages at `/p/:pageId`
- 💾 **Persistent Storage** — Supabase PostgreSQL + File Storage

---

## Quick Start

### Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) account

---

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In your project, go to **SQL Editor** and run the contents of `backend/supabase-schema.sql`.
3. Go to **Storage** → Create a new bucket named `logos` → Make it **Public**.
4. Note your **Project URL** and **Service Role Key** (from Settings → API).

---

## Step 2: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
JWT_SECRET=some-very-long-random-string-at-least-64-chars
ADMIN_EMAIL=admin@yoursite.com
ADMIN_PASSWORD=your_secure_password
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

The API runs at `http://localhost:4000`.

---

## Step 3: Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...  (use the anon/public key here)
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Step 4: Create Your First Business Page

1. Open `http://localhost:5173` → redirects to demo page (you'll see "not found").
2. Go to your first business page URL: `http://localhost:5173/p/mybusiness`
3. Triple-tap the "Powered by" text at the bottom to open admin login.
4. Log in with the email/password you set in `.env`.
5. In the Admin Dashboard → **Pages** tab → **Create New Page** → enter `mybusiness`.
6. Customize everything and save!

---

## URLs

| URL | Description |
|-----|-------------|
| `/p/:pageId` | Public business landing page |
| `/admin/login` | Admin login (also via triple-tap) |
| `/admin` | Admin dashboard (protected) |

---

## Deployment

### Deploy Backend (Railway / Render)

1. Push `backend/` to a Git repo.
2. Deploy on [Railway](https://railway.app) or [Render](https://render.com).
3. Add all env vars from `.env` in the platform's settings.

### Deploy Frontend (Vercel / Netlify)

1. Push `frontend/` to a Git repo.
2. Deploy on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Set env vars: `VITE_API_BASE_URL=https://your-backend.railway.app`
4. Set build command: `npm run build`, output: `dist`.

---

## Architecture

```
Browser → React Frontend (Vite)
              ↓ /api/* proxy
         Express Backend (Node.js)
              ↓
         Supabase (PostgreSQL + Storage)
```

### Database Schema

**`business_pages` table** — one row per business:
- `page_id` — unique slug (e.g. `business001`)
- Business details: `business_name`, `logo_url`, `welcome_message`, `footer_brand`
- Social toggles & URLs: google, whatsapp, instagram
- Design: `bg_color`, `btn_color`, `btn_style`, `text_color`, `font`, `border_radius`, `layout`, `theme`

---

## Security

- Admin password never stored in DB — only in `.env`
- JWT tokens stored in httpOnly cookies
- Login rate-limited (5 attempts / 15 min)
- Supabase RLS: public can only read, writes require service role
- No admin UI exposed on public pages

---

## Adding More Businesses

In Admin Dashboard → **Pages** tab → **Create New Page**:
- Enter a unique Page ID (e.g. `salon-xyz`, `cafe-abc`)
- Their page is live at `/p/salon-xyz`

Each business gets completely separate settings, colors, and social links.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Routing | React Router v6 |
| Icons | Lucide React |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Auth | JWT + Supabase Auth |
| Deployment | Vercel + Railway (recommended) |
