# Gallery Setup Guide

This guide explains how to set up the premium gallery system for Hackwise 2.0.

## Overview

The gallery system uses a **separate Cloudinary account** specifically for gallery media storage and delivery. This ensures isolation from other media uploads in the system.

## Environment Variables

Add these environment variables to your `.env.local` or production environment:

```env
# Gallery Cloudinary Configuration (Separate Account)
GALLERY_CLOUDINARY_CLOUD_NAME=your-gallery-cloud-name
GALLERY_CLOUDINARY_API_KEY=your-gallery-api-key
GALLERY_CLOUDINARY_API_SECRET=your-gallery-api-secret
```

**Important:** These are different from the main Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

## Database Setup

Run the database setup to create the gallery media table:

```bash
# Visit this endpoint or call the setup function
GET /api/setup-db
```

This will create the `hw-gallery-media` table with the following structure:
- Media storage (Cloudinary public ID and URL)
- Media type (image/video)
- Caption, category, team name
- Approval status (pending/approved)
- Featured flag
- Metadata (dimensions, duration, file size)

## Features

### Public Gallery (`/gallery`)

1. **Hero Section**
   - Animated counters (Hackers, Hours, Prize Pool, Photos)
   - Featured media showcase
   - Premium dark theme

2. **Editor's Picks**
   - Displays admin-flagged featured media
   - Bento grid layout
   - Hover effects with crimson glow

3. **Filter Bar (Sticky)**
   - Categories: All, Day 1, Day 2, Day 3, Tech Events, Hackathon, Winners, Fun Moments
   - Animated underline
   - Media count badges

4. **Main Gallery Grid**
   - Bento + Masonry layout
   - 4 columns desktop, 2 tablet, 1 mobile
   - Infinite scroll with lazy loading
   - Blur placeholders
   - Hover lift animations

5. **Upload Section**
   - Drag & drop interface
   - File validation (10MB images, 30MB videos)
   - Caption, category, team name inputs
   - Progress bar
   - Pending approval badge

6. **Fullscreen Modal**
   - Click any media to open fullscreen
   - Keyboard navigation (Arrow keys, Escape)
   - Swipe support (mobile)
   - Download option
   - Background blur

### Admin Gallery Management (`/admin/gallery`)

1. **Media Management**
   - View all media (approved and pending)
   - Search by caption, team, category
   - Filter by approval status

2. **Actions**
   - Approve/reject media
   - Feature/unfeature media
   - Delete media (removes from Cloudinary and database)

3. **Features**
   - Grid view with previews
   - Status badges
   - Bulk operations ready

## File Structure

```
app/
  gallery/
    page.js              # Main gallery page
  admin/
    gallery/
      page.js            # Admin gallery management
  api/
    gallery/
      route.js           # Public gallery API (GET, POST, DELETE)
    admin/
      gallery/
        route.js         # Admin gallery API (GET, PUT)

lib/
  cloudinary-gallery.js  # Gallery-specific Cloudinary config
  db-setup.js            # Database schema (includes gallery table)
```

## API Endpoints

### Public Endpoints

- `GET /api/gallery` - Fetch gallery media
  - Query params: `category`, `page`, `limit`, `featured`
  - Returns: Media array, pagination, stats

- `POST /api/gallery` - Upload media
  - Form data: `file`, `caption`, `category`, `teamName`
  - Returns: Uploaded media info (pending approval)

- `DELETE /api/gallery?id={id}` - Delete media
  - Requires: Media ID
  - Returns: Success status

### Admin Endpoints

- `GET /api/admin/gallery` - Get all media (including unapproved)
  - Query params: `status`, `page`, `limit`
  - Requires: Admin authentication

- `PUT /api/admin/gallery` - Update media
  - Body: `{ id, is_approved, is_featured, category }`
  - Requires: Admin authentication

## Usage

### Uploading Media

1. Visit `/gallery`
2. Click "Upload" button
3. Drag & drop or browse for file
4. Fill in caption, category, team name (optional)
5. Submit - media will be pending approval

### Managing Media (Admin)

1. Visit `/admin/gallery`
2. Use filters to find media
3. Approve/reject, feature, or delete media
4. Changes reflect immediately on public gallery

## Media Requirements

- **Images**: JPG, PNG, WebP (max 10MB)
- **Videos**: MP4, WebM (max 30MB)
- All uploads require admin approval before appearing publicly

## Performance Features

- Lazy loading images
- CDN delivery via Cloudinary
- Optimized thumbnails
- Proper video streaming
- Compressed delivery
- Infinite scroll
- Blur placeholders (no layout shift)

## Security

- All uploads require approval
- Admin-only delete functionality
- File type and size validation
- Separate Cloudinary account isolation

## Customization

The gallery uses:
- Framer Motion for animations
- Tailwind CSS for styling
- Dark theme with orange accents
- Premium spacing and typography

To customize colors, edit the Tailwind classes in `app/gallery/page.js`.

## Troubleshooting

### Gallery not loading
- Check Gallery Cloudinary credentials
- Verify database table exists
- Check browser console for errors

### Uploads failing
- Verify file size and type
- Check Gallery Cloudinary configuration
- Ensure API route is accessible

### Admin can't access
- Verify admin session cookie
- Check authentication middleware
- Ensure admin is logged in

## Support

For issues or questions, check:
1. Environment variables are set correctly
2. Database table exists
3. Cloudinary account is active
4. Admin session is valid

