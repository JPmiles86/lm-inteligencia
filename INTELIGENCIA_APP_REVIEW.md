# Inteligencia App Systematic Review

## Executive Summary

This document provides a comprehensive review of the Inteligencia multi-industry marketing platform, analyzing the structure, content differences between verticals, and identifying what content is universal vs. custom.

## App Architecture Overview

### Current Verticals
The app currently supports 4 industry verticals:
1. **Hotels & Hospitality** (`/hotels`) - hospitality
2. **Restaurants & Food Service** (`/restaurants`) - foodservice  
3. **Healthcare** (`/dental`) - healthcare
4. **Sports & Recreation** (`/sports`) - athletics

### Key Technical Components
- **Routing**: Uses React Router with industry-based URL paths
- **Industry Detection**: `industryMapping.ts` handles URL-to-industry mapping
- **Configuration**: `industry-configs.ts` contains all industry-specific content
- **Universal Content**: `universal-content.ts` contains shared content across all verticals

## Hotels Vertical Analysis (Gold Standard)

The Hotels vertical has been recently updated by the client and represents the desired state for all verticals. Key features include:

### 1. **Services Structure** (7 Core Services)
- Hotels Ad Management
- Meta (FB/IG) Advertising
- Email Marketing & Funnels
- Marketing Strategy Consulting
- Event/Launch Campaigns
- OTA Optimization & Demand Generation
- Restaurant Marketing

### 2. **Pricing Structure**
Three main tiers with optional add-ons:
- **Starter Hospitality**: $1,500/month
- **Growth Hospitality**: $3,000/month (Recommended)
- **Pro+ Hospitality**: $5,500/month+

**Add-Ons (A La Carte)** - NEW FEATURE:
- Landing Page Build: $300
- Email Funnel Setup: $950
- Ad Creative Design: $250/ad set
- Hospitality Marketing Audit: $399

### 3. **Content Enhancements**
- Video backgrounds (desktop and mobile versions)
- Detailed service descriptions with key benefits
- Client testimonials with company URLs
- Stats showing ROI (40% increase in direct bookings, etc.)
- Comprehensive FAQ section
- Office hours information
- Detailed contact form with business types, budgets, timelines

### 4. **Services Page Updates**
- Hero section with gradient background
- SimplifiedPricingSection component showing pricing early
- 7 core services displayed in grid format
- Each service includes icon, description, and 4 feature bullets

## Comparison with Other Verticals

### Food Service Vertical
**Similarities:**
- Same pricing tiers ($1,500, $3,000, $5,500)
- Similar structure for services
- Has testimonials and case studies

**Differences:**
- Only 3 main services on homepage (vs 7 for hotels)
- No add-on pricing section
- Different service focus (Local SEO, Delivery Platform Management)
- No video backgrounds configured

### Healthcare Vertical  
**Similarities:**
- Same pricing structure
- Similar page layouts
- Has testimonials

**Differences:**
- Only 3 main services on homepage
- HIPAA compliance emphasis
- Different service names (Patient Acquisition vs Hotel Ads)
- No add-on pricing

### Athletics Vertical
**Similarities:**
- Same pricing tiers
- Similar structure

**Differences:**
- Only 3 main services displayed
- Focus on tournaments and membership
- Different terminology (Facility Basics vs Starter)
- No add-on pricing

## Universal vs Custom Content

### Universal Content (Shared Across All Verticals)
Located in `universal-content.ts`:
- Navigation menu structure
- About page content (Laurie's bio, company values, team)
- Footer structure
- Core company values
- Team member profiles

### Custom Content (Per Vertical)
Located in `industry-configs.ts`:
- Hero titles and subtitles
- Service offerings and descriptions
- Pricing plan names and descriptions
- Testimonials
- Case studies
- Industry-specific terminology
- Contact form options (business types, etc.)
- FAQ content
- Video backgrounds

## Key Findings & Recommendations

### 1. **Service Display Inconsistency**
- Hotels shows 7 services, others show only 3
- Recommendation: Update all verticals to show 7 industry-specific services

### 2. **Missing Add-On Pricing**
- Only Hotels vertical has the add-on pricing section
- Recommendation: Add industry-specific add-ons for each vertical

### 3. **Video Backgrounds**
- Only Hotels has video URLs configured
- Other verticals reference the same YouTube URL as placeholder
- Recommendation: Either add videos for each vertical or remove the placeholder

### 4. **Services Page Structure**
- Hotels has custom service grid, others use default
- Recommendation: Standardize the services page structure across all verticals

### 5. **Content Depth**
- Hotels has much more detailed content (FAQs, office hours, etc.)
- Recommendation: Add similar depth to other verticals

### 6. **Pricing Naming**
- Hotels uses "Starter Hospitality", "Growth Hospitality", etc.
- Athletics uses "Facility Basics", "Elite Facility", etc.
- Others use generic "Essential Package", "Professional Package"
- Recommendation: Standardize naming convention

## Required Updates for New Verticals

When adding or updating verticals, ensure:

1. **Landing Page Updates**
   - Update industries array in `LandingArea.tsx`
   - Update industry mapping in `industryMapping.ts`
   - Add new industry configuration in `industry-configs.ts`

2. **Content Requirements**
   - 7 core services with icons and descriptions
   - 3 pricing tiers with industry-specific names
   - Add-on pricing options
   - At least 3 testimonials
   - 2+ case studies
   - Industry-specific FAQ (4+ questions)
   - Contact form customization (business types, etc.)

3. **Visual Assets**
   - Service icons/images
   - Team photos (if industry-specific team members)
   - Case study images
   - Video backgrounds (optional but recommended)

## Next Steps

1. Await client's new vertical information
2. Create migration plan for updating existing verticals
3. Ensure all verticals match the Hotels standard
4. Update universal content if needed
5. Test all changes thoroughly before deployment