# TinyMCE Setup Guide

## Current Status
TinyMCE is configured but needs an API key to remove the warning message.

## Required Domains for TinyMCE Cloud Account

Add these domains to your TinyMCE Cloud account:

1. **inteligenciadm.com** - Production main domain
2. **hospitality.inteligenciadm.com** - Hospitality subdomain  
3. **localhost:3001** - Local development (default port)
4. **localhost:3002** - Local development (fallback port)
5. **\*.vercel.app** - Vercel preview deployments (use wildcard)

## Setup Steps

### 1. Get Your API Key
1. Sign up at: https://www.tiny.cloud/auth/signup/
2. Copy your API key from the dashboard

### 2. Update the Script Tag
Edit `/index.html` line 70:

```html
<!-- Replace 'no-api-key' with your actual API key -->
<script src="https://cdn.tiny.cloud/1/YOUR_API_KEY_HERE/tinymce/8/tinymce.min.js" referrerpolicy="origin" crossorigin="anonymous"></script>
```

### 3. Configure Environment Variable (Optional)
If you want to use environment variables instead:

1. Create a `.env` file in the project root:
```
REACT_APP_TINYMCE_API_KEY=your_api_key_here
```

2. The EnhancedBlogEditor.tsx is already configured to use this environment variable.

### 4. Add Domains to TinyMCE Cloud
1. Log into your TinyMCE Cloud account
2. Go to the "Approved Domains" section
3. Add all 5 domains listed above
4. Save your changes

## Testing
1. After adding your API key, restart the dev server
2. Navigate to `/admin` → Blog Management → Create/Edit Post
3. The Rich Text Editor should load without the API key warning

## Notes
- The free tier includes 1,000 editor loads per month
- The API key warning only appears in the editor, not to end users viewing the blog
- Make sure to add all domain variations to avoid warnings in different environments