import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, TrendingUp, AlertCircle, ArrowDownLeft, Building2, Clock, ShieldCheck } from 'lucide-react';
import moment from 'moment';

const EnhancedAdminDashboard = () => {
  const navigate = useNavigate();
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
      const [empRes, attRes, leaveRes, deptRes] = await Promise.all([
        api.get('/employee/all'),
        api.get('/attendance/all'),
        api.get('/leave/all'),
        api.get('/department')
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

    switch (selectedPeriod) {
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
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 font-outfit">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-black italic tracking-tighter text-xl">OAS</div>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-12 font-outfit space-y-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight uppercase leading-none">
              Command Center
            </h1>
            <p className="text-slate-400 mt-4 text-xs font-black uppercase tracking-[0.4em]">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-8 py-4 bg-white/40 backdrop-blur-3xl border border-gray-200/60 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-xs text-gray-600 uppercase tracking-wide shadow-sm appearance-none pr-16"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Period: 30 Cycles</option>
                <option value="90days">Period: 90 Cycles</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover:scale-110 transition-transform">
                <TrendingUp size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid - Premium Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Employees */}
          <div className="group bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-sm border border-gray-200/60 p-10 transition-all hover:shadow-2xl hover:shadow-blue-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Users size={24} />
              </div>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">Workforce</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-3 relative z-10">Present Today</p>
            <p className="text-6xl font-black text-slate-900 tracking-tighter relative z-10 leading-none">
              {dashboardData.employees.length}
            </p>
          </div>

          {/* Current Time Display - Premium Aesthetic */}
          <div className="bg-slate-950 rounded-[2.5rem] shadow-2xl p-10 text-white flex flex-col justify-center items-center border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative z-10 text-center">
              <div className="mb-8 inline-flex p-4 bg-white/5 rounded-2xl backdrop-blur-3xl border border-white/10 shadow-2xl group-hover:scale-110 transition-transform">
                <Clock className="text-blue-400" size={24} />
              </div>
              <p className="text-5xl font-black text-white tracking-widest leading-none mb-6">
                {currentTime.format('HH:mm')}
                <span className="text-2xl ml-2 font-black opacity-20 animate-pulse">{currentTime.format('ss')}</span>
              </p>
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2">{currentTime.format('dddd')}</p>
                <div className="h-0.5 w-12 bg-blue-500 rounded-full mb-3"></div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{currentTime.format('MMMM DD, YYYY')}</p>
              </div>
            </div>
          </div>

          {/* Absent Today */}
          <div className="group bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-sm border border-gray-200/60 p-10 transition-all hover:shadow-2xl hover:shadow-red-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="w-14 h-14 bg-rose-600/10 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
                <ArrowDownLeft size={24} />
              </div>
              <span className="text-[9px] font-black text-rose-600 uppercase tracking-[0.3em] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 shadow-sm">Attendance</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-3 relative z-10">Baseline Discordance</p>
            <p className="text-6xl font-black text-slate-900 tracking-tighter relative z-10 leading-none">
              {absentToday.length}
            </p>
          </div>

          {/* Pending Approvals */}
          <div className="group bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-sm border border-gray-200/60 p-10 transition-all hover:shadow-2xl hover:shadow-amber-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="w-14 h-14 bg-amber-600/10 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Calendar size={24} />
              </div>
              <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.3em] bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100 shadow-sm">Operational</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-3 relative z-10">Queue Latency</p>
            <p className="text-6xl font-black text-slate-900 tracking-tighter relative z-10 leading-none">
              {pendingLeaves}
            </p>
          </div>
        </div>

        {/* Charts - Premium Containers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 mb-12">
          {/* Attendance Trend */}
          <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-gray-200/60 p-6 md:p-12 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-12 tracking-tight flex items-center gap-5 uppercase">
              <div className="w-1 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
              Performance Velocity
            </h2>
            <div style={{ width: '100%', height: 'clamp(220px, 55vw, 340px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="leave" stroke="#F59E0B" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Distribution */}
          <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-gray-200/60 p-6 md:p-12 hover:shadow-2xl hover:shadow-violet-500/5 transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-12 tracking-tight flex items-center gap-5 uppercase">
              <div className="w-1 h-8 bg-violet-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
              Distribution Audit
            </h2>
            <div style={{ width: '100%', height: 'clamp(220px, 55vw, 340px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Overview - Premium Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12 mb-12">
          {/* Department Statistics - Bar Chart */}
          <div className="md:col-span-2 bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-slate-200/60 p-6 md:p-12 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Units Allocation</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Cross-departmental personnel distribution</p>
              </div>
              <div className="w-14 h-14 bg-indigo-600/10 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Building2 size={24} />
              </div>
            </div>

            {deptStats.length > 0 ? (
              <div style={{ width: '100%', height: 'clamp(220px, 55vw, 340px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '24px' }}
                  />
                    <Bar
                      dataKey="employees"
                      fill="url(#colorDept)"
                      radius={[12, 12, 4, 4]}
                      name="Employees"
                      barSize={44}
                    />
                    <defs>
                      <linearGradient id="colorDept" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={1} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-300 font-extrabold uppercase tracking-widest text-[10px]">Registry Empty</p>
              </div>
            )}
          </div>

          {/* Department Cards - Distribution Focus */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-gray-200 p-4 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">Key Metrics</h2>

            {deptStats.length > 0 ? (
              <div className="space-y-8">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={deptStats}
                      dataKey="employees"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      strokeWidth={0}
                    >
                      {deptStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend Table - Clean Modern Style */}
                <div className="space-y-4">
                  {deptStats.slice(0, 4).map((dept, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][idx % 6] }}
                        ></div>
                        <span className="text-sm text-slate-700 font-bold truncate max-w-[120px]">{dept.name}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{dept.employees}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 font-bold italic">
                Data missing
              </div>
            )}
          </div>
        </div>

        {/* Department Detail Grid - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {deptStats.map((dept, idx) => {
            const themes = [
              { ring: 'ring-blue-500/10', icon: 'bg-blue-50 text-blue-600', bar: 'bg-blue-500' },
              { ring: 'ring-emerald-500/10', icon: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
              { ring: 'ring-amber-500/10', icon: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
              { ring: 'ring-rose-500/10', icon: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500' },
              { ring: 'ring-indigo-500/10', icon: 'bg-indigo-50 text-indigo-600', bar: 'bg-indigo-500' },
              { ring: 'ring-violet-500/10', icon: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500' }
            ];
            const theme = themes[idx % themes.length];

            return (
              <div
                key={idx}
                className="group bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm border border-gray-200 p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Business Unit</p>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-2 tracking-tight group-hover:text-blue-600 transition-colors">{dept.name}</h3>
                  </div>
                  <div className={`w-12 h-12 ${theme.icon} rounded-2xl flex items-center justify-center shadow-inner`}>
                    <Building2 size={24} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-slate-900 leading-none">{dept.employees}</span>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 px-1">Active Staff</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${theme.bar} h-full rounded-full transition-all duration-1000 group-hover:brightness-110`}
                      style={{ width: `${(dept.employees / Math.max(...deptStats.map(d => d.employees))) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${dept.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {dept.status === 'active' ? 'Operational' : 'Offline'}
                      </span>
                    </div>
                    <button onClick={() => navigate('/admin/departments')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                      Inspect →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats & Intelligence Center */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Intelligence Alerts */}
          <div className="md:col-span-3 bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-slate-200/60 p-6 md:p-12">
            <h2 className="text-2xl font-black text-slate-900 mb-10 tracking-tighter flex items-center gap-5 uppercase">
              <div className="w-1 h-6 bg-rose-600 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.5)]"></div>
              Status Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {absentToday.length > 0 ? (
                <div className="group flex items-start gap-6 p-8 bg-gradient-to-br from-rose-50/50 to-white/30 backdrop-blur-3xl rounded-[2rem] border border-rose-100 transition-all hover:shadow-2xl hover:shadow-rose-500/5">
                  <div className="w-14 h-14 bg-rose-600/10 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-2xl tracking-tighter leading-none">{absentToday.length} Employees Absent</p>
                    <p className="text-[9px] text-rose-600 font-black uppercase tracking-[0.2em] mt-3">Action Required</p>
                    <button onClick={() => navigate('/admin/attendance-report')} className="mt-6 text-[9px] font-black text-rose-700 uppercase tracking-[0.3em] flex items-center gap-2 hover:translate-x-2 transition-transform">View List →</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-6 p-8 bg-slate-50/30 backdrop-blur-3xl rounded-[2rem] border border-dashed border-slate-200/60">
                  <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                    <ShieldCheck className="text-emerald-500/40" size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-300 text-xl tracking-tighter leading-none uppercase">All Present</p>
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em] mt-3">No Absences</p>
                  </div>
                </div>
              )}

              {pendingLeaves > 0 ? (
                <div className="group flex items-start gap-6 p-8 bg-gradient-to-br from-amber-50/50 to-white/30 backdrop-blur-3xl rounded-[2rem] border border-amber-100 transition-all hover:shadow-2xl hover:shadow-amber-500/5">
                  <div className="w-14 h-14 bg-amber-600/10 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-2xl tracking-tighter leading-none">{pendingLeaves} Logic Queries</p>
                    <p className="text-[9px] text-amber-600 font-black uppercase tracking-[0.2em] mt-3">Awaiting Administrative Logic</p>
                    <button onClick={() => navigate('/admin/unplanned-leave')} className="mt-6 text-[9px] font-black text-amber-700 uppercase tracking-[0.3em] flex items-center gap-2 hover:translate-x-2 transition-transform">Execute Workflow →</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-6 p-8 bg-slate-50/30 backdrop-blur-3xl rounded-[2rem] border border-dashed border-slate-200/60">
                  <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                    <Users className="text-slate-300/40" size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-300 text-xl tracking-tighter leading-none uppercase">Queue Clear</p>
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em] mt-3">System Ready</p>
                  </div>
                </div>
              )}

              <div className="group flex items-start gap-6 p-8 bg-gradient-to-br from-blue-50/50 to-white/30 backdrop-blur-3xl rounded-[2rem] border border-blue-100 transition-all hover:shadow-2xl hover:shadow-blue-500/5">
                <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-2xl tracking-tighter leading-none uppercase">System OK</p>
                  <p className="text-[9px] text-blue-600 font-black uppercase tracking-[0.2em] mt-3">All Systems Normal</p>
                  <button onClick={() => navigate('/admin/timings')} className="mt-6 text-[9px] font-black text-blue-700 uppercase tracking-[0.3em] flex items-center gap-2 hover:translate-x-2 transition-transform">View Logs →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
