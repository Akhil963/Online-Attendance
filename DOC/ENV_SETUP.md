# Environment Setup Guide

## Quick Start

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your local values
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

---

## Environment Variables Reference

### Backend (.env)

#### Core Configuration
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| NODE_ENV | development | ✓ | Set to `production` for prod |
| PORT | 5000 | ✓ | API server port |
| HOST | 0.0.0.0 | ✓ | Bind to all interfaces |

#### Database
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| MONGODB_URI | mongodb://localhost:27017/attendance_system | ✓ | Local or MongoDB Atlas URL |

#### Authentication
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| JWT_SECRET | [Strong Random String] | ✓ | Min 32 characters |
| JWT_EXPIRE | 7d | ✓ | Token expiration |
| ADMIN_REGISTRATION_CODE | admin123456 | ✓ | Code to create first admin |

#### Frontend Integration
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| CLIENT_URL | http://localhost:3000 | ✓ | Frontend URL (CORS) |

#### Email Service (SendGrid)
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| SENDGRID_API_KEY | SG.xxx | ✓ | Get from SendGrid dashboard |
| SENDGRID_FROM_EMAIL | noreply@domain.com | ✓ | Verified sender email |
| REPORT_EMAIL | admin@domain.com | ✓ | Admin email |

#### SMS Notifications (Twilio) - Optional
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| TWILIO_ACCOUNT_SID | ACxxx | ✗ | SMS optional |
| TWILIO_AUTH_TOKEN | xxx | ✗ | SMS optional |
| TWILIO_PHONE_NUMBER | +1234567890 | ✗ | SMS optional |

#### Error Tracking (Sentry)
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| SENTRY_DSN | https://xxx@xxx.ingest.sentry.io/xxx | ✗ | Error monitoring |

#### Security
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| SESSION_SECRET | [Strong Random String] | ✓ | Min 32 characters |
| SECURE_COOKIES | true | ✓ | HTTPS only in prod |

#### Rate Limiting
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| RATE_LIMIT_WINDOW_MS | 900000 | ✓ | 15 minutes |
| RATE_LIMIT_MAX_REQUESTS | 100 | ✓ | Requests per window |

### Frontend (.env)

| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| REACT_APP_API_URL | http://localhost:5000/api | ✓ | Backend API endpoint |
| REACT_APP_SOCKET_URL | http://localhost:5000 | ✓ | Socket.io server |

---

## Generating Secure Values

### JWT_SECRET & SESSION_SECRET
Generate strong random strings:

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Service Integration

### SendGrid (Email)
1. Sign up at https://sendgrid.com/
2. Create API Key: Settings → API Keys → Create API Key
3. Verify Sender Domain for better deliverability
4. Add to `.env`:
```env
SENDGRID_API_KEY=SG.your_key_here
```

### Twilio (SMS) - Optional
1. Sign up at https://www.twilio.com/
2. Get Account SID & Auth Token from Console
3. Verify phone numbers in Twilio console
4. Enable SMS channel in Verify Services
5. Add to `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Sentry (Error Tracking)
1. Sign up at https://sentry.io/
2. Create new project: Node.js
3. Copy DSN URL
4. Add to `.env`:
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### MongoDB Atlas (Production Database)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create new cluster
3. Create database user with strong password
4. Whitelist IP addresses
5. Copy connection string
6. Add to `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

---

## Environment-Specific Configurations

### Development
- NODE_ENV=development
- Rate limiting disabled
- Logging verbose
- HTTPS not required

### Production
- NODE_ENV=production
- HTTPS required (SECURE_COOKIES=true)
- Rate limiting enabled
- Verbose logging disabled
- All credentials strongly protected
- Database backups enabled

---

## Deployment Checklist

### Before Deploying
- [ ] All APIs credentials generated
- [ ] JWT_SECRET and SESSION_SECRET are strong random strings
- [ ] MONGODB_URI uses production database
- [ ] CLIENT_URL set to production domain
- [ ] SENDGRID_API_KEY is production key
- [ ] All third-party services configured
- [ ] `.env` NOT committed to git
- [ ] HTTPS/SSL certificate obtained
- [ ] Rate limiting enabled
- [ ] Sentry error tracking configured

### Hosting Platforms

#### Vercel (Frontend)
1. Connect GitHub repo
2. Set environment variables in Settings → Environment Variables
3. Deploy

#### Heroku (Backend)
1. Create new app
2. Connect to GitHub
3. Go to Settings → Config Vars
4. Add all `.env` variables
5. Deploy

#### Railway (Backend + Database)
1. Create new project
2. Connect GitHub
3. Add environment variables
4. Deploy

---

## Troubleshooting

**Error: "Missing required environment variables"**
- Check [SECURITY.md](./SECURITY.md) for required vars
- Ensure `.env` file exists in backend folder

**Error: "Cannot connect to MongoDB"**
- Verify MONGODB_URI is correct
- Check MongoDB service is running (locally)
- Verify IP whitelist (MongoDB Atlas)

**Error: "SendGrid API key invalid"**
- Regenerate API key in SendGrid console
- Copy entire key including "SG." prefix

**SMS not working (Twilio)**
- Verify TWILIO_ACCOUNT_SID and AUTH_TOKEN are correct
- Ensure SMS channel is enabled in Twilio Verify
- Check phone number format (+1234567890)

---

## Additional Resources
- [Environment Variables Guide](./SECURITY.md)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
