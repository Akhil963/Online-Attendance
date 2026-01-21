import React, { useState, useEffect, useCallback } from 'react';
import { attendanceAPI, employeeAPI } from '../services/api';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'react-toastify';
import moment from 'moment';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);


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

  const fetchAttendance = async () => {
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
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAllEmployees();
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };


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
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Report</h1>
          <p className="text-gray-600">View and analyze attendance data</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Total Records</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{summary.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 border-l-4 border-green-600">
            <p className="text-green-700 text-sm font-semibold">Present</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{summary.present}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 border-l-4 border-red-600">
            <p className="text-red-700 text-sm font-semibold">Absent</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{summary.absent}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 border-l-4 border-yellow-600">
            <p className="text-yellow-700 text-sm font-semibold">On Leave</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{summary.on_leave}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4 border-l-4 border-blue-600">
            <p className="text-blue-700 text-sm font-semibold">Weekly Off</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{summary.weekly_off}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="planned_leave">On Leave</option>
                <option value="weekly_off">Weekly Off</option>
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Employee</label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">&nbsp;</label>
              <button
                onClick={handleExportAttendance}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-2 text-sm md:text-base rounded-lg font-medium transition"
              >
                📊 Export
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Attendance Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Daily Attendance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                <Bar dataKey="on_leave" fill="#f59e0b" name="On Leave" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getStatusPieData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getStatusPieData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700">ID</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700">Name</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700 hidden sm:table-cell">Date</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700 hidden md:table-cell">Check In</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700 hidden lg:table-cell">Check Out</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700 hidden lg:table-cell">Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map(record => (
                    <tr key={record._id} className="border-b hover:bg-gray-50">
                      <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-blue-600 text-xs md:text-sm">{record.employeeId?.employeeId}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">{record.employeeId?.name}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs hidden sm:table-cell">{moment(record.date).format('MMM DD')}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs">
                        <span className={`px-2 md:px-3 py-1 rounded-full text-white text-xs font-medium ${
                          record.status === 'present' ? 'bg-green-500' :
                          record.status === 'absent' ? 'bg-red-500' :
                          record.status === 'planned_leave' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}>
                          {record.status.substring(0, 3)}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs hidden md:table-cell">{record.checkInTime ? moment(record.checkInTime).format('hh:mm A') : '-'}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs hidden lg:table-cell">{record.checkOutTime ? moment(record.checkOutTime).format('hh:mm A') : '-'}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs hidden lg:table-cell">{record.workingHours ? record.workingHours.toFixed(1) + 'h' : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-2 md:px-4 py-6 md:py-8 text-center text-gray-500 text-xs md:text-sm">
                      No attendance records found
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
