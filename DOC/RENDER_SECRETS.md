# Generate Secure Environment Variables for Render Deployment

## Quick Setup - Generate Your Secrets

### Windows PowerShell:
```powershell
# JWT_SECRET
Write-Host "JWT_SECRET:" -ForegroundColor Green
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# SESSION_SECRET
Write-Host "SESSION_SECRET:" -ForegroundColor Green
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# ADMIN_REGISTRATION_CODE (more readable version)
Write-Host "ADMIN_REGISTRATION_CODE:" -ForegroundColor Green
-join ((65..90) + (97..122) | Get-Random -Count 16 | % {[char]$_})
```

### Linux/Mac:
```bash
# JWT_SECRET
echo "JWT_SECRET:"
openssl rand -base64 32

# SESSION_SECRET
echo "SESSION_SECRET:"
openssl rand -base64 32

# ADMIN_REGISTRATION_CODE
echo "ADMIN_REGISTRATION_CODE:"
openssl rand -hex 8
```

### Node.js (Any OS):
```bash
# Run these in terminal
node -e "console.log('JWT_SECRET:', require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('SESSION_SECRET:', require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('ADMIN_CODE:', require('crypto').randomBytes(8).toString('hex'))"
```

---

## Environment Variables for Render

### Copy this template and fill in your values:

```
# === CORE CONFIGURATION ===
NODE_ENV=production
PORT=5000

# === DATABASE (REQUIRED) ===
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system?retryWrites=true&w=majority

# === SECURITY (REQUIRED - Generate above) ===
JWT_SECRET=<PASTE JWT_SECRET HERE>
JWT_EXPIRE=7d
SESSION_SECRET=<PASTE SESSION_SECRET HERE>
ADMIN_REGISTRATION_CODE=<PASTE ADMIN_CODE HERE>

# === FRONTEND CORS (REQUIRED) ===
CLIENT_URL=https://attendance-frontend.onrender.com

# === EMAIL (REQUIRED - SendGrid) ===
SENDGRID_API_KEY=SG.<YOUR_SENDGRID_API_KEY>
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
REPORT_EMAIL=admin@yourdomain.com

# === SMS (OPTIONAL - Twilio) ===
TWILIO_ACCOUNT_SID=AC<YOUR_ACCOUNT_SID>
TWILIO_AUTH_TOKEN=<YOUR_AUTH_TOKEN>
TWILIO_PHONE_NUMBER=+1234567890

# === ERROR TRACKING (OPTIONAL - Sentry) ===
SENTRY_DSN=https://<YOUR_SENTRY_DSN>

# === RATE LIMITING ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# === DATABASE POOL ===
DB_POOL_SIZE=10
DB_TIMEOUT=5000

# === LOGGING ===
LOG_LEVEL=info
API_VERSION=v1

# === SECURITY ===
SECURE_COOKIES=true
```

---

## Getting Each Secret

### 1. JWT_SECRET & SESSION_SECRET
**Generate using commands above** - These are unique keys for your deployment

### 2. MONGODB_URI
**From MongoDB Atlas:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Click "Connect" → "Connect to your application"
4. Copy connection string
5. Replace `<password>` with your user password

Example: `mongodb+srv://admin:MyPassword123@cluster.mongodb.net/attendance_system?retryWrites=true&w=majority`

### 3. SENDGRID_API_KEY
**From SendGrid:**
1. Sign up: https://sendgrid.com
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Copy the key starting with "SG."
5. Also verify sender email in Settings → Sender Authentication

### 4. TWILIO_ACCOUNT_SID & AUTH_TOKEN (Optional)
**From Twilio:**
1. Sign up: https://www.twilio.com
2. Go to Console
3. Find Account SID and Auth Token
4. Get phone number from Phone Numbers section

### 5. SENTRY_DSN (Optional)
**From Sentry:**
1. Sign up: https://sentry.io
2. Create new project → Node.js
3. Copy DSN URL

### 6. ADMIN_REGISTRATION_CODE
**Generate using commands above** - Create a secret code to register first admin

---

## Step-by-Step Render Setup

### 1. Add Secrets to Render Backend Service

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Paste variables from template above
6. Click **"Save Changes"**
7. Service auto-redeploys

### 2. Update Frontend Service (if using Vercel)

1. Go to https://vercel.com
2. Select your project
3. Settings → Environment Variables
4. Add:
   ```
   REACT_APP_API_URL=https://attendance-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://attendance-backend.onrender.com
   ```
5. Redeploy

---

## Validation Checklist

Before clicking "Deploy":

- [ ] JWT_SECRET is 32+ characters
- [ ] SESSION_SECRET is 32+ characters  
- [ ] MONGODB_URI contains actual credentials
- [ ] SENDGRID_API_KEY starts with "SG."
- [ ] ADMIN_REGISTRATION_CODE is set
- [ ] CLIENT_URL points to frontend URL
- [ ] All required variables filled (no blanks)

---

## Test After Deployment

```bash
# Test backend is running
curl https://attendance-backend.onrender.com/api/health

# Should return:
# {"status": "ok"}

# Test database connection
curl https://attendance-backend.onrender.com/api/departments

# Should return departments array (or empty if none exist)
```

---

## Common Issues

### "Invalid connection string"
- Check MONGODB_URI format
- Verify username:password are URL-encoded
- Test locally first

### "Unauthorized - Invalid API key"
- SendGrid key doesn't start with "SG."?
- Key expired or regenerated?
- Copy entire key including "SG."

### "JWT_SECRET is undefined"
- Verify variable is set in Render
- Wait 5 minutes for service to restart
- Check spelling: "JWT_SECRET" (exact case)

### "Service keeps restarting"
- Check JWT_SECRET is set
- Check MONGODB_URI is valid
- Look at logs: Render → Logs tab

---

## Security Notes

⚠️ **IMPORTANT:**
- Never share JWT_SECRET anyone
- Never paste secrets in chat/email
- All values are stored encrypted in Render
- Access logs show who changed what

🔒 **Best Practices:**
- Different secrets for dev/prod
- Rotate secrets every 3 months
- Monitor access logs
- Use strong random values (not "password123")

---

## Need to Regenerate Secrets Later?

To rotate secrets safely:

1. Generate new JWT_SECRET (using commands above)
2. In Render: Dashboard → Backend → Environment
3. Update JWT_SECRET value
4. All existing tokens become invalid
5. Users must login again

---

## Quick Reference

| Variable | Source | Example |
|----------|--------|---------|
| JWT_SECRET | Generate | Random 32 chars |
| SESSION_SECRET | Generate | Random 32 chars |
| MONGODB_URI | MongoDB Atlas | mongodb+srv://... |
| SENDGRID_API_KEY | SendGrid | SG.xxxxx |
| TWILIO_ACCOUNT_SID | Twilio | ACxxxxx |
| TWILIO_AUTH_TOKEN | Twilio | Random string |
| SENTRY_DSN | Sentry | https://xxx@.ingest.sentry.io/xxx |

---

## Files Reference

- [RENDER_QUICK_START.md](RENDER_QUICK_START.md) - 5-min deployment guide
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Complete detailed guide
- [render.yaml](render.yaml) - Infrastructure as code config
- [SECURITY.md](SECURITY.md) - Security guidelines
- [ENV_SETUP.md](ENV_SETUP.md) - Environment variables reference

---

**Ready to deploy? Start here:** [RENDER_QUICK_START.md](RENDER_QUICK_START.md)
