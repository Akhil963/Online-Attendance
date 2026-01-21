import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { attendanceAPI, holidayAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const AttendanceMarker = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weeklyOffInfo, setWeeklyOffInfo] = useState(null);

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
    } catch (error) {
      console.error('Error checking weekly off:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
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
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* Weekly Off Alert */}
      {weeklyOffInfo?.isWeeklyOff && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
          <p className="text-blue-800 font-semibold">
            📅 Today is Weekly Off - {weeklyOffInfo.reason}
          </p>
          <p className="text-blue-600 text-sm mt-1">You are not required to mark attendance today</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Clock */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-6xl font-bold mb-2">
            {moment(currentTime).format('hh:mm:ss A')}
          </div>
          <div className="text-2xl mb-4">
            {moment(currentTime).format('(dddd) MMMM DD, YYYY')}
          </div>
          <p className="text-sm opacity-75">Current Time</p>
        </div>

        {/* Check In/Out Buttons - Only for Employees */}
        {!user?.role || (user?.role !== 'admin' && user?.role !== 'director') ? (
          <div className="flex flex-col gap-4 justify-center">
            {weeklyOffInfo?.isWeeklyOff ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-700 font-medium">
                  ✓ Weekly Off / Holiday
                </p>
                <p className="text-blue-600 text-sm mt-1">{weeklyOffInfo.reason}</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Check In Time:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {todayAttendance?.checkInTime
                      ? moment(todayAttendance.checkInTime).format('hh:mm:ss A')
                      : 'Not checked in'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-2">Check Out Time:</p>
                  <p className="text-2xl font-bold text-red-600">
                    {todayAttendance?.checkOutTime
                      ? moment(todayAttendance.checkOutTime).format('hh:mm:ss A')
                      : 'Not checked out'}
                  </p>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCheckIn}
                    disabled={todayAttendance?.checkInTime || loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded font-bold transition"
                  >
                    Check In
                  </button>
                  <button
                    onClick={handleCheckOut}
                    disabled={!todayAttendance?.checkInTime || todayAttendance?.checkOutTime || loading}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 rounded font-bold transition"
                  >
                    Check Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AttendanceMarker;
