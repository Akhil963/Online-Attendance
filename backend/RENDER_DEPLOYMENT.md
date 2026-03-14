# Render.com Deployment Guide

## Overview

Render is a modern cloud platform that replaces Heroku. It's simpler, cheaper, and more reliable for deploying this attendance system.

**Advantages:**
- ✅ Free tier with generous limits
- ✅ PostgreSQL & MongoDB support
- ✅ Automatic SSL/TLS
- ✅ GitHub integration
- ✅ Environment variable management
- ✅ Cron jobs for scheduled tasks
- ✅ No credit card required for free tier

**Pricing:**
- Web Service: $7/month (or free tier)
- MongoDB: $5+/month (optional, use Atlas free tier)
- Static Site: Free

---

## Prerequisites

1. **Render Account** - Sign up at https://render.com (free)
2. **GitHub Account** - With this repository pushed
3. **MongoDB Atlas Account** - For database (or use Render's managed database)
4. **SendGrid & Twilio** - API keys ready

---

## Step-by-Step Deployment

### Step 1: Create Backend Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
   - Select the repository
   - Branch: `main` (or `develop`)
4. Configure the service:
   - **Name:** `attendance-backend` (or your choice)
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (or Starter at $7/month)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system?retryWrites=true&w=majority
   JWT_SECRET=[generate strong random string]
   JWT_EXPIRE=7d
   ADMIN_REGISTRATION_CODE=[your secret code]
   CLIENT_URL=https://your-frontend.vercel.app,https://yourdomain.com
   SENDGRID_API_KEY=SG.[your API key]
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   REPORT_EMAIL=admin@yourdomain.com
   TWILIO_ACCOUNT_SID=AC[your SID]
   TWILIO_AUTH_TOKEN=[your token]
   TWILIO_PHONE_NUMBER=+1234567890
   SENTRY_DSN=https://[your sentry DSN]
   SESSION_SECRET=[generate strong random string]
   SECURE_COOKIES=true
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   DB_POOL_SIZE=10
   DB_TIMEOUT=5000
   ```

6. Click **"Create Web Service"**

7. Wait for deployment (2-3 minutes)
   - Check build logs: Dashboard → Service → Logs
   - Your backend URL: `https://attendance-backend.onrender.com`

---

### Step 2: Create Frontend Web Service (Static Site)

**Option A: Vercel (Recommended for React)**

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import GitHub repository
4. Select `frontend` as root directory
5. Add environment variables:
   ```
   REACT_APP_API_URL=https://attendance-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://attendance-backend.onrender.com
   ```
6. Deploy

**Option B: Render Static Site**

1. In Render Dashboard → **"New +"** → **"Static Site"**
2. Connect GitHub repository
3. Configure:
   - **Name:** `attendance-frontend`
   - **Build Command:** `cd frontend && npm run build`
   - **Publish Directory:** `frontend/build`
4. Add environment variables (same as above)
5. Deploy

---

### Step 3: Configure Database

**Option A: MongoDB Atlas (Recommended - Free Tier)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user (strong password)
4. Whitelist Render IP:
   - Dashboard → Render service → Settings
   - Get static IP address
   - MongoDB Atlas → Network Access → Add IP
   - OR add `0.0.0.0/0` for automatic
5. Get connection string
6. Update backend `MONGODB_URI` environment variable

**Option B: Render PostgreSQL**

If using PostgreSQL instead:
1. Go to Render Dashboard
2. Create PostgreSQL database
3. Connection string auto-populated
4. Update application accordingly

---

### Step 4: Deploy with GitHub Integration

The beauty of Render is automatic deployments:

1. **Repository Settings:**
   - Push code to GitHub `main` branch
   - Render automatically redeploys
   - No manual deployment needed!

2. **Monitor Deployment:**
   - Render Dashboard → Service → Logs
   - Watch build and runtime logs
   - Check for errors

3. **Rollback if needed:**
   - Dashboard → Service → Deploys
   - Click previous deployment → "Redeploy"

---

## Configuration Files for Render

### render.yaml (Optional - for Infrastructure as Code)

Create this file in your repository root to define all services at once:

```yaml
services:
  - type: web
    name: attendance-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    plan: free
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLIENT_URL
        value: https://attendance-frontend.onrender.com
      - key: SENDGRID_API_KEY
        sync: false
      - key: SENDGRID_FROM_EMAIL
        value: noreply@yourdomain.com

  - type: static
    name: attendance-frontend
    buildCommand: cd frontend && npm run build
    staticPublishPath: frontend/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://attendance-backend.onrender.com/api
```

Then deploy using: `render init` (or push to GitHub and select this file)

---

## Post-Deployment Configuration

### 1. Update Frontend .env

After backend is deployed, update frontend environment variables:

```env
REACT_APP_API_URL=https://attendance-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://attendance-backend.onrender.com
```

Then redeploy frontend.

### 2. Configure Custom Domain

1. In Render Dashboard → Service → Settings
2. Scroll to "Custom Domain"
3. Add your domain: `api.yourdomain.com`
4. Update DNS records:
   ```
   CNAME api.yourdomain.com → attendance-backend.onrender.com
   ```
5. Render auto-provisions SSL certificate

### 3. Set Up Cron Jobs (Optional)

For scheduled email reports:

1. Render Dashboard → New → Cron Job
2. Name: `attendance-email-report`
3. Image URL: `https://attendance-backend.onrender.com` (or Docker image)
4. Command: `node backend/utils/emailService.js`
5. Cron Schedule: `0 9 * * MON` (9 AM every Monday)
6. Add same environment variables as web service

---

## Monitoring & Logs

### View Logs
1. Render Dashboard → Service name
2. Tabs: **Logs** (runtime), **Events** (deployment)
3. Filter by date/time
4. Export logs if needed

### Monitoring
- Dashboard shows service status
- CPU, Memory, Disk usage visible
- Automatic restart on crashes
- Email alerts for errors (optional)

### Set Alerts (Optional)
1. Dashboard → Service settings
2. Scroll to "External database"
3. Configure webhook for alerts
4. Or integrate with Sentry for error tracking

---

## Troubleshooting

### Build Failures

**Problem:** "Command exited with non-zero status"
```
Check logs → Look for error message
```

**Common causes:**
- Missing environment variables
- Node modules not installing
- Build script failing

**Solution:**
```bash
# Test locally first
cd backend
npm install
npm start

# Check for errors
npm run build  # if there's a build step
```

### Runtime Errors

**Problem:** Service crashing on startup
```
MONGODB_URI connection failed
JWT_SECRET not set
```

**Solution:**
1. Check environment variables are set
2. Verify MongoDB is accessible
3. Check logs for specific error

### Deploy Stops at 100%

**Problem:** Service deployed but not responding
```
curl https://your-service.onrender.com
```

**Likely causes:**
- Port not exposed (should auto-expose 5000)
- Application not starting correctly
- Database not accessible

**Fix:**
1. Check Start Command is correct: `node backend/server.js`
2. Ensure PORT environment variable exists
3. Verify database connection

### "Service is Spinning Up"

**Problem:** Service shows "Spinning up" for more than 5 minutes

**Causes:**
- Free tier is cold-starting (takes 30-50s)
- Application taking long to start
- Memory limit reached

**Solutions:**
- Upgrade to Starter plan ($7/month)
- Or add cron job to keep service warm:
  ```
  curl https://your-service.onrender.com/api/health
  ```
  Run every 5 minutes

---

## Cost Breakdown

### Minimal Setup (Recommended):
| Service | Cost | Notes |
|---------|------|-------|
| Backend on Render | Free | ($7/mo for paid) |
| Frontend on Vercel | Free | (Recommended) |
| MongoDB Atlas | Free | (M0 tier, 512MB) |
| SendGrid | Free | (100 emails/day) |
| **Total** | **$0-7/mo** | |

### Recommended Setup:
| Service | Cost | Notes |
|---------|------|-------|
| Backend on Render | $7/mo | Starter tier |
| Frontend on Vercel | Free | Auto-scaling CDN |
| MongoDB Atlas | $5/mo | Shared tier |
| SendGrid | $0-10/mo | Pay as you go |
| Custom Domain | $10/yr | Registrar |
| **Total** | **~$25-30/mo** | |

---

## Performance Tips

### Keep Service Warm
Free tier services sleep after 15 min inactivity. To prevent:

1. Add a Cron job to ping health endpoint:
   ```
   # Every 15 minutes
   curl https://your-backend.onrender.com/api/health
   ```

2. Or upgrade to Starter plan ($7/month) for always-on

### Database Optimization
- Use MongoDB Atlas free tier for development
- Upgrade cluster if needed for production
- Enable query monitoring
- Create indexes on frequently queried fields

### Frontend Optimization
- Vercel auto-optimizes React builds
- CDN delivers from edge locations globally
- Automatic code splitting

---

## GitHub Integration

### Auto-Deploy on Push

By default, pushing to `main` triggers automatic deployment:

1. Edit code locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Render automatically redeploys
4. Check dashboard for deployment status
5. Service goes live in 2-3 minutes

### Manual Redeploy

Without code changes:
1. Dashboard → Service → Manual Deploy
2. Select commit
3. Click "Redeploy"

---

## Environment Variables Reference

### Backend Required:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong_random_string
CLIENT_URL=https://yourdomain.com
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Backend Optional:
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
SENTRY_DSN=https://...
```

### Frontend Required:
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
```

---

## Scaling to Production

### If Traffic Increases:

1. **Backend:**
   - Upgrade from Free → Starter ($7/mo)
   - Or to Standard tier ($12/mo) for high traffic
   - Render scales automatically within tier

2. **Database:**
   - MongoDB Atlas: Scale cluster
   - Increase connections: DB_POOL_SIZE

3. **Frontend:**
   - Vercel auto-scales (paid plans)
   - Global CDN already enabled

---

## Support & Next Steps

### Immediate Next Steps:
1. [ ] Create Render account
2. [ ] Connect GitHub repository
3. [ ] Create backend web service
4. [ ] Set up MongoDB Atlas
5. [ ] Add all environment variables
6. [ ] Deploy backend
7. [ ] Deploy frontend (Vercel)
8. [ ] Test login and basic flows
9. [ ] Configure custom domain
10. [ ] Monitor logs for issues

### Resources:
- Render Docs: https://render.com/docs
- GitHub Integration: https://render.com/docs/deploy-from-repo
- Environment Variables: https://render.com/docs/environment-variables
- Node.js Guide: https://render.com/docs/deploy-node-express-app

---

## Render Dashboard Locations

| Task | Location |
|------|----------|
| Create service | **+** → New Web Service |
| View logs | Service → Logs tab |
| Set variables | Service → Environment |
| Redeploy | Service → Manual Deploy |
| Configure domain | Service → Settings |
| View billing | Account → Usage & Billing |

---

Last Updated: March 2026
For Render Deployment
