# Online Attendance System

A comprehensive full-stack web application for managing employee attendance, leave requests, and notifications.

## 🌟 Features

### Employee Side
- **Real-time Attendance Marking**
  - Check-in/Check-out with real-time clock
  - Time cannot be manually changed on client-side
  - Automatic timestamp recording

- **Dashboard Analytics**
  - Monthly attendance statistics
  - Attendance distribution pie charts
  - Gender ratio analysis
  - Department-wise employee distribution
  - Attendance trend graphs

- **Leave Management**
  - Apply for planned/unplanned/medical/emergency leaves
  - View leave history
  - Track approval status

- **Department Information**
  - View all departments
  - See employee count per department
  - Department details

- **Notices Board**
  - View company-wide notices
  - Filter by category and department
  - Check expiry dates

- **Profile Management**
  - View personal details
  - Update profile information
  - Profile picture support

### Admin/Director Features
- **Employee Management**
  - Add/Edit/Delete employees
  - View all employees
  - Filter by department and status

- **Attendance Management**
  - View all attendance records
  - Filter by department and date
  - Generate attendance reports

- **Leave Management**
  - Review leave applications
  - Approve/Reject leaves
  - View leave history

- **Department Management**
  - Create/Edit/Delete departments
  - Manage department employees

- **Notices Management**
  - Post notices to specific departments
  - Categorize notices
  - Set expiry dates

- **Reports**
  - Generate monthly attendance reports
  - Export to Excel
  - Daily email scheduling (7 PM)

## 🏗️ Project Structure

```
Online-Attendance/
├── backend/                 # Node.js/Express server
│   ├── models/             # MongoDB schemas
│   ├── controllers/        # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth and custom middleware
│   ├── utils/            # Helper functions
│   ├── server.js         # Main server file
│   └── package.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   └── App.js
│   ├── public/
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
MONGODB_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

5. **Start MongoDB**
```bash
# On Windows
mongod

# On macOS
brew services start mongodb-community
```

6. **Run the server**
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. **Start the development server**
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/login` - Employee login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-token` - Verify JWT token

### Attendance
- `POST /api/attendance/check-in` - Mark check-in
- `POST /api/attendance/check-out` - Mark check-out
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/all` - Get all attendance (Admin)

### Leave
- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave/my-leaves` - Get employee's leaves
- `GET /api/leave/all` - Get all leaves (Admin)
- `POST /api/leave/approve/:leaveId` - Approve leave
- `POST /api/leave/reject/:leaveId` - Reject leave

### Departments
- `GET /api/department` - Get all departments
- `GET /api/department/with-count` - Get departments with employee count
- `POST /api/department` - Create department (Admin)
- `PUT /api/department/:id` - Update department (Admin)
- `DELETE /api/department/:id` - Delete department (Admin)

### Employee
- `GET /api/employee/profile` - Get user profile
- `PUT /api/employee/profile` - Update profile
- `GET /api/employee/all` - Get all employees (Admin)
- `GET /api/employee/:id` - Get employee details
- `PUT /api/employee/:id` - Update employee (Admin)
- `DELETE /api/employee/:id` - Delete employee (Admin)

### Dashboard
- `GET /api/dashboard/employee` - Get employee dashboard
- `GET /api/dashboard/admin` - Get admin dashboard
- `POST /api/dashboard/report` - Generate report

### Notices
- `POST /api/notice` - Create notice (Admin)
- `GET /api/notice` - Get notices
- `GET /api/notice/all` - Get all notices (Admin)
- `DELETE /api/notice/:id` - Delete notice (Admin)

## 🔐 User Roles

1. **Employee**
   - Can mark attendance
   - Can apply for leaves
   - Can view notices
   - Can view own profile

2. **Manager**
   - All employee permissions
   - Can approve/reject leaves
   - Can view department attendance

3. **Director**
   - All manager permissions
   - Can access admin dashboard
   - Can view all attendance

4. **Admin**
   - Full system access
   - Can manage all records
   - Can post notices
   - Can generate reports

## 📊 Real-time Features

- **Socket.io Integration**
  - Real-time attendance updates
  - Live dashboard updates
  - Instant notifications

## 💾 Database Models

### Employee
- employeeId (auto-generated)
- name, email, password
- department, role
- phone, designation, gender, address
- profilePicture
- status, joiningDate

### Attendance
- employeeId
- date, checkInTime, checkOutTime
- status (present/absent/leave)
- workingHours

### Leave
- employeeId
- leaveType, startDate, endDate
- reason, status
- approvedBy, approvalDate
- numberOfDays

### Department
- name, description
- managerId

### Notice
- title, content, category
- departments, roles
- postedBy, attachments
- isActive, expiryDate

## 📧 Email Reports

- Automated daily reports at 7 PM
- Excel file generation
- Email to admin/managers
- Includes attendance summary

## 🎨 UI/UX Features

- **Responsive Design** - Works on all devices
- **Modern Dashboard** - Interactive charts and statistics
- **Dark/Light Mode Support** - User preference
- **Intuitive Navigation** - Easy to use interface
- **Real-time Clock** - Shows current time
- **Mobile-Friendly** - Optimized for mobile devices

## 🛠️ Technology Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io
- JWT for authentication
- Nodemailer for emails
- ExcelJS for reports

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Chart.js & Recharts for visualizations
- Tailwind CSS for styling
- React Toastify for notifications

## 📝 Testing

To test the application:

1. Create a department first (as admin)
2. Sign up as a new employee
3. Login and mark attendance
4. Apply for leaves
5. View dashboard analytics
6. Check notices and update profile

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check connection string in `.env`
- Verify database name

### CORS Errors
- Check `CLIENT_URL` in backend `.env`
- Ensure frontend URL matches

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributors

- Your Name

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

## 🔄 Future Enhancements

- Biometric integration
- Mobile app (React Native)
- Advanced analytics and reporting
- SMS notifications
- WhatsApp integration
- Geolocation for attendance
- Annual leave balance tracking
- Shift management
- Overtime tracking
