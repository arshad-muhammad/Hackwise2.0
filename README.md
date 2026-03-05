# Hackwise 2.0

> **"Architect the Future of SaaS. Transform Code into Global Impact."**

A national-level SaaS hackathon platform built by **Sphere Hive** at KVG College of Engineering. This repository contains the full web application — public-facing site, team dashboard, campus ambassador system, accommodation portal, admin panel, and more.

---

## Table of Contents

- [Event Overview](#event-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Database](#database)
- [API Reference](#api-reference)
- [Campus Ambassador System](#campus-ambassador-system)
- [Registration Validation](#registration-validation)
- [Gallery System](#gallery-system)
- [Email Notifications](#email-notifications)
- [SEO Implementation](#seo-implementation)
- [Design System](#design-system)
- [Contributing](#contributing)

---

## Event Overview

| Detail | Info |
|---|---|
| **Event Name** | Hackwise 2.0 |
| **Format** | Hybrid — Online Phase + Offline Finale |
| **Organizer** | Sphere Hive at KVG College of Engineering |
| **Finale Date** | April 4–5, 2026 |
| **Venue** | KVGCE, Sullia, Karnataka |

### Prize Pool

| Rank | Prize |
|---|---|
| 🥇 Champion | ₹40,000 + Direct Job Offer + Exclusive Rewards |
| 🥈 Runner Up | ₹20,000 + Internship Offer + Exclusive Rewards |
| 🥉 Second Runner Up | Internship Offer + Exclusive Rewards |
| **Total** | **₹60,000+ & Internship Opportunities** |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/), GSAP, custom CSS |
| Database | MySQL 8 via [mysql2](https://github.com/sidorares/node-mysql2) |
| Authentication | JWT ([jose](https://github.com/panva/jose)) |
| File Storage | [Cloudinary](https://cloudinary.com/) |
| Email | [Resend](https://resend.com/) |
| Payments | [Razorpay](https://razorpay.com/) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) + Custom DB analytics |
| Icons | [Lucide React](https://lucide.dev/), [Remix Icon](https://remixicon.com/) |
| PDF | [pdf-lib](https://pdf-lib.js.org/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Project Structure

```
hackwise2.0/
├── app/
│   ├── page.js                    # Landing page
│   ├── layout.js                  # Root layout with SEO metadata
│   ├── globals.css
│   │
│   ├── accommodation/             # Accommodation booking portal
│   ├── campus-ambassador/         # CA application & dashboard
│   ├── dashboard/                 # Team dashboard & project submission
│   ├── gallery/                   # Public media gallery
│   ├── register/                  # Team registration
│   ├── verify/                    # Certificate verification
│   ├── r/[ca_code]/               # CA referral redirect pages
│   │
│   ├── admin/                     # Admin panel (auth-protected)
│   │   ├── accommodation/         # Manage accommodation bookings
│   │   ├── analytics/             # Site analytics
│   │   ├── ca/                    # Manage campus ambassadors
│   │   ├── certificates/          # Issue & manage certificates
│   │   ├── gallery/               # Approve/manage gallery uploads
│   │   ├── logs/                  # System activity logs
│   │   ├── teams/                 # Manage registered teams
│   │   └── submissions/           # Review project submissions
│   │
│   ├── api/                       # API routes (Next.js Route Handlers)
│   │   ├── accommodation/         # Booking, payment, invoice APIs
│   │   ├── admin/                 # Admin-only CRUD APIs
│   │   ├── analytics/             # Event tracking API
│   │   ├── ca/                    # Campus ambassador APIs
│   │   ├── gallery/               # Gallery upload & fetch APIs
│   │   ├── register/              # Team registration API
│   │   ├── setup-db/              # One-time database initializer
│   │   └── verify/                # Certificate verification API
│   │
│   └── components/                # Shared UI components
│       ├── Navbar.jsx
│       ├── Footer.jsx
│       ├── Background.jsx
│       ├── DecryptedText.jsx
│       ├── CountdownTimer.jsx
│       └── ...
│
├── lib/
│   ├── db.js                      # MySQL connection pool
│   ├── db-setup.js                # Table creation & migrations
│   ├── auth.js                    # JWT session helpers
│   ├── email.js                   # Resend email utilities
│   ├── cloudinary.js              # Main Cloudinary config
│   ├── cloudinary-gallery.js      # Gallery-specific Cloudinary config
│   └── utils.js                   # Shared utility functions
│
├── public/
│   └── brochure.pdf
│
├── .env.local                     # Environment variables (not committed)
├── next.config.mjs
└── package.json
```

---

## Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
# ── Database ──────────────────────────────────────────────
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=hackwise

# ── Admin ─────────────────────────────────────────────────
ADMIN_PASSWORD=your-secure-admin-password
JWT_SECRET=your-jwt-secret-key

# ── Razorpay (Payments) ───────────────────────────────────
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# ── Resend (Emails) ───────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=Hackwise 2.0 <noreply@hackwise.spherehive.in>

# ── Cloudinary (General uploads) ─────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ── Cloudinary (Gallery — separate account) ───────────────
GALLERY_CLOUDINARY_CLOUD_NAME=your-gallery-cloud-name
GALLERY_CLOUDINARY_API_KEY=your-gallery-api-key
GALLERY_CLOUDINARY_API_SECRET=your-gallery-api-secret

# ── SEO Verifications (optional) ─────────────────────────
GOOGLE_SITE_VERIFICATION=your-google-token
BING_VERIFICATION=your-bing-token
YANDEX_VERIFICATION=your-yandex-token
```

### First-Time Database Setup

After setting up environment variables, visit this URL once to create all database tables:

```
https://your-domain.com/api/setup-db
```

Expected response: `{"message":"Database initialized successfully"}`

This is safe to call multiple times — all queries use `CREATE TABLE IF NOT EXISTS`.

---

## Database

All tables are prefixed with `hw-`. The schema is defined in `lib/db-setup.js` and auto-migrates on each call to `/api/setup-db`.

### Tables Overview

| Table | Purpose |
|---|---|
| `hw-teams` | Registered hackathon teams |
| `hw-team-members` | Individual team members |
| `hw-settings` | Key-value config store (feature flags, pricing, etc.) |
| `hw-logs` | System activity log (INFO / WARN / ERROR / AUTH) |
| `hw-analytics` | Custom page-view & event tracking |
| `hw-visitors` | Anonymous visitor records |
| `hw-contact` | Contact form submissions |
| `hw-faq` | FAQ entries managed by admin |
| `hw-announcements` | Team-targeted announcements |
| `hw-chat` | Team chat messages |
| `hw-project-submissions` | Round 2 project submissions |
| `hw-certificates` | Issued certificates with verification codes |
| `hw-certificate-templates` | Visual certificate templates |
| `hw-committees` | Organizing committee groups |
| `hw-committee-members` | Individual committee members with full profiles |
| `hw-gallery-media` | Gallery images and videos |
| `hw-accommodation-queries` | Accommodation booking requests and payment records |
| `hw-ca-applications` | Campus Ambassador applications |
| `hw-ca-clicks` | CA referral link click tracking |
| `hw-ca-registrations` | Registrations attributed to CAs (from Unstop) |
| `hw-ca-tasks` | Tasks assigned to Campus Ambassadors |
| `hw-ca-task-assignments` | Many-to-many mapping of tasks to CAs |
| `hw-ca-task-submissions` | CA task submissions with review status |
| `hw-participant-registrations` | Direct participant registrations via CA |
| `hw-participant-members` | Members within participant registrations |

---

## API Reference

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/accommodation/settings` | Get accommodation pricing & availability |
| `POST` | `/api/accommodation/submit` | Submit accommodation booking |
| `POST` | `/api/accommodation/create-order` | Create Razorpay payment order |
| `POST` | `/api/accommodation/payment-callback` | Verify and record payment |
| `POST` | `/api/accommodation/payment-failed` | Record payment failure |
| `GET` | `/api/accommodation/invoice` | Download invoice PDF |
| `POST` | `/api/analytics` | Track a page view or event |
| `GET` | `/api/ca/redirect/[ca_code]` | Log a referral click and redirect |
| `POST` | `/api/ca/apply` | Submit a Campus Ambassador application |
| `POST` | `/api/ca/login` | CA authentication |
| `POST` | `/api/ca/logout` | Invalidate CA session |
| `GET` | `/api/ca/tasks` | Fetch tasks assigned to logged-in CA |
| `POST` | `/api/ca/tasks/submit` | Submit a task |
| `GET` | `/api/ca/dashboard` | CA dashboard data (tasks, registrations, leaderboard) |
| `GET` | `/api/committees` | Fetch public committee structure |
| `GET` | `/api/committee-members` | Fetch all public committee member profiles |
| `GET` | `/api/faq` | Fetch FAQ entries |
| `GET` | `/api/gallery` | Fetch approved gallery media |
| `POST` | `/api/gallery` | Upload media (pending admin approval) |
| `POST` | `/api/contact` | Submit a contact form message |
| `POST` | `/api/register` | Register a new team |
| `GET` | `/api/verify` | Verify a certificate by code |
| `GET` | `/api/setup-db` | Initialize / migrate database tables |

### Team (Authenticated) Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/team/login` | Team login |
| `POST` | `/api/team/logout` | Team logout |
| `GET` | `/api/team/dashboard` | Team dashboard data |
| `GET/POST` | `/api/team/submission` | View or submit project |
| `GET` | `/api/team/members` | List team members |
| `POST` | `/api/team/chat` | Send a chat message |

### Admin Endpoints *(require admin session)*

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Admin login |
| `GET/PUT` | `/api/admin/accommodation` | View/update accommodation bookings |
| `GET` | `/api/admin/analytics` | Site analytics data |
| `GET/POST/DELETE` | `/api/admin/ca` | Manage CA applications (approve/reject) |
| `GET/POST` | `/api/admin/ca/tasks` | Create and manage CA tasks |
| `POST` | `/api/admin/ca/tasks/assign` | Assign tasks to CAs |
| `GET/PUT` | `/api/admin/ca/tasks/submissions` | Review task submissions |
| `GET/POST/DELETE` | `/api/admin/certificates` | Manage certificates |
| `GET/POST` | `/api/admin/committees` | Manage committees |
| `GET/PUT/DELETE` | `/api/admin/committee-members` | Manage committee member profiles |
| `GET/PUT` | `/api/admin/gallery` | Approve/feature/delete gallery media |
| `GET` | `/api/admin/logs` | View system activity logs |
| `GET` | `/api/admin/queries` | View contact form queries |
| `GET` | `/api/admin/teams` | View all registered teams |
| `GET` | `/api/admin/submissions` | View all project submissions |

---

## Campus Ambassador System

The CA system manages the full lifecycle from application to performance tracking and leaderboard.

### System Flow

```
1. Student applies → hw-ca-applications (status: PENDING)
        ↓
2. Admin approves → CA code generated (e.g. KVGCE001) → status: APPROVED
        ↓
3. CA shares referral link: /r/{ca_code}
        ↓
4. User clicks → click logged in hw-ca-clicks → redirected to Unstop
        ↓
5. User registers on Unstop, enters CA code manually
        ↓
6. Admin exports Unstop data → imports into hw-ca-registrations (is_verified: false)
        ↓
7. Admin verifies registrations → is_verified: true → CA verified_registrations++
        ↓
8. Admin creates tasks → assigns to CAs → hw-ca-task-assignments
        ↓
9. CA submits task → hw-ca-task-submissions (status: PENDING)
        ↓
10. Admin reviews → APPROVED → CA approved_tasks++ → points_awarded
        ↓
11. Performance score recalculated → Leaderboard updated
        ↓
12. Top performers → is_organising_team_candidate = true
```

### CA Code Format

Codes are generated on approval using the college abbreviation followed by a zero-padded number.

```
KVGCE001, KVGCE002 ...
MIT001, MIT002 ...
```

> **Important:** CA codes are permanent. They never change after generation, even if the CA's details are updated.

### Data Models

#### `hw-ca-applications` — Applications & Status

| Field | Type | Description |
|---|---|---|
| `id` | INT PK | Auto increment |
| `name`, `email`, `phone` | VARCHAR | Identity (email & phone are unique) |
| `college`, `college_abbreviation` | VARCHAR | Used for CA code generation |
| `status` | ENUM | `PENDING` → `APPROVED` / `REJECTED` |
| `ca_code` | VARCHAR UNIQUE | Generated on approval |
| `referral_link` | VARCHAR | `/r/{ca_code}` |
| `performance_score` | INT | Calculated composite score |
| `verified_registrations` | INT | Count of verified Unstop referrals |
| `approved_tasks` | INT | Count of approved task submissions |
| `is_organising_team_candidate` | BOOL | Flagged for top performers |

#### `hw-ca-clicks` — Referral Link Tracking

Logs every click on a `/r/{ca_code}` link. Includes IP address, user agent, and referrer for conversion and fraud analysis.

#### `hw-ca-registrations` — Validated Registrations

Stores registrations imported from Unstop exports. Only `is_verified = TRUE` rows count toward a CA's score. Unique constraint on `unstop_registration_id` prevents double counting.

#### `hw-ca-tasks` — Task Definitions

| Field | Description |
|---|---|
| `task_type` | `TEXT`, `FILE`, `SCREENSHOT`, or `MIXED` |
| `points_on_completion` | Base points (default: 5) |
| `bonus_points_early` | Bonus for early submission (default: 2) |
| `early_submission_hours` | Hours before deadline to qualify for bonus (default: 24) |

#### `hw-ca-task-assignments` — Task → CA Mapping

Many-to-many join table. Unique constraint on `(task_id, ca_id)` prevents duplicate assignments. CAs only see tasks they've been assigned.

#### `hw-ca-task-submissions` — Submissions

Unique constraint on `(task_id, ca_id)` ensures one submission per task. Includes status (`PENDING` / `APPROVED` / `REJECTED`), points awarded, and admin feedback.

---

## Registration Validation

Since registrations happen on an external platform (Unstop), there is a manual validation workflow to link them to Campus Ambassadors.

### Rules

| Rule | How it Works |
|---|---|
| **No self-registration** | If participant email matches CA email → flagged as `is_self_registration = TRUE`, excluded from score |
| **No duplicates** | Unique constraint on `unstop_registration_id` — re-imports are skipped |
| **Only verified count** | Only `is_verified = TRUE` rows contribute to the CA's `verified_registrations` count |
| **Codes are permanent** | CA codes never change, so historical registrations always link correctly |

### Workflow

```
Step 1 — Export from Unstop
  Admin downloads registration CSV/Excel

Step 2 — Import to Hackwise
  Admin uploads via admin interface
  System creates hw-ca-registrations records (is_verified: false)
  Auto-flags self-registrations and skips duplicates

Step 3 — Admin Verification
  Admin reviews each unverified entry
  Checks legitimacy and correct CA code
  Marks verified or rejects

Step 4 — Performance Update
  Verified registrations increment CA's verified_registrations count
  Performance score is recalculated
  Leaderboard is updated
```

### Edge Cases

| Scenario | Handling |
|---|---|
| Participant forgot to enter CA code | Imported without CA link — admin can manually assign |
| Invalid CA code entered | Imported with `ca_id = NULL` — admin can correct |
| Multiple registrations from same email | Both stored (different `unstop_registration_id`); admin verifies legitimacy |

---

## Gallery System

The gallery uses a **separate Cloudinary account** dedicated to gallery media, isolated from general uploads.

### Features

**Public Gallery** (`/gallery`)
- Featured "Editor's Picks" in a bento grid layout
- Filterable by category: All, Day 1, Day 2, Day 3, Tech Events, Hackathon, Winners, Fun Moments
- Infinite scroll with lazy loading
- Fullscreen modal with keyboard navigation (← → Esc) and mobile swipe
- Drag-and-drop upload with progress bar (pending approval after upload)

**Admin Gallery** (`/admin/gallery`)
- View all media including pending uploads
- Approve / reject / feature / delete media
- Filter by approval status
- Changes reflect on the public gallery immediately

### Media Requirements

| Type | Formats | Max Size |
|---|---|---|
| Images | JPG, PNG, WebP | 10 MB |
| Videos | MP4, WebM | 30 MB |

All uploads require admin approval before appearing publicly.

### Gallery API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/gallery` | Fetch approved media (supports `category`, `page`, `limit`, `featured` params) |
| `POST` | `/api/gallery` | Upload media (form data: `file`, `caption`, `category`, `teamName`) |
| `DELETE` | `/api/gallery?id={id}` | Delete media by ID |
| `GET` | `/api/admin/gallery` | All media including unapproved *(admin only)* |
| `PUT` | `/api/admin/gallery` | Update approval, featured flag, or category *(admin only)* |

---

## Email Notifications

Emails are sent using [Resend](https://resend.com). Email failures are non-blocking — if an email fails, the underlying operation (CA approval, task assignment) still succeeds.

### Triggers

| Email | When Sent | Key Details Included |
|---|---|---|
| **CA Approval** | Admin approves a CA application | CA's name, generated CA code, dashboard login link |
| **Task Assignment** | Admin creates a task with assignments | Task title, description, deadline, points, bonus points |

### Setup

1. Sign up at [resend.com](https://resend.com) and create an API key
2. In Resend dashboard, verify your domain (e.g. `hackwise.spherehive.in`)
3. Add to your environment:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=Hackwise 2.0 <noreply@hackwise.spherehive.in>
```

### Behavior

- **Non-blocking** — email failures are logged to `hw-logs` but never block API responses
- **Parallel** — when assigning tasks to multiple CAs, all emails are sent at the same time
- **Graceful fallback** — if `RESEND_API_KEY` is missing, operations succeed silently without sending emails

### Troubleshooting Emails

| Problem | Solution |
|---|---|
| Emails not sending | Check `RESEND_API_KEY` is set and valid |
| Emails sent but not received | Verify domain DNS in Resend dashboard |
| Wrong sender name/address | Update `RESEND_FROM_EMAIL` env variable |
| Rate limits hit | Free tier allows 3,000 emails/month; upgrade as needed |
| Logs show failures | Check `hw-logs` table for `level = 'WARN'` entries |

---

## SEO Implementation

### What's Implemented

**Page Metadata**
- Every public page has a unique `<title>`, `<meta description>`, and keyword list
- Campus Ambassador, Registration, and key landing pages have enhanced SEO
- Private pages (dashboards, login pages, referral redirects) are set to `noindex`

**Structured Data (JSON-LD)**
- `EducationalOrganization` schema on the CA page
- `FAQPage` schema on the CA page
- `Event` schema on the registration page (start/end dates, location, organizer)

**Sitemap** (`/sitemap.xml`)
- Auto-generated via `app/sitemap.js`
- Includes priority levels (Homepage: 1.0, CA & Register: 0.9, others: 0.5–0.8)
- Change frequency hints for crawlers

**Robots** (`/robots.txt`)
- Auto-generated via `app/robots.js`
- Blocks: `/admin/`, `/dashboard/`, `/api/`, CA dashboards, success pages, referral pages
- Allows all public-facing content

**Open Graph & Twitter Cards**
- All pages include `og:title`, `og:description`, `og:image`, `og:type`
- Twitter Card metadata for large image previews
- 1200×630 OG images for best social sharing appearance

**Verification Support**
- Add `GOOGLE_SITE_VERIFICATION`, `BING_VERIFICATION`, and `YANDEX_VERIFICATION` env vars to enable Search Console verification without touching code

### SEO Keywords Strategy

**Primary:** Campus Ambassador, CA Program, Hackwise 2.0, Sphere Hive, KVGCE, Hackathon Registration, National Hackathon India

**Long-tail:** "Become Campus Ambassador Hackwise 2.0", "Student Ambassador Program India", "Hackathon CA Registration"

**Location-based:** KVGCE, Sullia, Karnataka Hackathon, Bangalore Hackathon

---

## Design System

Hackwise 2.0 uses a consistent cyberpunk / dark-tech visual language throughout.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#0A090F` | All page backgrounds |
| Orange 500 | `#f97316` | Primary actions, accents, headings |
| Orange 500/50 | `rgba(249,115,22,0.5)` | Button borders, hover effects |
| Orange 500/20 | `rgba(249,115,22,0.2)` | Card hover glows |
| White | `#ffffff` | Primary text |
| White/80 | `rgba(255,255,255,0.8)` | Body text |
| White/60 | `rgba(255,255,255,0.6)` | Secondary text |
| White/20 | `rgba(255,255,255,0.2)` | Borders, dividers |
| Green 500 | `#22c55e` | Live / active indicators (pulsing dot) |

### Typography

| Style | Font | Class | Size |
|---|---|---|---|
| Display headings | Hackwise (custom) | `font-hackwise` | `text-4xl` – `text-8xl` |
| Technical labels | Roboto Mono | `font-mono` | `text-xs` – `text-sm` |
| Body text | Inter | `font-sans` | `text-sm` – `text-base` |
| Large subheadings | Space Grotesk | `font-display` | `text-xl` – `text-3xl` |

### Clip Path — Beveled Corners

All cards and buttons use CSS `clip-path` to create the signature cut-corner look:

```css
/* Cards — 20px corner cut */
clip-path: polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px);

/* Buttons — 10px corner cut */
clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
```

### Card Structure (Multi-layer)

```jsx
<div className="relative group">
  {/* Layer 1 — hover glow */}
  <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

  {/* Layer 2 — border */}
  <div className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
       style={{ clipPath: CARD_CLIP }} />

  {/* Layer 3 — content */}
  <div className="relative bg-[#0A090F] p-8"
       style={{ clipPath: CARD_CLIP }}>
    {/* content here */}
  </div>
</div>
```

### Button Variants

| Variant | Use Case | Style |
|---|---|---|
| **Primary** | Main CTA | Solid `bg-orange-500`, black text, glow shadow |
| **Outline** | Secondary action | `bg-orange-500/30` border, dark interior, orange text |
| **Ghost** | Navbar | Compact outline, `px-6 py-2` |
| **Card Action** | In-card CTAs | Three-layer animated border, `DecryptedText` label |

### Shadows

```css
/* Card drop shadow */
filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));

/* Button glow */
box-shadow: 0 0 20px rgba(249,115,22,0.4);

/* Button hover glow */
box-shadow: 0 0 30px rgba(249,115,22,0.6);
```

---

## Contributing

Contributions are welcome. Please fork the repository and open a pull request.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a PR

---

## License

This project is licensed under the **MIT License**.

---

*Built with ❤️ by [Muhammad Arshad R A](https://spherehive.in/member/sh001)*
