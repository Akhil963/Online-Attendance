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
      setDashboardData(response.data.dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center py-10">No data available</div>;
  }

  const total = dashboardData.present + dashboardData.weeklyOff + dashboardData.plannedLeave;
  
  // Attendance distribution
  const attendanceData = [
    { name: 'Present', value: dashboardData.present, fill: '#10b981' },
    { name: 'Weekly Off', value: dashboardData.weeklyOff, fill: '#3b82f6' },
    { name: 'Leave', value: dashboardData.plannedLeave, fill: '#f59e0b' }
  ];

  // Attendance by date for graph
  const dateWiseData = {};
  dashboardData.attendance.forEach(record => {
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
  });

  const graphData = Object.values(dateWiseData).slice(-20);

  return (
    <div className="space-y-6">
      {/* Month/Year Selector */}
      <div className="flex gap-4 mb-4">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={String(i + 1).padStart(2, '0')}>
              {moment(`2024-${String(i + 1).padStart(2, '0')}`, 'YYYY-MM').format('MMMM')}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>

      {/* Statistics Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Box 1: Attendance Distribution */}
        <div className="bg-white rounded-lg shadow p-6 col-span-1">
          <h3 className="text-lg font-bold mb-4">Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="45%"
                labelLine={false}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} days`} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value}: ${entry.payload.value}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Box 2: Detailed Statistics */}
        <div className="bg-white rounded-lg shadow p-6 col-span-1">
          <h3 className="text-lg font-bold mb-4">Attendance Summary</h3>
          <div className="space-y-2">
            <div className="p-3 bg-green-50 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Present</span>
                <span className="text-xl font-bold text-green-600">{dashboardData.present}</span>
              </div>
              <p className="text-xs text-gray-500">{(dashboardData.present/total*100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Weekly Off</span>
                <span className="text-xl font-bold text-blue-600">{dashboardData.weeklyOff}</span>
              </div>
              <p className="text-xs text-gray-500">{(dashboardData.weeklyOff/total*100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Leave</span>
                <span className="text-xl font-bold text-yellow-600">{dashboardData.plannedLeave}</span>
              </div>
              <p className="text-xs text-gray-500">{(dashboardData.plannedLeave/total*100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Box 3: Attendance Rate */}
        <div className="bg-white rounded-lg shadow p-6 col-span-1">
          <h3 className="text-lg font-bold mb-4">Attendance Rate</h3>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <div className="text-center">
                <p className="text-5xl font-bold">{(dashboardData.present/total*100).toFixed(0)}%</p>
                <p className="text-xs mt-2 opacity-90">Present</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              <span className="font-semibold">{dashboardData.present}</span> out of <span className="font-semibold">{total}</span> days
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Trend Graph */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Attendance Trend - {moment(`${year}-${month}`, 'YYYY-MM').format('MMMM YYYY')}</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="dateDisplay" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              formatter={(value) => value}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke="#10b981" 
              name="Present" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="plannedLeave" 
              stroke="#f59e0b" 
              name="Planned Leave" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardStatistics;
