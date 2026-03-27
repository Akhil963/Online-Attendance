import React, { useState, useEffect, useCallback, useRef } from 'react';
import moment from 'moment';
import { dashboardAPI } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardStatistics = ({ refreshKey = 0 }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [month, setMonth] = useState(moment().format('MM'));
  const [year, setYear] = useState(moment().format('YYYY'));
  const [loading, setLoading] = useState(true);
  // Show syncing indicator when refreshKey changes
  const [isSyncing, setIsSyncing] = useState(false);
  // Track connection status for display
  const [isLive, setIsLive] = useState(false);
  
  useEffect(() => {
    if (refreshKey > 0) {
      setIsSyncing(true);
      setIsLive(true);
      const timeout = setTimeout(() => {
        setIsSyncing(false);
        setIsLive(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [refreshKey]);
  
  const lastRefreshRef = useRef(0);

  const fetchDashboardData = useCallback(async () => {
    // Debounce: minimum 1 second between refreshes
    const now = Date.now();
    if (now - lastRefreshRef.current < 1000) {
      return;
    }
    lastRefreshRef.current = now;
    
    try {
      setLoading(true);
      const response = await dashboardAPI.getEmployeeDashboard(month, year);
      setDashboardData(response.data.dashboardData || {
        present: 0,
        weeklyOff: 0,
        plannedLeave: 0,
        unplannedLeave: 0,
        attendance: []
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setDashboardData({
        present: 0,
        weeklyOff: 0,
        plannedLeave: 0,
        unplannedLeave: 0,
        attendance: []
      });
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh data when refreshKey changes (triggered by parent via socket events)
  useEffect(() => {
    if (refreshKey === 0) return;
    // Small delay to let the UI update first
    const timeout = setTimeout(() => {
      fetchDashboardData();
    }, 100);
    return () => clearTimeout(timeout);
  }, [refreshKey, fetchDashboardData]);

  if (loading) {
    return (
      <div className="text-center py-24 font-outfit">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs animate-pulse">
            {isSyncing ? 'Live Syncing...' : 'Syncing Yield Analytics'}
          </p>
        </div>
      </div>
    );
  }

  // Safe data access with defaults
  const present = dashboardData?.present || 0;
  const weeklyOff = dashboardData?.weeklyOff || 0;
  const plannedLeave = dashboardData?.plannedLeave || 0;
  const unplannedLeave = dashboardData?.unplannedLeave || 0;
  const attendance = dashboardData?.attendance || [];

  // Show "No attendance data" only if there are no records at all (including holidays)
  const hasAttendanceData = 
    present > 0 || 
    plannedLeave > 0 || 
    unplannedLeave > 0 || 
    weeklyOff > 0 || 
    (attendance && attendance.length > 0);
  
  if (!dashboardData || !hasAttendanceData) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 text-gray-600">
          <p className="font-medium">No attendance data available for the selected period.</p>
          <p className="text-sm text-gray-500 mt-2">(Mark attendance, apply leave, or check back tomorrow to see data)</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="text-xs font-bold text-gray-500 uppercase">{isLive ? 'Live Mode Active' : 'Offline Mode'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total excluding holidays
  const total = present + plannedLeave + unplannedLeave;

  // Attendance distribution (EXCLUDE holidays - they don't count as working days)
  const attendanceData = [
    { name: 'Present', value: present, fill: '#10b981' },
    { name: 'Planned Leave', value: plannedLeave, fill: '#f59e0b' },
    { name: 'Unplanned Leave', value: unplannedLeave, fill: '#ef4444' }
  ];

  // Attendance by date for graph (EXCLUDE holidays)
  const dateWiseData = {};
  if (attendance && Array.isArray(attendance)) {
    attendance.forEach(record => {
      // Skip holidays (weekly_off) from graph
      if (record.status === 'weekly_off') return;
      
      const dateObj = moment(record.date);
      const date = dateObj.format('DD-MM');
      if (!dateWiseData[date]) {
        dateWiseData[date] = {
          date,
          dateDisplay: `${dateObj.format('DD')} ${dateObj.format('MMM')}`,
          day: dateObj.format('ddd'),
          present: 0,
          plannedLeave: 0,
          unplannedLeave: 0
        };
      }
      if (record.status === 'present') dateWiseData[date].present += 1;
      if (record.status === 'planned_leave') dateWiseData[date].plannedLeave += 1;
      if (record.status === 'unplanned_leave') dateWiseData[date].unplannedLeave += 1;
    });
  }

  return (
    <div className="space-y-8 sm:space-y-10 md:space-y-12 font-outfit px-2 sm:px-4">
      {/* Month/Year Selector - Premium Style */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto">
          <div className="relative group/select flex-1 sm:flex-none">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full appearance-none bg-white/40 backdrop-blur-3xl border border-gray-200/60 rounded-[1.25rem] px-4 sm:px-8 py-3 sm:py-4 pr-10 sm:pr-16 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-xs sm:text-sm text-gray-600 shadow-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>
                  {moment(`2024-${String(i + 1).padStart(2, '0')}`, 'YYYY-MM').format('MMMM')} Cycle
                </option>
              ))}
            </select>
            <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover:scale-110 transition-transform">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative group/select flex-1 sm:flex-none">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full appearance-none bg-white/40 backdrop-blur-3xl border border-gray-200/60 rounded-[1.25rem] px-4 sm:px-8 py-3 sm:py-4 pr-10 sm:pr-16 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-xs sm:text-sm text-gray-600 shadow-sm"
            >
              <option value="2023">Timeline: 2023</option>
              <option value="2024">Timeline: 2024</option>
              <option value="2025">Timeline: 2025</option>
              <option value="2026">Timeline: 2026</option>
            </select>
            <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover:scale-110 transition-transform">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-gray-200/60 bg-white/40 backdrop-blur-3xl w-full sm:w-auto justify-center sm:justify-start">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{isLive ? 'Live Sync' : 'Ready'}</span>
        </div>
      </div>

      {/* Statistics Boxes - Premium Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Attendance Distribution */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/60 p-3 sm:p-4 md:p-6 lg:p-10 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-10 flex items-center gap-3 sm:gap-4">
            <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
            <span className="truncate">Status Mix</span>
          </h3>
          <div style={{ width: '100%', height: 'clamp(180px, 45vw, 240px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={10}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
                />
                <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '600', paddingTop: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Statistics - Premium Summary */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/60 p-3 sm:p-4 md:p-6 lg:p-10 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-10 flex items-center gap-3 sm:gap-4">
            <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
            <span className="truncate">Vital Logs</span>
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 md:p-6 bg-white/40 backdrop-blur-3xl rounded-xl md:rounded-[1.75rem] border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 sm:gap-5 w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600/10 text-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center font-bold shadow-inner text-sm sm:text-base flex-shrink-0">P</div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 mb-0.5 truncate">Operational</p>
                  <p className="text-xs font-bold text-gray-900 truncate">Presence Yield</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{present}</p>
                <p className="text-xs text-emerald-600 font-bold mt-1">{total > 0 ? (present / total * 100).toFixed(1) : 0}%</p>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-6 bg-white/40 backdrop-blur-3xl rounded-xl md:rounded-[1.75rem] border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 sm:gap-5 w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600/10 text-red-600 rounded-lg md:rounded-xl flex items-center justify-center font-bold shadow-inner text-sm sm:text-base flex-shrink-0">U</div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 mb-0.5 truncate">Unscheduled</p>
                  <p className="text-xs font-bold text-gray-900 truncate">Unplanned Leave</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{unplannedLeave}</p>
                <p className="text-xs text-red-600 font-bold mt-1">{total > 0 ? (unplannedLeave / total * 100).toFixed(1) : 0}%</p>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-6 bg-white/40 backdrop-blur-3xl rounded-xl md:rounded-[1.75rem] border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 sm:gap-5 w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/10 text-amber-600 rounded-lg md:rounded-xl flex items-center justify-center font-bold shadow-inner text-sm sm:text-base flex-shrink-0">L</div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 mb-0.5 truncate">Involved</p>
                  <p className="text-xs font-bold text-gray-900 truncate">Leave Usage</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{plannedLeave}</p>
                <p className="text-xs text-amber-600 font-bold mt-1">{total > 0 ? (plannedLeave / total * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Rate - Premium Gauge */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
            <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
            <span className="truncate">Efficiency Rate</span>
          </h3>
          <div className="flex flex-col items-center justify-center h-full pb-4 sm:pb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl relative border-6 sm:border-8 border-gray-100/10 group">
              <div className={`absolute inset-0 bg-blue-500/10 rounded-full transition-opacity ${isLive ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
              <div className="text-center relative z-10">
                <p className="text-4xl sm:text-5xl md:text-6xl font-bold leading-none italic">{total > 0 ? (present / total * 100).toFixed(0) : 0}%</p>
                <p className="text-xs font-bold mt-2 sm:mt-3 text-blue-400">Precision</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-gray-400 text-xs font-bold flex items-center gap-1 sm:gap-2 justify-center flex-wrap">
                <span className="text-gray-900 font-bold text-sm sm:text-base italic">{present}</span>
                <span>/</span>
                <span className="text-gray-900 font-bold text-sm sm:text-base italic">{total}</span>
                <span>Total</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Progress - Beautiful Progress Bars */}
      <div className="bg-gradient-to-br from-white/60 via-white/40 to-emerald-50/30 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-200/70 p-5 sm:p-8 md:p-12 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group overflow-hidden relative">
        {/* Animated accent */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Header */}
        <div className="relative z-10 flex flex-col gap-2 mb-8 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-2 h-7 sm:h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Attendance Progress</h3>
            </div>
            <div className="flex items-center gap-2 ml-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50/50 rounded-full border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-700">Live Tracking</span>
            </div>
          </div>
          <div className="flex items-start gap-2 ml-5 sm:ml-6">
            <span className="text-emerald-500 font-bold text-base sm:text-lg leading-none mt-0.5">📊</span>
            <p className="text-xs sm:text-sm text-gray-500 font-semibold">Monthly breakdown • Visual progress of your attendance this period</p>
          </div>
        </div>

        {/* Overall Attendance Rate Bar */}
        <div className="relative z-10 mb-8 sm:mb-10 p-4 sm:p-6 bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">🎯</span>
              <span className="text-sm sm:text-base font-bold text-gray-800">Overall Attendance Rate</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-emerald-600">{total > 0 ? (present / total * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="w-full h-4 sm:h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-md transition-all duration-1000 ease-out"
              style={{ width: `${total > 0 ? (present / total * 100) : 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400 font-semibold">{present} days present</span>
            <span className="text-xs text-gray-400 font-semibold">{total} total working days</span>
          </div>
        </div>

        {/* Individual Progress Bars */}
        <div className="relative z-10 space-y-4 sm:space-y-5">

          {/* Present */}
          <div className="p-4 sm:p-5 bg-white/50 backdrop-blur-xl rounded-2xl border border-emerald-100/60 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 text-base sm:text-lg font-black">✓</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Operational</p>
                  <p className="text-sm sm:text-base font-bold text-gray-800">Days Present</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">{present}</p>
                <p className="text-xs font-bold text-emerald-500">{total > 0 ? (present / total * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
            <div className="w-full h-3 sm:h-3.5 bg-emerald-50 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${total > 0 ? (present / total * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Planned Leave */}
          <div className="p-4 sm:p-5 bg-white/50 backdrop-blur-xl rounded-2xl border border-amber-100/60 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 text-base sm:text-lg font-black">L</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Approved</p>
                  <p className="text-sm sm:text-base font-bold text-gray-800">Planned Leave</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-amber-500">{plannedLeave}</p>
                <p className="text-xs font-bold text-amber-400">{total > 0 ? (plannedLeave / total * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
            <div className="w-full h-3 sm:h-3.5 bg-amber-50 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-1000 ease-out"
                style={{ width: `${total > 0 ? (plannedLeave / total * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Unplanned Leave */}
          <div className="p-4 sm:p-5 bg-white/50 backdrop-blur-xl rounded-2xl border border-red-100/60 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-base sm:text-lg font-black">U</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Unscheduled</p>
                  <p className="text-sm sm:text-base font-bold text-gray-800">Unplanned Leave</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-red-500">{unplannedLeave}</p>
                <p className="text-xs font-bold text-red-400">{total > 0 ? (unplannedLeave / total * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
            <div className="w-full h-3 sm:h-3.5 bg-red-50 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-300 to-red-500 transition-all duration-1000 ease-out"
                style={{ width: `${total > 0 ? (unplannedLeave / total * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Stacked Combined Bar */}
          <div className="p-4 sm:p-5 bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
              <span>📋</span> Monthly Breakdown (Combined)
            </p>
            <div className="w-full h-5 sm:h-6 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000"
                style={{ width: `${total > 0 ? (present / total * 100) : 0}%` }}
                title={`Present: ${present} days`}
              ></div>
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000"
                style={{ width: `${total > 0 ? (plannedLeave / total * 100) : 0}%` }}
                title={`Planned Leave: ${plannedLeave} days`}
              ></div>
              <div
                className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-1000"
                style={{ width: `${total > 0 ? (unplannedLeave / total * 100) : 0}%` }}
                title={`Unplanned Leave: ${unplannedLeave} days`}
              ></div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span className="text-xs text-gray-500 font-semibold">Present ({present}d)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span className="text-xs text-gray-500 font-semibold">Planned ({plannedLeave}d)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
                <span className="text-xs text-gray-500 font-semibold">Unplanned ({unplannedLeave}d)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardStatistics;
