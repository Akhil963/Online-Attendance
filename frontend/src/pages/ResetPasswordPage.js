import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const type = searchParams.get('type'); // 'employee' or 'admin'

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !type) {
        toast.error('Invalid reset link');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/auth/verify-reset-token', {
          params: { token }
        });

        setEmail(response.data.email);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Invalid or expired reset link');
        navigate(type === 'admin' ? '/login/admin' : '/login/employee');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, type, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please enter both passwords');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setValidating(true);
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        password,
        confirmPassword,
        userType: type
      });

      setResetSuccess(true);
      toast.success('Password reset successfully');

      setTimeout(() => {
        navigate(type === 'admin' ? '/login/admin' : '/login/employee');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
      console.error('Reset password error:', error);
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  const bgGradient = type === 'admin' 
    ? 'from-slate-900 to-slate-800' 
    : 'from-blue-50 to-indigo-100';

  const primaryColor = type === 'admin' ? 'slate' : 'blue';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {!resetSuccess ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-${primaryColor}-100 rounded-full mb-4`}>
                <Lock className={`text-${primaryColor}-600`} size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
              <p className="text-gray-600 text-sm">Set a new password for your account</p>
              <p className="text-gray-500 text-sm mt-1">{email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
                    disabled={validating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
                    disabled={validating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirm)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    tabIndex="-1"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={validating}
                className={`w-full bg-gradient-to-r from-${primaryColor}-600 to-${primaryColor}-700 hover:from-${primaryColor}-700 hover:to-${primaryColor}-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg disabled:cursor-not-allowed`}
              >
                {validating ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to={type === 'admin' ? '/login/admin' : '/login/employee'}
                className="flex items-center justify-center text-blue-600 hover:text-blue-700 font-medium gap-2"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Password Reset Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been reset. You can now log in with your new password.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login page in 3 seconds...
            </p>
            <button
              onClick={() => navigate(type === 'admin' ? '/login/admin' : '/login/employee')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
            >
              Go to Login Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
