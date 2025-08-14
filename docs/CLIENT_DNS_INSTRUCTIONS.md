# DNS Setup Instructions for inteligenciadm.com

## 🎯 **EXACT DNS RECORDS TO ADD**

Based on Vercel's configuration, your domain provider needs these **exact DNS records**:

```
Type: A      | Name: @              | Value: 216.198.79.1
Type: CNAME  | Name: www            | Value: d084e2eb64410622.vercel-dns-017.com
Type: CNAME  | Name: hospitality    | Value: d084e2eb64410622.vercel-dns-017.com
Type: CNAME  | Name: health         | Value: d084e2eb64410622.vercel-dns-017.com
Type: CNAME  | Name: tech           | Value: d084e2eb64410622.vercel-dns-017.com
Type: CNAME  | Name: sports         | Value: d084e2eb64410622.vercel-dns-017.com
```

---

## 📋 **PROVIDER-SPECIFIC INSTRUCTIONS**

### **If using GoDaddy:**
1. **Login** to GoDaddy account
2. Go to **"My Domains"** → select `inteligenciadm.com`
3. Click **"DNS"** → **"Manage Zones"** (or "DNS Management")
4. **Delete any existing** A or CNAME records for these names
5. **Add these new records** (one by one):

```
Record Type: A
Host: @ (or leave blank)
Points to: 216.198.79.1
TTL: 1 Hour (default)

Record Type: CNAME
Host: www
Points to: d084e2eb64410622.vercel-dns-017.com
TTL: 1 Hour (default)

Record Type: CNAME
Host: hospitality
Points to: d084e2eb64410622.vercel-dns-017.com
TTL: 1 Hour (default)

Record Type: CNAME
Host: health
Points to: d084e2eb64410622.vercel-dns-017.com
TTL: 1 Hour (default)

Record Type: CNAME
Host: tech
Points to: d084e2eb64410622.vercel-dns-017.com
TTL: 1 Hour (default)

Record Type: CNAME
Host: sports
Points to: d084e2eb64410622.vercel-dns-017.com
TTL: 1 Hour (default)
```

6. **Save all changes**

---

### **If using Google Domains (now Squarespace):**
1. **Login** to domains account
2. Select `inteligenciadm.com`
3. Go to **"DNS settings"** or **"DNS Management"**
4. **Delete any existing** records for @ (root), www, hospitality, etc.
5. **Add these custom records**:

```
Type: A | Name: @ | Data: 216.198.79.1
Type: CNAME | Name: www | Data: d084e2eb64410622.vercel-dns-017.com
Type: CNAME | Name: hospitality | Data: d084e2eb64410622.vercel-dns-017.com
Type: CNAME | Name: health | Data: d084e2eb64410622.vercel-dns-017.com
Type: CNAME | Name: tech | Data: d084e2eb64410622.vercel-dns-017.com
Type: CNAME | Name: sports | Data: d084e2eb64410622.vercel-dns-017.com
```

---

### **If using Cloudflare:**
1. **Login** to Cloudflare dashboard
2. Select `inteligenciadm.com`
3. Go to **"DNS"** → **"Records"**
4. **Add these records** (make sure proxy is OFF/gray cloud):

```
Type: A | Name: @ | Target: 216.198.79.1 | Proxy: OFF
Type: CNAME | Name: www | Target: d084e2eb64410622.vercel-dns-017.com | Proxy: OFF
Type: CNAME | Name: hospitality | Target: d084e2eb64410622.vercel-dns-017.com | Proxy: OFF
Type: CNAME | Name: health | Target: d084e2eb64410622.vercel-dns-017.com | Proxy: OFF
Type: CNAME | Name: tech | Target: d084e2eb64410622.vercel-dns-017.com | Proxy: OFF
Type: CNAME | Name: sports | Target: d084e2eb64410622.vercel-dns-017.com | Proxy: OFF
```

---

### **If using Namecheap:**
1. **Login** to Namecheap account
2. Go to **"Domain List"** → select `inteligenciadm.com`
3. Click **"Manage"** → **"Advanced DNS"**
4. **Delete any existing** A or CNAME records
5. **Add these new records**:

```
Type: A Record | Host: @ | Value: 216.198.79.1 | TTL: Automatic
Type: CNAME Record | Host: www | Value: d084e2eb64410622.vercel-dns-017.com | TTL: Automatic
Type: CNAME Record | Host: hospitality | Value: d084e2eb64410622.vercel-dns-017.com | TTL: Automatic
Type: CNAME Record | Host: health | Value: d084e2eb64410622.vercel-dns-017.com | TTL: Automatic
Type: CNAME Record | Host: tech | Value: d084e2eb64410622.vercel-dns-017.com | TTL: Automatic
Type: CNAME Record | Host: sports | Value: d084e2eb64410622.vercel-dns-017.com | TTL: Automatic
```

---

## ⚠️ **CRITICAL REQUIREMENTS**

### **1. Delete Existing Records First**
Before adding new records, **DELETE any existing** A, AAAA, or CNAME records for:
- `@` (root domain)
- `www`
- `hospitality`
- `health`
- `tech` 
- `sports`

### **2. Exact Values Required**
- **CNAME Value**: Must be exactly `d084e2eb64410622.vercel-dns-017.com`
- **A Record Value**: Must be exactly `216.198.79.1`
- **Copy and paste** these values to avoid typos
- **No trailing dots** needed in most providers

### **3. Propagation Time**
- Changes take **24-48 hours** to propagate globally
- Some providers are faster (1-6 hours)
- Check progress at [whatsmydns.net](https://www.whatsmydns.net/)

---

## ✅ **VERIFICATION STEPS**

### **1. Check DNS Propagation**
Visit [whatsmydns.net](https://www.whatsmydns.net/) and enter:
- `inteligenciadm.com` (should show `216.198.79.1`)
- `hospitality.inteligenciadm.com` (should show the CNAME)

### **2. Test Website Access**
After propagation (24-48 hours):
- `https://inteligenciadm.com` → should redirect to `https://hospitality.inteligenciadm.com`
- `https://www.inteligenciadm.com` → should redirect to `https://hospitality.inteligenciadm.com`
- `https://hospitality.inteligenciadm.com` → should load the hospitality site

### **3. Vercel Dashboard Check**
- All domains should show "Valid Configuration" in Vercel
- SSL certificates will be automatically provisioned

---

## 📞 **SIMPLE EMAIL TEMPLATE FOR CLIENT**

```
Subject: DNS Records for inteligenciadm.com Website Setup

Hi [Client Name],

To complete your website setup, please add these DNS records to your domain provider (where you bought inteligenciadm.com):

**IMPORTANT: Delete any existing records for @, www, hospitality, health, tech, and sports FIRST**

Then add these exact records:

Type: A | Name: @ | Value: 216.198.79.1
Type: CNAME | Name: www | Value: d084e2eb64410622.vercel-dns-017.com
Type: CNAME | Name: hospitality | Value: d084e2eb64410622.vercel-dns-017.com
Type: CNAME | Name: health | Value: d084e2eb64410622.vercel-dns-017.com
Type: CNAME | Name: tech | Value: d084e2eb64410622.vercel-dns-017.com
Type: CNAME | Name: sports | Value: d084e2eb64410622.vercel-dns-017.com

**Process:**
1. Login to your domain provider (GoDaddy, Google Domains, etc.)
2. Go to DNS management/settings
3. Delete existing records for these names
4. Add the new records above (copy/paste the values exactly)
5. Save changes

**Timeline:**
- Takes 24-48 hours to complete
- Your website will be live at https://inteligenciadm.com
- All visitors will automatically be directed to https://hospitality.inteligenciadm.com

Let me know once you've added these records!

Best regards,
[Your Name]
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

1. **"Invalid Configuration" in Vercel**
   - Double-check DNS record values are exact
   - Wait 24-48 hours for propagation
   - Contact domain provider if records aren't saving

2. **Website Not Loading**
   - Verify DNS propagation at whatsmydns.net
   - Check that old records were deleted
   - Try accessing in incognito/private browser

3. **SSL Certificate Issues**
   - SSL auto-provisions after DNS is verified
   - May take additional 24-48 hours
   - Will show security warnings until complete

### **Emergency Contact:**
If issues persist after 48 hours, contact your domain provider's support team with these DNS record requirements.

---

**🎯 Once these DNS records are added, your new website will be live at inteligenciadm.com!**