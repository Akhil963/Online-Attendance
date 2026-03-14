# Render Deployment - Complete Guide

**Your project is configured to deploy on Render.** This is a modern, free alternative to Heroku.

> **Total Setup Time: 30 minutes** • **Cost: Free-$25/month** • **No credit card needed**

---

## 📚 Documentation Map

### Quick Start (DO THIS FIRST)
👉 **[RENDER_QUICK_START.md](RENDER_QUICK_START.md)** ← Start here!
- 5-minute setup guide
- Step-by-step checklist
- Deployment in under 30 minutes

### Generate Secrets
👉 **[RENDER_SECRETS.md](RENDER_SECRETS.md)**
- Generate JWT_SECRET, SESSION_SECRET
- Get API keys from SendGrid, Twilio, Sentry
- MongoDB connection string setup

### Detailed Reference
👉 **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)**
- Complete technical guide
- Troubleshooting section
- Performance tips
- Scaling information

### General Guides
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Overview of all platforms
- [SECURITY.md](SECURITY.md) - Security best practices
- [ENV_SETUP.md](ENV_SETUP.md) - Environment variables reference

---

## 🚀 Quick Deploy (5 steps)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Grant permission to your repository

### Step 2: Deploy Backend
1. Dashboard → **"New +"** → **"Web Service"**
2. Select your GitHub repo
3. Configure:
   - **Name:** `attendance-backend`
   - **Build:** `cd backend && npm install`
   - **Start:** `cd backend && npm start`
   - **Plan:** Free
4. Add environment variables (see [RENDER_SECRETS.md](RENDER_SECRETS.md))
5. **Create** - Wait ~2 minutes

### Step 3: Deploy Frontend
1. Dashboard → **"New +"** → **"Static Site"**
2. Select GitHub repo
3. Configure:
   - **Name:** `attendance-frontend`
   - **Build:** `cd frontend && npm run build`
   - **Publish:** `frontend/build`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://attendance-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://attendance-backend.onrender.com
   ```
5. **Create** - Wait ~1 minute

### Step 4: Test
- Open `https://attendance-frontend.onrender.com`
- Should load ✅
- Try login
- Mark attendance

### Step 5: Optional - Add Custom Domain
1. Purchase domain at namecheap.com or godaddy.com
2. Backend service → Settings → Add custom domain
3. Update DNS CNAME record
4. SSL auto-provisioned ✅

**You're live!** 🎉

---

## 💰 Pricing

### Free Tier (Recommended for starting)
- **Backend:** Free (spins down after 15 min inactivity)
- **Frontend:** Free (always available)
- **Database:** Free MongoDB (512MB from Atlas)
- **Total:** **FREE**

### Paid Tiers (When scaling up)
- **Backend Starter:** $7/month (always on)
- **Frontend:** Free (CDN included)
- **Database:** $5+/month (as needed)
- **Total:** **$12-50/month**

### Cost by Usage
| Traffic | Cost | When to upgrade |
|---------|------|-----------------|
| Small (<100 users) | Free | Not needed |
| Medium (100-1000 users) | $7-15/mo | When getting frequent cold starts |
| Large (1000+ users) | $25-100/mo | Need auto-scaling |

---

## ✅ Pre-Deployment Checklist

Before you start, make sure:

### Code Ready
- [ ] All code committed to GitHub
- [ ] `.gitignore` includes `.env` files
- [ ] `backend/package.json` has `npm start` script
- [ ] `frontend/package.json` has `npm run build` script
- [ ] No hardcoded secrets in code

### Services Ready (Get API Keys)
- [ ] SendGrid account & API key (free tier)
- [ ] MongoDB Atlas account (free M0 cluster)
- [ ] Optional: Twilio account for SMS
- [ ] Optional: Sentry account for errors

### Generated Values
- [ ] JWT_SECRET (generate using [RENDER_SECRETS.md](RENDER_SECRETS.md))
- [ ] SESSION_SECRET (generate using [RENDER_SECRETS.md](RENDER_SECRETS.md))
- [ ] ADMIN_REGISTRATION_CODE (personal secret code)

---

## 🔑 Environment Variables You Need

### Required (must have):
```
MONGODB_URI          # MongoDB connection string
JWT_SECRET           # Generate - at least 32 chars random
SESSION_SECRET       # Generate - at least 32 chars random
SENDGRID_API_KEY     # From https://sendgrid.com
SENDGRID_FROM_EMAIL  # Your verified email
ADMIN_REGISTRATION_CODE  # Your secret code
```

### Recommended:
```
CLIENT_URL           # https://attendance-frontend.onrender.com
REPORT_EMAIL         # Where to send admin reports
LOG_LEVEL            # info (or debug)
```

### Optional:
```
TWILIO_ACCOUNT_SID   # For SMS notifications
TWILIO_AUTH_TOKEN    # For SMS notifications
SENTRY_DSN          # For error tracking
```

**👉 See [RENDER_SECRETS.md](RENDER_SECRETS.md) for how to generate/get each one.**

---

## 🔄 How Render Works

### Automatic Deployment
Every time you push code:
```bash
git push origin main
```
Render automatically:
1. Detects the push on GitHub
2. Pulls latest code
3. Runs build command
4. Restarts services
5. Updates live in 2-3 minutes

### Manual Redeploy
No code changes needed:
1. Render Dashboard → Service name
2. Click "Manual Deploy"
3. Select commit
4. Wait 2-3 minutes

### Logs
Live logs of everything:
1. Render Dashboard → Service → Logs
2. Scroll to see real-time output
3. Great for debugging

---

## 🐛 Troubleshooting

### Common Issues:

**Build Failed**
- Check logs in Render dashboard
- Test locally: `npm install && npm start`
- Verify `build` and `start` commands are correct

**"Cannot connect to database"**
- Verify MONGODB_URI in environment variables
- Check MongoDB whitelist allows Render IPs

**"CORS errors on frontend"**
- Update `CLIENT_URL` in backend environment
- Make sure it matches frontend URL
- Redeploy backend

**"Service spinning up for 5+ minutes"**
- Normal on free tier
- Upgrade to Starter ($7/mo) to prevent
- Or add cron job to keep warm

**"Email not sending"**
- Verify SendGrid API key is correct
- Check sender email is verified
- View SendGrid logs

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for more troubleshooting.

---

## 📈 Monitoring

### Health Check
```bash
curl https://attendance-backend.onrender.com/api/health
```
Should return `{"status": "working"}`

### View Logs
Render Dashboard → Service → Logs tab
- Real-time logs
- Filter by date
- Export if needed

### Performance Metrics
Render shows:
- CPU usage
- Memory usage
- Disk space
- Request count

### Error Tracking
Set up Sentry for automatic error notifications:
1. Create account at https://sentry.io
2. Copy DSN
3. Add `SENTRY_DSN` environment variable
4. Errors automatically reported

---

## 🔒 Security

### Protect Your Secrets
- ✅ Never commit `.env` files
- ✅ All secrets stored encrypted in Render
- ✅ Use strong random values (not "password123")
- ✅ Rotate every 3 months

### Verify Security
- ✅ HTTPS enabled automatically
- ✅ Rate limiting active
- ✅ CORS configured for your domain
- ✅ Security headers (Helmet.js) active

See [SECURITY.md](SECURITY.md) for detailed guidelines.

---

## 🚀 After Deployment

### Immediate (First 24 hours)
- [ ] Test all features
- [ ] Monitor error logs
- [ ] Verify emails work
- [ ] Check database connection

### Weekly
- [ ] Review error logs
- [ ] Monitor performance
- [ ] Check disk usage

### Monthly
- [ ] Update dependencies
- [ ] Review security
- [ ] Rotate API keys
- [ ] Database maintenance

---

## ❓ Quick FAQ

**Q: Do I need a credit card?**
A: No! Free tier requires no credit card. Annual cost: free to $25/month.

**Q: Will the backend sleep?**
A: Yes, on free tier after 15 min inactivity. Takes 30-50s to wake up. Upgrade to Starter ($7/mo) to prevent.

**Q: How do I update after deployment?**
A: Just push to GitHub - Render redeploys automatically!

**Q: Can I use my own domain?**
A: Yes! Add custom domain in Render settings. SSL auto-provisioned.

**Q: What if something breaks?**
A: Check Render logs, or click "Manual Deploy" to earlier version.

**Q: How much does it cost?**
A: Free tier (up to 100 users), or $7-25/month for scaling.

**Q: Can I scale later?**
A: Yes! Upgrade anytime. Render auto-scales with your traffic.

---

## 📞 Getting Help

### Render Support
- Docs: https://render.com/docs
- Email: support@render.com

### Application Issues
1. Check Render logs first
2. Review [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
3. Test locally: `npm run dev`

### Database Issues
- MongoDB Atlas: https://www.mongodb.com/support
- Connection string issues: [ENV_SETUP.md](ENV_SETUP.md)

### Email Issues
- SendGrid docs: https://sendgrid.com/docs
- [RENDER_SECRETS.md](RENDER_SECRETS.md) for API key setup

---

## 🎯 Next Steps

1. **Read:** [RENDER_QUICK_START.md](RENDER_QUICK_START.md) (5 min read)
2. **Generate:** [RENDER_SECRETS.md](RENDER_SECRETS.md) (create API keys)
3. **Deploy:** Follow the 5-step quick deploy above (20 min)
4. **Test:** Open your frontend URL and verify everything works
5. **Celebrate:** You're live! 🎉

---

## 📋 Deployment Checklist

- [ ] GitHub repo ready
- [ ] Render account created
- [ ] Environment variables generated (see [RENDER_SECRETS.md](RENDER_SECRETS.md))
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Backend URL noted: `https://attendance-backend.onrender.com`
- [ ] Frontend URL noted: `https://attendance-frontend.onrender.com`
- [ ] Can login to frontend ✅
- [ ] Can mark attendance ✅
- [ ] Emails working ✅
- [ ] No errors in logs ✅
- [ ] Optional: Custom domain configured

---

**Ready to go live? Start with:** [RENDER_QUICK_START.md](RENDER_QUICK_START.md)

---

Last Updated: March 2026
For Render.com Deployment
