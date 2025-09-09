# URGENT: Visibility Settings Database Migration - HANDOFF DOCUMENT

## CRITICAL - NEEDS IMMEDIATE ACTION (7 min build time)

### What Was Done:
- Vertical visibility settings were moved from localStorage to database
- Complete API and database schema created by sub-agent
- Admin panel now saves to database instead of localStorage
- Frontend fetches settings from database (affects ALL visitors)

### IMMEDIATE ACTIONS NEEDED:

## 1. Run Database Migration (FIRST!)
```bash
npm run db:migrate
```

If that doesn't work, try:
```bash
npx drizzle-kit push:pg
```

## 2. Push to GitHub
```bash
git add -A
git commit -m "feat: Database-backed vertical visibility settings

- Moved visibility settings from localStorage to database
- Created vertical_visibility_settings table
- Added API endpoint /api/vertical-visibility
- Admin changes now affect all website visitors
- Settings persist across sessions and devices

Healthcare: All sections hidden
Hospitality: Staff and blog hidden, rest visible"

git push
```

## 3. Verify Deployment
The build will take ~7 minutes on Vercel. Once deployed:
- Settings should persist in admin panel
- Changes affect all website visitors
- Healthcare shows NO sections (all hidden)
- Hospitality shows testimonials, case studies, add-ons (but NOT staff/blog)

### FILES CREATED/MODIFIED:
- `/api/vertical-visibility.ts` - New API endpoint
- `/src/db/schema.ts` - Added table definition
- `/src/utils/verticalVisibility.ts` - Database integration
- `/src/utils/verticalVisibilityCache.ts` - Caching system
- `/src/hooks/useVerticalVisibility.ts` - React hook
- `/src/components/admin/shared/VerticalVisibilitySettings.tsx` - Updated to use database
- `/database/migrations/002_add_vertical_visibility_settings.sql` - Migration file

### CURRENT SETTINGS IN DATABASE:
- **Healthcare**: ALL hidden (staff, blog, testimonials, case studies, add-ons)
- **Hospitality**: Staff & blog hidden, rest visible
- **Tech/Athletics**: All visible (defaults)

### IF ISSUES OCCUR:
- System has fallbacks to localStorage
- Won't break if database fails
- Check Vercel logs for database connection issues
- Auth token for admin: `inteligencia-admin-2025`

### DATABASE TABLE STRUCTURE:
```sql
vertical_visibility_settings (
  id SERIAL PRIMARY KEY,
  vertical VARCHAR(50) UNIQUE NOT NULL,
  show_staff_section BOOLEAN DEFAULT true,
  show_blog BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT true,
  show_case_studies BOOLEAN DEFAULT true,
  show_optional_add_ons BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

USER NEEDS THIS DEPLOYED ASAP!