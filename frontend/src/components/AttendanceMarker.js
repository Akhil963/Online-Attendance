import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { attendanceAPI, holidayAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { Calendar } from 'lucide-react';

const AttendanceMarker = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weeklyOffInfo, setWeeklyOffInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
    checkTodayWeeklyOff();
  }, []);

  const checkTodayWeeklyOff = async () => {
    try {
      const today = moment().format('YYYY-MM-DD');
      const response = await holidayAPI.checkWeeklyOff(today);
      setWeeklyOffInfo(response.data);
      setError(null);
    } catch (error) {
      console.error('Error checking weekly off:', error);
      setWeeklyOffInfo(null);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(response.data.attendance);
      setError(null);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setTodayAttendance(null);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await attendanceAPI.checkIn();
      toast.success('Check-in successful!');
      fetchTodayAttendance();
    } catch (error) {
      toast.error('Check-in failed: ' + error.response?.data?.error);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await attendanceAPI.checkOut();
      toast.success('Check-out successful!');
      fetchTodayAttendance();
    } catch (error) {
      toast.error('Check-out failed: ' + error.response?.data?.error);
    }
    setLoading(false);
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-8 text-red-700">
          <p className="font-semibold">Error loading attendance data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-gray-200/60 p-4 md:p-12 mb-12 overflow-hidden relative group font-outfit">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-blue-500/10"></div>

      {/* Weekly Off Alert - Premium Glass Alert */}
      {weeklyOffInfo?.isWeeklyOff && (
        <div className="mb-12 p-8 bg-gradient-to-r from-blue-50/50 to-white/30 backdrop-blur-3xl rounded-[2rem] border border-blue-100 flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-xl leading-none">
              Today is Your Day Off
            </p>
            <p className="text-blue-600 text-xs font-bold mt-3 italic">{weeklyOffInfo.reason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Clock - Digital Command Center Style */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2rem] p-4 md:p-10 text-white border border-gray-700/50 shadow-2xl relative overflow-hidden group/clock">
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover/clock:opacity-100 transition-opacity"></div>
          <p className="text-blue-400 text-xs font-bold mb-6 relative z-10">Current Time</p>
          <div className="text-6xl md:text-7xl font-bold mb-4 relative z-10 leading-none">
            {moment(currentTime).format('hh:mm')}
            <span className="text-2xl ml-1 font-bold opacity-30 animate-pulse">{moment(currentTime).format('ss')}</span>
            <span className="text-xl ml-4 font-bold text-blue-400">{moment(currentTime).format('A')}</span>
          </div>
          <div className="h-px w-12 bg-blue-500/50 mb-4 relative z-10"></div>
          <div className="text-lg md:text-xl font-bold text-gray-400 relative z-10">
            {moment(currentTime).format('dddd')}
          </div>
          <p className="text-xs text-gray-500 font-bold mt-2 relative z-10">
            {moment(currentTime).format('MMMM DD, YYYY')}
          </p>
        </div>

        {/* Check In/Out Buttons - Premium Nodes */}
        {!user?.role || (user?.role !== 'admin' && user?.role !== 'director') ? (
          <div className="flex flex-col justify-center gap-10 pl-0 md:pl-12">
            {weeklyOffInfo?.isWeeklyOff ? (
              <div className="bg-gray-50/30 backdrop-blur-3xl border border-dashed border-gray-200/60 rounded-[2.5rem] p-6 md:p-12 text-center">
                <div className="w-20 h-20 bg-white/50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
                  <span className="text-4xl">🌴</span>
                </div>
                <p className="font-bold text-gray-800 text-2xl leading-none">You Have Day Off</p>
                <p className="text-gray-400 text-xs font-bold mt-4 italic">{weeklyOffInfo.reason}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-white/40 backdrop-blur-3xl p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group/log">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <p className="text-xs font-bold text-gray-400 mb-4 relative z-10">Check-In Time</p>
                    <p className={`text-3xl font-bold relative z-10 leading-none ${todayAttendance?.checkInTime ? 'text-emerald-500' : 'text-gray-200 italic'}`}>
                      {todayAttendance?.checkInTime
                        ? moment(todayAttendance.checkInTime).format('HH:mm:ss')
                        : '00:00:00'}
                    </p>
                  </div>

                  <div className="bg-white/40 backdrop-blur-3xl p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group/log">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <p className="text-xs font-bold text-gray-400 mb-4 relative z-10">Check-Out Time</p>
                    <p className={`text-3xl font-bold relative z-10 leading-none ${todayAttendance?.checkOutTime ? 'text-red-500' : 'text-gray-200 italic'}`}>
                      {todayAttendance?.checkOutTime
                        ? moment(todayAttendance.checkOutTime).format('HH:mm:ss')
                        : '00:00:00'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <button
                    onClick={handleCheckIn}
                    disabled={todayAttendance?.checkInTime || loading}
                    className="flex-1 group relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-50 disabled:text-gray-200 text-white h-20 rounded-[1.5rem] font-bold text-xs transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center border-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <span className="relative z-10">{loading ? 'Processing...' : 'Check In'}</span>
                  </button>
                  <button
                    onClick={handleCheckOut}
                    disabled={!todayAttendance?.checkInTime || todayAttendance?.checkOutTime || loading}
                    className="flex-1 group relative overflow-hidden bg-red-600 hover:bg-red-700 disabled:bg-gray-50 disabled:text-gray-200 text-white h-20 rounded-[1.5rem] font-bold text-xs transition-all shadow-2xl shadow-red-500/20 active:scale-95 flex items-center justify-center border-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <span className="relative z-10">{loading ? 'Processing...' : 'Check Out'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
          ) : null}
      </div>
      </div>
    </>
  );
};

export default AttendanceMarker;
