import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Calendar, Award } from 'lucide-react';
import moment from 'moment';

const PerformanceAnalyticsPage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedMonth]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [attendanceRes, employeesRes, leavesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/attendance/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/employee/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/leave/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAttendanceData(attendanceRes.data?.attendance || attendanceRes.data || []);
      setEmployees(employeesRes.data?.employees || employeesRes.data || []);
      setLeaves(leavesRes.data?.leaves || leavesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch analytics data', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate performance metrics
  const calculateMetrics = () => {
    const monthStart = moment(selectedMonth, 'YYYY-MM').startOf('month');
    const monthEnd = moment(selectedMonth, 'YYYY-MM').endOf('month');
    
    const monthAttendance = attendanceData.filter(a => {
      const date = moment(a.date);
      return date.isBetween(monthStart, monthEnd, null, '[]');
    });

    const totalRecords = monthAttendance.length;
    const presentCount = monthAttendance.filter(a => a.status === 'present').length;
    const absentCount = monthAttendance.filter(a => a.status === 'absent').length;
    const onLeaveCount = monthAttendance.filter(a => a.status === 'planned_leave').length;
    const weeklyOffCount = monthAttendance.filter(a => a.status === 'weekly_off').length;

    return {
      totalRecords,
      presentCount,
      absentCount,
      onLeaveCount,
      weeklyOffCount,
      attendanceRate: totalRecords > 0 ? ((presentCount / (totalRecords - weeklyOffCount)) * 100).toFixed(2) : 0
    };
  };

  // Get employee performance
  const getEmployeePerformance = () => {
    const monthStart = moment(selectedMonth, 'YYYY-MM').startOf('month');
    const monthEnd = moment(selectedMonth, 'YYYY-MM').endOf('month');
    
    return employees.map(emp => {
      const empAttendance = attendanceData.filter(a => 
        a.employeeId?._id === emp._id &&
        moment(a.date).isBetween(monthStart, monthEnd, null, '[]')
      );
      
      const present = empAttendance.filter(a => a.status === 'present').length;
      const total = empAttendance.length;
      
      return {
        name: emp.name.split(' ')[0],
        fullName: emp.name,
        present,
        total,
        attendance: total > 0 ? ((present / total) * 100).toFixed(1) : 0,
        department: emp.department?.name || 'Unknown'
      };
    }).sort((a, b) => b.attendance - a.attendance);
  };

  // Get daily attendance trend
  const getDailyTrend = () => {
    const monthStart = moment(selectedMonth, 'YYYY-MM').startOf('month');
    const monthEnd = moment(selectedMonth, 'YYYY-MM').endOf('month');
    
    const trend = [];
    let current = moment(monthStart);
    
    while (current.isSameOrBefore(monthEnd)) {
      const dayAttendance = attendanceData.filter(a => 
        moment(a.date).format('YYYY-MM-DD') === current.format('YYYY-MM-DD')
      );
      
      trend.push({
        date: current.format('DD'),
        present: dayAttendance.filter(a => a.status === 'present').length,
        absent: dayAttendance.filter(a => a.status === 'absent').length,
        leave: dayAttendance.filter(a => a.status === 'planned_leave').length
      });
      
      current.add(1, 'day');
    }
    
    return trend.slice(0, 15); // Last 15 days
  };

  // Get leave distribution
  const getLeaveDistribution = () => {
    const monthLeaves = leaves.filter(l => 
      l.status === 'approved' &&
      moment(l.startDate).format('YYYY-MM') === selectedMonth
    );

    const distribution = {
      planned: monthLeaves.filter(l => l.leaveType === 'planned_leave').length,
      medical: monthLeaves.filter(l => l.leaveType === 'medical_leave').length,
      emergency: monthLeaves.filter(l => l.leaveType === 'emergency_leave').length
    };

    return [
      { name: 'Planned', value: distribution.planned, color: '#3B82F6' },
      { name: 'Medical', value: distribution.medical, color: '#10B981' },
      { name: 'Emergency', value: distribution.emergency, color: '#F59E0B' }
    ];
  };

  // Get department metrics
  const getDepartmentMetrics = () => {
    const deptMetrics = {};
    
    employees.forEach(emp => {
      const deptName = emp.department?.name || 'Unassigned';
      if (!deptMetrics[deptName]) {
        deptMetrics[deptName] = { total: 0, present: 0 };
      }
      deptMetrics[deptName].total += 1;
    });

    attendanceData.forEach(att => {
      const emp = employees.find(e => e._id === att.employeeId?._id);
      if (emp) {
        const deptName = emp.department?.name || 'Unassigned';
        if (att.status === 'present') {
          deptMetrics[deptName].present += 1;
        }
      }
    });

    return Object.entries(deptMetrics).map(([dept, data]) => ({
      dept,
      total: data.total,
      present: data.present,
      rate: data.total > 0 ? ((data.present / data.total) * 100).toFixed(1) : 0
    }));
  };

  const metrics = calculateMetrics();
  const employeePerf = getEmployeePerformance();
  const dailyTrend = getDailyTrend();
  const leaveDistribution = getLeaveDistribution();
  const deptMetrics = getDepartmentMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
            <p className="text-gray-600 mt-1">Company-wide attendance and performance metrics</p>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Records</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.totalRecords}</p>
              </div>
              <Calendar className="text-blue-300" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Present</p>
                <p className="text-3xl font-bold text-green-600">{metrics.presentCount}</p>
              </div>
              <Award className="text-green-300" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Absent</p>
                <p className="text-3xl font-bold text-red-600">{metrics.absentCount}</p>
              </div>
              <Users className="text-red-300" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">On Leave</p>
                <p className="text-3xl font-bold text-yellow-600">{metrics.onLeaveCount}</p>
              </div>
              <Calendar className="text-yellow-300" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Attendance Rate</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.attendanceRate}%</p>
              </div>
              <TrendingUp className="text-purple-300" size={32} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Attendance Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Attendance Trend (15 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10B981" name="Present" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                <Bar dataKey="leave" fill="#F59E0B" name="Leave" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leave Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Leave Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leaveDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Department Attendance Rate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptMetrics.map((dept, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">{dept.dept}</p>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{dept.present}/{dept.total}</span>
                  <span className="font-medium text-gray-900">{dept.rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      dept.rate >= 80 ? 'bg-green-500' : dept.rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Employee Performance Ranking</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Employee Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Present Days</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {employeePerf.slice(0, 10).map((emp, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">#{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{emp.department}</td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {emp.present}/{emp.total}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        emp.attendance >= 80
                          ? 'bg-green-100 text-green-800'
                          : emp.attendance >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {emp.attendance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyticsPage;
