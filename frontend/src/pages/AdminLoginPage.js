import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password, 'admin');
      if (rememberMe) {
        localStorage.setItem('rememberedAdmin', email);
      }
      navigate('/admin-dashboard');
      toast.success('Admin login successful!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10 w-full max-w-md">
        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl -mr-24 -mt-24"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
            <span className="text-white text-xl font-bold tracking-tight">OAS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Admin Login</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sign in to admin portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="group/field">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="admin@company.com"
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
            New to admin panel?{' '}
            <Link to="/signup/admin" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>

          <div className="flex flex-col gap-2">
            <Link to="/forgot-password/admin" className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors">
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

export default AdminLoginPage;
