import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Calendar, Award, Info } from 'lucide-react';
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
      const [attendanceRes, employeesRes, leavesRes] = await Promise.all([
        api.get('/attendance/all'),
        api.get('/employee/all'),
        api.get('/leave/all')
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

    const normalizeLeaveType = (type) => {
      const value = String(type || '').toLowerCase();
      if (value === 'planned' || value === 'planned_leave') return 'planned';
      if (value === 'medical' || value === 'medical_leave') return 'medical';
      if (value === 'emergency' || value === 'emergency_leave') return 'emergency';
      return 'other';
    };

    const distribution = {
      planned: monthLeaves.filter(l => normalizeLeaveType(l.leaveType) === 'planned').length,
      medical: monthLeaves.filter(l => normalizeLeaveType(l.leaveType) === 'medical').length,
      emergency: monthLeaves.filter(l => normalizeLeaveType(l.leaveType) === 'emergency').length
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
    const monthStart = moment(selectedMonth, 'YYYY-MM').startOf('month');
    const monthEnd = moment(selectedMonth, 'YYYY-MM').endOf('month');

    employees.forEach(emp => {
      const deptName = emp.department?.name || 'Unassigned';
      if (!deptMetrics[deptName]) {
        deptMetrics[deptName] = { total: 0, presentIds: new Set() };
      }
      deptMetrics[deptName].total += 1;
    });

    attendanceData
      .filter(att => {
        const date = moment(att.date);
        return date.isBetween(monthStart, monthEnd, null, '[]') && att.status === 'present';
      })
      .forEach(att => {
      const emp = employees.find(e => e._id === att.employeeId?._id);
      if (emp) {
        const deptName = emp.department?.name || 'Unassigned';
        if (deptMetrics[deptName]) {
          deptMetrics[deptName].presentIds.add(emp._id);
        }
      }
      });

    return Object.entries(deptMetrics).map(([dept, data]) => ({
      dept,
      total: data.total,
      present: data.presentIds.size,
      rate: data.total > 0 ? ((data.presentIds.size / data.total) * 100).toFixed(1) : 0
    }));
  };

  const metrics = calculateMetrics();
  const employeePerf = getEmployeePerformance();
  const dailyTrend = getDailyTrend();
  const leaveDistribution = getLeaveDistribution();
  const hasLeaveData = leaveDistribution.some(item => item.value > 0);
  const deptMetrics = getDepartmentMetrics();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Performance Analytics
            </h1>
            <p className="text-gray-500 mt-2 text-xs sm:text-sm md:text-base">System-wide growth and efficiency metrics</p>
          </div>
          <div className="relative w-full md:w-auto">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full md:w-auto px-4 sm:px-6 py-2 sm:py-3.5 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-lg sm:rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm sm:text-base text-gray-700 shadow-sm"
            />
          </div>
        </div>

        {/* Key Metrics - Premium Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="group bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-50 text-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center">
                <Calendar size={20} className="sm:w-6 sm:h-6" />
              </div>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg">Month</span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest px-1">Total Logs</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{metrics.totalRecords}</p>
          </div>

          <div className="group bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-6 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg">High</span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest px-1">Presences</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{metrics.presentCount}</p>
          </div>

          <div className="group bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-6 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-lg">Watch</span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest px-1">Absences</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{metrics.absentCount}</p>
          </div>

          <div className="group bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-6 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-lg">Leave</span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest px-1">On Leave</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{metrics.onLeaveCount}</p>
          </div>

          <div className="group bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-6 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg">Rate</span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest px-1">Efficiency</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{metrics.attendanceRate}%</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Daily Attendance Trend */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-900 mb-4 md:mb-8 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-4 md:h-6 bg-blue-500 rounded-full"></div>
              Daily Attendance Pulse
            </h2>
            <div style={{ width: '100%', height: 'clamp(200px, 50vw, 320px)' }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }} dx={-10} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '15px' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="present" fill="url(#colorPresent)" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="url(#colorAbsent)" radius={[4, 4, 0, 0]} name="Absent" />
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Distribution */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-900 mb-4 md:mb-8 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-4 md:h-6 bg-amber-500 rounded-full"></div>
              Leave Allocation
            </h2>
            {hasLeaveData ? (
              <div style={{ width: '100%', height: 'clamp(180px, 45vw, 260px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leaveDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {leaveDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '15px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-xs sm:text-sm font-semibold">
                No leave data for the selected month.
              </div>
            )}
          </div>
        </div>

        {/* Department Performance - Progress Style */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 md:p-10 mb-8 md:mb-12">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-10 tracking-tight flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
            Unit Performance Coverage
            <span className="relative inline-flex items-center group/coverage-help">
              <Info size={16} className="text-gray-400" />
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover/coverage-help:opacity-100">
                Active means unique employees marked present at least once in the selected month.
              </span>
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {deptMetrics.map((dept, idx) => (
              <div key={idx} className="group transition-all hover:translate-x-1">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{dept.dept}</p>
                    <p className="text-sm font-bold text-gray-500 mt-1">{dept.present} Active / {dept.total} Total</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{dept.rate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 p-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 group-hover:brightness-110 shadow-sm ${dept.rate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                        dept.rate >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                          'bg-gradient-to-r from-rose-400 to-rose-500'
                      }`}
                    style={{ width: `${dept.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking Table - Premium Style */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Award className="text-blue-600 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              Elite Performers
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-3 sm:px-6 md:px-8 py-3 sm:py-5 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Global Rank</th>
                  <th className="px-3 sm:px-6 md:px-8 py-3 sm:py-5 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Employee Profile</th>
                  <th className="px-3 sm:px-6 md:px-8 py-3 sm:py-5 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Team</th>
                  <th className="px-3 sm:px-6 md:px-8 py-3 sm:py-5 text-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Activity</th>
                  <th className="px-3 sm:px-6 md:px-8 py-3 sm:py-5 text-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employeePerf.slice(0, 10).map((emp, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-3 sm:px-6 md:px-8 py-3 sm:py-6">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-lg ${idx === 0 ? 'bg-amber-100 text-amber-600 shadow-sm border border-amber-200' :
                          idx === 1 ? 'bg-gray-200 text-gray-600 shadow-sm border border-gray-300' :
                            idx === 2 ? 'bg-orange-100 text-orange-600 shadow-sm border border-orange-200' :
                              'bg-gray-100 text-gray-400 shadow-sm border border-gray-200'
                        }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 md:px-8 py-3 sm:py-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl shadow-lg shadow-blue-100">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-xs sm:text-base md:text-lg truncate">{emp.fullName}</p>
                          <p className="text-[8px] sm:text-xs text-gray-400 font-medium">Verified</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 md:px-8 py-3 sm:py-6 hidden sm:table-cell">
                      <div className="px-2 sm:px-4 py-1 sm:py-1.5 bg-gray-100 rounded-lg sm:rounded-xl w-fit text-[9px] sm:text-sm font-bold text-gray-600 border border-gray-200">
                        {emp.department}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 md:px-8 py-3 sm:py-6 text-center">
                      <p className="text-xs sm:text-sm font-bold text-gray-900">{emp.present} / {emp.total}</p>
                      <p className="text-[8px] sm:text-xs text-gray-400 font-bold uppercase tracking-[0.05em] mt-0.5">Check-ins</p>
                    </td>
                    <td className="px-3 sm:px-6 md:px-8 py-3 sm:py-6">
                      <div className="flex flex-col items-center">
                        <span className={`px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black transition-all group-hover:scale-105 ${emp.attendance >= 80 ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
                            emp.attendance >= 60 ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                              'bg-rose-100 text-rose-600 border border-rose-200'
                          }`}>
                          {emp.attendance}%
                        </span>
                      </div>
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
