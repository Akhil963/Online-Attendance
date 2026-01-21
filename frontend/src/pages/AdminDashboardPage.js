import React, { useState, useEffect, useCallback } from 'react';
import { leaveAPI, attendanceAPI, departmentAPI, employeeAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { toast } from 'react-toastify';

const AdminDashboardPage = () => {
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    maleCount: 0,
    femaleCount: 0,
    departments: [],
    presentCount: 0,
    absentCount: 0,
    onLeaveCount: 0,
    totalDepartments: 0
  });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch attendance data
      const attendanceResponse = await attendanceAPI.getAllAttendance();
      
      // Fetch department data with employee counts
      const deptData = await departmentAPI.getDepartmentsWithCount();
      
      // Fetch all employees for gender count
      const employeeResponse = await employeeAPI.getAllEmployees();
      const allEmployees = employeeResponse.data.employees || [];
      
      const totalEmployees = allEmployees.length;
      const maleCount = allEmployees.filter(e => e.gender === 'Male').length;
      const femaleCount = allEmployees.filter(e => e.gender === 'Female').length;
      
      // Count attendance today
      const today = moment().format('YYYY-MM-DD');
      const todayAttendance = attendanceResponse.data.attendance.filter(a => 
        moment(a.date).format('YYYY-MM-DD') === today
      );
      
      const presentCount = todayAttendance.filter(a => a.status === 'present').length;
      const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
      const onLeaveCount = todayAttendance.filter(a => 
        a.status === 'planned_leave'
      ).length;
      
      setStatistics({
        departments: deptData.data.departments,
        totalEmployees: totalEmployees,
        maleCount: maleCount,
        femaleCount: femaleCount,
        presentCount: presentCount,
        absentCount: absentCount,
        onLeaveCount: onLeaveCount,
        totalDepartments: deptData.data.departments.length
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      const response = await leaveAPI.getAllLeaves({ status: 'pending' });
      setLeaves(response.data.leaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchLeaves();
  }, [fetchDashboardData, fetchLeaves]);

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveAPI.approveLeave(leaveId);
      toast.success('Leave approved!');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await leaveAPI.rejectLeave(leaveId, { rejectionReason: 'Rejected by admin' });
      toast.success('Leave rejected!');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const chartData = statistics.departments.map(dept => ({
    name: dept.name,
    count: Number(dept.employeeCount) || Number(dept.count) || 0
  }));

  const maleCount = Number(statistics.maleCount) || 0;
  const totalEmployees = Number(statistics.totalEmployees) || 0;
  const femaleCount = Number(statistics.femaleCount) || 0;
  const otherCount = totalEmployees - maleCount - femaleCount;

  const genderData = [
    { name: 'Male', value: maleCount > 0 ? maleCount : 0, fill: '#3b82f6' },
    { name: 'Female', value: femaleCount > 0 ? femaleCount : 0, fill: '#ec4899' },
    { name: 'Other', value: otherCount > 0 ? otherCount : 0, fill: '#8b5cf6' }
  ].filter(item => item.value > 0);

  const attendanceData = [
    { name: 'Present', value: statistics.presentCount, color: '#10b981', bg: 'bg-green-100' },
    { name: 'Absent', value: statistics.absentCount, color: '#ef4444', bg: 'bg-red-100' },
    { name: 'On Leave', value: statistics.onLeaveCount, color: '#f59e0b', bg: 'bg-amber-100' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Welcome back! Here's your system overview</p>
            </div>
            <div className="text-right text-slate-600">
              <p className="text-sm">{moment().format('dddd')}</p>
              <p className="text-lg font-semibold text-slate-900">{moment().format('MMMM DD, YYYY')}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics - Professional Color Scheme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {/* Total Employees - Primary Blue */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all hover:shadow-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{Number(statistics.totalEmployees) || 0}</p>
                <p className="text-xs text-slate-500 mt-2">👥 Active staff</p>
              </div>
              <div className="text-4xl opacity-20 text-blue-600">👤</div>
            </div>
          </div>

          {/* Present Today - Green */}
          <div className="bg-white rounded-xl p-6 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all hover:shadow-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Present Today</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{Number(statistics.presentCount) || 0}</p>
                <p className="text-xs text-slate-500 mt-2">✓ {statistics.totalEmployees > 0 ? Math.round((statistics.presentCount / statistics.totalEmployees) * 100) : 0}% attendance</p>
              </div>
              <div className="text-4xl opacity-20 text-emerald-600">✓</div>
            </div>
          </div>

          {/* Absent Today - Red */}
          <div className="bg-white rounded-xl p-6 border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all hover:shadow-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Absent Today</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{Number(statistics.absentCount) || 0}</p>
                <p className="text-xs text-slate-500 mt-2">✕ Not marked</p>
              </div>
              <div className="text-4xl opacity-20 text-red-600">✕</div>
            </div>
          </div>

          {/* On Leave - Amber */}
          <div className="bg-white rounded-xl p-6 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all hover:shadow-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">On Leave</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{Number(statistics.onLeaveCount) || 0}</p>
                <p className="text-xs text-slate-500 mt-2">📅 Approved</p>
              </div>
              <div className="text-4xl opacity-20 text-amber-600">📅</div>
            </div>
          </div>

          {/* Departments - Cyan */}
          <div className="bg-white rounded-xl p-6 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-lg transition-all hover:shadow-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Departments</p>
                <p className="text-3xl font-bold text-cyan-600 mt-2">{Number(statistics.totalDepartments) || 0}</p>
                <p className="text-xs text-slate-500 mt-2">🏢 Active</p>
              </div>
              <div className="text-4xl opacity-20 text-cyan-600">🏢</div>
            </div>
          </div>

          {/* Pending Leaves - Indigo */}
          <div className="bg-white rounded-xl p-6 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all hover:shadow-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Pending Leaves</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{leaves.length || 0}</p>
                <p className="text-xs text-slate-500 mt-2">⏳ Awaiting</p>
              </div>
              <div className="text-4xl opacity-20 text-indigo-600">⏳</div>
            </div>
          </div>
        </div>

        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {attendanceData.map((item, idx) => {
            const colorClasses = {
              '#10b981': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', hover: 'hover:border-emerald-400 hover:shadow-emerald-100' },
              '#ef4444': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', hover: 'hover:border-red-400 hover:shadow-red-100' },
              '#f59e0b': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', hover: 'hover:border-amber-400 hover:shadow-amber-100' }
            };
            const colors = colorClasses[item.color] || colorClasses['#10b981'];
            
            return (
              <div
                key={idx}
                className={`${colors.bg} rounded-xl p-6 border-2 ${colors.border} ${colors.hover} transition-all hover:shadow-lg group cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${colors.text} text-sm font-semibold uppercase`}>{item.name}</p>
                    <p className={`${colors.text} text-5xl font-bold mt-3`}>
                      {item.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {item.value > 0 ? '✓ Recorded' : '○ None'}
                    </p>
                  </div>
                  <div
                    className={`text-6xl opacity-15 group-hover:opacity-25 transition-opacity ${colors.text}`}
                  >
                    {item.name === 'Present' ? '✓' : item.name === 'Absent' ? '✕' : '📅'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gender Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-slate-400 text-center hover:shadow-lg transition-all hover:shadow-slate-100">
            <p className="text-slate-600 text-sm font-semibold uppercase">Total Staff</p>
            <p className="text-4xl font-bold text-slate-900 mt-3">{totalEmployees}</p>
            <p className="text-xs text-slate-500 mt-2">👥 Employees</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 text-center hover:shadow-lg transition-all hover:shadow-blue-100">
            <p className="text-blue-600 text-sm font-semibold uppercase">Male</p>
            <p className="text-4xl font-bold text-blue-600 mt-3">{maleCount}</p>
            <p className="text-xs text-blue-500 mt-2">{totalEmployees > 0 ? Math.round((maleCount / totalEmployees) * 100) : 0}%</p>
          </div>
          
          <div className="bg-pink-50 rounded-xl p-6 border-2 border-pink-200 hover:border-pink-400 text-center hover:shadow-lg transition-all hover:shadow-pink-100">
            <p className="text-pink-600 text-sm font-semibold uppercase">Female</p>
            <p className="text-4xl font-bold text-pink-600 mt-3">{femaleCount}</p>
            <p className="text-xs text-pink-500 mt-2">{totalEmployees > 0 ? Math.round((femaleCount / totalEmployees) * 100) : 0}%</p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 text-center hover:shadow-lg transition-all hover:shadow-purple-100">
            <p className="text-purple-600 text-sm font-semibold uppercase">Other</p>
            <p className="text-4xl font-bold text-purple-600 mt-3">{otherCount}</p>
            <p className="text-xs text-purple-500 mt-2">{totalEmployees > 0 ? Math.round((otherCount / totalEmployees) * 100) : 0}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Department Chart */}
          <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-400 transition-all hover:shadow-lg hover:shadow-blue-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Employees by Department
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.length > 0 ? chartData : [{name: 'No Data', count: 0}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="rgba(100, 116, 139, 0.8)" />
                <YAxis stroke="rgba(100, 116, 139, 0.8)" />
                <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '2px solid #3b82f6', borderRadius: '8px', color: '#1e293b' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Chart */}
          <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span> Gender Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData.length > 0 ? genderData : [{name: 'No Data', value: 1, fill: '#e5e7eb'}]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${isNaN(value) ? 0 : value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(genderData.length > 0 ? genderData : [{name: 'No Data', value: 1, fill: '#e5e7eb'}]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '2px solid #3b82f6', borderRadius: '8px', color: '#1e293b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Leave Approvals */}
        <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 transition-all hover:shadow-lg hover:shadow-indigo-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">⏳</span> Pending Leave Approvals
          </h2>
          {leaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="px-4 py-3 text-slate-700 font-semibold uppercase text-xs">Employee</th>
                    <th className="px-4 py-3 text-slate-700 font-semibold uppercase text-xs">Type</th>
                    <th className="px-4 py-3 text-slate-700 font-semibold uppercase text-xs">From - To</th>
                    <th className="px-4 py-3 text-slate-700 font-semibold uppercase text-xs">Days</th>
                    <th className="px-4 py-3 text-slate-700 font-semibold uppercase text-xs">Reason</th>
                    <th className="px-4 py-3 text-slate-700 font-semibold uppercase text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(leave => (
                    <tr key={leave._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{leave.employeeId?.name}</td>
                      <td className="px-4 py-3 capitalize text-slate-700">{leave.leaveType}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {moment(leave.startDate).format('MMM DD')} - {moment(leave.endDate).format('MMM DD')}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">{leave.numberOfDays}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{leave.reason.substring(0, 25)}...</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleApproveLeave(leave._id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-lg hover:shadow-emerald-200 transform hover:scale-105"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(leave._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-lg hover:shadow-red-200 transform hover:scale-105"
                        >
                          ✕ Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">✓ No pending leaves</p>
              <p className="text-slate-500 text-sm mt-1">All leave requests have been processed</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
