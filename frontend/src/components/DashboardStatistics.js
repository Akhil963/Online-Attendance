import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { dashboardAPI } from '../services/api';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardStatistics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [month, setMonth] = useState(moment().format('MM'));
  const [year, setYear] = useState(moment().format('YYYY'));
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="text-center py-24 font-outfit">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs animate-pulse">Syncing Yield Analytics</p>
      </div>
    );
  }

  // Show "No attendance data" only if there are no records at all (including holidays)
  const hasAttendanceData = dashboardData && (dashboardData.present > 0 || dashboardData.plannedLeave > 0 || dashboardData.unplannedLeave > 0 || dashboardData.weeklyOff > 0 || (dashboardData.attendance && dashboardData.attendance.length > 0));
  
  if (!dashboardData || !hasAttendanceData) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 text-gray-600">
          <p className="font-medium">No attendance data available for the selected period.</p>
          <p className="text-sm text-gray-500 mt-2">(Mark attendance, apply leave, or check back tomorrow to see data)</p>
        </div>
      </div>
    );
  }

  // Calculate total excluding holidays
  const total = dashboardData.present + dashboardData.plannedLeave + dashboardData.unplannedLeave;

  // Attendance distribution (EXCLUDE holidays - they don't count as working days)
  const attendanceData = [
    { name: 'Present', value: dashboardData.present, fill: '#10b981' },
    { name: 'Planned Leave', value: dashboardData.plannedLeave, fill: '#f59e0b' },
    { name: 'Unplanned Leave', value: dashboardData.unplannedLeave, fill: '#ef4444' }
  ];

  // Attendance by date for graph (EXCLUDE holidays)
  const dateWiseData = {};
  if (dashboardData.attendance && Array.isArray(dashboardData.attendance)) {
    dashboardData.attendance.forEach(record => {
      // Skip holidays (weekly_off) from graph
      if (record.status === 'weekly_off') return;
      
      const dateObj = moment(record.date);
      const date = dateObj.format('DD-MM');
      if (!dateWiseData[date]) {
        dateWiseData[date] = {
          date,
          dateDisplay: `(${dateObj.format('ddd')}) ${dateObj.format('DD')}`,
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
    <div className="space-y-12 font-outfit">
      {/* Month/Year Selector - Premium Style */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="relative group/select">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none bg-white/40 backdrop-blur-3xl border border-gray-200/60 rounded-[1.25rem] px-8 py-4 pr-16 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-xs text-gray-600 shadow-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={String(i + 1).padStart(2, '0')}>
                {moment(`2024-${String(i + 1).padStart(2, '0')}`, 'YYYY-MM').format('MMMM')} Cycle
              </option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover:scale-110 transition-transform">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <div className="relative group/select">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="appearance-none bg-white/40 backdrop-blur-3xl border border-gray-200/60 rounded-[1.25rem] px-8 py-4 pr-16 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-xs text-gray-600 shadow-sm"
          >
            <option value="2023">Timeline: 2023</option>
            <option value="2024">Timeline: 2024</option>
            <option value="2025">Timeline: 2025</option>
            <option value="2026">Timeline: 2026</option>
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover:scale-110 transition-transform">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Statistics Boxes - Premium Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Distribution */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-gray-200/60 p-4 md:p-10 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
          <h3 className="text-xl font-bold text-gray-900 mb-10 flex items-center gap-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
            Status Mix
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
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
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '600', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Statistics - Premium Summary */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-gray-200/60 p-4 md:p-10 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
          <h3 className="text-xl font-bold text-gray-900 mb-10 flex items-center gap-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
            Vital Logs
          </h3>
          <div className="space-y-4">
            <div className="p-6 bg-white/40 backdrop-blur-3xl rounded-[1.75rem] border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-600/10 text-emerald-600 rounded-xl flex items-center justify-center font-bold shadow-inner">P</div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Operational</p>
                  <p className="text-xs font-bold text-gray-900">Presence Yield</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 leading-none">{dashboardData.present}</p>
                <p className="text-xs text-emerald-600 font-bold mt-1">{total > 0 ? (dashboardData.present / total * 100).toFixed(1) : 0}%</p>
              </div>
            </div>

            <div className="p-6 bg-white/40 backdrop-blur-3xl rounded-[1.75rem] border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-xl flex items-center justify-center font-bold shadow-inner">U</div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Unscheduled</p>
                  <p className="text-xs font-bold text-gray-900">Unplanned Leave</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 leading-none">{dashboardData.unplannedLeave}</p>
                <p className="text-xs text-red-600 font-bold mt-1">{total > 0 ? (dashboardData.unplannedLeave / total * 100).toFixed(1) : 0}%</p>
              </div>
            </div>

            <div className="p-6 bg-white/40 backdrop-blur-3xl rounded-[1.75rem] border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-amber-600/10 text-amber-600 rounded-xl flex items-center justify-center font-bold shadow-inner">L</div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Involved</p>
                  <p className="text-xs font-bold text-gray-900">Leave Usage</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 leading-none">{dashboardData.plannedLeave}</p>
                <p className="text-xs text-amber-600 font-bold mt-1">{total > 0 ? (dashboardData.plannedLeave / total * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Rate - Premium Gauge */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            Efficiency Rate
          </h3>
          <div className="flex flex-col items-center justify-center h-full pb-8">
            <div className="w-48 h-48 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl relative border-8 border-gray-100/10 group">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse transition-opacity opacity-0 group-hover:opacity-100"></div>
              <div className="text-center relative z-10">
                <p className="text-6xl font-bold leading-none italic">{total > 0 ? (dashboardData.present / total * 100).toFixed(0) : 0}%</p>
                <p className="text-xs font-bold mt-3 text-blue-400">Precision</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-xs font-bold flex items-center gap-2 justify-center">
                <span className="text-gray-900 font-bold text-base italic">{dashboardData.present}</span>
                /
                <span className="text-gray-900 font-bold text-base italic">{total}</span>
                Total Units
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Trend Graph */}
      {/* Attendance Trend Graph - Premium Slate Container */}
      <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-gray-200/60 p-6 md:p-12 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all">
        <h3 className="text-2xl font-bold text-gray-900 mb-12 flex items-center gap-5">
          <div className="w-1 h-8 bg-emerald-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
          Daily Performance Velocity
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="dateDisplay"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
              height={60}
              interval={0}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
            <Tooltip
              contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '24px' }}
              cursor={{ stroke: '#6366F1', strokeWidth: 2, strokeDasharray: '3 3' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '600', paddingBottom: '20px' }} />
            <Line
              type="monotone"
              dataKey="present"
              stroke="#10B981"
              name="Operational"
              strokeWidth={4}
              dot={{ fill: '#fff', stroke: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#10B981' }}
            />
            <Line
              type="monotone"
              dataKey="plannedLeave"
              stroke="#F59E0B"
              name="Leave Use"
              strokeWidth={4}
              dot={{ fill: '#fff', stroke: '#F59E0B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#F59E0B' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardStatistics;
