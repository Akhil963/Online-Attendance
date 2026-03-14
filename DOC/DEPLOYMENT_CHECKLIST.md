# Production Deployment Quick Reference

## 📋 Quick Checklist

### Before Going Live
- [ ] All environment variables set in production
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Error tracking (Sentry) connected
- [ ] Email service (SendGrid) working
- [ ] Rate limiting enabled
- [ ] Security headers active (Helmet.js)
- [ ] CORS configured for your domain
- [ ] API keys rotated

### During Deployment
- [ ] Stop old server gracefully
- [ ] Deploy new code
- [ ] Run database migrations (if any)
- [ ] Start new server
- [ ] Verify all endpoints respond
- [ ] Test critical flows

### After Deployment
- [ ] Monitor error logs
- [ ] Check database connections
- [ ] Verify email delivery
- [ ] Monitor performance metrics
- [ ] Update DNS if needed

---

## 🚀 Deployment Commands

### Quick Start (Production)

**Linux/Mac:**
```bash
# Run setup
bash setup-production.sh

# Start application
cd backend
npm start
```

**Windows PowerShell:**
```powershell
# Run setup
.\setup-production.ps1

# Start application
cd backend
npm start
```

### Docker Deployment
```bash
# Build and run
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Heroku Deployment
```bash
# Deploy
git push heroku main

# View logs
heroku logs --tail

# Scale up if needed
heroku ps:scale web=2
```

---

## 🌐 Domain Configuration

### DNS Setup
```
Type  | Name    | Value
------|---------|-----------------------------------
A     | @       | Your server IP address
CNAME | www     | your-domain.com
CNAME | api     | your-api-server.herokuapp.com
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

### Backend (.env)
```env
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
SECURE_COOKIES=true
NODE_ENV=production
```

---

## 🔐 Security Quick Checks

```bash
# Verify .gitignore
grep "\.env" .gitignore           # Should exist
grep "node_modules" .gitignore    # Should exist

# Check for exposed secrets
grep -r "SG\." .                  # Should NOT find SendGrid keys
grep -r "AC" backend/server.js    # Should NOT find Twilio SID

# Verify no console.logs in production
grep -r "console\.log" backend/server.js  # Should be minimal
```

---

## 📊 Monitoring Setup

### Health Check
```bash
curl https://api.yourdomain.com/api/health
```

### Log Monitoring
```bash
# View recent errors
tail -f backend/logs/error.log

# Monitor all logs
tail -f backend/logs/app.log
```

### Database Connection
```bash
# Test MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/dbname"
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check port is available
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Check logs
tail -f backend/logs/app.log

# Verify environment variables
echo $MONGODB_URI
echo $JWT_SECRET
```

### Database connection fails
```bash
# Verify connection string
mongoconnect.test()

# Check IP whitelist
# MongoDB Atlas → Network Access → IP Whitelist

# Verify credentials
# User should have proper permissions
```

### CORS errors
```json
{
  "error": "CORS policy: No 'Access-Control-Allow-Origin'"
}
```
**Fix:**
- Update `CLIENT_URL` in backend `.env`
- Ensure frontend API_URL is correct
- Clear browser cache

### Email not sending
- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- Review SendGrid logs dashboard
- Test with: `curl -X POST https://api.sendgrid.com/v3/mail/send`

### SMS not working (Twilio)
- Verify Account SID and Auth Token
- Ensure SMS channel is enabled in Verify
- Check phone number format (+1234567890)
- Review Twilio logs

---

## 📈 Performance Optimization

### Frontend Build
```bash
cd frontend
npm run build
# Check build size
ls -lh build/

# Analyze bundle
npm install -g source-map-explorer
source-map-explorer 'build/static/js/*.js'
```

### Backend Optimization
```bash
# Monitor processes
top
pm2 monit

# Check memory usage
free -h
```

### Database Optimization
```bash
# MongoDB Atlas Metrics
# Check in browser → Cluster → Metrics

# Common indexes to create:
db.employees.createIndex({ email: 1 })
db.attendance.createIndex({ employee_id: 1, date: 1 })
db.leaves.createIndex({ employee_id: 1, status: 1 })
```

---

## 🔄 Maintenance Tasks

### Daily
- [ ] Monitor error logs
- [ ] Check system resources
- [ ] Verify backups ran

### Weekly
- [ ] Review performance metrics
- [ ] Check disk space
- [ ] Update monitoring dashboards

### Monthly
- [ ] Rotate API keys
- [ ] Review security logs
- [ ] Update dependencies (npm update)
- [ ] Database optimization

### Quarterly
- [ ] Full security audit
- [ ] Backup verification
- [ ] Performance review
- [ ] Cost analysis

---

## 📞 Support Resources

### Documentation
- [Security Guide](./SECURITY.md)
- [Environment Setup](./ENV_SETUP.md)  
- [Full Deployment Guide](./PRODUCTION_DEPLOYMENT.md)

### Troubleshooting
- Check `.github/workflows/deploy.yml` for CI/CD issues
- Review logs: `backend/logs/`
- Sentry Dashboard: Error tracking
- MongoDB Atlas Console: Database issues

### Getting Help
- Backend Issues: Check `backend/server.js`
- Frontend Issues: Check `frontend/src/services/api.js`
- Database Issues: MongoDB Atlas support
- Email Issues: SendGrid documentation
- SMS Issues: Twilio documentation

---

## 🎯 Success Criteria

After deployment, verify:
- ✅ Frontend loads at https://yourdomain.com
- ✅ API responds at https://api.yourdomain.com/api/health
- ✅ Login works
- ✅ Attendance can be marked
- ✅ Emails are sent
- ✅ No 404/500 errors
- ✅ Response time < 2s
- ✅ SSL certificate valid
- ✅ Database connected
- ✅ All logs clean

---

## 🚨 Emergency Procedures

### If server crashes:
1. Stop application: `pm2 stop app`
2. Check logs: `tail -f backend/logs/error.log`
3. Verify database: `mongosh your_connection_string`
4. Restart: `npm start` or `pm2 restart app`

### If database is down:
1. Check MongoDB Atlas console
2. Review cluster status
3. Contact database support if needed
4. Have backup ready to restore

### If DNS is not resolving:
1. Verify DNS records: `nslookup yourdomain.com`
2. Wait for DNS propagation (up to 48 hours)
3. Check domain registrar settings
4. Verify nameservers are correct

### Rollback procedure:
1. Keep previous deployment ready
2. Switch traffic back to previous version
3. Investigate issue before redeploying
4. Test thoroughly before next deployment

---

## 📝 Post-Deployment Verification

Run this checklist after every deployment:

```bash
#!/bin/bash
API_URL="https://your-api.com"

echo "POST-DEPLOYMENT VERIFICATION"
echo "============================"

# 1. Health check
echo "1. Testing health endpoint..."
curl -s $API_URL/api/health | grep -q "working" && echo "✓ OK" || echo "✗ FAILED"

# 2. Database connection
echo "2. Testing database..."
curl -s $API_URL/api/departments | grep -q "error" || echo "✓ OK"

# 3. Response time
echo "3. Checking response time..."
time curl -s -o /dev/null $API_URL/api/health

# 4. SSL certificate
echo "4. Checking SSL certificate..."
echo | openssl s_client -servername your-domain.com -connect api.yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

Last Updated: March 2026
