import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

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
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [errors, setErrors] = useState([]);

  const calculatePasswordStrength = (pwd) => {
    let criteria = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+={};':"\\"|,.<>/?[\]]/.test(pwd)
    };

    const met = Object.values(criteria).filter(v => v).length;
    const score = (met / 5) * 100;

    return {
      score,
      level: score < 40 ? 'Weak' : score < 70 ? 'Fair' : 'Strong',
      criteria,
      color: score < 40 ? 'red' : score < 70 ? 'yellow' : 'green'
    };
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !type) {
        toast.error('Invalid reset link');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await authAPI.verifyResetToken(token);

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

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (pwd) {
      setPasswordStrength(calculatePasswordStrength(pwd));
    } else {
      setPasswordStrength(null);
    }
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = [];

    if (!password || !confirmPassword) {
      newErrors.push('Please enter both passwords');
    }

    if (password.length < 8) {
      newErrors.push('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      newErrors.push('Password must contain at least one uppercase letter (A-Z)');
    }

    if (!/[a-z]/.test(password)) {
      newErrors.push('Password must contain at least one lowercase letter (a-z)');
    }

    if (!/[0-9]/.test(password)) {
      newErrors.push('Password must contain at least one number (0-9)');
    }

    if (!/[!@#$%^&*()_+={};':"\\|,.<>/?[\]]/.test(password)) {
      newErrors.push('Password must contain at least one special character (!@#$%)');
    }

    if (password !== confirmPassword) {
      newErrors.push('Passwords do not match');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setValidating(true);
      const response = await authAPI.resetPassword(token, password, confirmPassword, type);

      if (response.data.success) {
        setResetSuccess(true);
        toast.success('Password reset successfully');

        setTimeout(() => {
          navigate(type === 'admin' ? '/login/admin' : '/login/employee');
        }, 3000);
      }
    } catch (error) {
      if (error.response?.data?.details) {
        setErrors(error.response.data.details);
      } else {
        setErrors([error.response?.data?.error || 'Failed to reset password']);
      }
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-2xl p-16 text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please wait</h2>
          <p className="text-gray-600 text-sm">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md">
        {!resetSuccess ? (
          <div className="bg-white rounded-lg shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Lock className="w-12 h-12 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
              <p className="text-gray-600 text-sm mt-2">Account: {email}</p>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                {errors.map((err, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Choose a strong password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    disabled={validating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordStrength && password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.color === 'red'
                              ? 'bg-red-500'
                              : passwordStrength.color === 'yellow'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.color === 'red'
                          ? 'text-red-600'
                          : passwordStrength.color === 'yellow'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                        {passwordStrength.level}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                      <p className={passwordStrength.criteria.length ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.length ? '✓' : '○'}</span>
                        At least 8 characters
                      </p>
                      <p className={passwordStrength.criteria.uppercase ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.uppercase ? '✓' : '○'}</span>
                        Uppercase letter (A-Z)
                      </p>
                      <p className={passwordStrength.criteria.lowercase ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.lowercase ? '✓' : '○'}</span>
                        Lowercase letter (a-z)
                      </p>
                      <p className={passwordStrength.criteria.number ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.number ? '✓' : '○'}</span>
                        Number (0-9)
                      </p>
                      <p className={passwordStrength.criteria.special ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.special ? '✓' : '○'}</span>
                        Special character (!@#$%)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors([]);
                    }}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirm)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {password && confirmPassword && (
                  <div className="mt-2">
                    {password === confirmPassword ? (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Passwords match
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={validating || !password || !confirmPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? 'Processing...' : 'Reset Password'}
              </button>

              {/* Back Button */}
              <Link
                to={type === 'admin' ? '/login/admin' : '/login/employee'}
                className="w-full block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2.5"
              >
                ← Back to Login
              </Link>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successfully</h2>
            <p className="text-gray-600 text-sm mb-6">Your password has been changed and you can now log in.</p>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-700">Redirecting to login page in 3 seconds...</p>
            </div>

            <button
              onClick={() => navigate(type === 'admin' ? '/login/admin' : '/login/employee')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200"
            >
              Go to Login Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
