import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyToken: () => api.get('/auth/verify-token'),
  getCurrentUser: () => api.get('/auth/me'),
  updateAdminProfile: (data) => api.post('/auth/update-admin-profile', data),
  forgotPassword: (email, userType) => api.post('/auth/forgot-password', { email, userType }),
  verifyResetToken: (token) => api.get('/auth/verify-reset-token', { params: { token } }),
  resetPassword: (token, password, confirmPassword, userType) =>
    api.post('/auth/reset-password', { token, password, confirmPassword, userType }),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Attendance APIs
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/check-in', {}),
  checkOut: () => api.post('/attendance/check-out', {}),
  getHistory: (month, year) => api.get(`/attendance/history?month=${month}&year=${year}`),
  getTodayAttendance: () => api.get('/attendance/today'),
  getAllAttendance: (params) => api.get('/attendance/all', { params })
};

// Leave APIs
export const leaveAPI = {
  applyLeave: (data) => api.post('/leave/apply', data),
  getMyLeaves: () => api.get('/leave/my-leaves'),
  getAllLeaves: (params) => api.get('/leave/all', { params }),
  approveLeave: (leaveId) => api.post(`/leave/approve/${leaveId}`, {}),
  rejectLeave: (leaveId, data) => api.post(`/leave/reject/${leaveId}`, data),
  // Unplanned leave APIs
  createUnplannedLeave: (data) => api.post('/leave/unplanned/create', data),
  getUnplannedLeaves: (params) => api.get('/leave/unplanned/list', { params })
};

// Notice APIs
export const noticeAPI = {
  createNotice: (data) => api.post('/notice', data),
  getNotices: () => api.get('/notice'),
  getAllNotices: (params) => api.get('/notice/all', { params }),
  deleteNotice: (noticeId) => api.delete(`/notice/${noticeId}`)
};

// Dashboard APIs
export const dashboardAPI = {
  getEmployeeDashboard: (month, year) => 
    api.get(`/dashboard/employee?month=${month}&year=${year}`),
  getAdminDashboard: (month, year) => 
    api.get(`/dashboard/admin?month=${month}&year=${year}`),
  generateReport: (data) => api.post('/dashboard/report', data)
};

// Employee APIs
export const employeeAPI = {
  getProfile: () => api.get('/employee/profile'),
  updateProfile: (data) => api.put('/employee/profile', data),
  uploadProfilePicture: (data) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/employee/profile-picture', data, config);
  },
  getAllEmployees: (params) => api.get('/employee/all', { params }),
  getEmployeeById: (employeeId) => api.get(`/employee/${employeeId}`),
  updateEmployee: (employeeId, data) => api.put(`/employee/${employeeId}`, data),
  deleteEmployee: (employeeId) => api.delete(`/employee/${employeeId}`),
  approveEmployee: (employeeId) => api.post(`/employee/${employeeId}/approve`),
  rejectEmployee: (employeeId) => api.post(`/employee/${employeeId}/reject`)
};

// Department APIs
export const departmentAPI = {
  getAllDepartments: () => api.get('/department'),
  getDepartmentsWithCount: () => api.get('/department/with-count'),
  createDepartment: (data) => api.post('/department', data),
  updateDepartment: (departmentId, data) => api.put(`/department/${departmentId}`, data),
  deleteDepartment: (departmentId) => api.delete(`/department/${departmentId}`)
};

// Holiday APIs
export const holidayAPI = {
  getHolidays: () => api.get('/holiday/holidays'),
  getWeeklyOffs: (month, year) => api.get(`/holiday/weekly-offs?month=${month}&year=${year}`),
  checkWeeklyOff: (date) => api.get(`/holiday/check/${date}`)
};

export default api;
