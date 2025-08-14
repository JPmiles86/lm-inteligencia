# Deployment Checklist for inteligenciadm.com

## ✅ ALL TASKS COMPLETED

### Technical Implementation ✅
- [x] **Navigation Bug Fixed** - Removed race condition between navbar and route handling
- [x] **Contact Information Updated** - All instances updated to laurie@inteligenciadm.com and +506 6200 2747
- [x] **Team Section Hidden** - Added `hidden` class to About page team section
- [x] **Office Info Removed** - Filtered out office address and hidden office hours section
- [x] **WhatsApp Integration** - Added clickable WhatsApp button with pre-filled message
- [x] **Domain References Updated** - Updated all internal references to inteligenciadm.com
- [x] **Contact Forms Updated** - All forms now use laurie@inteligenciadm.com

### Content Updates ✅
- [x] **About-Universal.md** - Updated founder bio, image, approach, and values descriptions
- [x] **Contact-Hospitality.md** - Updated contact info and FAQ industry references  
- [x] **Home-Hospitality.md** - Updated service titles, testimonials, and trust indicators
- [x] **CaseStudies-Hospitality.md** - Updated all client logo URLs to Google Drive links
- [x] **Services-Hospitality.md** - Updated section title, service names, and added 2 new services

### Services Page Updates ✅
- [x] **Section Title** - Changed to "Our Digital Marketing Services"
- [x] **Meta Service Title** - Updated to "Meta (Facebook/Instagram) Advertising"
- [x] **Alternative Channel Marketing** - Added new service with 4 features
- [x] **Conversion Rate Optimization** - Added new CRO service with 4 features
- [x] **Total Services** - Now displays 9 services for hotels vertical

### Domain Infrastructure ✅
- [x] **Subdomain Mapping** - Updated configuration for inteligenciadm.com
- [x] **Redirect System** - Implemented automatic redirect from main domain to hospitality subdomain
- [x] **Environment Config** - Updated production settings for new domain
- [x] **Code Quality** - All linting and TypeScript errors resolved

---

## Next Steps - What YOU Need to Do

### 1. Vercel Dashboard Setup
**Location**: [vercel.com/dashboard](https://vercel.com/dashboard) → Your Project → Settings → Domains

**Add these domains:**
```
inteligenciadm.com
www.inteligenciadm.com
hospitality.inteligenciadm.com
health.inteligenciadm.com
tech.inteligenciadm.com
sports.inteligenciadm.com
```

### 2. Environment Variables (Optional)
**Location**: Vercel → Settings → Environment Variables

```bash
NEXT_PUBLIC_DOMAIN=inteligenciadm.com
NEXT_PUBLIC_ENABLE_REDIRECT=true
NEXT_PUBLIC_PRIMARY_SUBDOMAIN=hospitality
```

---

## What YOUR CLIENT Needs to Do

### DNS Configuration at Domain Provider
**Required CNAME Records:**

```
Type: CNAME | Name: @ (or inteligenciadm.com) | Value: cname.vercel-dns.com
Type: CNAME | Name: www | Value: cname.vercel-dns.com
Type: CNAME | Name: hospitality | Value: cname.vercel-dns.com
Type: CNAME | Name: health | Value: cname.vercel-dns.com
Type: CNAME | Name: tech | Value: cname.vercel-dns.com
Type: CNAME | Name: sports | Value: cname.vercel-dns.com
```

### Provider-Specific Instructions:

**If using GoDaddy:**
1. Login → My Domains → inteligenciadm.com
2. DNS → Manage Zones
3. Add the CNAME records above
4. Save (24-48h propagation)

**If using Google Domains:**
1. Login → Select domain → DNS settings
2. Add the CNAME records above
3. Save (24-48h propagation)

---

## Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| DNS Setup | 1 day | Client adds CNAME records |
| DNS Propagation | 24-48h | DNS changes spread globally |
| SSL Provisioning | 24-48h | Vercel creates SSL certificates |
| **Total** | **2-3 days** | **Full setup completion** |

---

## Testing Plan

### Once DNS Propagates:

1. **Main Domain Redirect**:
   - `https://inteligenciadm.com` → redirects to `https://hospitality.inteligenciadm.com`

2. **WWW Redirect**:
   - `https://www.inteligenciadm.com` → redirects to `https://hospitality.inteligenciadm.com`

3. **Path Preservation**:
   - `https://inteligenciadm.com/services` → `https://hospitality.inteligenciadm.com/services`

4. **Functionality Tests**:
   - Contact forms submit to laurie@inteligenciadm.com
   - WhatsApp button opens with correct number
   - Navigation works without vertical switching
   - Team section is hidden on About page
   - Office address/hours are hidden

### Verification Tools:
- [whatsmydns.net](https://www.whatsmydns.net/) - Check DNS propagation
- [dnschecker.org](https://dnschecker.org/) - Verify CNAME records
- Browser dev tools - Check redirect behavior

---

## Emergency Rollback

If issues occur:
1. **In Vercel**: Remove new domains, keep `lm-inteligencia.vercel.app`
2. **Environment Variables**: Set `NEXT_PUBLIC_ENABLE_REDIRECT=false`
3. **DNS**: Point records back to current working setup

---

## Post-Launch Monitoring

### Week 1:
- Monitor website analytics for traffic drops
- Check Google Search Console for indexing issues
- Verify all contact forms working properly
- Test WhatsApp integration on mobile devices

### Week 2-4:
- Monitor search rankings (subdomains may affect SEO initially)
- Check for any broken links or missing redirects
- Verify SSL certificates are working correctly

---

## Success Criteria ✅

The deployment is successful when:
- [x] All content updates applied correctly
- [x] Navigation bug resolved
- [x] Contact information updated everywhere
- [x] WhatsApp integration working
- [ ] Main domain redirects to hospitality subdomain
- [ ] All paths preserve correctly during redirect
- [ ] Contact forms send to correct email
- [ ] SSL certificates working for all domains
- [ ] No 404 errors or broken functionality

---

**Status**: Ready for DNS/Vercel domain configuration
**Next Action**: Add domains in Vercel + client DNS setup
**Timeline**: 2-3 days for full completion