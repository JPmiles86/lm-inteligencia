# Domain Setup Guide for inteligenciadm.com

## Overview
This guide covers the complete setup process for transitioning from `lm-inteligencia.vercel.app` to the new domain `inteligenciadm.com` with subdomain structure.

## Target Architecture
- **Main Domain**: `inteligenciadm.com` → redirects to `hospitality.inteligenciadm.com`
- **Hospitality**: `hospitality.inteligenciadm.com` (primary for now)
- **Healthcare**: `health.inteligenciadm.com` (future)
- **Tech**: `tech.inteligenciadm.com` (future)
- **Sports**: `sports.inteligenciadm.com` (future)

---

## Step 1: Domain Provider Setup (Client's Responsibility)

Your client needs to configure DNS records with their domain provider (GoDaddy, Google Domains, etc.):

### Required DNS Records:
```
Type: CNAME
Name: inteligenciadm.com (or @)
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: hospitality
Value: cname.vercel-dns.com

Type: CNAME
Name: health
Value: cname.vercel-dns.com

Type: CNAME
Name: tech
Value: cname.vercel-dns.com

Type: CNAME
Name: sports
Value: cname.vercel-dns.com
```

### Instructions for Common Providers:

#### GoDaddy:
1. Log into GoDaddy account
2. Go to "My Domains" → select `inteligenciadm.com`
3. Click "DNS" → "Manage Zones"
4. Add the CNAME records above
5. Save changes (propagation takes 24-48 hours)

#### Google Domains:
1. Log into Google Domains
2. Select `inteligenciadm.com`
3. Go to DNS settings
4. Add the CNAME records above
5. Save (propagation takes 24-48 hours)

---

## Step 2: Vercel Configuration (Your Responsibility)

### 2.1 Add Domains in Vercel Dashboard:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (lm-inteligencia)
3. Go to Settings → Domains
4. Add these domains one by one:
   - `inteligenciadm.com`
   - `www.inteligenciadm.com`
   - `hospitality.inteligenciadm.com`
   - `health.inteligenciadm.com`
   - `tech.inteligenciadm.com`
   - `sports.inteligenciadm.com`

### 2.2 Set Domain Configuration:
- **Primary Domain**: `hospitality.inteligenciadm.com`
- **Redirect Settings**: 
  - `inteligenciadm.com` → `hospitality.inteligenciadm.com` (handled by our code)
  - `www.inteligenciadm.com` → `hospitality.inteligenciadm.com` (handled by our code)

### 2.3 SSL Certificates:
- Vercel will automatically provision SSL certificates for all domains
- This process takes 24-48 hours after DNS propagation

---

## Step 3: Testing Process

### 3.1 DNS Propagation Check:
Use these tools to verify DNS propagation:
- [whatsmydns.net](https://www.whatsmydns.net/)
- [dnschecker.org](https://dnschecker.org/)

### 3.2 Test Scenarios:
1. **Main Domain Redirect**:
   - Visit `https://inteligenciadm.com` → should redirect to `https://hospitality.inteligenciadm.com`

2. **WWW Redirect**:
   - Visit `https://www.inteligenciadm.com` → should redirect to `https://hospitality.inteligenciadm.com`

3. **Direct Subdomain Access**:
   - Visit `https://hospitality.inteligenciadm.com` → should load hospitality site

4. **Path Preservation**:
   - Visit `https://inteligenciadm.com/services` → should redirect to `https://hospitality.inteligenciadm.com/services`

---

## Step 4: Environment Variables

Add these environment variables in Vercel:

```bash
NEXT_PUBLIC_DOMAIN=inteligenciadm.com
NEXT_PUBLIC_ENABLE_REDIRECT=true
NEXT_PUBLIC_PRIMARY_SUBDOMAIN=hospitality
```

---

## Step 5: Future Expansion

When ready to enable other verticals:

### 5.1 Update Redirect Logic:
- Set `NEXT_PUBLIC_ENABLE_REDIRECT=false` in Vercel
- This will disable automatic redirect to hospitality subdomain
- Users will see the industry selection page at `inteligenciadm.com`

### 5.2 Subdomain Content:
- `health.inteligenciadm.com` → Healthcare content
- `tech.inteligenciadm.com` → Tech content  
- `sports.inteligenciadm.com` → Sports content

---

## Step 6: Rollback Plan

If issues occur, you can quickly rollback:

1. **Emergency Rollback**:
   - Set `NEXT_PUBLIC_ENABLE_REDIRECT=false`
   - Point domains back to `lm-inteligencia.vercel.app`

2. **Gradual Rollback**:
   - Update DNS TTL to 300 seconds before changes
   - Test thoroughly in staging environment

---

## Important Notes

### Timeline:
- **DNS Propagation**: 24-48 hours
- **SSL Certificate**: 24-48 hours after DNS
- **Total Setup Time**: 2-3 days maximum

### Monitoring:
- Monitor website analytics for any traffic drops
- Check Google Search Console for indexing issues
- Verify all contact forms are working properly

### SEO Considerations:
- The subdomain structure maintains SEO value
- Google treats subdomains as separate entities
- Monitor search rankings for first 2 weeks

---

## Troubleshooting

### Common Issues:
1. **DNS Not Propagating**: Wait 48 hours or contact domain provider
2. **SSL Certificate Issues**: Verify DNS is pointing correctly to Vercel
3. **Redirect Loops**: Check environment variables are set correctly
4. **404 Errors**: Verify all domains are added in Vercel dashboard

### Contact Information:
- **Technical Issues**: Check Vercel dashboard and logs
- **DNS Issues**: Contact domain provider support
- **Code Issues**: Review the domain redirect logic in `/src/utils/domainRedirect.ts`

---

## Verification Checklist

- [ ] Client has updated DNS records
- [ ] All domains added in Vercel dashboard  
- [ ] DNS propagation complete (use checking tools)
- [ ] SSL certificates provisioned
- [ ] Redirect from main domain works
- [ ] Contact forms sending to laurie@inteligenciadm.com
- [ ] WhatsApp integration working
- [ ] All content updates applied
- [ ] Navigation bug fixed
- [ ] Team section hidden
- [ ] Office address/hours removed

---

*This completes the full domain setup and migration process.*