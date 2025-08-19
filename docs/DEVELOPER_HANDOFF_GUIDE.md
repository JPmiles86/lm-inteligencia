# Developer Handoff Guide - Inteligencia Hotels Vertical

## 🎯 **Project Overview**

This project is a multi-industry marketing platform that currently launches with **Hotels & Hospitality** as the primary vertical. The site is designed to support multiple industries (Healthcare, Tech, Sports) but currently redirects all traffic to the hospitality subdomain.

---

## 📁 **Project Structure**

### **Key Files & Locations:**

#### **Content Management:**
```
/src/config/
├── industry-configs.ts          # Main content for all verticals
├── universal-content.ts         # Shared content (About page, founder info)
└── subdomain-mapping.ts         # Domain routing configuration
```

#### **Components:**
```
/src/components/
├── pages/
│   ├── AboutPage.tsx            # Universal about page
│   ├── ContactPage.tsx          # Contact forms & info
│   ├── ServicesPage.tsx         # Detailed services page
│   └── CaseStudiesPage.tsx      # Case studies showcase
└── layout/
    ├── IndustryNavbar.tsx       # Main navigation (dropdown hidden)
    └── UnifiedInteligenciaApp.tsx # App routing logic
```

#### **Domain & Redirect System:**
```
/src/utils/
└── domainRedirect.ts            # Main → hospitality redirect logic
```

#### **Documentation:**
```
/docs/
├── CLIENT_DNS_INSTRUCTIONS.md  # DNS setup for client
├── DEPLOYMENT_CHECKLIST.md     # Complete deployment guide
└── DOMAIN_SETUP_GUIDE.md       # Comprehensive domain guide
```

#### **Content Update Templates:**
```
/client-text-updates/UPDATES - Hospitality Vertical Files/
├── About-Universal.md           # Founder bio, values updates
├── Contact-Hospitality.md       # Contact info, FAQ updates
├── Home-Hospitality.md          # Homepage content updates
├── CaseStudies-Hospitality.md   # Client logos & content
└── Services-Hospitality.md      # Services page content
```

---

## 🛠️ **How to Make Content Changes**

### **1. Update Existing Content:**

#### **Homepage/Services Content:**
File: `/src/config/industry-configs.ts`
```typescript
// Find the hospitality section around line 17
hospitality: {
  content: {
    hero: {
      title: 'Your New Title',
      subtitle: 'Your new subtitle',
      // ... other hero content
    },
    services: [
      {
        title: 'Service Name',
        description: 'Service description',
        // ... update as needed
      }
    ]
  }
}
```

#### **About Page Content:**
File: `/src/config/universal-content.ts`
```typescript
// Update founder information around line 94
founderStory: {
  title: 'Meet Laurie Meiring',
  description: 'Updated bio text here...',
  image: '/images/hospitality/BioPhoto2.JPG',
  // ... other founder content
}
```

#### **Contact Information:**
File: `/src/config/industry-configs.ts`
```typescript
// Update contact details around line 235
contact: {
  email: 'laurie@inteligenciadm.com',
  phone: '+506 6200 2747',
  // ... other contact info
}
```

### **2. Add New Services:**

File: `/src/components/pages/ServicesPage.tsx`
```typescript
// Add to the mainServices array around line 23
{
  title: 'New Service Name',
  icon: '🎯',
  description: 'Service description here...',
  features: [
    'Feature 1',
    'Feature 2',
    'Feature 3',
    'Feature 4'
  ]
}
```

### **3. Update Images:**

#### **Add New Images:**
1. Place images in `/public/images/hospitality/`
2. Update references in config files:

```typescript
// Example: Update case study image
image: '/images/hospitality/YourNewImage.jpg'
```

#### **Current Image Locations:**
- **Founder Photo**: `/images/hospitality/BioPhoto2.JPG`
- **Case Studies**: `/images/hospitality/[ClientName].jpg`
- **WhatsApp Icon**: `/images/Digital_Glyph_Green.svg`

---

## 🌐 **Domain & Multi-Vertical Setup**

### **Current State:**
- **Production**: All traffic redirects to `hospitality.inteligenciadm.com`
- **Development**: Shows all 4 verticals on localhost

### **To Enable Other Verticals:**

#### **1. Disable Redirect:**
File: `/src/utils/domainRedirect.ts`
```typescript
// Change line 47 to disable redirect
return getCurrentEnvironment() === 'never'; // Was 'production'
```

#### **2. Show Industry Dropdown:**
File: `/src/components/layout/IndustryNavbar.tsx`
```typescript
// Around line 134, change 'hidden' to 'flex'
className="flex items-center text-sm..."  // Was 'hidden flex...'

// Around line 145, change 'false &&' to just the condition
{isIndustryDropdownOpen && (  // Was 'false && isIndustryDropdownOpen'
```

#### **3. Hide Brand Text:**
File: `/src/components/layout/IndustryNavbar.tsx`
```typescript
// Around line 133, add 'hidden' class
<div className="hidden text-lg text-primary mt-1">  // Add 'hidden'
```

### **Adding New Vertical Content:**

#### **1. Update Industry Configs:**
File: `/src/config/industry-configs.ts`
```typescript
// Add new industry section (follow hospitality pattern)
newIndustry: {
  industry: 'newIndustry',
  name: 'New Industry Marketing',
  content: {
    // Copy hospitality structure and customize
  }
}
```

#### **2. Update URL Mapping:**
File: `/src/utils/industryMapping.ts`
```typescript
// Add new URL mappings
export const urlToIndustryMap: Record<string, IndustryType> = {
  'newindustry': 'newIndustry',
  // ... existing mappings
};
```

---

## 🔧 **Technical Implementation Details**

### **Navigation Bug Fix:**
- **Issue**: Vertical switching when navigating to services page
- **Fix**: Removed immediate store updates from navbar clicks
- **Location**: `/src/components/layout/IndustryNavbar.tsx` lines 154-156

### **WhatsApp Integration:**
- **Location**: `/src/components/pages/ContactPage.tsx`
- **Icon**: `/images/Digital_Glyph_Green.svg`
- **Logic**: Auto-formats phone number and opens WhatsApp with pre-filled message

### **Domain Redirect System:**
- **File**: `/src/utils/domainRedirect.ts`
- **Logic**: Detects production environment and redirects main domain to hospitality subdomain
- **Integration**: Called in `/src/components/layout/UnifiedInteligenciaApp.tsx`

### **Hidden Features:**
- **Team Section**: Hidden with `hidden` class in `/src/components/pages/AboutPage.tsx`
- **Office Info**: Filtered out in ContactPage.tsx
- **Industry Dropdown**: Hidden but preserved for future use

---

## 🚀 **Deployment Process**

### **Current Setup:**
1. **GitHub**: https://github.com/JPmiles86/lm-inteligencia
2. **Vercel**: Auto-deploys from main branch
3. **Domain**: inteligenciadm.com (pending DNS setup)

### **Making Changes:**
```bash
# 1. Make your changes in code
# 2. Test locally
npm run dev

# 3. Build and test
npm run build

# 4. Commit and push
git add .
git commit -m "Your change description"
git push

# 5. Vercel auto-deploys within 2-3 minutes
```

### **Environment Variables:**
In Vercel dashboard, optionally set:
```
NEXT_PUBLIC_DOMAIN=inteligenciadm.com
NEXT_PUBLIC_ENABLE_REDIRECT=true
NEXT_PUBLIC_PRIMARY_SUBDOMAIN=hospitality
```

---

## 📋 **Common Client Requests & Solutions**

### **"Update contact information"**
**Files to change:**
1. `/src/config/industry-configs.ts` - Update email/phone in all industry configs
2. `/src/services/customizationService.ts` - Update default contact settings

### **"Add new service"**
**Process:**
1. Add to ServicesPage.tsx (detailed services page)
2. Optionally add to industry-configs.ts (homepage preview)
3. Create service icon/image if needed

### **"Change homepage text"**
**File:** `/src/config/industry-configs.ts`
**Section:** Find the relevant industry → content → specific section

### **"Update case study"**
**Process:**
1. Add new image to `/public/images/hospitality/`
2. Update industry-configs.ts case study data
3. Update image path reference

### **"Hide/show sections"**
**Common hiding methods:**
- Add `hidden` class to component
- Use conditional rendering: `{false && <Component />}`
- Filter arrays: `.filter(item => condition)`

### **"Enable other industries"**
**Follow multi-vertical setup steps above**

---

## 🔍 **Debugging & Troubleshooting**

### **Common Issues:**

#### **Images not loading:**
- Check path starts with `/images/`
- Verify file exists in `/public/images/`
- Check exact filename and extension

#### **Content not updating:**
- Check you're editing the right industry in industry-configs.ts
- Restart dev server: `npm run dev`
- Clear browser cache

#### **Redirect not working:**
- Check production vs development environment
- Verify domain setup in Vercel
- Check domainRedirect.ts logic

#### **Build errors:**
- Run `npm run lint` to check for syntax errors
- Run `npx tsc --noEmit` for TypeScript errors
- Check console for specific error messages

### **Development Commands:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality
npm run preview      # Preview production build locally
```

---

## 📞 **Client Communication Templates**

### **For Content Updates:**
```
Hi Laurie,

I've updated [specific content] as requested. The changes include:
- [List specific changes made]

The updates are now live at https://inteligenciadm.com
Please review and let me know if any adjustments are needed.

Best regards,
[Developer Name]
```

### **For New Features:**
```
Hi Laurie,

I've implemented the new [feature name] functionality. Here's what it includes:
- [Feature description]
- [How to access/use it]

Please test it out and let me know if you'd like any modifications.

Best regards,
[Developer Name]
```

---

## 📈 **Future Expansion Roadmap**

### **Phase 1: Current (Hotels Only)**
- ✅ Single vertical (hospitality)
- ✅ Auto-redirect to subdomain
- ✅ All content updated
- ✅ WhatsApp integration

### **Phase 2: Multi-Vertical Launch**
- 🔄 Enable industry selection dropdown
- 🔄 Complete healthcare vertical content
- 🔄 Complete tech vertical content  
- 🔄 Complete sports vertical content
- 🔄 Disable main domain redirect

### **Phase 3: Advanced Features**
- 🔄 Contact form backend integration
- 🔄 Analytics implementation
- 🔄 SEO optimization
- 🔄 Performance improvements

---

## 🔐 **Important Notes**

### **Preserve for Future:**
- Industry dropdown functionality (currently hidden)
- Team section (currently hidden)
- Multi-vertical routing system
- All unused vertical content

### **Client Expectations:**
- Site redirects visitors to hospitality subdomain
- Industry dropdown is intentionally hidden
- Team section is intentionally hidden
- Office address/hours are intentionally removed

### **Technical Debt:**
- Some unused imports due to temporarily disabled features
- Image optimization could be improved
- Bundle size could be reduced with code splitting

---

**🎯 This codebase is ready for production and future expansion. All major client requirements have been implemented and documented.**