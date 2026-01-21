import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, TrendingUp, AlertCircle, ArrowDownLeft, Building2, Clock } from 'lucide-react';
import moment from 'moment';

const EnhancedAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    employees: [],
    attendance: [],
    leaves: [],
    departments: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [empRes, attRes, leaveRes, deptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/employee/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/attendance/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/leave/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/department', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDashboardData({
        employees: empRes.data.employees || empRes.data,
        attendance: attRes.data.attendance || attRes.data,
        leaves: leaveRes.data.leaves || leaveRes.data,
        departments: deptRes.data.departments || deptRes.data
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const endDate = moment();
    let startDate;
    
    switch(selectedPeriod) {
      case '7days':
        startDate = moment().subtract(7, 'days');
        break;
      case '30days':
        startDate = moment().subtract(30, 'days');
        break;
      case '90days':
        startDate = moment().subtract(90, 'days');
        break;
      default:
        startDate = moment().subtract(7, 'days');
    }
    
    return { startDate, endDate };
  };

  const getAttendanceChart = () => {
    const { startDate, endDate } = getDateRange();
    const chartData = [];
    let current = moment(startDate);

    while (current.isSameOrBefore(endDate)) {
      const dayData = dashboardData.attendance.filter(a => 
        moment(a.date).format('YYYY-MM-DD') === current.format('YYYY-MM-DD')
      );

      chartData.push({
        date: current.format('MMM DD'),
        present: dayData.filter(a => a.status === 'present').length,
        absent: dayData.filter(a => a.status === 'absent').length,
        leave: dayData.filter(a => a.status === 'planned_leave').length
      });

      current.add(1, 'day');
    }

    return chartData;
  };

  const getStatusDistribution = () => {
    const { startDate, endDate } = getDateRange();
    const filtered = dashboardData.attendance.filter(a => 
      moment(a.date).isBetween(startDate, endDate, null, '[]')
    );

    return [
      {
        name: 'Present',
        value: filtered.filter(a => a.status === 'present').length,
        color: '#10B981'
      },
      {
        name: 'Absent',
        value: filtered.filter(a => a.status === 'absent').length,
        color: '#EF4444'
      },
      {
        name: 'Leave',
        value: filtered.filter(a => a.status === 'planned_leave').length,
        color: '#F59E0B'
      },
      {
        name: 'Weekly Off',
        value: filtered.filter(a => a.status === 'weekly_off').length,
        color: '#8B5CF6'
      }
    ].filter(item => item.value > 0);
  };

  const getDepartmentStats = () => {
    return dashboardData.departments.map(dept => {
      const empCount = dashboardData.employees.filter(e => 
        e.department?._id === dept._id
      ).length;
      return {
        name: dept.name,
        employees: empCount,
        status: dept.status || 'active'
      };
    });
  };

  const getAbsentToday = () => {
    const today = moment().format('YYYY-MM-DD');
    return dashboardData.attendance.filter(a => 
      moment(a.date).format('YYYY-MM-DD') === today &&
      a.status === 'absent'
    );
  };

  const getPendingLeaves = () => {
    return dashboardData.leaves.filter(l => l.status === 'pending').length;
  };

  const attendanceChart = getAttendanceChart();
  const statusDistribution = getStatusDistribution();
  const deptStats = getDepartmentStats();
  const absentToday = getAbsentToday();
  const pendingLeaves = getPendingLeaves();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Company overview and key metrics</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Employees */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="text-4xl font-bold text-blue-600">
                  {dashboardData.employees.length}
                </p>
              </div>
              <Users className="text-blue-300" size={40} />
            </div>
            <p className="text-xs text-gray-500">
              Active workforce
            </p>
          </div>

          {/* Current Time Display */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white min-h-64 flex flex-col justify-center items-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="text-blue-200" size={32} />
              </div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-4">Current Time</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-6xl font-bold text-white tracking-wider">
                {currentTime.format('HH:mm:ss')}
              </p>
              <p className="text-xl text-blue-100 font-semibold">
                {currentTime.format('dddd')}
              </p>
              <p className="text-sm text-blue-100 opacity-90">
                {currentTime.format('MMMM DD, YYYY')}
              </p>
            </div>
          </div>

          {/* Absent Today */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm">Absent Today</p>
                <p className="text-4xl font-bold text-red-600">
                  {absentToday.length}
                </p>
              </div>
              <ArrowDownLeft className="text-red-300" size={40} />
            </div>
            <p className="text-xs text-gray-500">
              Need follow-up
            </p>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm">Pending Leaves</p>
                <p className="text-4xl font-bold text-yellow-600">
                  {pendingLeaves}
                </p>
              </div>
              <Calendar className="text-yellow-300" size={40} />
            </div>
            <p className="text-xs text-gray-500">
              Awaiting approval
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Attendance Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Attendance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="leave" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Attendance Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Overview & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Department Statistics - Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Employees by Department</h2>
                <p className="text-sm text-gray-600 mt-1">Distribution across all departments</p>
              </div>
              <Building2 className="text-blue-600" size={28} />
            </div>

            {deptStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `${value} employees`}
                    contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                  />
                  <Bar 
                    dataKey="employees" 
                    fill="#3b82f6" 
                    radius={[8, 8, 0, 0]}
                    name="Employee Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No department data available
              </div>
            )}
          </div>

          {/* Department Cards - Pie Chart with Legend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Department Distribution</h2>
            
            {deptStats.length > 0 ? (
              <div className="space-y-4">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deptStats}
                      dataKey="employees"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      labelLine={false}
                    >
                      {deptStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} employees`} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend Table */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Department Details</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {deptStats.map((dept, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6] }}
                          ></div>
                          <span className="text-sm text-gray-700 font-medium truncate">{dept.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{dept.employees}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data to display
              </div>
            )}
          </div>
        </div>

        {/* Department Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {deptStats.map((dept, idx) => {
            const colors = [
              { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: 'bg-blue-100' },
              { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', icon: 'bg-green-100' },
              { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', icon: 'bg-yellow-100' },
              { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: 'bg-red-100' },
              { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', icon: 'bg-purple-100' },
              { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', icon: 'bg-pink-100' }
            ];
            const color = colors[idx % colors.length];

            return (
              <div 
                key={idx} 
                className={`${color.bg} rounded-lg border-2 ${color.border} p-5 hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Department</p>
                    <h3 className={`text-lg font-bold ${color.text} mt-1`}>{dept.name}</h3>
                  </div>
                  <div className={`${color.icon} p-2 rounded-lg`}>
                    <Users className={`${color.text}`} size={20} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${color.text}`}>{dept.employees}</span>
                    <span className="text-gray-600 text-sm">employees</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`${color.text.replace('text-', 'bg-')} h-2 rounded-full`}
                      style={{ width: `${(dept.employees / Math.max(...deptStats.map(d => d.employees))) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-3 border-t border-gray-300">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      dept.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {dept.status === 'active' ? '✓ Active' : 'Inactive'}
                    </span>
                    <span className={`text-xs font-semibold ${color.text}`}>
                      {dept.employees > 0 ? '→ View' : 'No staff'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold">Total Departments</p>
                <p className="text-4xl font-bold text-blue-900 mt-2">{deptStats.length}</p>
              </div>
              <Building2 className="text-blue-600 opacity-20" size={48} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold">Total Employees</p>
                <p className="text-4xl font-bold text-green-900 mt-2">
                  {deptStats.reduce((sum, d) => sum + d.employees, 0)}
                </p>
              </div>
              <Users className="text-green-600 opacity-20" size={48} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold">Avg Per Department</p>
                <p className="text-4xl font-bold text-purple-900 mt-2">
                  {deptStats.length > 0 
                    ? Math.round(deptStats.reduce((sum, d) => sum + d.employees, 0) / deptStats.length)
                    : 0
                  }
                </p>
              </div>
              <TrendingUp className="text-purple-600 opacity-20" size={48} />
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Alerts & Notifications</h2>
          <div className="space-y-3">
            {absentToday.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium text-red-900">{absentToday.length} Employees Absent</p>
                  <p className="text-sm text-red-700">Today - needs follow-up</p>
                </div>
              </div>
            )}

            {pendingLeaves > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium text-yellow-900">{pendingLeaves} Pending Approvals</p>
                  <p className="text-sm text-yellow-700">Leave requests awaiting review</p>
                </div>
              </div>
            )}

            {absentToday.length === 0 && pendingLeaves === 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <TrendingUp className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium text-green-900">All Systems Nominal</p>
                  <p className="text-sm text-green-700">No active alerts at this time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
