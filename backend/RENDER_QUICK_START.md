# Render.com Deployment Quick Start

## ⚡ 5-Minute Quick Start

### Prerequisites
- [ ] GitHub account with code pushed
- [ ] Render account (free) at https://render.com
- [ ] MongoDB Atlas account (optional, can use MongoDB Cloud)

### Deploy Backend (3 min)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select GitHub repository **→ "Connect"**
4. Fill form:
   - Name: `attendance-backend`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: **Free**
5. Under "Advanced" → Add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system?retryWrites=true&w=majority
JWT_SECRET=[GENERATE: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
CLIENT_URL=https://attendance-frontend.onrender.com
SENDGRID_API_KEY=SG.[your sendgrid key]
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
REPORT_EMAIL=admin@yourdomain.com
SESSION_SECRET=[GENERATE: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
```

6. Click **"Create Web Service"** and wait (2 min)
7. Copy your URL: `https://attendance-backend.onrender.com`

### Deploy Frontend (2 min)

1. In Render Dashboard → **"New +"** → **"Static Site"**
2. Select GitHub repository
3. Fill form:
   - Name: `attendance-frontend`
   - Build Command: `cd frontend && npm run build`
   - Publish Directory: `frontend/build`
4. Add environment variable:

```
REACT_APP_API_URL=https://attendance-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://attendance-backend.onrender.com
```

5. Click **"Create Static Site"**
6. Wait for deployment (1 min)
7. Your frontend is live! ✅

---

## 📋 Complete Deployment Checklist

### Phase 1: Preparation (15 min)

- [ ] Code committed and pushed to GitHub
- [ ] `.gitignore` includes `.env`
- [ ] `backend/package.json` has correct start script
- [ ] `frontend/package.json` has build script
- [ ] All test locally work: `npm run dev`

### Phase 2: Backend Setup (10 min)

- [ ] Create Render account at https://render.com
- [ ] Connect GitHub repository
- [ ] Create Web Service:
  - [ ] Name: `attendance-backend`
  - [ ] Environment: Node
  - [ ] Build: `cd backend && npm install`
  - [ ] Start: `cd backend && npm start`
  - [ ] Plan: Free
- [ ] Generate JWT_SECRET:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Generate SESSION_SECRET (same command above)
- [ ] Add all environment variables
- [ ] Backend deployed ✅
- [ ] Note backend URL: `https://attendance-backend.onrender.com`

### Phase 3: Database Setup (5 min)

**Option A: MongoDB Atlas (Recommended)**
- [ ] Sign up at https://www.mongodb.com/cloud/atlas
- [ ] Create free M0 cluster
- [ ] Create database user
- [ ] Get connection string
- [ ] Update `MONGODB_URI` in Render backend service

**Option B: MongoDB Cloud (Managed by Render)**
- [ ] Render Dashboard → New → MongoDB
- [ ] Auto-generates connection string
- [ ] Copy to backend environment variables

### Phase 4: Frontend Setup (10 min)

- [ ] Create Static Site in Render
- [ ] Name: `attendance-frontend`
- [ ] Build Command: `cd frontend && npm run build`
- [ ] Publish Directory: `frontend/build`
- [ ] Add environment variables:
  - `REACT_APP_API_URL=https://attendance-backend.onrender.com/api`
  - `REACT_APP_SOCKET_URL=https://attendance-backend.onrender.com`
- [ ] Frontend deployed ✅
- [ ] Note frontend URL: `https://attendance-frontend.onrender.com`

### Phase 5: Testing (10 min)

- [ ] Frontend loads at `https://attendance-frontend.onrender.com` ✅
- [ ] Backend health check: `curl https://attendance-backend.onrender.com/api/health` ✅
- [ ] Can login with test account ✅
- [ ] Can mark attendance ✅
- [ ] Email sending works (check SendGrid logs) ✅

### Phase 6: Custom Domain (Optional, 10 min)

- [ ] Register domain (namecheap.com, godaddy.com, etc.)
- [ ] In Render Dashboard → Backend Service → Settings
- [ ] Add custom domain: `api.yourdomain.com`
- [ ] Update DNS record:
  ```
  Type: CNAME
  Name: api
  Value: attendance-backend.onrender.com
  ```
- [ ] Wait for DNS propagation (5-48 hours)
- [ ] SSL automatically provisioned ✅

### Phase 7: Production Checklist (5 min)

- [ ] `NODE_ENV=production` set ✅
- [ ] Rate limiting enabled ✅
- [ ] SECURE_COOKIES=true ✅
- [ ] All secrets are strong random strings ✅
- [ ] No hardcoded secrets in code ✅
- [ ] Error tracking (Sentry) configured ✅
- [ ] Backups configured (MongoDB Atlas) ✅

---

## 🔧 Environment Variables Needed

### Absolutely Required:
```
MONGODB_URI           # Your database connection string
JWT_SECRET            # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET        # Generate with above command
SENDGRID_API_KEY      # From https://sendgrid.com
SENDGRID_FROM_EMAIL   # Your verified sender email
```

### Recommended:
```
CLIENT_URL            # https://attendance-frontend.onrender.com (or your domain)
ADMIN_REGISTRATION_CODE  # Custom admin code
REPORT_EMAIL          # Where to send reports
```

### Optional:
```
TWILIO_ACCOUNT_SID    # For SMS (optional)
TWILIO_AUTH_TOKEN     # For SMS (optional)
SENTRY_DSN           # For error tracking (optional)
```

### Auto-Set by Render:
```
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
```

---

## 🚀 Deploy Commands

### One-Time Setup (First Deploy)
1. Push to GitHub: `git push origin main`
2. Go to Render Dashboard
3. Create Web Service (backend) - see above
4. Create Static Site (frontend) - see above

### Automatic Redeploy (On Code Push)
```bash
# Just push your changes - Render redeploys automatically!
git add .
git commit -m "Fix bug"
git push origin main
```

Check Render Dashboard → Service → Logs for deployment progress.

### Manual Redeploy (without code changes)
1. Render Dashboard → Service name
2. Click **"Manual Deploy"**
3. Select commit
4. Wait 2-3 minutes

---

## 🐛 Troubleshooting

### "Build failed"
**Check:** Render Dashboard → Logs tab
- Missing `backend/package.json`?
- Missing npm scripts in package.json?
- Module not found?

**Fix:**
```bash
# Test locally first
cd backend
npm install
npm start
```

### "Service spinning up" for 5+ minutes
**Reason:** Free tier takes time to start
**Solution:** Add cron job to keep service warm (prevents cold start)

### "Cannot connect to database"
1. Check MONGODB_URI is correct
2. Verify MongoDB whitelist allows Render IPs
3. Test connection locally with MongoDB CLI

### "CORS errors on frontend"
**Error:** `Access to XMLHttpRequest blocked by CORS`
**Fix:** Update `CLIENT_URL` in backend:
```
CLIENT_URL=https://attendance-frontend.onrender.com
```
Then redeploy backend.

### "Email not sending"
1. Verify SendGrid API key is correct
2. Check sender email is verified in SendGrid
3. View SendGrid logs to see bounce reasons

### "SSL certificate errors"
1. Wait 5-10 minutes for certificate provisioning
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito window
4. If still issues, email Render support

---

## 📊 Monitoring

### View Logs
1. Render Dashboard → Service name
2. Click **"Logs"** tab
3. Scroll to see real-time logs
4. Filter by date if needed

### Check Service Status
1. Dashboard → Service
2. Green light = Running ✅
3. Yellow = Starting
4. Red = Down ❌

### Performance Metrics
- Render shows CPU, Memory, Disk usage
- Free tier limits: 0.5GB memory
- If hitting limits, upgrade to Starter ($7/mo)

### Error Tracking
- Errors logged in Render
- Also check Sentry (if configured)
- SendGrid logs for email issues

---

## 💰 Cost Breakdown

| Component | Free Tier | Starter |
|-----------|-----------|---------|
| Backend | Free | $7/mo |
| Frontend | Free | Free |
| Database (MongoDB Atlas) | Free | $5+/mo |
| Email (SendGrid) | Free | Free-$25/mo |
| Domain | - | ~$10/yr |
| **Total** | **Free** | **~$25-40/mo** |

### Upgrade When Needed:
- Service constantly spinning = Upgrade to Starter (+$7/mo)
- More than 1GB database = Upgrade MongoDB Atlas (+$5-50/mo)
- High email volume = Pay SendGrid (per 1000 emails)

---

## 🔒 Security Checklist

- [ ] No `.env` files in git
- [ ] All secrets are strong random strings
- [ ] No hardcoded database passwords
- [ ] HTTPS/SSL enabled (automatic on Render)
- [ ] SECURE_COOKIES=true for production
- [ ] Rate limiting enabled
- [ ] CORS configured for your domain only

---

## 📝 After Deployment

### First 24 Hours:
- [ ] Monitor error logs
- [ ] Test all critical features
- [ ] Verify email and SMS work
- [ ] Check database connectivity
- [ ] Review Sentry for errors

### Weekly:
- [ ] Review logs for errors
- [ ] Check performance metrics
- [ ] Verify backups running

### Monthly:
- [ ] Rotate API keys
- [ ] Update dependencies: `npm update`
- [ ] Database maintenance
- [ ] Security audit

---

## 📞 Need Help?

**Render Support:**
- Email: support@render.com
- Docs: https://render.com/docs

**Database Support:**
- MongoDB Atlas: https://www.mongodb.com/support
- SendGrid: https://support.sendgrid.com

**Application Issues:**
- Check Render Logs first
- Review [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed guide
- Check Sentry for errors: https://sentry.io

---

## ✅ Success Indicators

After deployment, you should see:
✅ Frontend loads without errors
✅ Backend health check responds: `curl https://..../api/health`
✅ Can login with test account
✅ Attendance marking works
✅ Emails are sent (check SendGrid)
✅ No errors in Render logs
✅ SSL certificate valid (https:// works)
✅ Response time under 2 seconds

---

**Total Deployment Time: ~30 minutes**

Now you're ready to go live! 🎉

