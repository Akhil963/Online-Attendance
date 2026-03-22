import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, LogOut, AlertCircle, Bell, Heart, User, LayoutDashboard, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import { leaveAPI, noticeAPI } from '../services/api';
import realtimeService from '../services/realtimeService';

const ClientHeader = () => {
  const { user, token, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [noticeCount, setNoticeCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [pulseNotice, setPulseNotice] = useState(false);
  const [pulseLeave, setPulseLeave] = useState(false);
  const navigate = useNavigate();

  const userKey = useMemo(() => {
    if (!user) return 'guest';
    return String(user._id || user.id || user.employeeId || user.email || 'guest');
  }, [user]);

  const noticeSeenKey = `notice_seen_at_${userKey}`;
  const leaveSeenKey = `leave_seen_at_${userKey}`;

  const getSeenTimestamp = (key) => {
    const raw = localStorage.getItem(key);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const refreshNoticeCount = useCallback(async () => {
    if (!user) {
      setNoticeCount(0);
      return;
    }

    try {
      const response = await noticeAPI.getNotices();
      const notices = response?.data?.notices || [];
      const seenAt = getSeenTimestamp(noticeSeenKey);

      const unread = notices.filter((notice) => {
        const createdAt = new Date(notice.createdAt).getTime();
        return Number.isFinite(createdAt) && createdAt > seenAt;
      }).length;

      setNoticeCount(unread);
    } catch (error) {
      console.error('Failed to refresh notice badge count:', error);
    }
  }, [user, noticeSeenKey]);

  const refreshLeaveCount = useCallback(async () => {
    if (!user) {
      setLeaveCount(0);
      return;
    }

    try {
      const response = await leaveAPI.getMyLeaves();
      const leaves = response?.data?.leaves || [];
      const seenAt = getSeenTimestamp(leaveSeenKey);

      const unreadLeaves = leaves.filter((leave) => {
        const status = String(leave.status || '').toLowerCase();
        const hasTrackableStatus = ['approved', 'rejected', 'pending'].includes(status);
        if (!hasTrackableStatus) return false;

        const changedAt = new Date(leave.updatedAt || leave.createdAt).getTime();
        return Number.isFinite(changedAt) && changedAt > seenAt;
      }).length;

      setLeaveCount(unreadLeaves);
    } catch (error) {
      console.error('Failed to refresh leave badge count:', error);
    }
  }, [user, leaveSeenKey]);

  useEffect(() => {
    if (!user) return;

    refreshNoticeCount();
    refreshLeaveCount();

    const interval = setInterval(() => {
      refreshNoticeCount();
      refreshLeaveCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, refreshNoticeCount, refreshLeaveCount]);

  useEffect(() => {
    if (!user || !token) return;

    if (!realtimeService.isConnected()) {
      realtimeService.connect(token).catch((error) => {
        console.error('Realtime connection failed in header:', error);
      });
    }

    const handleNewNotification = (payload) => {
      if (payload?.type === 'notice') {
        setPulseNotice(true);
        setTimeout(() => setPulseNotice(false), 2500);
        refreshNoticeCount();
      }
    };

    const handleLeaveStatusChange = () => {
      setPulseLeave(true);
      setTimeout(() => setPulseLeave(false), 2500);
      refreshLeaveCount();
    };

    realtimeService.subscribeToNotifications(handleNewNotification);
    realtimeService.subscribeToLeaveStatusChange(handleLeaveStatusChange);

    return () => {
      realtimeService.off('notification:new', handleNewNotification);
      realtimeService.off('leave:statusChanged', handleLeaveStatusChange);
    };
  }, [user, token, refreshNoticeCount, refreshLeaveCount]);

  const markNoticesSeen = () => {
    localStorage.setItem(noticeSeenKey, Date.now().toString());
    setNoticeCount(0);
  };

  const markLeavesSeen = () => {
    localStorage.setItem(leaveSeenKey, Date.now().toString());
    setLeaveCount(0);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    toast.info('Session terminated successfully');
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <header className="bg-white/70 backdrop-blur-3xl border-b border-slate-200/60 sticky top-0 z-40 font-outfit">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
        <div className="flex justify-between items-center">
          {/* Logo and Branding */}
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl group-hover:scale-110 active:scale-90 transition-all">
              <span className="tracking-tighter">AS</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tighter leading-none">Attendance System</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1.5 opacity-80">Employee Portal</p>
            </div>
          </div>

          {/* Desktop Navigation - Premium Nodes */}
          <nav className="hidden md:flex gap-1">
            {user && (
              <>
                <Link to="/dashboard" className="px-5 py-2.5 rounded-xl font-semibold text-xs transition-all hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <Link to="/department-info" className="px-5 py-2.5 rounded-xl font-semibold text-xs transition-all hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                  <Globe size={14} />
                  Departments
                </Link>
                <Link
                  to="/notices"
                  onClick={markNoticesSeen}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs transition-all hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center gap-2"
                >
                  <span className="relative inline-flex">
                    <Bell size={14} />
                    {noticeCount > 0 && pulseNotice && (
                      <span className="absolute inset-0 animate-pulse rounded-full bg-red-600 opacity-75"></span>
                    )}
                    {noticeCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center font-bold">
                        {noticeCount > 9 ? '9+' : noticeCount}
                      </span>
                    )}
                  </span>
                  Notices
                </Link>
                <Link
                  to="/leaves"
                  onClick={markLeavesSeen}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs transition-all hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center gap-2"
                >
                  <span className="relative inline-flex">
                    <Heart size={14} />
                    {leaveCount > 0 && pulseLeave && (
                      <span className="absolute inset-0 animate-pulse rounded-full bg-orange-500 opacity-75"></span>
                    )}
                    {leaveCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[10px] leading-4 text-center font-bold">
                        {leaveCount > 9 ? '9+' : leaveCount}
                      </span>
                    )}
                  </span>
                  Leaves
                </Link>
                <Link to="/profile" className="px-5 py-2.5 rounded-xl font-semibold text-xs transition-all hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                  <User size={14} />
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* User Intelligence Node */}
          <div className="flex items-center gap-6">
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                  <p className="text-xs font-medium text-blue-600 mt-1 capitalize">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-semibold text-blue-600 border border-blue-200 shadow-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-all border border-red-100 shadow-sm active:scale-90"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              className="md:hidden p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Client Links */}
        {isOpen && user && (
          <nav className="md:hidden mt-4 space-y-2 border-t border-gray-200 pt-4">
            <Link
              to="/dashboard"
              className="block hover:bg-blue-50 px-3 py-2 rounded text-gray-700 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/department-info"
              className="block hover:bg-blue-50 px-3 py-2 rounded text-gray-700 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Departments
            </Link>
            <Link
              to="/notices"
              className="block hover:bg-blue-50 px-3 py-2 rounded text-gray-700 font-medium transition-colors"
              onClick={() => {
                markNoticesSeen();
                setIsOpen(false);
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Bell size={14} />
                Notices
                {noticeCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center font-bold">
                    {noticeCount > 9 ? '9+' : noticeCount}
                  </span>
                )}
              </span>
            </Link>
            <Link
              to="/leaves"
              className="block hover:bg-blue-50 px-3 py-2 rounded text-gray-700 font-medium transition-colors"
              onClick={() => {
                markLeavesSeen();
                setIsOpen(false);
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Heart size={14} />
                Leaves
                {leaveCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] leading-[18px] text-center font-bold">
                    {leaveCount > 9 ? '9+' : leaveCount}
                  </span>
                )}
              </span>
            </Link>
            <Link
              to="/profile"
              className="block hover:bg-blue-50 px-3 py-2 rounded text-gray-700 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                handleLogoutClick();
                setIsOpen(false);
              }}
              className="w-full text-left bg-red-600 text-white px-5 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold text-sm active:scale-95 shadow-lg shadow-red-600/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full border border-gray-200 shadow-xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-red-100 border border-red-200 mx-auto mb-6">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Confirm Logout</h3>
              <p className="text-gray-600 text-center mb-8 font-medium">
                Are you sure you want to logout? You will need to login again to access your account.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmLogout}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Yes, Logout
                </button>
                <button
                  onClick={cancelLogout}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ClientHeader;
