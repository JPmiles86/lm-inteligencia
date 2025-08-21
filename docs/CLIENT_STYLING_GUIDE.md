# Client Styling & Content Management Guide

This guide explains how to easily update your website's appearance, hide/show sections, and manage content without technical knowledge.

## 🎨 Quick Style Updates (Admin Panel)

### Accessing the Admin Panel

1. Go to your website URL and add `/admin` at the end (e.g., `yoursite.com/admin`)
2. Enter your admin password
3. You'll see the Admin Dashboard with style controls

### Changing Color Themes

**Pre-made Themes Available:**
- **Hospitality Purple (Default)** - Professional purple theme
- **Luxury Gold** - Elegant gold and black for luxury properties
- **Ocean Blue** - Calming blue for beach resorts
- **Forest Green** - Natural green for eco-lodges
- **Warm Sunset** - Energetic orange/red for vibrant properties

**To Change Themes:**
1. In the Admin Panel, find "Theme Selector"
2. Click dropdown and choose your preferred theme
3. Click "Apply Theme" to see changes
4. Click "Save Settings" to make it permanent

### Custom Color Adjustments

If you want to tweak colors from a theme:

1. Select "Custom Colors" in the Admin Panel
2. Use the color pickers to adjust:
   - **Primary Color** - Main brand color (buttons, headings)
   - **Secondary Color** - Accent color (highlights, links)
   - **Background Color** - Page background
   - **Text Color** - Main text color
3. Preview changes live
4. Save when satisfied

**Color Palette Reference:**

```
Professional Colors:
• Deep Purple: #371657
• Hot Pink: #f04a9b  
• Ocean Blue: #176ab2
• Dark Gray: #2d3748
• Medium Gray: #4a5568

Luxury Colors:
• Gold: #d4af37
• Black: #1a1a1a
• Dark Gold: #b8860b
• Charcoal: #2c2c2c
• Gray: #666666

Ocean Colors:
• Sky Blue: #0ea5e9
• Navy: #0c4a6e
• Cyan: #06b6d4
• Slate: #334155
• Blue Gray: #64748b
```

## 🔧 Hiding & Showing Sections

### Using the Admin Panel

**Section Visibility Controls:**

In the Admin Panel, you'll find toggles for:

- **Team Section** - Show/hide staff profiles on About page
- **Blog** - Show/hide entire blog section and navigation
- **Testimonials** - Show/hide customer reviews
- **Case Studies** - Show/hide success stories
- **Pricing Tables** - Show/hide service pricing
- **Contact Form** - Show/hide inquiry form
- **Newsletter Signup** - Show/hide email subscription
- **Social Media Links** - Show/hide social icons

**To Hide/Show a Section:**
1. Find the section in "Visibility Settings"
2. Click the toggle switch (green = visible, gray = hidden)
3. Click "Save Settings"
4. Changes appear immediately on your website

### Advanced Section Controls

**Page-Specific Sections:**
- **Homepage**: Hero, Services Preview, Stats, Video CTA
- **About Page**: Company Values, Certifications, Team
- **Services Page**: Detailed Services, Pricing, Add-ons
- **Contact Page**: Contact Form, Office Hours, FAQ

Each can be toggled individually.

## ✏️ Text Content Updates

### Current Text Update Process

**For Regular Text Updates:**
1. Create/edit files in the `/client-text-updates/` folder
2. Follow the existing markdown template format
3. Update only the "New:" sections
4. Send the updated file to your developer

**Template Example:**
```markdown
### Hero Title
**Current:** Where Hospitality Meets High-Performance Marketing
**New:** Your New Compelling Title Here

### Service Description
**Current:** Drive direct bookings with targeted campaigns
**New:** Your updated service description here
```

### Content Areas You Can Update

- **Homepage Hero** - Main headline and subtitle
- **Service Descriptions** - All service titles and descriptions
- **Pricing Plans** - Plan names, descriptions, features
- **Testimonials** - Client quotes and information
- **Contact Information** - Phone, email, address
- **About Page Content** - Company story, team bios
- **FAQ Section** - Questions and answers

## 🖼️ Image Management

### Current Images and Locations

**Service Images:**
- `/images/HotelAdsManagement.png`
- `/images/MetaAdvertising.png`
- `/images/EmailMarketing.png`
- `/images/MarketingStrategy.png`
- `/images/EventMarketing.png`
- `/images/OTAOptimization.png`
- `/images/RestaurantMarketing.png`
- `/images/AlternativeChannelMarketing.png` (new)
- `/images/ConversionRateOptimization.png` (new)

**Team Images:**
- `/images/team/laurie-meiring.jpg`
- Add new team photos in the same folder

**Background Videos:**
- Hero video (Vimeo): Currently linked to hospitality video
- Can be updated by changing the video URL in text updates

### To Update Images

**Option 1: Via Developer**
1. Send new images to your developer
2. Specify which image to replace
3. Preferred formats: PNG, JPG (optimized for web)
4. Recommended sizes:
   - Service images: 600x400px
   - Team photos: 400x400px
   - Hero images: 1920x1080px

**Option 2: Via Image URLs (Future Enhancement)**
- Upload to Google Drive/Dropbox
- Get shareable link
- Update via admin panel (coming soon)

## 🎯 Font Changes

### Available Font Options

**Current Font Families by Theme:**

- **Hospitality Purple**: Inter (headings), System fonts (body)
- **Luxury Gold**: Playfair Display (headings), Source Sans Pro (body)
- **Ocean Blue**: Nunito Sans (headings), Open Sans (body)
- **Forest Green**: Lato (headings), Roboto (body)
- **Warm Sunset**: Montserrat (headings), Source Sans Pro (body)

### Custom Font Selection

**Via Admin Panel:**
1. Go to "Typography Settings"
2. Choose from dropdown of web-safe fonts:
   - Inter, Poppins, Nunito, Lato, Montserrat
   - Playfair Display, Georgia (for elegant look)
   - Open Sans, Source Sans Pro, Roboto (for readability)
3. Preview changes
4. Save settings

## 📱 Mobile Responsiveness

All styling changes automatically adapt to mobile devices. However, check these on your phone:

- **Text readability** - Ensure good contrast
- **Button sizes** - Should be easily tappable
- **Image scaling** - Verify images look good on small screens
- **Color visibility** - Test in different lighting

## ⚡ Quick Reference

### Most Common Updates

| What You Want to Change | Where to Do It |
|------------------------|----------------|
| Main website colors | Admin Panel > Theme Selector |
| Hide team section | Admin Panel > Visibility > Team Section |
| Update service text | Text Update File > Services Section |
| Change contact info | Text Update File > Contact Section |
| Hide/show pricing | Admin Panel > Visibility > Pricing Tables |
| Update testimonials | Text Update File > Testimonials Section |

### Emergency Contact

If something breaks or you need help:
- **Email**: [Developer Email]
- **Phone**: [Developer Phone]
- **Priority**: Mention "URGENT - Website Issue"

### Best Practices

✅ **Do:**
- Test changes on different devices
- Keep backups of your text update files
- Make one change at a time when testing
- Save frequently in the admin panel

❌ **Avoid:**
- Making multiple changes simultaneously
- Using very bright or clashing colors
- Hiding essential sections (like contact info)
- Using more than 3-4 different colors

### Backup & Recovery

- Your settings are automatically saved
- Previous versions are kept for 30 days
- Contact developer to restore if needed

---

## 🆘 Troubleshooting

### Common Issues

**"Changes aren't showing"**
1. Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)
2. Check if you clicked "Save Settings"
3. Clear browser cache if still not working

**"Admin panel won't load"**
1. Check your internet connection
2. Try incognito/private browsing mode
3. Contact developer if persists

**"Colors look wrong"**
1. Make sure you're viewing in good lighting
2. Check on different devices
3. Use the "Reset to Default" option if needed

**"Section disappeared"**
1. Check Visibility Settings in admin panel
2. Look for the toggle switch for that section
3. Make sure it's switched to "on" (green)

---

*This guide covers the most common styling and content updates. For advanced customizations or new features, please contact your developer.*