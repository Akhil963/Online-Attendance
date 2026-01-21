- [ ] Project setup complete
- [ ] Backend server configured
- [ ] Frontend application configured
- [ ] Database models created
- [ ] API endpoints implemented
- [ ] Authentication system working
- [ ] Attendance tracking functional
- [ ] Leave management implemented
- [ ] Dashboard analytics working
- [ ] Responsive design complete
- [ ] Email scheduling setup
- [ ] Testing completed
- [ ] Deployment ready

## Setup Instructions

### Quick Start

1. **Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm start
   ```

3. **Create initial data:**
   - Create departments via API
   - Sign up employees
   - Start marking attendance

### Configuration Files

All configuration files use `.env` pattern:
- `backend/.env` - Server configuration
- `frontend/.env` - Client configuration

### Database

MongoDB must be running before starting the server:
- Local: `mongodb://localhost:27017/attendance_system`
- Atlas: Update `MONGODB_URI` in `.env`

### Default Admin Account

After setup, create first admin account through signup process.
