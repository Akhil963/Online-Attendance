# Security Guidelines

## Environment Variables

### DO NOT
❌ Commit `.env` files to git
❌ Share credentials in code, comments, or documentation
❌ Use default/placeholder credentials in production
❌ Store secrets in client-side code

### DO
✅ Use `.env.example` to document required variables
✅ Generate strong random values for secrets (JWT_SECRET, SESSION_SECRET)
✅ Use different credentials for each environment (dev, staging, production)
✅ Rotate credentials regularly
✅ Use environment-specific `.env` files locally

## Setting Up Environment Variables

### Development
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your local development values
```

### Production
```bash
# Set environment variables using your hosting platform (Vercel, Heroku, etc.)
# OR create a secure .env.production file (never commit this)
```

## Secure Credential Generation

### JWT_SECRET & SESSION_SECRET
Generate using:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Credentials to Change

These are exposed and need immediate rotation after fixing:

1. **Twilio Account SID**: Revoke in Twilio console
2. **Twilio Auth Token**: Revoke in Twilio console
3. **SendGrid API Key**: Revoke in SendGrid console
4. **Sentry DSN**: Consider this as compromised
5. **MongoDB Credentials**: Change if using Atlas
6. **JWT Secret**: Generate a new strong value
7. **Session Secret**: Generate a new strong value
8. **Admin Registration Code**: Change from current value

## MongoDB Security

### For Development
- Local MongoDB: No credentials required
- MongoDB Atlas: Create strong username/password

### For Production (MongoDB Atlas)
```
mongodb+srv://username:password@cluster.mongodb.net/attendance_system?retryWrites=true&w=majority
```

- Create dedicated production user
- Enable IP whitelist (only allow your server IPs)
- Use strong passwords (20+ characters)
- Enable two-factor authentication

## API Keys Rotation Schedule

| Service | Rotation | Priority |
|---------|----------|----------|
| Twilio | Every 90 days | High |
| SendGrid | Every 90 days | High |
| Sentry | Quarterly | Medium |
| MongoDB | Quarterly | High |
| JWT_SECRET | Per deployment | High |

## Deployment Checklist

- [ ] All credentials rotated
- [ ] Production `.env` set in hosting platform
- [ ] HTTPS/SSL enabled
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Error tracking (Sentry) working
- [ ] Monitoring & logs enabled
- [ ] Security headers configured (Helmet)
- [ ] Rate limiting not disabled

## Additional Resources

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit)
