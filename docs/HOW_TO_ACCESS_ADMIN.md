# How to Access Inteligencia Admin

## Step-by-Step Instructions

### 1. Navigate to Inteligencia Project
```bash
cd /Users/jpmiles/laurie-meiring-website/clients/laurie-inteligencia
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Access the Admin
- **Website**: `http://localhost:3001/` (or whatever port it shows)
- **Admin**: `http://localhost:3001/admin`

## What You'll See in Admin
- **Dashboard**: Overview with stats
- **Blog Management**: Create, edit, delete blog posts
- **Site Customization**: Change logos, colors, fonts
- **Analytics**: Performance metrics

## Important Notes
- **No password required** (development mode)
- **Admin is built into the Inteligencia website**
- **Completely separate from JP Miles WebGen**
- **Works on any industry subdomain** (hotels, restaurants, etc.)

## If Admin Doesn't Load
1. Make sure dev server is running (`npm run dev`)
2. Check the port number in terminal
3. Try `http://localhost:3001/admin` (replace 3001 with your port)
4. Clear browser cache if needed