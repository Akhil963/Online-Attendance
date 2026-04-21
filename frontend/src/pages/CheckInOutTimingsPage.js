import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Clock, Search, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment';

const DEFAULT_CHECKOUT_TIME = { hour: 18, minute: 48 }; // 6:48 PM

const formatLocation = (location) => {
  if (location?.latitude == null || location?.longitude == null) {
    return '-';
  }

  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
};

const formatPlace = (location) => {
  if (!location) {
    return '-';
  }

  const place = [location.village, location.city, location.state, location.country]
    .filter(Boolean)
    .join(', ');

  return place || location.displayName || '-';
};

const getMapUrl = (location) => {
  if (location?.latitude == null || location?.longitude == null) {
    return null;
  }

  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
};

const CheckInOutTimingsPage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterStatus, setFilterStatus] = useState('all'); // all, checked-out, missed-checkout

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const dateObj = moment(selectedDate, 'YYYY-MM-DD');
      const month = dateObj.format('MM');
      const year = dateObj.format('YYYY');

      const attendanceRes = await api.get(`/attendance/all?month=${month}&year=${year}`);

      setAttendanceData(attendanceRes.data?.attendance || attendanceRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get attendance records for the selected date
  const getDayRecords = () => {
    const dayStart = moment(selectedDate, 'YYYY-MM-DD').startOf('day');
    const dayEnd = moment(selectedDate, 'YYYY-MM-DD').endOf('day');

    return attendanceData
      .filter(record => {
        const recordDate = moment(record.date);
        return recordDate.isBetween(dayStart, dayEnd, null, '[]') && record.status === 'present';
      })
      .map(record => {
        const emp = record.employeeId;
        const hasCheckedOut = !!record.checkOutTime;

        // Default checkout time: 6:48 PM on the same day if not checked out
        let effectiveCheckout = record.checkOutTime;
        if (!hasCheckedOut && record.checkInTime) {
          const checkInDate = moment(record.date);
          effectiveCheckout = checkInDate
            .clone()
            .hour(DEFAULT_CHECKOUT_TIME.hour)
            .minute(DEFAULT_CHECKOUT_TIME.minute)
            .second(0)
            .toDate();
        }

        // Calculate working hours
        let workingHours = record.workingHours || 0;
        if (!hasCheckedOut && record.checkInTime && effectiveCheckout) {
          workingHours = moment(effectiveCheckout).diff(moment(record.checkInTime), 'hours', true);
        }

        return {
          _id: record._id,
          employeeId: emp?.employeeId || emp?._id || 'N/A',
          employeeName: emp?.name || 'Unknown',
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          checkInLocation: record.checkInLocation || null,
          checkOutLocation: record.checkOutLocation || null,
          effectiveCheckout,
          hasCheckedOut,
          workingHours: Math.max(0, workingHours).toFixed(2),
          status: record.status
        };
      })
      .filter(record => {
        // Search filter
        const matchesSearch =
          record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        if (filterStatus === 'checked-out') return matchesSearch && record.hasCheckedOut;
        if (filterStatus === 'missed-checkout') return matchesSearch && !record.hasCheckedOut;
        return matchesSearch;
      })
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  };

  const records = getDayRecords();
  const totalPresent = records.length;
  const checkedOut = records.filter(r => r.hasCheckedOut).length;
  const missedCheckout = records.filter(r => !r.hasCheckedOut).length;

  const goToPrevDay = () => {
    setSelectedDate(moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD'));
  };

  const goToNextDay = () => {
    const next = moment(selectedDate).add(1, 'day');
    if (next.isSameOrBefore(moment(), 'day')) {
      setSelectedDate(next.format('YYYY-MM-DD'));
    }
  };

  const isToday = moment(selectedDate).isSame(moment(), 'day');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading timings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
              Check-In / Check-Out
            </h1>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Employee Timings</p>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevDay}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90"
            >
              <ChevronLeft size={18} />
            </button>
            <input
              type="date"
              value={selectedDate}
              max={moment().format('YYYY-MM-DD')}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm text-gray-700 shadow-sm"
            />
            <button
              onClick={goToNextDay}
              disabled={isToday}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Clock size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Present</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">{totalPresent}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <CheckCircle size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Checked Out</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-600">{checkedOut}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <AlertTriangle size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Missed</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-600">{missedCheckout}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-700"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 pr-10 py-3 sm:py-3.5 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-700 appearance-none"
            >
              <option value="all">All Employees</option>
              <option value="checked-out">Checked Out</option>
              <option value="missed-checkout">Missed Checkout</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Records */}
        {records.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-12 sm:p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="text-gray-300" size={40} />
            </div>
            <p className="font-bold text-gray-500 uppercase text-xs">
              {searchTerm ? 'No matching records found' : 'No attendance records for this date'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {records.map((record) => (
                <div key={record._id} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-100 flex-shrink-0">
                        {record.employeeName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{record.employeeName}</p>
                        <p className="text-[10px] font-semibold text-gray-400">{record.employeeId}</p>
                      </div>
                    </div>
                    {!record.hasCheckedOut ? (
                      <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Missed
                      </span>
                    ) : (
                      <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle size={10} />
                        Done
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">In</p>
                      <p className="text-xs font-bold text-emerald-600">
                        {record.checkInTime ? moment(record.checkInTime).format('hh:mm A') : '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Out</p>
                      <p className={`text-xs font-bold ${record.hasCheckedOut ? 'text-red-500' : 'text-amber-500 italic'}`}>
                        {record.hasCheckedOut
                          ? moment(record.checkOutTime).format('hh:mm A')
                          : record.effectiveCheckout
                            ? `${moment(record.effectiveCheckout).format('hh:mm A')}*`
                            : '--'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Hours</p>
                      <p className="text-xs font-bold text-blue-600">{record.workingHours}h</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] text-gray-500 font-semibold">
                      In: {formatLocation(record.checkInLocation)} | {formatPlace(record.checkInLocation)}
                      {getMapUrl(record.checkInLocation) && (
                        <>
                          {' '}
                          <a
                            href={getMapUrl(record.checkInLocation)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            (map)
                          </a>
                        </>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-500 font-semibold">
                      Out: {formatLocation(record.checkOutLocation)} | {formatPlace(record.checkOutLocation)}
                      {getMapUrl(record.checkOutLocation) && (
                        <>
                          {' '}
                          <a
                            href={getMapUrl(record.checkOutLocation)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            (map)
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  {!record.hasCheckedOut && (
                    <p className="text-[9px] text-amber-500 font-medium mt-2 italic">* Default checkout time (6:48 PM) applied</p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-900 text-white uppercase text-xs font-bold">
                      <th className="px-6 lg:px-8 py-5">Employee</th>
                      <th className="px-6 lg:px-8 py-5">ID</th>
                      <th className="px-6 lg:px-8 py-5">Check In</th>
                      <th className="px-6 lg:px-8 py-5">Check Out</th>
                      <th className="px-6 lg:px-8 py-5">Check-In Location</th>
                      <th className="px-6 lg:px-8 py-5">Check-Out Location</th>
                      <th className="px-6 lg:px-8 py-5">Working Hours</th>
                      <th className="px-6 lg:px-8 py-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((record) => (
                      <tr key={record._id} className="group hover:bg-blue-50/50 transition-all">
                        <td className="px-6 lg:px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100">
                              {record.employeeName.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{record.employeeName}</span>
                          </div>
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                            {record.employeeId}
                          </span>
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          <span className="font-bold text-emerald-600 text-sm">
                            {record.checkInTime ? moment(record.checkInTime).format('hh:mm:ss A') : '--'}
                          </span>
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          {record.hasCheckedOut ? (
                            <span className="font-bold text-red-500 text-sm">
                              {moment(record.checkOutTime).format('hh:mm:ss A')}
                            </span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-bold text-amber-500 text-sm italic">
                                {record.effectiveCheckout
                                  ? `${moment(record.effectiveCheckout).format('hh:mm A')}*`
                                  : '--'
                                }
                              </span>
                              <span className="text-[10px] text-amber-400 font-medium mt-0.5">Default time applied</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          <p className="text-xs font-bold text-gray-700">{formatLocation(record.checkInLocation)}</p>
                          <p className="text-[10px] text-gray-400 font-semibold max-w-[180px] truncate">{formatPlace(record.checkInLocation)}</p>
                          {getMapUrl(record.checkInLocation) && (
                            <a
                              href={getMapUrl(record.checkInLocation)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                            >
                              Open map
                            </a>
                          )}
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          <p className="text-xs font-bold text-gray-700">{formatLocation(record.checkOutLocation)}</p>
                          <p className="text-[10px] text-gray-400 font-semibold max-w-[180px] truncate">{formatPlace(record.checkOutLocation)}</p>
                          {getMapUrl(record.checkOutLocation) && (
                            <a
                              href={getMapUrl(record.checkOutLocation)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                            >
                              Open map
                            </a>
                          )}
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          <span className="font-extrabold text-blue-600 text-lg">{record.workingHours}</span>
                          <span className="text-xs text-gray-400 font-bold ml-1">hrs</span>
                        </td>
                        <td className="px-6 lg:px-8 py-5 text-center">
                          {record.hasCheckedOut ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <CheckCircle size={12} />
                              Checked Out
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
                              <AlertTriangle size={12} />
                              Missed Checkout
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] sm:text-xs text-gray-400 font-medium px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                * Employees who didn&apos;t checkout are auto-assigned 6:48 PM as default
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckInOutTimingsPage;
