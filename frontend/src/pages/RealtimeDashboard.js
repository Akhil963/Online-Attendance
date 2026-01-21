import React, { useEffect, useState } from 'react';
import {
  useRealtimeStats,
  useRealtimePresence,
  useRealtimeNotifications,
  useRealtime
} from '../hooks/useRealtime';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const RealtimeDashboard = () => {
  const { isConnected } = useRealtime();
  const stats = useRealtimeStats();
  const onlineUsers = useRealtimePresence();
  const notifications = useRealtimeNotifications();
  
  const [chartData, setChartData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate chart data from stats
  useEffect(() => {
    const newData = {
      name: new Date().toLocaleTimeString(),
      present: stats.presentToday || 0,
      absent: stats.absentToday || 0,
      onLeave: stats.onLeaveToday || 0
    };

    setChartData(prev => {
      const updated = [...prev, newData];
      return updated.slice(-20); // Keep last 20 data points
    });
  }, [stats.presentToday, stats.absentToday, stats.onLeaveToday]);

  const attendanceDistribution = [
    { name: 'Present', value: stats.presentToday || 0, fill: '#10b981' },
    { name: 'Absent', value: stats.absentToday || 0, fill: '#ef4444' },
    { name: 'On Leave', value: stats.onLeaveToday || 0, fill: '#f59e0b' }
  ];

  const connectionStatus = isConnected ? 'Connected' : 'Disconnected';
  const connectionColor = isConnected ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with real-time status */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Real-Time Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connectionColor} animate-pulse`}></div>
              <span className="text-sm font-medium text-gray-700">{connectionStatus}</span>
            </div>
            <div className="text-sm text-gray-600">
              Online: <span className="font-bold text-blue-600">{onlineUsers.length}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm">Total Employees</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalEmployees || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-green-600 animate-pulse">
            <p className="text-gray-600 text-sm">Present Today</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{stats.presentToday || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-red-600 animate-pulse">
            <p className="text-gray-600 text-sm">Absent Today</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{stats.absentToday || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-yellow-600 animate-pulse">
            <p className="text-gray-600 text-sm">On Leave</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.onLeaveToday || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-purple-600">
            <p className="text-gray-600 text-sm">Pending Leaves</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{stats.pendingLeaves || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Real-time Attendance Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Attendance Trend (Live)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" isAnimationActive={true} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" isAnimationActive={true} />
                <Line type="monotone" dataKey="onLeave" stroke="#f59e0b" isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Today's Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Online Users & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Online Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              👥 Online Users ({onlineUsers.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {onlineUsers.length > 0 ? (
                onlineUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-transparent rounded"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700">User ID: {user.userId}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(user.connectedAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No users online</p>
              )}
            </div>
          </div>

          {/* Real-time Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              🔔 Live Notifications ({notifications.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded animate-in"
                  >
                    <p className="text-sm text-gray-800 font-medium">
                      {notif.message || notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No new notifications</p>
              )}
            </div>
          </div>
        </div>

        {/* Auto Refresh Toggle */}
        <div className="mt-6 flex justify-end">
          <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Auto Refresh</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default RealtimeDashboard;
