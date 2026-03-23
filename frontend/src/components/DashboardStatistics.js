import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { dashboardAPI } from '../services/api';
import realtimeService from '../services/realtimeService';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardStatistics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [month, setMonth] = useState(moment().format('MM'));
  const [year, setYear] = useState(moment().format('YYYY'));
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchDashboardData = useCallback(async () => {
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
      // Set default empty data on error
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

  // Listen for realtime refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchDashboardData();
    };

    window.addEventListener('refresh-dashboard-stats', handleRefresh);
    return () => window.removeEventListener('refresh-dashboard-stats', handleRefresh);
  }, [fetchDashboardData]);

  // Real-time socket.io listeners for instant updates
  useEffect(() => {
    setIsLive(true);

    const handleAttendanceUpdated = () => {
      console.log('📊 Attendance update received, refreshing dashboard...');
      fetchDashboardData();
    };

    const handleLeaveUpdated = () => {
      console.log('📊 Leave update received, refreshing dashboard...');
      fetchDashboardData();
    };

    const handleStatsUpdated = () => {
      console.log('📊 Stats update received, refreshing dashboard...');
      fetchDashboardData();
    };

    // Subscribe to realtime events
    realtimeService.on('attendance:updated', handleAttendanceUpdated);
    realtimeService.on('attendance:checked-in', handleAttendanceUpdated);
    realtimeService.on('attendance:checked-out', handleAttendanceUpdated);
    realtimeService.on('leave:statusChanged', handleLeaveUpdated);
    realtimeService.on('leave:created', handleLeaveUpdated);
    realtimeService.on('stats:updated', handleStatsUpdated);

    return () => {
      realtimeService.off('attendance:updated', handleAttendanceUpdated);
      realtimeService.off('attendance:checked-in', handleAttendanceUpdated);
      realtimeService.off('attendance:checked-out', handleAttendanceUpdated);
      realtimeService.off('leave:statusChanged', handleLeaveUpdated);
      realtimeService.off('leave:created', handleLeaveUpdated);
      realtimeService.off('stats:updated', handleStatsUpdated);
      setIsLive(false);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="text-center py-24 font-outfit">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs animate-pulse">
            {isLive ? 'Live Syncing...' : 'Syncing Yield Analytics'}
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

  const graphData = Object.values(dateWiseData).slice(-20);

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
          <ResponsiveContainer width="100%" height={200} minHeight={200}>
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

      {/* Attendance Trend Graph - Premium Enhanced Container */}
      <div className="bg-gradient-to-br from-white/60 via-white/40 to-emerald-50/30 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-gray-200/70 p-6 md:p-12 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group overflow-hidden relative">
        {/* Animated accent */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10 flex flex-col gap-3 mb-12">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Attendance Progress</h3>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-auto px-4 py-2 bg-emerald-50/50 rounded-full border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-700">Live Tracking</span>
            </div>
          </div>
          <div className="flex items-start gap-2 ml-6">
            <span className="text-emerald-500 font-bold text-lg leading-none mt-0.5">📈</span>
            <p className="text-sm text-gray-600 font-semibold">Daily performance trend • Track your presence and approved leaves throughout the month</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="dateDisplay"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
              height={60}
              interval={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
              label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { fill: '#64748B', fontWeight: 600, fontSize: 11 } }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '1.5rem', border: '2px solid #F3F4F6', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '20px', backgroundColor: '#FFFFFF' }}
              cursor={{ stroke: '#10B981', strokeWidth: 2, strokeDasharray: '5 5' }}
              formatter={(value) => [value > 0 ? value : '0', '']}
              labelFormatter={(label) => `📅 ${label}`}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', fontWeight: '700', paddingBottom: '24px' }}
              formatter={(value) => (
                <span style={{ color: '#1F2937', fontSize: '12px', fontWeight: '600' }}>
                  {value}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="present"
              stroke="#10B981"
              name="✓ Present Days"
              strokeWidth={3.5}
              dot={{ fill: '#fff', stroke: '#10B981', strokeWidth: 3, r: 5 }}
              activeDot={{ r: 9, strokeWidth: 2, fill: '#10B981' }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="plannedLeave"
              stroke="#F59E0B"
              name="📅 Approved Leave"
              strokeWidth={3.5}
              dot={{ fill: '#fff', stroke: '#F59E0B', strokeWidth: 3, r: 5 }}
              activeDot={{ r: 9, strokeWidth: 2, fill: '#F59E0B' }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardStatistics;
