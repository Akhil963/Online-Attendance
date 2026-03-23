import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { leaveAPI, attendanceAPI, departmentAPI, employeeAPI, authAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { toast } from 'react-toastify';
import useLiveDataSync from '../hooks/useLiveDataSync';
import LeaveRejectionModal from '../components/LeaveRejectionModal';
import { X, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';

const AdminDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedLeaveForRejection, setSelectedLeaveForRejection] = useState(null);
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);

  // Employee Registration Modal State
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    departmentId: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [departments, setDepartments] = useState([]);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDashboardData();
    fetchLeaves();
    fetchDepartments();

    // Check if should open create employee modal from URL param
    if (searchParams.get('open') === 'create-employee') {
      setTimeout(() => {
        openEmployeeModal();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle URL param changes
  useEffect(() => {
    if (searchParams.get('open') === 'create-employee') {
      openEmployeeModal();
      // Clear the URL param without re-triggering this effect
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('open');
      setSearchParams(newParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAllDepartments();
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchDashboardData(), fetchLeaves()]);
  }, [fetchDashboardData, fetchLeaves]);

  const { isLive, lastSyncAt } = useLiveDataSync({
    onRefresh: refreshAll,
    events: ['attendance:updated', 'stats:updated', 'leave:updated', 'employee:statusUpdated', 'notification:new'],
    soundEvents: ['leave:updated', 'employee:statusUpdated', 'notification:new'],
    pollMs: 30000,
    enabled: true
  });

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveAPI.approveLeave(leaveId);
      toast.success('Leave approved!');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleRejectLeave = (leave) => {
    setSelectedLeaveForRejection(leave);
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = async (rejectionReason) => {
    try {
      setRejectingLeaveId(selectedLeaveForRejection._id);
      await leaveAPI.rejectLeave(selectedLeaveForRejection._id, { rejectionReason });
      toast.success('Leave rejected with reason provided!');
      setRejectionModalOpen(false);
      setSelectedLeaveForRejection(null);
      setRejectingLeaveId(null);
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to reject leave');
      setRejectingLeaveId(null);
    }
  };

  // Employee Registration Handlers
  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openEmployeeModal = () => {
    setRegistrationData({
      name: '',
      email: '',
      phone: '',
      gender: '',
      departmentId: '',
      password: '',
      confirmPassword: ''
    });
    setShowEmployeeModal(true);
  };

  const handleRegisterEmployee = async (e) => {
    e.preventDefault();

    // Validation
    if (!registrationData.name || !registrationData.email || !registrationData.gender ||
        !registrationData.departmentId || !registrationData.password || !registrationData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (registrationData.password !== registrationData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registrationData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setRegistrationLoading(true);
      const response = await authAPI.register({
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone || undefined,
        gender: registrationData.gender,
        departmentId: registrationData.departmentId,
        password: registrationData.password,
        role: 'employee'
      });

      const newEmployee = response.data.employee;
      setCreatedEmployee(newEmployee);
      setShowEmployeeModal(false);
      setShowSuccessModal(true);

      // Refresh dashboard data
      fetchDashboardData();

      toast.success('Employee account created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create employee account');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedEmployee(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's your system overview</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white">
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{isLive ? 'Live' : 'Syncing'}</span>
                {lastSyncAt && (
                  <span className="text-[10px] text-gray-400 font-semibold">{new Date(lastSyncAt).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
            <div className="text-left md:text-right text-gray-600">
              <p className="text-sm">{moment().format('dddd')}</p>
              <p className="text-lg font-semibold text-gray-900">{moment().format('MMMM DD, YYYY')}</p>
            </div>
            <button
              onClick={openEmployeeModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-blue-200 transform hover:scale-105"
            >
              <UserPlus size={20} />
              <span>Create Employee</span>
            </button>
          </div>
        </div>

        {/* Key Metrics - Professional Color Scheme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {/* Total Employees - Primary Blue */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all hover:shadow-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.totalEmployees || 0}</p>
                <p className="text-xs text-gray-500 mt-2">👥 Active staff</p>
              </div>
              <div className="text-4xl opacity-20 text-blue-600">👤</div>
            </div>
          </div>

          {/* Present Today - Green */}
          <div className="bg-white rounded-xl p-6 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all hover:shadow-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Present Today</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{statistics.presentCount || 0}</p>
                <p className="text-xs text-gray-500 mt-2">✓ {statistics.totalEmployees > 0 ? Math.round((statistics.presentCount / statistics.totalEmployees) * 100) : 0}% attendance</p>
              </div>
              <div className="text-4xl opacity-20 text-emerald-600">✓</div>
            </div>
          </div>

          {/* Absent Today - Red */}
          <div className="bg-white rounded-xl p-6 border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all hover:shadow-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Absent Today</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{statistics.absentCount || 0}</p>
                <p className="text-xs text-gray-500 mt-2">✕ Not marked</p>
              </div>
              <div className="text-4xl opacity-20 text-red-600">✕</div>
            </div>
          </div>

          {/* On Leave - Amber */}
          <div className="bg-white rounded-xl p-6 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all hover:shadow-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">On Leave</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{statistics.onLeaveCount || 0}</p>
                <p className="text-xs text-gray-500 mt-2">📅 Approved</p>
              </div>
              <div className="text-4xl opacity-20 text-amber-600">📅</div>
            </div>
          </div>

          {/* Departments - Cyan */}
          <div className="bg-white rounded-xl p-6 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-lg transition-all hover:shadow-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Departments</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{statistics.totalDepartments || 0}</p>
                <p className="text-xs text-gray-500 mt-2">🏢 Active</p>
              </div>
              <div className="text-4xl opacity-20 text-cyan-600">🏢</div>
            </div>
          </div>

          {/* Pending Leaves - Indigo */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all hover:shadow-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Pending Leaves</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{leaves.length || 0}</p>
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
                    <p className={`${colors.text} text-3xl md:text-5xl font-bold mt-3`}>
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
              <BarChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', count: 0 }]}>
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
                  data={genderData.length > 0 ? genderData : [{ name: 'No Data', value: 1, fill: '#e5e7eb' }]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${isNaN(value) ? 0 : value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(genderData.length > 0 ? genderData : [{ name: 'No Data', value: 1, fill: '#e5e7eb' }]).map((entry, index) => (
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
                          onClick={() => handleRejectLeave(leave)}
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

        {/* Leave Rejection Modal */}
        <LeaveRejectionModal
          isOpen={rejectionModalOpen}
          onClose={() => {
            setRejectionModalOpen(false);
            setSelectedLeaveForRejection(null);
          }}
          onConfirm={handleConfirmReject}
          leave={selectedLeaveForRejection}
          loading={rejectingLeaveId !== null}
        />

        {/* Employee Registration Modal */}
        {showEmployeeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="text-blue-600" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Create Employee Account</h2>
                </div>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleRegisterEmployee} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={registrationData.name}
                      onChange={handleRegistrationChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={registrationData.email}
                      onChange={handleRegistrationChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="john@company.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={registrationData.phone}
                      onChange={handleRegistrationChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={registrationData.gender}
                      onChange={handleRegistrationChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                    <select
                      name="departmentId"
                      value={registrationData.departmentId}
                      onChange={handleRegistrationChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={registrationData.password}
                        onChange={handleRegistrationChange}
                        required
                        minLength={8}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={registrationData.confirmPassword}
                        onChange={handleRegistrationChange}
                        required
                        minLength={8}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                        placeholder="Repeat password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEmployeeModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registrationLoading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {registrationLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && createdEmployee && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md text-center p-8">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>

              {/* Success Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Created Successfully!</h2>
              <p className="text-gray-600 mb-6">The employee account has been created. Please share the login details with the employee.</p>

              {/* Employee Details Card */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Employee ID</span>
                    <span className="font-bold text-gray-900">{createdEmployee.employeeId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Name</span>
                    <span className="font-bold text-gray-900">{createdEmployee.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Email</span>
                    <span className="font-bold text-gray-900">{createdEmployee.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Password</span>
                    <span className="font-bold text-blue-600 text-sm">Shared by admin</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    closeSuccessModal();
                    openEmployeeModal();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Create Another
                </button>
                <button
                  onClick={closeSuccessModal}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboardPage;
