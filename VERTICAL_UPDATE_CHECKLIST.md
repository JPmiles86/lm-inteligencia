# Vertical Update Checklist

## Quick Reference for Updating Verticals

### When You Provide New Verticals, We'll Need To:

#### 1. **Update Landing Page** 
Files: `src/components/LandingArea/LandingArea.tsx`
- [ ] Update industries array with new vertical names
- [ ] Update titles and labels
- [ ] Ensure proper industry mapping

#### 2. **Update URL Routing**
File: `src/utils/industryMapping.ts`
- [ ] Add URL-to-industry mappings for new verticals
- [ ] Update reverse mappings (industry-to-URL)
- [ ] Ensure singular/plural forms are handled

#### 3. **Create Industry Configuration**
File: `src/config/industry-configs.ts`
- [ ] Add complete configuration for new vertical
- [ ] Match the Hotels vertical structure:
  - 7 services with icons and descriptions
  - 3 pricing tiers with industry-specific names
  - Add-on pricing options
  - Testimonials (3+)
  - Case studies (2+)
  - Contact form customization
  - FAQ section
  - Video backgrounds (if available)

#### 4. **Update Universal Content (if needed)**
File: `src/config/universal-content.ts`
- [ ] Update industries list in footer
- [ ] Verify navigation labels are correct
- [ ] Check if any universal content needs adjustment

#### 5. **Visual Assets Required**
- [ ] Service images/icons (7 total)
- [ ] Case study images
- [ ] Video backgrounds (optional)
- [ ] Any industry-specific imagery

### Content Template Needed From Client

For each new vertical, please provide:

1. **Industry Details**
   - Industry name (e.g., "Technology & Software")
   - URL path (e.g., "tech" or "technology")
   - Short label for landing page (e.g., "tech companies & startups")

2. **Hero Content**
   - Main headline
   - Subtitle
   - 3 key statistics (e.g., "85% Revenue Growth")

3. **7 Core Services** (following Hotels model)
   - Service name
   - Brief description
   - Key benefit statement
   - 4 feature bullets

4. **Pricing**
   - Names for 3 tiers (industry-specific)
   - Any specific features to highlight
   - Add-on services with prices

5. **Testimonials** (3+)
   - Quote
   - Client name, title, company
   - Company website (optional)

6. **Case Studies** (2+)
   - Client name
   - Challenge faced
   - Solution provided
   - 3 key results with metrics

7. **Contact Form Options**
   - Business types (dropdown options)
   - Any industry-specific form fields

8. **FAQ** (4+ questions)
   - Common questions and answers for this industry

### Notes on Current Verticals

**Staying the Same:**
- Hotels (already updated to client specifications)
- [To be confirmed which others stay]

**Being Replaced:**
- [To be confirmed which vertical is being replaced]

**New Vertical:**
- [Awaiting client information]