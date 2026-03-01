import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import realtimeService from '../services/realtimeService';

const PendingApprovalPage = () => {
  const { user, logout, token, setUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get email from localStorage or user context
  const getEmail = useCallback(() => {
    return user?.email || localStorage.getItem('pendingApprovalEmail') || null;
  }, [user]);

  // Navigate to dashboard only after user.isApproved is truly committed in React state
  useEffect(() => {
    if (user?.isApproved && isRedirecting) {
      toast.success('✓ Your account has been approved! Redirecting to dashboard...');
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user?.isApproved, isRedirecting, navigate]);

  // Check if user was approved when page loads
  const checkApprovalStatus = useCallback(async (emailToCheck, isInitial = false) => {
    try {
      // Prevent multiple calls while redirecting
      if (isRedirecting) {
        return;
      }
      setChecking(true);
      const email = emailToCheck || getEmail();
      if (!email) {
        toast.error('Unable to verify email. Please logout and login again.');
        return;
      }
      // Call public endpoint to check approval status
      const response = await axios.get(
        `http://localhost:5000/api/auth/check-approval/${email}`
      );
      const approvalData = response.data;
      setEmployeeData(approvalData);
      // If approved, refresh auth context and let useEffect handle navigation
      if (approvalData.isApproved) {
        localStorage.removeItem('pendingApprovalEmail');
        if (token) {
          const updated = await refreshUser();
          if (!updated?.isApproved) {
            // Fallback: patch the user in context directly
            setUser(prev => prev ? { ...prev, isApproved: true } : prev);
          }
        } else {
          setUser(prev => prev ? { ...prev, isApproved: true } : prev);
        }
        setIsRedirecting(true);
      }
      // Only show toast on manual check, not on initial load
      if (!isInitial && !approvalData.isApproved) {
        toast.info('Still waiting for approval. Check back soon!');
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
      if (error.response?.status === 404) {
        toast.error('Employee record not found.');
      } else if (!isInitial) {
        // Only show error toast on manual check
        toast.error('Could not check approval status. Please try again.');
      }
    } finally {
      setChecking(false);
    }
  }, [getEmail, isRedirecting, token, setUser, refreshUser]);

  // Subscribe to real-time approval notifications
  useEffect(() => {
    const setupRealtimeListener = async () => {
      if (token) {
        try {
          await realtimeService.connect(token);
          realtimeService.subscribeToApprovalStatus(async (data) => {
            if (data.employeeId || data.message?.includes('approved')) {
              setEmployeeData({ isApproved: true, ...data });
              localStorage.removeItem('pendingApprovalEmail');
              // Refresh auth context — navigation is handled by the useEffect above
              const updated = await refreshUser();
              if (!updated?.isApproved) {
                // Fallback: patch isApproved directly so ProtectedRoute passes
                setUser(prev => prev ? { ...prev, isApproved: true } : prev);
              }
              setIsRedirecting(true);
            }
          });
        } catch (err) {
          console.error('Failed to connect to real-time service:', err);
        }
      }
    };

    setupRealtimeListener();

    return () => {
      if (realtimeService.isConnected()) {
        realtimeService.disconnect();
      }
    };
  }, [token, setUser, refreshUser]);

  useEffect(() => {
    const email = getEmail();
    if (email && !isRedirecting) {
      checkApprovalStatus(email, true); // true = isInitial check
    }
    // Intentionally runs only once on mount to check approval status
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('pendingApprovalEmail');
    logout();
    navigate('/login/employee');
  };

  const handleCheckStatus = async () => {
    // Prevent clicking while already redirecting
    if (isRedirecting) {
      return;
    }
    await checkApprovalStatus();
  };

  const email = getEmail();

  // If redirecting, show loading screen
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/40 p-16 text-center max-w-lg w-full relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/10">
              <svg className="w-12 h-12 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Account Verified</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] leading-relaxed">Your account has been approved. Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 py-12">
      <div className="max-w-xl w-full">
        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/40 p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-yellow-500/10"></div>

          {/* Icon */}
          <div className="flex justify-center mb-10 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/20">
                <Clock className="text-yellow-400" size={40} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-10 relative z-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase">Account Pending</h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-4 bg-yellow-500 rounded-full animate-bounce"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Awaiting Multi-Factor Internal Approval</p>
            </div>
          </div>

          {/* Status Info Box */}
          <div className="bg-slate-900 rounded-[2rem] p-8 mb-10 shadow-2xl shadow-slate-900/10 relative z-10">
            {!employeeData?.isApproved ? (
              <div className="text-center">
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></span>
                  Verification In Progress
                </p>
                <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-widest">
                  Your account has been created. Our team is reviewing your details for approval.
                </p>
              </div>
            ) : null}
          </div>

          {/* Account Details */}
          {(employeeData || email) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative z-10">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-blue-500/20 transition-all">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Full Name</p>
                <p className="text-slate-900 font-black text-sm uppercase tracking-tight italic">
                  {employeeData?.name || user?.name || 'SYNCING...'}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-blue-500/20 transition-all">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Email Address</p>
                <p className="text-slate-900 font-black text-sm break-all tracking-tight lowercase">
                  {email || employeeData?.email || user?.email || 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-blue-500/20 transition-all">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Employee ID</p>
                <p className="text-slate-900 font-black text-sm uppercase tracking-tight italic">
                  {employeeData?.employeeId || user?.employeeId || 'INITIALIZING'}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-blue-500/20 transition-all">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${employeeData?.isApproved ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
                  <p className={`font-black text-sm uppercase tracking-tight ${employeeData?.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                    {employeeData?.isApproved ? 'Approved' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Protocol Flow */}
          <div className="mb-10 relative z-10">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 ml-1">Approval Status</h3>
            <div className="space-y-4">
              {[
                { step: 1, label: 'Account Created', desc: 'Account information saved', color: 'blue', status: 'done' },
                { step: 2, label: 'Admin Review', desc: 'Admin is reviewing', color: 'yellow', status: 'active' },
                { step: 3, label: 'System Access', desc: 'Access enabled', color: 'slate', status: 'wait' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 group/item hover:bg-white hover:border-blue-500/20 transition-all">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${item.status === 'done' ? 'bg-green-100 text-green-600' : item.status === 'active' ? 'bg-yellow-100 text-yellow-600 scale-110 shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                    {item.step}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${item.status === 'active' ? 'text-slate-900' : 'text-slate-400'}`}>{item.label}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Interface */}
          <div className="space-y-4 relative z-10">
            <button
              onClick={handleCheckStatus}
              disabled={checking || isRedirecting}
              className="w-full h-16 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3 border-none">
              <RefreshCw size={18} strokeWidth={2.5} className={checking ? 'animate-spin' : ''} />
              {checking ? 'Checking...' : 'Check Status'}
            </button>
            <button
              onClick={handleLogout}
              disabled={isRedirecting}
              className="w-full h-14 bg-slate-100 hover:bg-slate-200 disabled:text-slate-300 text-slate-600 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 border-none">
              <LogOut size={16} strokeWidth={2.5} />
              Logout
            </button>
          </div>

          {/* Elite Help Desk */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center relative z-10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Need help? Contact Support at <span className="text-slate-900 underline">support@attendance.com</span>
            </p>
          </div>
        </div>

        {/* Intelligence Accordion (Simplified FAQ) */}
        <div className="mt-8 bg-slate-900/5 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 p-8 group">
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            FAQ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2">How long does approval take?</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest">Usually within 24 hours.</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2">Wrong information?</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest">Contact your admin for account updates.</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2">Verification failed?</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest">Please check your details and try again.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
