import React, { useState, useEffect, useCallback } from 'react';
import { attendanceAPI, employeeAPI } from '../services/api';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'react-toastify';
import moment from 'moment';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useLiveDataSync from '../hooks/useLiveDataSync';

const AttendanceReportPage = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({});

  const filterAttendance = useCallback(() => {
    let filtered = attendance.filter(record => {
      const recordDate = moment(record.date).format('YYYY-MM-DD');
      const isInRange = moment(recordDate).isBetween(startDate, endDate, null, '[]');
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesEmployee = employeeFilter === 'all' || record.employeeId?._id === employeeFilter;
      return isInRange && matchesStatus && matchesEmployee;
    });
    // Calculate summary
    const summaryData = {
      total: filtered.length,
      present: filtered.filter(r => r.status === 'present').length,
      absent: filtered.filter(r => r.status === 'absent').length,
      weekly_off: filtered.filter(r => r.status === 'weekly_off').length,
      on_leave: filtered.filter(r => r.status === 'planned_leave').length
    };
    setSummary(summaryData);
    setFilteredAttendance(filtered);
  }, [attendance, startDate, endDate, statusFilter, employeeFilter]);

  useEffect(() => {
    filterAttendance();
  }, [filterAttendance]);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAllAttendance();
      setAttendance(response.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeeAPI.getAllEmployees();
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [fetchAttendance, fetchEmployees]);

  const refreshAttendanceData = useCallback(async () => {
    await Promise.all([fetchAttendance(), fetchEmployees()]);
  }, [fetchAttendance, fetchEmployees]);

  const { isLive, lastSyncAt } = useLiveDataSync({
    onRefresh: refreshAttendanceData,
    events: ['attendance:updated', 'stats:updated', 'leave:updated'],
    soundEvents: [],
    pollMs: 30000,
    enabled: true
  });


  const getChartData = () => {
    const dailyData = {};
    filteredAttendance.forEach(record => {
      const date = moment(record.date).format('MMMM DD');
      if (!dailyData[date]) {
        dailyData[date] = { date, present: 0, absent: 0, on_leave: 0, weekly_off: 0 };
      }
      if (record.status === 'present') dailyData[date].present += 1;
      else if (record.status === 'absent') dailyData[date].absent += 1;
      else if (record.status === 'planned_leave') dailyData[date].on_leave += 1;
      else if (record.status === 'weekly_off') dailyData[date].weekly_off += 1;
    });
    return Object.values(dailyData).slice(-15); // Last 15 days
  };

  const getStatusPieData = () => {
    if (summary.total === 0) return [];
    return [
      { name: 'Present', value: summary.present, fill: '#10b981' },
      { name: 'Absent', value: summary.absent, fill: '#ef4444' },
      { name: 'On Leave', value: summary.on_leave, fill: '#f59e0b' },
      { name: 'Weekly Off', value: summary.weekly_off, fill: '#3b82f6' }
    ].filter(item => item.value > 0);
  };

  const handleExportAttendance = () => {
    const data = filteredAttendance.map(record => ({
      'Employee ID': record.employeeId?.employeeId || '-',
      'Employee Name': record.employeeId?.name || '-',
      'Date': moment(record.date).format('MMMM DD YYYY'),
      'Status': record.status,
      'Check In': record.checkInTime ? moment(record.checkInTime).format('hh:mm:ss A') : '-',
      'Check Out': record.checkOutTime ? moment(record.checkOutTime).format('hh:mm:ss A') : '-',
      'Working Hours': record.workingHours?.toFixed(2) || '-'
    }));
    exportToExcel(data, 'attendance_report', 'Attendance');
    toast.success('Attendance exported successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Generating attendance report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Attendance Intelligence
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Detailed history and attendance logs</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/70">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{isLive ? 'Live' : 'Syncing'}</span>
              {lastSyncAt && (
                <span className="text-[10px] text-gray-400 font-semibold">{new Date(lastSyncAt).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          <button
            onClick={handleExportAttendance}
            className="group bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-200"
          >
            <span className="text-xl">📊</span>
            <span>Export Analytics</span>
          </button>
        </div>

        {/* Summary Cards - Premium accent style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-6 border-b-4 border-b-gray-400">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Audit Logs</p>
            <p className="text-4xl font-extrabold text-gray-900">{summary.total}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-6 border-b-4 border-b-emerald-500">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-1">Present</p>
            <p className="text-4xl font-extrabold text-gray-900">{summary.present}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-6 border-b-4 border-b-red-500">
            <p className="text-red-600 text-xs font-bold uppercase tracking-widest mb-1">Absent</p>
            <p className="text-4xl font-extrabold text-gray-900">{summary.absent}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-6 border-b-4 border-b-amber-500">
            <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-1">Leave</p>
            <p className="text-4xl font-extrabold text-gray-900">{summary.on_leave}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-6 border-b-4 border-b-blue-500">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">Off</p>
            <p className="text-4xl font-extrabold text-gray-900">{summary.weekly_off}</p>
          </div>
        </div>

        {/* Filters - Premium Glass */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white p-4 md:p-8 mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
            Filter Parameters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Range Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Range End</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Daily Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="planned_leave">On Leave</option>
                <option value="weekly_off">Weekly Off</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Talent</label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 shadow-sm"
              >
                <option value="all">Entire Team</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Daily Attendance Chart */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              Daily Timeline
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '15px' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                <Bar dataKey="on_leave" fill="#f59e0b" radius={[4, 4, 0, 0]} name="On Leave" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              Audit Distribution
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={getStatusPieData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getStatusPieData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '15px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Table - Premium Style */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Data Audit Logs</h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredAttendance.length} Entries Generated</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Timeline</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Check In/Out</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell text-center">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map(record => (
                    <tr key={record._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm border border-blue-200/50">
                            {record.employeeId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{record.employeeId?.name}</p>
                            <p className="text-xs text-blue-500 font-bold uppercase tracking-tight">{record.employeeId?.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <p className="font-bold text-gray-700">{moment(record.date).format('MMM DD')}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{moment(record.date).format('YYYY')}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          record.status === 'absent' ? 'bg-red-100 text-red-700 border-red-200' :
                            record.status === 'planned_leave' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-700">{record.checkInTime ? moment(record.checkInTime).format('hh:mm A') : '--:--'}</p>
                            <div className="w-full h-0.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="w-1/2 h-full bg-blue-400"></div>
                            </div>
                            <p className="text-xs font-bold text-gray-700">{record.checkOutTime ? moment(record.checkOutTime).format('hh:mm A') : '--:--'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden lg:table-cell text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-lg font-bold text-gray-900">{record.workingHours ? record.workingHours.toFixed(1) + 'h' : '-'}</p>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duration</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center">
                      <p className="text-gray-400 font-bold text-lg">No audit records match your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReportPage;
