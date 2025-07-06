# Admin System Access Guide

## How to Access the Admin

### 1. **Start the Development Server**
```bash
cd /Users/jpmiles/laurie-meiring-website/clients/laurie-inteligencia
npm run dev
```

### 2. **Navigate to Admin**
- **URL**: `http://localhost:3001/admin`
- **Direct Access**: Go directly to the admin URL in your browser

### 3. **Admin Features Available**

#### **Blog Management** (`/admin`)
- ✅ Create new blog posts with rich text editor
- ✅ Edit existing blog posts 
- ✅ Delete blog posts
- ✅ Upload featured images
- ✅ Set categories and tags
- ✅ Draft and publish workflow
- ✅ SEO meta data fields

#### **Site Customization** 
- ✅ Upload logo and favicon
- ✅ Change color schemes
- ✅ Modify typography (fonts, sizes)
- ✅ Update contact information
- ✅ Manage social media links
- ✅ Set business hours

#### **Dashboard Overview**
- ✅ Blog statistics
- ✅ Recent activity
- ✅ Quick actions
- ✅ Analytics overview

### 4. **Admin Navigation**
- **Dashboard**: Main overview page
- **Blog Management**: Create and manage blog posts
- **Site Customization**: Branding and content settings
- **User Menu**: Profile and settings (top right)

### 5. **No Authentication Required**
Currently the admin has no password protection - it's open access for development. In production, you'd add authentication.

### 6. **Admin is Industry-Specific**
The admin adapts to whichever industry you're viewing:
- `http://localhost:3001/admin` - Main site admin
- From any industry page, navigate to `/admin` to manage that industry's content

## Testing the Admin

1. **Test Blog Management**:
   - Click "Create New Post"
   - Add title, content, featured image
   - Save as draft or publish
   - Edit an existing post

2. **Test Site Customization**:
   - Upload a new logo
   - Change primary/secondary colors
   - Update contact information
   - See live preview of changes

3. **Test Navigation**:
   - Switch between admin sections
   - Navigate back to public site
   - Test mobile admin interface