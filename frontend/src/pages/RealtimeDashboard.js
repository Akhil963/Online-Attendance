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
import { Clock } from 'lucide-react';

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
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with real-time status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight flex items-center gap-4">
              Live Dashboard
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">Real-time attendance monitoring</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 bg-white/70 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${connectionColor} ${isConnected ? 'animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : ''}`}></div>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{connectionStatus}</span>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="text-sm font-semibold text-gray-600">
              Active Session: <span className="font-bold text-blue-600 ml-1">{onlineUsers.length}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics - Premium Vibe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm p-6 border border-gray-200 border-l-4 border-l-blue-600">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Global Count</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalEmployees || 0}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm p-6 border border-gray-200 border-l-4 border-l-emerald-500 relative overflow-hidden">
            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
            <p className="text-emerald-600 text-xs font-medium uppercase tracking-wide">Present Live</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.presentToday || 0}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm p-6 border border-gray-200 border-l-4 border-l-red-500 relative overflow-hidden">
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
            <p className="text-red-600 text-xs font-medium uppercase tracking-wide">Absent Live</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.absentToday || 0}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm p-6 border border-gray-200 border-l-4 border-l-amber-500">
            <p className="text-amber-600 text-xs font-medium uppercase tracking-wide">On Leave</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.onLeaveToday || 0}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm p-6 border border-gray-200 border-l-4 border-l-violet-600">
            <p className="text-violet-600 text-xs font-medium uppercase tracking-wide">Pending Appr</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.pendingLeaves || 0}</p>
          </div>
        </div>

        {/* Charts - Premium Slate Containers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Real-time Attendance Trend */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200 p-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-10 tracking-tight flex items-center gap-4">
              <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
              Live Ingestion Trend
            </h2>
            <div style={{ width: '100%', height: 'clamp(220px, 55vw, 340px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={4} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={4} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="onLeave" stroke="#f59e0b" strokeWidth={4} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Distribution */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200 p-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-10 tracking-tight flex items-center gap-4">
              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
              Distribution Meta
            </h2>
            <div style={{ width: '100%', height: 'clamp(220px, 55vw, 340px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {attendanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
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

        {/* Online Users & Notifications - Premium Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Online Users */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200 p-4 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Sessions</h2>
              <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">{onlineUsers.length} Online</span>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {onlineUsers.length > 0 ? (
                onlineUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-black text-xs shadow-sm border border-blue-100 group-hover:scale-105 transition-transform">
                      {user.userId.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Session {user.userId.substring(0, 8)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Established {new Date(user.connectedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-slate-300 font-bold uppercase tracking-[0.2em] text-sm italic">No active telemetry sessions</p>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Notifications */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200 p-4 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Events</h2>
              <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">{notifications.length} Unread</span>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl border border-indigo-100/50 animate-in fade-in duration-500"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-xl">⚡</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-800 font-bold leading-relaxed">
                          {notif.message || notif.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                          <Clock size={10} />
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-slate-300 font-bold uppercase tracking-[0.2em] text-sm italic">System logs are clean</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auto Refresh Toggle - Premium Style */}
        <div className="mt-12 flex justify-end">
          <label className="group flex items-center gap-4 bg-white/70 backdrop-blur-xl px-10 py-5 rounded-3xl border border-slate-200 shadow-sm cursor-pointer transition-all active:scale-95 hover:shadow-lg">
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="opacity-0 w-0 h-0 peer"
              />
              <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-slate-200 transition duration-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:h-4 after:w-4 after:left-1 after:bottom-1 after:bg-white after:transition after:duration-200 after:rounded-full peer-checked:after:translate-x-6"></span>
            </div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-[0.3em]">Live Feed Analytics</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default RealtimeDashboard;
