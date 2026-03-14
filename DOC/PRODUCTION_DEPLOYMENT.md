# Production Deployment Guide

## Pre-Deployment Checklist

### Security & Credentials
- [ ] All sensitive credentials rotated
- [ ] JWT_SECRET generated (strong random string)
- [ ] SESSION_SECRET generated (strong random string)
- [ ] All API keys from services (SendGrid, Twilio, Sentry)
- [ ] `.env` files NOT in git
- [ ] `node_modules/` NOT in git

### Code Quality
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers active
- [ ] CORS configured for production domains only

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Production user created with strong password
- [ ] IP whitelist configured (only allow server IP)
- [ ] Backup configured
- [ ] Indexes created for performance

### Frontend
- [ ] Build optimized: `npm run build`
- [ ] API_URL points to production backend
- [ ] SOCKET_URL points to production server
- [ ] Analytics configured (Sentry, Vercel)

### Testing
- [ ] All critical flows tested
- [ ] Authentication tested
- [ ] Email sending tested
- [ ] Error handling tested

---

## Deployment Options

### Option A: Vercel (Frontend) + Heroku/Railway (Backend)

#### Frontend - Vercel Deployment

**Steps:**
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repo
5. Configure:
   - Framework: Create React App
   - Root Directory: `frontend`
6. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-api-domain.com/api
   REACT_APP_SOCKET_URL=https://your-api-domain.com
   REACT_APP_SENTRY_DSN=your_sentry_dsn
   ```
7. Deploy

**Cost:** Free tier available, $20+/month for production

#### Backend - Heroku Deployment

**Prerequisites:**
- Heroku account
- Heroku CLI installed

**Steps:**
1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create new app:
   ```bash
   cd backend
   heroku create your-app-name
   ```

4. Add MongoDB Atlas addon:
   ```bash
   heroku addons:create mongolab:sandbox
   ```
   OR set MONGODB_URI manually:
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
   ```

5. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secure_jwt_secret
   heroku config:set CLIENT_URL=https://your-frontend-domain.vercel.app
   heroku config:set SENDGRID_API_KEY=your_key
   heroku config:set SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   # ... add all other variables
   ```

6. Deploy:
   ```bash
   git push heroku main
   ```

7. View logs:
   ```bash
   heroku logs --tail
   ```

**Cost:** ~$7/month dyno + database costs

---

### Option B: Railway (Frontend + Backend)

**Advantage:** Single platform for both services

**Steps:**

1. Go to https://railway.app
2. Click "New Project"
3. Select "GitHub Repo"
4. Install Railway GitHub app
5. Select your repository

**Backend Service:**
1. Add Variables from Railway dashboard
2. Connect MongoDB:
   - Add Plugin → MongoDB
   - Copy MongoDB URI to `MONGODB_URI`
3. Configure other environment variables

**Frontend Service:**
1. Add new service
2. Connect same GitHub repo
3. Set Root Directory: `frontend`
4. Build Command: `npm run build`
5. Start Command: `npm start`

**Cost:** ~$5-10/month for hobby plan

---

### Option C: Docker + AWS/Digital Ocean/Linode

**Dockerfile Setup:**

Backend Dockerfile is already configured at `backend/Dockerfile`
Frontend Dockerfile is already configured at `frontend/Dockerfile`

**Using Docker Compose for deployment:**

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**Deployment to Cloud:**

#### AWS EC2:
1. Launch Ubuntu instance
2. Install Docker & Docker Compose
3. Clone repository
4. Update `.env` files
5. Run `docker-compose up -d`

#### Digital Ocean Droplet:
1. Create droplet
2. Install Docker
3. Upload docker-compose.yml
4. Run containers
5. Configure nginx reverse proxy

#### Docker Hub / Docker Registry:
```bash
# Build with tag
docker build -t yourusername/attendance-backend:latest backend/

# Push to Docker Hub
docker push yourusername/attendance-backend:latest

# Pull and run
docker run -e MONGODB_URI=... yourusername/attendance-backend:latest
```

---

## Production Environment Setup

### 1. Set NODE_ENV to Production

**Backend (.env):**
```env
NODE_ENV=production
```

This disables:
- Console output
- nodemon auto-reload
- Verbose logging

Enables:
- Rate limiting
- Helmet.js security headers
- Production error handling

### 2. Configure HTTPS/SSL

**Heroku:**
- Automatic SSL provided
- URL format: `https://your-app.herokuapp.com`

**Vercel:**
- Automatic SSL provided
- URL format: `https://your-domain.vercel.app`

**Self-hosted (AWS/Digital Ocean):**

Use Nginx as reverse proxy with Let's Encrypt:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Install Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

### 3. Database Backups

**MongoDB Atlas:**
- Automated backups included in cluster
- Configure backup schedule in Atlas UI
- Download backups as needed

**Manual Backup:**
```bash
mongodump --uri "mongodb+srv://user:password@cluster.mongodb.net/dbname" --archive=backup.archive

# Restore
mongorestore --archive=backup.archive
```

### 4. Error Tracking & Monitoring

**Sentry Configuration:**

Already configured in `backend/instrument.js`

Monitor in production at http://sentry.io

### 5. Logging

**Log Files Location:**
- Backend logs: `backend/logs/`
- View via: `tail -f backend/logs/app.log`

**Hosting Platform Logs:**
- Heroku: `heroku logs --tail`
- Railway: Dashboard logs
- Vercel: Deployments → Function logs
- AWS CloudWatch: Console dashboard

---

## Performance Optimization

### Frontend
```bash
# Production build
cd frontend
npm run build

# This creates optimized build in build/ folder
# Gzip compression: Enabled
# Code splitting: Automatic
# Minification: Automatic
```

### Backend
- Connection pooling: DB_POOL_SIZE=20
- Rate limiting enabled
- Helmet.js security headers
- CORS optimized for production domain only

### Database
- Indexes created on frequently queried fields
- Connection pooling configured
- Query optimization enabled

---

## Monitoring & Alerts

### 1. Sentry Error Tracking
- Monitors all unhandled errors
- Sends notifications on errors
- Generate reports

### 2. Health Check Endpoint
```bash
curl https://your-api.com/api/health
```

### 3. Database Monitoring
- MongoDB Atlas: Metrics dashboard
- CPU, Memory, Connections monitored

### 4. Uptime Monitoring
Use services like:
- Pingdom
- Uptime Robot
- New Relic

---

## Scaling Considerations

### If Traffic Increases:

**Frontend:**
- Vercel automatically scales
- CDN enabled globally
- Caching optimized

**Backend:**
- For Heroku: Upgrade dyno immediately
- For AWS: Auto-scaling group + load balancer
- Container orchestration: Kubernetes ready

**Database:**
- MongoDB Atlas: Scale cluster up
- Connection pooling: Already configured
- Query optimization: Monitor in Atlas

---

## Rollback Procedure

### Heroku
```bash
# View release history
heroku releases

# Rollback to previous version
heroku rollback
```

### Vercel
- Dashboard → Deployments
- Click previous deployment
- Click "Redeploy"

### Docker
```bash
# Tag current production image
docker tag old-image:latest old-image:backup

# Deploy previous image
docker run old-image:backup
```

---

## Post-Deployment

### First 24 Hours
- [ ] Monitor error logs in Sentry
- [ ] Check database connections
- [ ] Verify email delivery (SendGrid)
- [ ] Test SMS functionality (Twilio)
- [ ] Monitor performance metrics
- [ ] Check uptime monitoring

### Weekly
- [ ] Review error reports
- [ ] Check performance metrics
- [ ] Verify backups running
- [ ] Monitor disk usage

### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Database maintenance
- [ ] Credentials rotation schedule

---

## Troubleshooting

### Application Won't Start
```bash
# Check environment variables
heroku config

# View logs
heroku logs --tail

# Add missing variables
heroku config:set VARIABLE_NAME=value
```

### Database Connection Failed
- Verify MONGODB_URI
- Check IP whitelist (MongoDB Atlas)
- Verify credentials are correct

### CORS Errors
- Update CLIENT_URL in backend for frontend domain
- Verify frontend API_URL is correct

### SSL Certificate Issues
- Verify domain DNS points to server
- Check certificate expiration
- Renew with Let's Encrypt if needed

---

## Security Reminders

🔒 **Never:**
- Expose `.env` files
- Commit credentials to git
- Use default passwords
- Skip SSL/HTTPS
- Disable rate limiting
- Share API keys

✅ **Always:**
- Use strong passwords (20+ chars)
- Rotate credentials quarterly
- Enable two-factor authentication
- Monitor error logs
- Keep dependencies updated
- Review security headers

---

## Cost Estimate

### Recommended Setup (Small-Medium Traffic):

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Frontend) | Free-$20/mo | CDN included |
| Heroku (Backend) | $7/mo | Dyno pricing |
| MongoDB Atlas | $5-50/mo | Cluster dependent |
| SendGrid | Free-$30/mo | Email volume |
| Sentry | Free-$99/mo | Error tracking |
| Custom Domain | ~$10/yr | Registrar |
| **Total** | **~$25-150/mo** | Scales with traffic |

