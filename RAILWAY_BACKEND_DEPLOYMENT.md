# Railway Backend API Deployment Guide

## Quick Setup Steps

1. **Go to Railway.app** and create a new project
2. **Connect GitHub repo** - select this repository  
3. **Create new service** from the repo
4. **Configure environment variables** in Railway dashboard:
   ```
   DATABASE_URL=postgresql://postgres:dACuHoFqbnRzcpFfwLtozFUqnjSKWoMh@crossover.proxy.rlwy.net:41734/railway
   GOOGLE_APPLICATION_CREDENTIALS_JSON=[your GCS JSON key]
   GCS_BUCKET_NAME=laurie-blog-media
   GCS_PROJECT_ID=pbguisecr-laurie-meirling
   FRONTEND_URL=https://hospitality.inteligenciadm.com
   API_PORT=3000
   NODE_ENV=production
   ```

5. **Deploy** - Railway will auto-detect the configuration and deploy

## After Deployment

1. **Copy the Railway app URL** (e.g., `https://your-app.railway.app`)
2. **Update Vercel environment variables**:
   - Set `VITE_API_BASE_URL=https://your-app.railway.app/api`
3. **Test the deployment**:
   - Visit: `https://your-app.railway.app/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

## Files Updated for Deployment

- `package.json` - Added `start:api` script
- `railway.json` - Configuration for Railway deployment
- API server already configured to use environment variables

## Environment Variables Needed

The Railway service needs these environment variables (copy from your existing Railway database service):

- `DATABASE_URL` - Your Railway PostgreSQL connection string
- `GCS_BUCKET_NAME` - Google Cloud Storage bucket name
- `GCS_PROJECT_ID` - Google Cloud project ID  
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` - GCS service account key as JSON string
- `FRONTEND_URL` - Your Vercel domain for CORS configuration
- `API_PORT=3000` - Port for Railway (3000 is standard)
- `NODE_ENV=production` - Production environment flag