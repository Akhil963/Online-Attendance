import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AttendanceMarker from '../components/AttendanceMarker';
import DashboardStatistics from '../components/DashboardStatistics';
import { useAuth } from '../hooks/useAuth';
import useLiveDataSync from '../hooks/useLiveDataSync';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Ref to track last refresh time
  const lastRefreshRef = useRef(0);

  const refreshDashboard = useCallback(() => {
    // Debounce: minimum 2 seconds between refreshes
    const now = Date.now();
    if (now - lastRefreshRef.current < 2000) {
      return;
    }
    lastRefreshRef.current = now;
    setRefreshKey(k => k + 1);
  }, []);

  // Realtime sync - only responds to socket events, no polling
  useLiveDataSync({
    onRefresh: refreshDashboard,
    events: [
      'attendance:updated',
      'attendance:checked-in', 
      'attendance:checked-out',
      'leave:statusChanged',
      'leave:created',
      'notification:new',
      'profile:updated',
      'stats:updated'
    ],
    soundEvents: ['leave:statusChanged', 'notification:new', 'attendance:checked-in'],
    pollMs: 0,  // Disabled - only update on socket events
    enabled: true
  });

  // Redirect to admin dashboard if user is admin
  useEffect(() => {
    if (!loading && user) {
      try {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.role === 'employee' && user.isApproved) {
          setIsValidated(true);
        } else if (user.role === 'employee' && !user.isApproved) {
          navigate('/pending-approval', { replace: true });
        }
      } catch (error) {
        setValidationError('Error validating user role');
      }
    }
  }, [user, loading, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login/employee', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if validation failed
  if (validationError) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="bg-white/70 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/40 p-6 md:p-12 text-center max-w-lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{validationError}</p>
            <button
              onClick={() => navigate('/login/employee')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if user is missing
  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="bg-white/70 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/40 p-6 md:p-12 text-center max-w-lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-6">Unable to load user information. Please login again.</p>
            <button
              onClick={() => navigate('/login/employee')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard only if validated and user is approved employee
  if (!isValidated || !user.isApproved) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs animate-pulse">Verifying Account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* Welcome Section - Elite Aesthetic */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Welcome, <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{user?.name || 'Employee'}</span>!
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-gray-100 rounded-full border border-gray-200 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employee ID: {user?.employeeId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <AttendanceMarker />
          </div>
          <div>
            <DashboardStatistics key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
