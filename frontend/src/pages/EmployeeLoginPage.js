import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const EmployeeLoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if user was just approved
    const isApproved = searchParams.get('approved');
    if (isApproved === 'true') {
      toast.success('✓ Your account has been approved! Please login with your credentials.');
    }

    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      setIdentifier(remembered);
      setRememberMe(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(identifier, password, 'employee');
      if (rememberMe) {
        localStorage.setItem('rememberedUser', identifier);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      navigate('/dashboard');
      toast.success('Login successful!');
    } catch (error) {
      // Check if it's a pending approval error (403 Forbidden)
      if (error.response?.status === 403) {
        // Extract email from error response if available
        const email = error.response?.data?.email;
        if (email) {
          localStorage.setItem('pendingApprovalEmail', email);
        }
        toast.info('Your account is pending admin approval. Redirecting...');
        // Wait a moment then redirect to pending approval page
        setTimeout(() => {
          navigate('/pending-approval');
        }, 1500);
      } else {
        toast.error(error.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 w-full max-w-md">
        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl -mr-24 -mt-24"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
            <span className="text-white text-xl font-bold tracking-tight">AS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Employee Login</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="group/field">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Name
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="your@email.com or name"
            />
          </div>

          <div className="group/field">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border border-gray-300 rounded accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-600">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-4 text-center relative z-10">
          <p className="text-sm font-medium text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup/employee" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>

          <div className="flex justify-between items-center gap-4">
            <Link to="/forgot-password" className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors">
              Forgot Password
            </Link>
            <Link to="/" className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
              Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;
