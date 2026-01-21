import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const PendingApprovalPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get email from localStorage or user context
  const getEmail = useCallback(() => {
    return user?.email || localStorage.getItem('pendingApprovalEmail') || null;
  }, [user]);

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
      // If approved, redirect to dashboard immediately
      if (approvalData.isApproved) {
        setIsRedirecting(true);
        if (!isInitial) {
          toast.success('\u2713 Your account has been approved! Redirecting to dashboard...');
        }
        localStorage.removeItem('pendingApprovalEmail');
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
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
  }, [getEmail, isRedirecting, navigate]);

  useEffect(() => {
    const email = getEmail();
    if (email) {
      checkApprovalStatus(email, true); // true = isInitial check
    }
    // Intentionally runs only once on mount to check approval status
  }, [checkApprovalStatus, getEmail]);


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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse w-20 h-20 mx-auto"></div>
            <div className="relative bg-green-100 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Redirecting...</h2>
          <p className="text-gray-600">Your account has been approved. Taking you to dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse"></div>
              <div className="relative bg-yellow-100 rounded-full p-6">
                <Clock className="text-yellow-600" size={48} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">
            Account Pending Approval
          </h1>

          {/* Subtitle */}
          <p className="text-center text-gray-600 text-lg mb-6">
            Thank you for registering!
          </p>

          {/* Status Info */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
            {!employeeData?.isApproved ? (
              <>
                <p className="text-yellow-800 text-center font-semibold mb-2">
                  ⏳ Waiting for Admin Approval
                </p>
                <p className="text-yellow-700 text-sm text-center">
                  Your account has been created successfully. An administrator will review your details and approve your account shortly.
                </p>
              </>
            ) : null}
          </div>

          {/* Employee Info - Show from both sources */}
          {(employeeData || email) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Name</p>
                <p className="text-gray-800 font-medium">
                  {employeeData?.name || user?.name || 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                <p className="text-gray-800 font-medium break-all">
                  {email || employeeData?.email || user?.email || 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Employee ID</p>
                <p className="text-gray-800 font-medium">
                  {employeeData?.employeeId || user?.employeeId || 'Being Generated'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Approval Status</p>
                <p className="text-sm">
                  {employeeData?.isApproved ? (
                    <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* No User Message */}
          {!employeeData && !email && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-center">
                Please check your email for approval updates. You can check back anytime to see your status.
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">What Happens Next?</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Account Created</p>
                  <p className="text-xs text-gray-600">Your account details are saved</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Pending Review</p>
                  <p className="text-xs text-gray-600">Admin will review your information</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Account Approved</p>
                  <p className="text-xs text-gray-600">You'll be able to login to the system</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Note:</span> You will be able to login once your account is approved by an administrator. This usually takes a few hours.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckStatus}
              disabled={checking || isRedirecting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} className={checking ? 'animate-spin' : ''} />
              {checking ? 'Checking...' : 'Check Approval Status'}
            </button>
            <button
              onClick={handleLogout}
              disabled={isRedirecting}
              className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout & Go to Login
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Need help? Contact your administrator or email support@zintech04.com
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Frequently Asked Questions</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-700">How long does approval take?</p>
              <p className="text-gray-600">Usually within 24 hours during business hours</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Can I change my information?</p>
              <p className="text-gray-600">Contact your administrator to request changes</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">What if I haven't been approved?</p>
              <p className="text-gray-600">Check back later or contact your admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
