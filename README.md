# Nilavi | Aesthetics & Beauty Studio (MERN Stack + CRM)

A full-stack **MERN** (MongoDB, Express, React, Node.js) web application and studio **CRM**, built from the design and interaction specifications of `nilave.html`.

---

## ✨ Features & Architecture

### 1. Client-Facing Studio Website
- **Design System & Aesthetics**: Signature Plum (`#1B0830`, `#2A0E47`, `#51227F`), Gold Gradients (`#9A7220` → `#E9D296` → `#8A651B`), Bodoni Moda display serif & Manrope body typography, and delicate paper texture overlay.
- **Dynamic Site Branding & Images**: Directly controllable via the Admin CRM — customize the studio brand name, custom image logo, hero photograph, headline copy, and service images without modifying any code.
- **Hero & Curated Imagery**: High-resolution, aesthetic photography for skin care, hair styling, nails, bridal artistry, and wellness treatments.
- **Interactive Service Accordion**: Expanding service panels (*Facials*, *Hair*, *Nails*, *Bridal*, *Wellness*) linked to the booking wizard with starting prices.
- **The Nilavi Ritual**: 4-phase visual journey (*Listen, Prepare, Treat, Glow*) with minimalist icons.
- **Gallery & Lightbox**: Interactive category filter chips (*All, Skin, Hair, Nails, Bridal*), responsive masonry grid with real client photography, and fullscreen lightbox modal with previous/next navigation and keyboard shortcuts (`Escape`, `ArrowLeft`, `ArrowRight`).
- **Kind Words / Reviews**: 5-star testimonials dynamically fetched from `/api/reviews`.
- **3-Step Real-Time Booking Wizard**:
  - **Step 1**: Treatment selector with live pricing and durations.
  - **Step 2**: 14-day interactive date picker + time slot groups with automatic past-time detection, Sunday closure rules, and booked status.
  - **Step 3**: Client name, phone number, and allergy/occasion notes with floating label inputs and live validation.
  - **Confirmation**: Celebratory particle star animations, booking summary, and direct WhatsApp confirmation link.
  - **Live Sticky Summary**: Real-time visit card dynamically tracking chosen treatment, date, time slot, and price.
- **Contact & Inquiries**: Studio address, phone, email, WhatsApp card, and validated message form with topic selection.
- **Clean Public Page**: No admin or CRM buttons appear on the client-facing website.

---

### 2. Redesigned Professional Admin CRM (Private URL: `/admin`)
Access exclusively via the private URL: **`http://localhost:5000/admin`** (or `http://localhost:3000/admin` in dev).

- **Modern Executive UI**: Clean professional sans-serif typography (`Inter` / system font), crisp tabular layouts, and a dedicated **left sidebar** replacing the old horizontal top bar.
- **Redesigned Admin Login Page**: Split-panel layout with ambient branding, username & password icons, password visibility toggle, session memory, and 1-click demo filler.
- **Executive Metrics**:
  - Total Bookings
  - Pending Action count
  - Confirmed Appointments
  - Total Pipeline Leads
  - Total Booked Revenue (`₹`)
- **Proper Lead Management & History Pipeline**:
  - Segmented source controls: **All Leads**, **WhatsApp Leads**, **Website Inquiries**, and **Phone / Walk-in Leads**.
  - **Detailed Lead Drawer & Modal**: Inspect complete contact details, inquiry topic, client's message, and current status.
  - **Interaction History Timeline**: Full chronological audit log displaying lead creation, status changes, and staff follow-ups with timestamps and author tags.
  - **Add Interaction Log**: Front desk staff can record notes, phone calls, or consultations directly onto any lead.
  - **Action Buttons**: One-click *Message on WhatsApp*, *Call Client*, and *Convert to Appointment* (prefills scheduling modal).
  - 📥 Export leads to CSV spreadsheet.
- **Bookings & Appointments CRM**:
  - Filter by status (`All`, `Pending`, `Confirmed`, `Completed`, `Cancelled`).
  - Search by client name, phone number, or service.
  - **Reschedule / Edit Booking**: Change client appointment date, time slot, service, or notes.
  - **Customizable WhatsApp Templates**:
    1. *Booking Confirmation*
    2. *24-Hour Appointment Reminder*
    3. *Post-Treatment Aftercare & Review Request*
  - **📥 Export to CSV**: One-click download of appointments into spreadsheet format.
  - **+ Add Booking**: Book walk-in or telephone clients into the calendar.
- **Clients Directory (Customer CRM)**:
  - Automatically aggregates client profiles from bookings and inquiries.
  - Tracks visit count, lifetime spend (`₹`), client tags (`VIP`, `Regular`, `Bridal Prospect`), and customer preferences.
  - 📥 Export customer list to CSV.
- **Site Media & Branding Customizer**:
  - Update **Studio Brand Logo** (text or custom image URL) with live preview.
  - Update **Hero Image URL**, tagline, and headline copy in real time.
  - Update **Services Section Photos** for facials, hair, nails, bridal, and wellness.
  - Changes instantly update the live public website upon clicking *"Save All Media Changes"*.
- **Service Menu Catalog**:
  - Inspect, edit pricing/duration, toggle active status, and add new treatments.
- **Reviews & Testimonials Management**:
  - Approve, feature, add, or delete client testimonials appearing on the website.

---

### 3. Dual-Mode Database Resilience
- **MongoDB + Mongoose**: Connects directly to `MONGODB_URI` (e.g., local MongoDB or MongoDB Atlas).
- **Persistent JSON Fallback**: If MongoDB is not active or unreachable, the server automatically operates via a persistent local JSON store in `server/data/nilavi_db.json`. Zero setup hurdles, zero downtime, and data persists across restarts!

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Running the Application

#### Option A: Full Development Mode (Concurrent Server & Client)
1. Start the backend API server:
   ```bash
   npm run server
   ```
   *(Running on http://localhost:5000)*

2. In a second terminal, start the Vite client:
   ```bash
   npm run client
   ```
   *(Running on http://localhost:3000 with hot module reloading and API proxy)*

#### Option B: Production Mode (Unified Server)
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the unified production server:
   ```bash
   npm run start
   ```
   - Client Webpage: `http://localhost:5000/`
   - Admin CRM Portal: `http://localhost:5000/admin`

---

## ☁️ Deploying to Vercel (Unified Client & Server)

This repository is pre-configured for **zero-friction 1-click deployment on Vercel**, hosting both the Vite React frontend and Express API serverless functions under a single domain without CORS or routing issues.

### Architecture on Vercel
- **Frontend**: Built from `client/` into `client/dist`, served globally via Vercel's high-speed Edge CDN with SPA routing rewrites.
- **Backend API**: The Express application runs as a Vercel Serverless Function via `api/index.js`, receiving all `/api/*` traffic automatically.
- **Database**:
  - Out of the box, loads initial seed data (`server/data/nilavi_db.json`) and writes to `/tmp/nilavi_db.json` with memory caching.
  - For persistent multi-region cloud storage across serverless instances, add your MongoDB Atlas connection string as `MONGODB_URI` in Vercel.

### Deploy Steps

#### Method 1: Via Vercel Web Dashboard (Recommended)
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/new), click **"Add New Project"** and import the repository.
3. Keep the **Root Directory** as `./` (default).
4. The build settings are auto-detected from `vercel.json`:
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`
5. *(Optional)* In **Environment Variables**, set:
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/nilavi?retryWrites=true&w=majority`
   - `ADMIN_USER`: custom admin username (defaults to `admin`)
   - `ADMIN_PASS`: custom admin password (defaults to `nilavi2026`)
6. Click **Deploy**.

#### Method 2: Via Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the interactive prompts to link and deploy.

---

## 🔐 Admin & CRM Credentials
- **Dedicated Admin URL**: `http://localhost:5000/admin` (or `https://<your-vercel-domain>/admin`)
- **Username**: `admin`
- **Password**: `nilavi2026`
