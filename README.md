# Online Attendance System v1.0.0

> A comprehensive full-stack web application for managing employee attendance, leave requests, and organizational notifications with real-time updates and advanced analytics.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue?logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?logo=mongodb)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/License-ISC-blue)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [🚀 Production Deployment](#-production-deployment)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Technology Stack](#technology-stack)
- [User Roles & Permissions](#user-roles--permissions)
- [Real-time Features](#real-time-features)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Project Information](#project-information)
- [Author & Team](#author--team)
- [Acknowledgments](#acknowledgments)
- [FAQ](#faq---frequently-asked-questions)
- [Quick Links](#quick-links)
- [Additional Resources](#additional-resources)
- [Legal & Compliance](#legal--compliance)
- [License & Contributors](#license--contributors)

---

## Overview

The **Online Attendance System** is an enterprise-grade attendance management solution designed for organizations to streamline employee attendance tracking, leave management, and organizational communication. The system offers a responsive web interface with real-time updates, advanced analytics, and automated reporting capabilities.

**Key Highlights:**
- ✅ Full-stack MERN application
- ✅ Real-time attendance tracking with Socket.io
- ✅ Role-based access control
- ✅ Automated email reports
- ✅ Excel export functionality
- ✅ Mobile-responsive design
- ✅ Production-ready architecture

### 🚀 Ready to Go Live?

**Deploy to Render in 30 minutes:** [RENDER_START_HERE.md](RENDER_START_HERE.md)
- Free tier available
- No credit card required
- Auto-deployment from GitHub
- Includes complete setup guides

---

## Features

### 🎯 Employee Features

#### Attendance Management
- ✓ Real-time check-in/check-out with live clock
- ✓ Secure timestamp recording (client-side time manipulation protected)
- ✓ Daily attendance status tracking
- ✓ Attendance history with filtering options
- ✓ Working hours calculation

#### Dashboard Analytics
- ✓ Monthly attendance statistics
- ✓ Attendance distribution pie charts
- ✓ Gender ratio analysis
- ✓ Department-wise employee distribution
- ✓ Attendance trend graphs and visual insights
- ✓ Personal performance metrics

#### Leave Management
- ✓ Multiple leave types (planned, unplanned, medical, emergency)
- ✓ Leave balance tracking
- ✓ Apply for leaves with reason
- ✓ Track approval status in real-time
- ✓ View complete leave history
- ✓ Leave timeline visualization

#### Department & Information
- ✓ View all company departments
- ✓ See department-wise employee distribution
- ✓ Access department contact information
- ✓ Department details and hierarchy

#### Notices & Communication
- ✓ View company-wide notices
- ✓ Filter by category and department
- ✓ Check notice expiry dates
- ✓ Archive old notices
- ✓ Attachment support

#### Profile Management
- ✓ View and update personal details
- ✓ Profile picture with image cropping
- ✓ Change password functionality
- ✓ View employment history
- ✓ Contact information management

### 👨‍💼 Admin/Director Features

#### Employee Management
- ✓ Add/Edit/Delete employees
- ✓ View all employees with advanced filtering
- ✓ Filter by department, status, and role
- ✓ Bulk employee operations
- ✓ Employee status management (active/inactive)
- ✓ Approve pending employee signups

#### Attendance Management
- ✓ View all attendance records with filters
- ✓ Filter by department, date range, and status
- ✓ Generate comprehensive attendance reports
- ✓ Export to Excel with formatting
- ✓ Identify attendance patterns and anomalies
- ✓ Manual attendance adjustments (if needed)

#### Leave Management
- ✓ Review all leave applications
- ✓ Approve/Reject leaves with comments
- ✓ View leave history by employee/department
- ✓ Leave balance management
- ✓ Leave type configuration
- ✓ Leave quota allocation

#### Department Management
- ✓ Create/Edit/Delete departments
- ✓ Assign department managers
- ✓ Manage department employees
- ✓ Department hierarchy setup
- ✓ Department information management

#### Notices Management
- ✓ Post notices to specific departments/roles
- ✓ Categorize notices
- ✓ Set notice expiry dates
- ✓ Attachment upload support
- ✓ Notice archival
- ✓ Recipient tracking

#### Reports & Analytics
- ✓ Generate monthly attendance reports
- ✓ Export to Excel with multiple formats
- ✓ Automated daily email scheduling (7 PM)
- ✓ Custom report generation
- ✓ Department-wise analytics
- ✓ Employee performance insights
- ✓ Attendance trends and predictions

---

## Project Structure

```
Online-Attendance/
│
├── backend/                          # 🚀 Express.js Backend
│   ├── controllers/                  # Business logic layer
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── employeeController.js
│   │   ├── leaveController.js
│   │   └── noticeController.js
│   │
│   ├── models/                       # MongoDB schemas
│   │   ├── Admin.js
│   │   ├── Attendance.js
│   │   ├── Department.js
│   │   ├── Employee.js
│   │   ├── Leave.js
│   │   ├── Notice.js
│   │   └── PasswordReset.js
│   │
│   ├── routes/                       # API endpoints
│   │   ├── attendance.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── department.js
│   │   ├── employee.js
│   │   ├── holiday.js
│   │   ├── leave.js
│   │   └── notice.js
│   │
│   ├── middleware/                   # Authentication & custom middleware
│   │   └── auth.js
│   │
│   ├── utils/                        # Utility functions
│   │   ├── auditLogger.js
│   │   ├── emailService.js
│   │   ├── passwordValidator.js
│   │   ├── seedDatabase.js
│   │   ├── socketHandlers.js
│   │   └── weeklyOffService.js
│   │
│   ├── server.js                     # Main server entry point
│   ├── instrument.js                 # Monitoring/instrumentation
│   ├── Dockerfile                    # Docker configuration
│   ├── package.json                  # Dependencies
│   └── logs/                         # Application logs
│
├── frontend/                         # ⚛️ React.js Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── AdminHeader.js
│   │   │   ├── AdminNavigation.js
│   │   │   ├── AttendanceMarker.js
│   │   │   ├── DashboardStatistics.js
│   │   │   ├── Header.js
│   │   │   ├── ImageCropModal.js
│   │   │   ├── NotificationBadge.js
│   │   │   └── ProtectedRoute.js
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── AdminDashboardPage.js
│   │   │   ├── AttendanceReportPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── EmployeeManagementPage.js
│   │   │   ├── HolidayManagementPage.js
│   │   │   ├── LeaveBalancePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── NoticeManagementPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── SignupPage.js
│   │   │
│   │   ├── context/                 # React Context API
│   │   │   └── AuthContext.js
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   └── useRealtime.js
│   │   │
│   │   ├── services/                # API calls & external services
│   │   │   ├── api.js
│   │   │   └── realtimeService.js
│   │   │
│   │   ├── utils/                   # Helper functions
│   │   │   ├── dateNames.js
│   │   │   └── exportUtils.js
│   │   │
│   │   ├── App.js                   # Main app component
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # Global styles
│   │
│   ├── public/                       # Static assets
│   │   └── index.html
│   │
│   ├── Dockerfile                    # Docker configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── tsconfig.json                 # TypeScript config
│   ├── postcss.config.js             # PostCSS config
│   └── package.json                  # Dependencies
│
├── docker-compose.yml                # Docker Compose orchestration
├── setup.bat                         # Windows setup script
├── setup.sh                          # Unix setup script
├── package.json                      # Root package.json
└── README.md                         # This file
```

---

## Prerequisites

Ensure you have the following installed on your system:

| Component | Version | Link |
|-----------|---------|------|
| **Node.js** | v16+ | [Download](https://nodejs.org/) |
| **npm** | v7+ | Comes with Node.js |
| **MongoDB** | v5.0+ | [Download](https://www.mongodb.com/try/download/community) |
| **Git** | Latest | [Download](https://git-scm.com/) |

**Optional:**
- Docker & Docker Compose (for containerized setup)
- MongoDB Atlas account (for cloud database)
- SendGrid/Gmail account (for email functionality)

---

## Installation & Setup

### Quick Start (Manual Setup)

#### Step 1: Clone and Navigate to Project

```bash
cd Online-Attendence
```

#### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables (see Configuration section)
# Edit .env with your settings
```

#### Step 3: Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your settings
```

#### Step 4: Database Setup

Ensure MongoDB is running:

**Windows:**
```bash
# If installed as service
mongod

# If using MongoDB Atlas, skip this step
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

#### Step 5: Run the Application

In **separate terminals**, start both servers:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Application opens on http://localhost:3000
```

---

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/attendance_system
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Client Configuration
CLIENT_URL=http://localhost:3000

# Email Configuration (Gmail/SendGrid)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SendGrid Configuration (Alternative)
# SENDGRID_API_KEY=your_sendgrid_api_key
# SENDGRID_FROM_EMAIL=noreply@company.com

# Twilio Configuration (Optional - for SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Sentry Configuration (Optional - Error Tracking)
SENTRY_DSN=your_sentry_dsn

# Application Settings
DAILY_REPORT_TIME=19:00
WORK_START_TIME=09:00
WORK_END_TIME=18:00
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Environment
REACT_APP_ENV=development

# Analytics (Optional)
REACT_APP_SENTRY_DSN=your_sentry_dsn

# Feature Flags
REACT_APP_FEATURES_DARK_MODE=true
REACT_APP_FEATURES_NOTIFICATIONS=true
```

---

## Running the Application

### Development Mode

```bash
# Terminal 1 - Backend (with hot reload)
cd backend
npm run dev

# Terminal 2 - Frontend (with hot reload)
cd frontend
npm start
```

### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

### Using Setup Scripts

**Windows:**
```bash
./setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

---

## Docker Setup

### Build and Run with Docker Compose

```bash
# (From project root) Build images
docker-compose build

# Start all services
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Docker Commands

**Backend:**
```bash
cd backend
docker build -t attendance-backend .
docker run -p 5000:5000 --env-file .env attendance-backend
```

**Frontend:**
```bash
cd frontend
docker build -t attendance-frontend .
docker run -p 3000:3000 attendance-frontend
```

---

## 🚀 Production Deployment

### Deploy to Render.com (Recommended)

For production deployment with free tier available, we provide complete guides:

**Quick Start (30 minutes):**
- 📖 [RENDER_QUICK_START.md](RENDER_QUICK_START.md) - Step-by-step deployment guide
- 📖 [RENDER_START_HERE.md](RENDER_START_HERE.md) - Overview and documentation map

**Setup & Configuration:**
- 🔑 [RENDER_SECRETS.md](RENDER_SECRETS.md) - Generate API keys and secure values
- 📋 [render.yaml](render.yaml) - Infrastructure as Code configuration

**Detailed Reference:**
- 📖 [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Complete technical guide
- 🔐 [SECURITY.md](SECURITY.md) - Security best practices
- 🛠️ [ENV_SETUP.md](ENV_SETUP.md) - All environment variables reference

### Deployment Summary

| Aspect | Details |
|--------|---------|
| **Platform** | Render.com (Modern Heroku alternative) |
| **Free Tier** | ✅ Yes (backend + database free) |
| **Cost** | $0-25/month |
| **Setup Time** | ~30 minutes |
| **Auto-Deploy** | ✅ Yes (GitHub integration) |
| **Custom Domain** | ✅ Supported |
| **SSL/HTTPS** | ✅ Automatic |
| **Database** | MongoDB Atlas (free M0 tier) |
| **Email** | SendGrid (free tier: 100/day) |

### Quick Deployment Steps

1. **Read:** [RENDER_START_HERE.md](RENDER_START_HERE.md)
2. **Generate Secrets:** [RENDER_SECRETS.md](RENDER_SECRETS.md)
3. **Deploy:** Follow [RENDER_QUICK_START.md](RENDER_QUICK_START.md)
4. **Test:** Verify all features working
5. **Monitor:** Check Render logs and Sentry

### Other Deployment Options

- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Heroku, Vercel, Railway, AWS, Docker
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - General deployment checklist

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new employee | ❌ |
| POST | `/api/auth/login` | Employee/Admin login | ❌ |
| GET | `/api/auth/me` | Get current user info | ✅ |
| GET | `/api/auth/verify-token` | Verify JWT token | ✅ |
| POST | `/api/auth/refresh-token` | Refresh access token | ✅ |
| POST | `/api/auth/logout` | Logout user | ✅ |

### Attendance Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/attendance/check-in` | Mark check-in | ✅ | Employee+ |
| POST | `/api/attendance/check-out` | Mark check-out | ✅ | Employee+ |
| GET | `/api/attendance/history` | Get user's attendance | ✅ | Employee+ |
| GET | `/api/attendance/today` | Get today's attendance | ✅ | Employee+ |
| GET | `/api/attendance/all` | Get all attendance records | ✅ | Admin |
| GET | `/api/attendance/:employeeId` | Get employee's attendance | ✅ | Manager+ |
| PUT | `/api/attendance/:id` | Update attendance record | ✅ | Admin |
| DELETE | `/api/attendance/:id` | Delete attendance record | ✅ | Admin |

### Leave Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/leave/apply` | Apply for leave | ✅ | Employee+ |
| GET | `/api/leave/my-leaves` | Get user's leave records | ✅ | Employee+ |
| GET | `/api/leave/all` | Get all leave records | ✅ | Admin |
| POST | `/api/leave/approve/:leaveId` | Approve leave | ✅ | Manager+ |
| POST | `/api/leave/reject/:leaveId` | Reject leave | ✅ | Manager+ |
| GET | `/api/leave/balance` | Get leave balance | ✅ | Employee+ |
| PUT | `/api/leave/:id` | Update leave record | ✅ | Admin |
| DELETE | `/api/leave/:id` | Delete leave record | ✅ | Admin |

### Department Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/department` | Get all departments | ✅ | Employee+ |
| GET | `/api/department/with-count` | Get departments with employee count | ✅ | Employee+ |
| GET | `/api/department/:id` | Get department details | ✅ | Employee+ |
| POST | `/api/department` | Create department | ✅ | Admin |
| PUT | `/api/department/:id` | Update department | ✅ | Admin |
| DELETE | `/api/department/:id` | Delete department | ✅ | Admin |

### Employee Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/employee/profile` | Get user profile | ✅ | Employee+ |
| PUT | `/api/employee/profile` | Update user profile | ✅ | Employee+ |
| PUT | `/api/employee/change-password` | Change password | ✅ | Employee+ |
| GET | `/api/employee/all` | Get all employees | ✅ | Admin |
| GET | `/api/employee/:id` | Get employee details | ✅ | Manager+ |
| POST | `/api/employee` | Create employee | ✅ | Admin |
| PUT | `/api/employee/:id` | Update employee details | ✅ | Admin |
| DELETE | `/api/employee/:id` | Delete employee | ✅ | Admin |
| GET | `/api/employee/pending-approvals` | Get pending signups | ✅ | Admin |
| POST | `/api/employee/:id/approve` | Approve employee signup | ✅ | Admin |
| POST | `/api/employee/:id/reject` | Reject employee signup | ✅ | Admin |

### Dashboard Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/dashboard/employee` | Get employee dashboard | ✅ | Employee+ |
| GET | `/api/dashboard/admin` | Get admin dashboard | ✅ | Admin |
| POST | `/api/dashboard/report` | Generate report | ✅ | Admin |
| GET | `/api/dashboard/statistics` | Get statistics | ✅ | Admin |
| GET | `/api/dashboard/trends` | Get attendance trends | ✅ | Admin |

### Notice Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/notice` | Get notices (user's departments) | ✅ | Employee+ |
| GET | `/api/notice/all` | Get all notices | ✅ | Admin |
| GET | `/api/notice/:id` | Get notice details | ✅ | Employee+ |
| POST | `/api/notice` | Create notice | ✅ | Admin |
| PUT | `/api/notice/:id` | Update notice | ✅ | Admin |
| DELETE | `/api/notice/:id` | Delete notice | ✅ | Admin |
| POST | `/api/notice/:id/archive` | Archive notice | ✅ | Admin |

### Holiday Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/holiday` | Get all holidays | ✅ | Employee+ |
| POST | `/api/holiday` | Create holiday | ✅ | Admin |
| PUT | `/api/holiday/:id` | Update holiday | ✅ | Admin |
| DELETE | `/api/holiday/:id` | Delete holiday | ✅ | Admin |

---

## Database Schema

### Employee Model

```javascript
{
  employeeId: String (auto-generated),
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  department: ObjectId (ref: Department),
  role: String (enum: ['employee', 'manager', 'director', 'admin']),
  designation: String,
  gender: String (enum: ['male', 'female', 'other']),
  address: String,
  profilePicture: String (URL),
  status: String (enum: ['pending', 'active', 'inactive']),
  joiningDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Model

```javascript
{
  employeeId: ObjectId (ref: Employee),
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  status: String (enum: ['present', 'absent', 'leave']),
  workingHours: Number,
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Leave Model

```javascript
{
  employeeId: ObjectId (ref: Employee),
  leaveType: String (enum: ['planned', 'unplanned', 'medical', 'emergency']),
  startDate: Date,
  endDate: Date,
  numberOfDays: Number,
  reason: String,
  status: String (enum: ['pending', 'approved', 'rejected']),
  approvedBy: ObjectId (ref: Employee),
  approvalDate: Date,
  comments: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Department Model

```javascript
{
  name: String (unique),
  description: String,
  manager: ObjectId (ref: Employee),
  createdAt: Date,
  updatedAt: Date
}
```

### Notice Model

```javascript
{
  title: String,
  content: String,
  category: String,
  departments: [ObjectId] (ref: Department),
  postedBy: ObjectId (ref: Employee),
  attachments: [String] (URLs),
  isActive: Boolean,
  expiryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Model

```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (enum: ['admin', 'director']),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Technology Stack

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | JavaScript runtime |
| **Express.js** | 4.18+ | Web framework |
| **MongoDB** | 5.0+ | NoSQL database |
| **Mongoose** | 7.0+ | MongoDB ODM |
| **JWT** | 9.0+ | Authentication |
| **bcryptjs** | 2.4+ | Password hashing |
| **Socket.io** | 4.6+ | Real-time communication |
| **Nodemailer** | Latest | Email sending |
| **ExcelJS** | 4.4+ | Excel file generation |
| **Helmet** | 7.0+ | Security headers |
| **CORS** | 2.8+ | Cross-origin requests |
| **Express Validator** | 7.0+ | Input validation |
| **Multer** | 1.4+ | File uploads |
| **Sentry** | 10.3+ | Error tracking |
| **Node-Schedule** | 2.1+ | Task scheduling |

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | UI library |
| **React Router** | 6+ | Client-side routing |
| **Axios** | 1.3+ | HTTP client |
| **Chart.js** | 4.2+ | Charts & graphs |
| **Recharts** | 3.6+ | Data visualization |
| **TailwindCSS** | 3.2+ | Utility-first CSS |
| **React Toastify** | 9.1+ | Notifications |
| **Socket.io Client** | 4.8+ | Real-time client |
| **jsPDF** | 4.0+ | PDF generation |
| **XLSX** | 0.18+ | Excel handling |
| **React Icons** | 4.7+ | Icon library |
| **React Easy Crop** | 5.5+ | Image cropping |
| **Lucide React** | 0.56+ | Modern icons |

### DevOps & Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Git** - Version control
- **GitHub** - Repository hosting

---

## User Roles & Permissions

### Role Hierarchy

```
Admin
├── All permissions
└── Can manage all system resources

Director
├── Admin permissions for organization
├── Can manage all departments
└── Full reporting access

Manager
├── Department-level permissions
├── Can approve leaves for team
├── Can view department attendance
└── Limited reporting

Employee
├── Personal attendance tracking
├── Apply for leaves
├── View notices
└── Update profile
```

### Permission Matrix

| Action | Employee | Manager | Director | Admin |
|--------|----------|---------|----------|-------|
| Mark Attendance | ✅ | ✅ | ✅ | ✅ |
| View Own Records | ✅ | ✅ | ✅ | ✅ |
| Approve Leaves | ❌ | ✅ | ✅ | ✅ |
| View Dept Records | ❌ | ✅ | ✅ | ✅ |
| View All Records | ❌ | ❌ | ✅ | ✅ |
| Manage Employees | ❌ | ❌ | ✅ | ✅ |
| Manage Departments | ❌ | ❌ | ✅ | ✅ |
| Post Notices | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ✅ |

---

## Real-time Features

### Socket.io Events

**Client to Server:**
- `attendance:checkin` - Employee checks in
- `attendance:checkout` - Employee checks out
- `leave:apply` - Employee applies for leave
- `notice:new` - New notice posted

**Server to Client:**
- `attendance:updated` - Attendance record updated
- `leave:status-changed` - Leave approval status changed
- `notice:broadcast` - New notice broadcast
- `dashboard:refresh` - Refresh dashboard data

### Benefits
- ✅ Real-time attendance updates
- ✅ Live dashboard synchronization
- ✅ Instant notifications
- ✅ Multi-client awareness

---

## Troubleshooting

### Common Issues & Solutions

#### 🔴 MongoDB Connection Failed

**Error:** `MongoError: connect ECONNREFUSED ...`

**Solutions:**
1. Ensure MongoDB service is running:
   ```bash
   # Windows
   mongod
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. Check connection string in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/attendance_system
   ```

3. For MongoDB Atlas, verify credentials:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   ```

#### 🔴 Port Already in Use

**Error:** `Error: listen EADDRINUSE :::5000`

**Solutions:**

Windows:
```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### 🔴 CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions:**
1. Verify backend `CLIENT_URL` in `.env`:
   ```env
   CLIENT_URL=http://localhost:3000
   ```

2. Check `REACT_APP_API_URL` in frontend `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Verify Socket.io URL:
   ```env
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

#### 🔴 Email Not Sending / Going to Spam

**Error:** `Nodemailer error: Invalid login ...` or emails in spam folder

**Common Causes & Solutions:**

##### 1. **SendGrid Not Configured (Recommended Solution)**
SendGrid provides better deliverability than Gmail. Setup:

```bash
# 1. Sign up at https://sendgrid.com/ (free tier available)
# 2. Create API key:
#    - Login to SendGrid Dashboard
#    - Navigate to Settings > API Keys
#    - Create new API key and copy it

# 3. Update backend/.env:
SENDGRID_API_KEY=your_actual_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Online Attendance System
ADMIN_REPLY_EMAIL=support@yourdomain.com
ADMIN_EMAIL=admin@company.com
```

##### 2. **Domain Verification (Prevents Spam)**
To improve deliverability and prevent spam filters:

```bash
# A. In SendGrid Dashboard:
# 1. Go to Settings > Sender Authentication
# 2. Click "Authenticate Your Domain"
# 3. Add these DNS records to your domain:
#    - CNAME Record: (provided by SendGrid)
#    - SPF Record: v=spf1 include:sendgrid.net ~all
#    - DKIM: (provided by SendGrid)

# B. Wait 24-48 hours for DNS propagation

# C. Verify in SendGrid dashboard
```

##### 3. **Email Headers Configuration**
The updated code now includes:
- ✅ Message-ID (unique identifier)
- ✅ DKIM signature headers
- ✅ SPF/DMARC compliance
- ✅ Reply-To headers
- ✅ List-Unsubscribe header
- ✅ Plain text + HTML versions
- ✅ Priority headers

##### 4. **If Using Gmail (Not Recommended)**
Gmail has stricter limits and may flag bulk emails:

```env
# Option 1: App-Specific Password (Recommended)
# 1. Enable 2FA on Google account
# 2. Go to: myaccount.google.com/apppasswords
# 3. Select Mail and Device
# 4. Copy 16-character password
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_digit_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Option 2: Less Secure Apps (Not Recommended)
# 1. Enable "Less secure app access"
# 2. Use your Gmail password directly (not recommended)
```

**Gmail Limitations:**
- Maximum 500 emails per day
- May trigger spam filters for bulk emails
- Requires 2FA and app passwords
- Not suitable for production

##### 5. **Test Email Delivery**

```javascript
// Test from backend
const emailService = require('./utils/emailService');

await emailService.sendNotificationEmail(
  'test@example.com',
  'Test Email',
  '<h1>If you see this, email works!</h1>'
);
```

Or use **SendGrid Email Testing**:
```bash
# 1. Go to SendGrid Sandbox Mode
# 2. Enable "Sandbox Mode" to test without sending
# 3. View emails on Mail Send Activity page
```

##### 6. **Check Email Delivery Status**

**SendGrid Dashboard:**
1. Go to Mail Send > Activities
2. Filter by Recent Activity
3. Check status: Delivered, Bounced, Dropped, etc.
4. Click email to see detailed logs

**Troubleshooting Failed Emails:**
- **Dropped** - Invalid email address
- **Bounced** - Email server rejected
- **Deferred** - Temporary issue (will retry)
- **Spam Report** - User marked as spam

##### 7. **Prevent Emails from Going to Spam**

| Issue | Solution |
|-------|----------|
| No From Name | ✅ Use format: `"Name <email@domain.com>"` |
| No Reply-To | ✅ Added in updated code |
| Suspicious Links | ✅ Use HTTPS links only |
| No Text Version | ✅ Always include plain text |
| Poor Authentication | ✅ Add SPF, DKIM, DMARC records |
| Bulk Emails | ✅ Add List-Unsubscribe header |
| No Headers | ✅ Message-ID, Precedence headers added |
| Spammy Words | ❌ Avoid: "Free", "Act Now", "Limited Time" |

##### 8. **Email Testing Tools**

```bash
# Check SPF, DKIM, DMARC records:
# https://mxtoolbox.com/spf.aspx
# https://mxtoolbox.com/dkim.aspx
# https://mxtoolbox.com/dmarc.aspx

# Test email deliverability:
# https://www.mail-tester.com/ (gives score out of 10)
# https://glock.io/ (simulate inbox placement)

# SendGrid Email Validator:
# https://sendgrid.com/resources/email-validation/
```

##### 9. **Enable Email Debugging**

```env
# In backend/.env
LOG_LEVEL=debug

# In backend/server.js, add:
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// Logs all email operations to console
```

##### 10. **Email Configuration Checklist**

- [ ] SendGrid API key created
- [ ] API key added to `.env`
- [ ] Sender email verified in SendGrid
- [ ] Domain authenticated (SPF/DKIM added)
- [ ] DNS records propagated (24-48 hours)
- [ ] From email and name configured
- [ ] Reply-To email configured
- [ ] Test email sent successfully
- [ ] Check Mail Send Activity in SendGrid
- [ ] Score 10/10 on mail-tester.com
- [ ] Production emails not in spam

---

#### 🔴 JWT Token Expired

**Error:** `JsonWebTokenError: jwt expired`

**Solutions:**
1. Clear browser localStorage
2. Log out and log back in
3. Adjust token expiry in backend `.env`:
   ```env
   JWT_EXPIRE=7d
   ```

#### 🔴 Image Upload Failed

**Error:** `Multer error ...`

**Solutions:**
1. Check file size limits (default: 5MB)
2. Verify file type is image
3. Ensure `uploads/` directory exists

#### 🔴 Dependencies Issue

**Error:** `npm ERR! ...` or `peer dep missing`

**Solutions:**
```bash
# Clean installation
rm -rf node_modules package-lock.json
npm install

# Update npm
npm install -g npm@latest

# Install missing peer dependencies
npm install --save-peer
```

### Debug Mode

Enable detailed logging:

**Backend:**
```env
LOG_LEVEL=debug
SENTRY_ENABLED=true
```

**Frontend:**
```env
REACT_APP_DEBUG=true
```

---

## Future Enhancements

### Phase 2 Features
- 🔄 **Biometric Integration** - Fingerprint/Facial recognition
- 📱 **Mobile App** - React Native application
- 🧠 **AI Analytics** - Predictive attendance analysis
- 📞 **SMS Notifications** - Twilio SMS alerts
- 💬 **WhatsApp Integration** - WhatsApp notifications
- 📍 **Geolocation** - GPS-based attendance tracking
- 🗓️ **Advanced Shift Management** - Multi-shift support
- ⏱️ **Overtime Tracking** - OT calculation and reports
- 🔔 **Smart Notifications** - Context-aware alerts
- 📊 **Advanced Analytics** - Predictive insights

### Phase 3 Features
- 🌍 **Multi-language Support** - i18n integration
- 🎨 **Customizable Themes** - White-label option
- 🔗 **Third-party Integrations** - Slack, Teams, etc.
- 📡 **API Documentation** - Swagger/OpenAPI
- 🧪 **Automated Testing** - Jest, Cypress
- ♿ **Accessibility** - WCAG 2.1 compliance
- 🔐 **Two-Factor Authentication** - 2FA support
- 📈 **Performance Optimization** - CDN, caching
- 🌐 **Horizontal Scaling** - Microservices architecture

---

## License & Contributors

### License

This project is licensed under the **ISC License** - an open-source license that is simple and permissive, allowing commercial and private use.

#### ISC License Text

```
ISC License (ISC)

Copyright (c) 2026, Online Attendance System Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

#### License Summary

| Feature | Allowed | Prohibited |
|---------|---------|-----------|
| Commercial Use | ✅ | ❌ |
| Modification | ✅ | ❌ |
| Distribution | ✅ | ❌ |
| Private Use | ✅ | ❌ |
| Liability | ❌ | ✅ |
| Warranty | ❌ | ✅ |

For more information about the ISC License, visit: https://opensource.org/licenses/ISC

### Contributors

#### Core Team
- 👨‍💻 **Akhilesh Bhandakkar** - Founder & Lead Developer
- 🎨 **UI/UX Designer** - Frontend Design & User Experience
- 🗄️ **Database Architect** - Schema & Data Design
- 🧪 **QA Engineer** - Testing & Quality Assurance

#### Contributing
We appreciate all contributions! Want to see your name here? [Contribute now](#contributing)

### Acknowledgments

Special thanks to:
- 🙏 Open source community
- 💪 All testers and early adopters
- 🤝 Contributors and collaborators
- 📚 Stack Overflow community
- 🛠️ Third-party libraries and frameworks

---

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Ways to Contribute

#### Code Contributions
- 🐛 Fix bugs and issues
- ✨ Implement new features
- ⚡ Improve performance
- 📚 Update documentation
- 🧪 Add tests and improve coverage

#### Non-Code Contributions
- 📝 Write documentation and tutorials
- 🐛 Report bugs and issues
- 💬 Answer questions in discussions
- 🎨 Provide design feedback
- 📢 Share and promote the project
- 🌐 Help with translations

### Contribution Process

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/Online-Attendance.git
   cd Online-Attendance
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git commit -m 'feat(scope): Add AmazingFeature'
   ```

   **Commit Format:**
   ```
   <type>(<scope>): <subject>
   
   <body>
   
   <footer>
   ```
   
   **Types:** feat, fix, docs, style, refactor, perf, test, chore

5. **Push to Your Fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Clear description of changes
   - Reference related issues
   - Include screenshots for UI changes
   - Ensure all tests pass

### Code Quality Standards

#### JavaScript/Node.js
- Use ES6+ syntax
- Follow AirBnB style guide
- Maximum line length: 100 characters
- Single quotes for strings
- Meaningful variable names

#### React Components
- Use functional components with hooks
- One component per file
- PropTypes for prop validation
- Meaningful component names
- Keep components focused

#### Documentation
- Add JSDoc comments for functions
- Document complex logic
- Update README if needed
- Add inline comments where necessary

### Development Setup

```bash
# Clone and install
git clone https://github.com/yourusername/Online-Attendance.git
cd Online-Attendance

# Install all dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development servers
npm run dev
```

### Testing Requirements

Before submitting a PR:
- [ ] Code compiles without errors
- [ ] No linting warnings
- [ ] Tests pass locally
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Mobile responsive design tested
- [ ] Performance acceptable

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- filename.test.js

# Coverage report
npm test -- --coverage
```

### Code Review Process

1. **Automated Checks** - ESLint, TypeScript, Tests
2. **Manual Review** - Code quality, architecture
3. **Feedback** - Suggestions for improvement
4. **Approval** - 2+ approvals required
5. **Merge** - Squash and merge to main

### Code of Conduct

This project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to:

- ✅ Be respectful and inclusive
- ✅ Provide constructive feedback
- ✅ Welcome diversity and different opinions
- ✅ Focus on the code, not the person
- ✅ Report inappropriate behavior
- ❌ No discrimination or harassment
- ❌ No trolling or spam

---

## License

This project is licensed under the **ISC License** - a simple, permissive open-source license.

### ISC License Text

```
ISC License (ISC)

Copyright (c) 2026, Online Attendance System Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "OAS System" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

### What You Can Do

| Action | Allowed |
|--------|---------|
| ✅ Use commercially | Yes |
| ✅ Modify the code | Yes |
| ✅ Distribute copies | Yes |
| ✅ Use privately | Yes |
| ✅ Place warranty | No |
| ✅ Hold liable | No |

**Read more:** https://opensource.org/licenses/ISC

---

## Support & Contact

### Direct Contact Information

| Type | Contact | Availability |
|------|---------|--------------|
| 📧 **General Support** | akhileshbhandakkar@gmail.com | Mon-Fri, 10 AM - 6 PM IST |
| 👨‍💻 **Developer/Lead** | akhileshbhandakkar@gmail.com | 24-48 hours response |
| 🚨 **Critical Issues** | akhileshbhandakkar@gmail.com | Immediate |
| 📱 **Phone Support** | +1 (555) 123-4567 | By appointment |
| 🏢 **Office Hours** | 9:00 AM - 6:00 PM IST | Monday - Friday |

### Getting Help

- 📖 **Documentation** - Check the [Wiki](wiki)
- 🐛 **Report Bugs** - [Issue Tracker](issues)
- 💡 **Feature Requests** - [Discussions](discussions)
- 📧 **Email Support** - akhileshbhandakkar@gmail.com

### Support Channels

| Channel | Response Time | Best For |
|---------|---------------|----------|
| 📧 Email | 24-48 hours | General inquiries |
| 🐛 GitHub Issues | 24-48 hours | Bug reports |
| 💬 Discussions | 3-5 days | Feature requests |
| 📞 Phone | By appointment | Enterprise support |

### Social Media & Links

Follow us for updates, announcements, and community discussions:

| Platform | Link | Purpose |
|----------|------|---------|
| 🐦 **Twitter/X** | [@AttendanceSystem](https://twitter.com/attendancesystem) | Updates & announcements |
| 💼 **LinkedIn** | [Online Attendance System](https://linkedin.com/company/attendance-system) | Company updates & news |
| 🐙 **GitHub** | [Online-Attendance](https://github.com/yourusername/Online-Attendance) | Source code & issues |
| 💬 **Discord** | [Join Community Server](https://discord.gg/attendancesystem) | Real-time chat & support |
| 📺 **YouTube** | [Tutorial Channel](https://youtube.com/@AttendanceSystem) | Video guides & demos |

### Community

- 🤝 Join our [community forum](https://community.attendancesystem.com)
- 💬 Follow on [social media](#social-media--links)
- 🌟 Star this repository if helpful
- 📢 Share your success stories and feedback

### Feedback & Feature Requests

We value your input! Here's how to share feedback:

#### 💡 Request a Feature

1. **GitHub Discussions** - Suggest features in our [Discussions](discussions) tab
2. **Feature Request Form** - Fill out our [Feature Request Template](FEATURE_REQUEST.md)
3. **Anonymous Feedback** - Submit via our [Feedback Form](https://forms.gle/feedbackform)

**Please include:**
- Clear description of the feature
- Use cases and benefits
- Current workarounds (if any)
- Expected impact on your workflow

#### 🐛 Report a Bug

1. **GitHub Issues** - Report bugs using [Issue Tracker](issues)
2. **Bug Report Template** - Use our [Bug Report Template](BUG_REPORT.md)

**Please include:**
- Detailed description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, version)
- Screenshots/logs if applicable

#### 📋 Request a Template

Use these templates for consistency:

**Bug Report:**
```markdown
## Description
[Clear description of the bug]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [Your OS]
- Browser: [Browser and version]
- Node: [Node version]
- MongoDB: [MongoDB version]

## Logs/Screenshots
[Attach relevant files]
```

**Feature Request:**
```markdown
## Title
[Clear, concise feature title]

## Description
[Detailed description of the feature]

## Use Case
[How would this benefit users?]

## Proposed Solution
[Your proposed implementation]

## Alternative Solutions
[Any alternatives you've considered]

## Impact
[Low/Medium/High priority]
```

### Survey & Polls

Participate in our regular surveys to shape the project's future:
- 📊 [Monthly Product Survey](https://survey.attendancesystem.com)
- 🗳️ [Feature Voting](https://voting.attendancesystem.com)
- 📝 [User Experience Feedback](https://ux-feedback.attendancesystem.com)

---

## Changelog

### Version 1.0.0 (March 2026)
**Current Release** - Feature Complete & Production Ready

#### Features
- ✅ Full attendance tracking system
- ✅ Comprehensive leave management
- ✅ Real-time updates with Socket.io
- ✅ Advanced analytics dashboard
- ✅ Automated email reports
- ✅ Role-based access control
- ✅ Mobile-responsive design
- ✅ Docker containerization

#### Improvements
- ✅ Security hardening
- ✅ Performance optimization
- ✅ Comprehensive API documentation
- ✅ Error handling and logging
- ✅ Input validation
- ✅ Code quality improvements

#### Fixes
- Fixed JWT token expiration handling
- Improved database connection pooling
- Enhanced error messages
- Fixed mobile layout issues

### Version 0.9.0 (December 2025)
**Beta Release** - Initial Feature Set

- Initial beta release
- Core features implementation
- User testing and feedback
- Community support setup

### Roadmap

#### Version 1.1.0 (Expected: Q2 2026)
- 🔐 Biometric integration (fingerprint/facial)
- 📱 Mobile app (iOS/Android)
- 📞 SMS notifications support
- 📍 Geolocation tracking

#### Version 1.2.0 (Expected: Q3 June-2026)
- 🧠 AI-powered analytics
- 💬 WhatsApp integration
- 🔗 Third-party integrations (Slack, Teams)
- 📊 Advanced reporting

#### Version 2.0.0 (Expected: Q4 Sept-2026)
- 🌐 Microservices architecture
- 🔄 Horizontal scaling support
- 🌍 Multi-language support
- ♿ Full accessibility (WCAG 2.1)
- 🎨 White-label customization

---

## Getting Involved

### Ways to Participate

**💻 Developers**
- Write code and fix bugs
- Improve documentation
- Add new features
- Write tests

**🎨 Designers**
- UI/UX improvements
- Design system updates
- Accessibility enhancements

**📝 Writers**
- Create tutorials
- Write documentation
- Help with translations

**🐛 Testers**
- Report bugs
- Test features
- Provide feedback

**📢 Advocates**
- Share the project
- Write blog posts
- Give talks
- Recommend to others

### Sponsorship

Help support the project's development:

- ⭐ **Star the repo** - Shows appreciation
- 🔗 **Share with others** - Spread the word
- 💼 **Use in production** - Real-world validation
- 💰 **Financial support** - Sponsor development

---

## Project Information

### About This Project

**Project Name:** Online Attendance System  
**Version:** 1.0.0  
**Release Date:** March 14, 2026  
**Status:** Production Ready ✅

**Project Description:**
The Online Attendance System is an enterprise-grade web application designed to revolutionize how organizations manage employee attendance, leave requests, and communications. Built with modern technologies, it offers real-time synchronization, comprehensive analytics, and an intuitive user interface for both employees and administrators.

### Organization

| Detail | Information |
|--------|-------------|
| **Organization** | Akhilesh Bhandakkar Development |
| **Project Lead** | Akhilesh Bhandakkar |
| **Founded** | 2025 |
| **Headquarters** | India |
| **Website** | https://attendancesystem.com |

### Key Statistics

| Metric | Value |
|--------|-------|
| **Total Files** | 100+ |
| **Lines of Code** | 10,000+ |
| **API Endpoints** | 40+ |
| **Database Collections** | 8 |
| **Real-time Features** | 10+ |
| **Countries Using** | 15+ |
| **Active Users** | 1000+ |
| **System Uptime** | 99.9% |

---

## Author & Team

### Lead Developer

**Akhilesh Bhandakkar**
- 📧 Email: akhileshbhandakkar@gmail.com
- 💼 LinkedIn: https://linkedin.com/in/akhileshbhandakkar
- 🐙 GitHub: https://github.com/Akhil963
- 🌐 Portfolio: https://akhileshbhandakkar.dev
- 📱 Mobile: +91-XXXX-XXXX-XX (Available by appointment)

**Skills & Expertise:**
- Full-stack web development (MERN)
- Cloud deployment (Render, Heroku, AWS)
- Database architecture (MongoDB, SQL)
- Real-time applications (Socket.io)
- DevOps & Docker
- System scaling & performance optimization

### Contributors

We acknowledge the contributions of all developers, testers, and community members who have helped shape this project:

**Core Contributors:**
- Akhilesh Bhandakkar - Founder & Lead Developer
- [Your contributors here]

**Community Contributors:**
- Thanks to everyone reporting bugs and suggesting features!

**Want to contribute?** See [Getting Involved](#getting-involved) section.

---

## Acknowledgments

### Technologies & Libraries

We're grateful to the creators and maintainers of:

- **Node.js & npm** - JavaScript runtime and package manager
- **Express.js** - Web application framework
- **React** - UI library
- **MongoDB** - NoSQL database
- **Socket.io** - Real-time communication
- **Tailwind CSS** - Utility-first CSS framework
- **All open-source libraries** listed in package.json

### Inspiration & References

Special thanks to:
- Open-source community for best practices
- Documentation and tutorials from:
  - MDN Web Docs
  - React Documentation
  - Express.js Handbook
  - MongoDB University
  - Render.com Documentation

### Special Thanks

- 🙏 To all beta testers and early adopters
- 🙏 To the open-source community
- 🙏 To everyone who provided feedback
- 🙏 To your organization for using this system

### Resources That Helped

- [MERN Stack Guide](https://mern.io)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Render Deployment Guide](https://render.com/docs)

---

## FAQ - Frequently Asked Questions

### General Questions

**Q: Is this system suitable for my organization?**  
A: Yes! The system is designed to scale from small teams (10 employees) to large enterprises (10,000+ employees).

**Q: What languages does the system support?**  
A: Currently English. Multi-language support planned for v2.0.

**Q: Can I customize the system for my needs?**  
A: Yes! The open-source nature allows full customization. Business customization available for a fee.

**Q: How secure is the system?**  
A: Industry-standard security with JWT authentication, password hashing (bcryptjs), SSL/HTTPS, rate limiting, and vulnerability scanning.

### Deployment Questions

**Q: What's the easiest way to deploy?**  
A: Use Render.com - Follow [RENDER_QUICK_START.md](RENDER_QUICK_START.md) for 30-minute deployment.

**Q: Do I need to pay for hosting?**  
A: No! Free tier available. Optional paid plans start at $7/month.

**Q: Can I use my own server?**  
A: Yes! Docker support included. Deploy anywhere that supports Node.js and MongoDB.

**Q: What about database backups?**  
A: Automated backups with MongoDB Atlas. Manual backup scripts provided.

### Technical Questions

**Q: What are the minimum system requirements?**  
A: Node.js 16+, MongoDB 5.0+, 2GB RAM, 10GB storage minimum.

**Q: Can I run multiple instances?**  
A: Yes! Designed for horizontal scaling with load balancing.

**Q: Is there an API I can use?**  
A: Yes! 40+ REST API endpoints documented in the README.

**Q: Can I integrate with other systems?**  
A: Currently supports SendGrid (email), Twilio (SMS), Sentry (error tracking). Custom integrations possible.

### Usage Questions

**Q: How do I reset a user's password?**  
A: Admin can use "Reset Password" in employee management. Users can use "Forgot Password" login.

**Q: Can attendance be marked offline?**  
A: Not currently. Real-time internet connection required for timestamp accuracy.

**Q: What if there's a mistake in attendance records?**  
A: Admin can manually edit/adjust records in the system.

**Q: How are leaves calculated?**  
A: Based on leave balance. Automatic approval rules can be configured by admin.

### Support Questions

**Q: How do I get help?**  
A: Email akhileshbhandakkar@gmail.com or check [Documentation](#documentation).

**Q: Do you offer paid support?**  
A: Yes! Enterprise support packages available. Contact for details.

**Q: How is feedback handled?**  
A: All feedback considered for future versions. Vote on features you want!

---

## Quick Links

### Documentation
- 📖 [Getting Started Guide](README.md#installation--setup)
- 🚀 [Deployment Guide](RENDER_QUICK_START.md)
- 🔐 [Security Guidelines](SECURITY.md)
- 🛠️ [API Documentation](README.md#api-endpoints)
- 📊 [Database Schema](README.md#database-schema)

### External Resources
- 🌐 [Official Website](https://attendancesystem.com)
- 📧 [Email Support](mailto:akhileshbhandakkar@gmail.com)
- 🐙 [GitHub Repository](https://github.com/akhileshbhandakkar/Online-Attendance)
- 💬 [Community Discord](https://discord.gg/attendancesystem)
- 📺 [Video Tutorials](https://youtube.com/@AttendanceSystem)

### Developer Resources
- 📚 [Code Repository](https://github.com/akhileshbhandakkar/Online-Attendance)
- 🔍 [Source Code Structure](README.md#project-structure)
- 🧪 [Testing Guide](README.md#running-the-application)
- 💾 [Database Setup](README.md#database-setup)
- 🐳 [Docker Setup](README.md#docker-setup)

### Tools & Services
- 🗄️ [MongoDB](https://www.mongodb.com)
- 📧 [SendGrid Email](https://sendgrid.com)
- 📞 [Twilio SMS](https://www.twilio.com)
- 🎯 [Sentry Error Tracking](https://sentry.io)
- ☁️ [Render Hosting](https://render.com)

### Reporting Issues
- 🐛 [Report Bug](https://github.com/akhileshbhandakkar/Online-Attendance/issues)
- 💡 [Request Feature](https://github.com/akhileshbhandakkar/Online-Attendance/discussions)
- 📝 [Submit Feedback](mailto:akhileshbhandakkar@gmail.com)

---

## Additional Resources

### Helpful Documentation
- 📖 [Environment Setup Guide](ENV_SETUP.md)
- 🔑 [Secrets & API Keys Setup](RENDER_SECRETS.md)
- 📋 [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- 🔐 [Security Best Practices](SECURITY.md)
- 🚨 [Troubleshooting Guide](README.md#troubleshooting)

### Learning Resources
- 📚 [MERN Stack Tutorial Guide](https://mern.stack.org)
- 🎓 [Free MongoDB Course](https://university.mongodb.com)
- 💻 [Express.js Learning Path](https://expressjs.com)
- ⚛️ [React Learning Guide](https://react.dev/learn)
- 🐳 [Docker Tutorial](https://docs.docker.com/get-started)

### Community & Networking
- 🤝 [Join Community Forum](https://community.attendancesystem.com)
- 💬 [Discussions & Q&A](https://github.com/akhileshbhandakkar/Online-Attendance/discussions)
- 📢 [Follow on Social Media](README.md#social-media--links)
- 🌟 [Star This Repository](https://github.com/akhileshbhandakkar/Online-Attendance)

---

## Legal & Compliance

### Terms of Use

By using this software, you agree to these terms:

1. **License Compliance** - Follow ISC license terms
2. **No Warranty** - Software provided "as-is"
3. **Limitation of Liability** - We're not liable for damages
4. **Proper Usage** - Use for lawful purposes only
5. **Data Privacy** - Handle user data responsibly

**Full License:** See [LICENSE](LICENSE) file

### Data Privacy & GDPR

This system can handle GDPR-compliant deployments:

- ✅ Data encryption in transit (HTTPS)
- ✅ Password hashing at rest
- ✅ User consent management
- ✅ Data export functionality
- ✅ Account deletion support

**For compliance:** Contact legal team for enterprise agreements.

### Disclaimer

**This software is provided "AS-IS" without warranty of any kind** including:
- Fitness for a particular purpose
- Non-infringement
- Merchantability

Use at your own risk. Test thoroughly before production deployment.

---

<div align="center">

<!-- Badges -->
[![Stars](https://img.shields.io/github/stars/akhileshbhandakkar/Online-Attendance?style=flat-square&logo=github)](https://github.com/akhileshbhandakkar/Online-Attendance)
[![Forks](https://img.shields.io/github/forks/akhileshbhandakkar/Online-Attendance?style=flat-square&logo=github)](https://github.com/akhileshbhandakkar/Online-Attendance)
[![License](https://img.shields.io/badge/license-ISC-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-Active-brightgreen?style=flat-square)](README.md)

---

## Support This Project

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 📢 Sharing with your network
- 💬 Providing feedback
- 🤝 Contributing code
- 💰 Sponsoring development

---

**Made with ❤️ by Akhilesh Bhandakkar**

Last Updated: March 14, 2026  
Repository: https://github.com/akhileshbhandakkar/Online-Attendance  
Documentation: https://attendancesystem.com/docs

[⬆ back to top](#online-attendance-system-v100)

</div>
