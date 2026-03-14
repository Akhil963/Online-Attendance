import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const AdminSignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.adminCode) {
      toast.error('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: 'admin',
        adminCode: formData.adminCode
      });
      navigate('/admin-dashboard');
      toast.success('Admin registration successful!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-6">
      <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/40 p-6 md:p-12 w-full max-w-2xl relative overflow-hidden group">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-blue-600/10"></div>

        <div className="text-center mb-12 relative z-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/20 active:scale-95 transition-transform">
            <span className="text-white text-2xl font-bold tracking-tight">OAS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3 uppercase">Admin Registration</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Create your admin account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group/field">
              <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 ml-1 group-focus-within/field:text-indigo-600 transition-colors">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="John Doe"
              />
            </div>

            <div className="group/field">
              <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 ml-1 group-focus-within/field:text-indigo-600 transition-colors">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="admin@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group/field">
              <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 ml-1 group-focus-within/field:text-indigo-600 transition-colors">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="group/field">
              <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 ml-1 group-focus-within/field:text-indigo-600 transition-colors">
                Admin Code *
              </label>
              <input
                type="password"
                name="adminCode"
                value={formData.adminCode}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="Enter Admin Code"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group/field">
              <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 ml-1 group-focus-within/field:text-indigo-600 transition-colors">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  placeholder="Min. 6 Characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                  {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <div className="group/field">
              <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 ml-1 group-focus-within/field:text-indigo-600 transition-colors">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  placeholder="Repeat Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                  {showConfirmPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-bold uppercase tracking-wide text-sm rounded-2xl transition-all shadow-xl shadow-blue-600/10 active:scale-95 border-none">
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col gap-4 text-center relative z-10">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Already have an account?{' '}
            <a href="/login/admin" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign In
            </a>
          </p>

          <a href="/" className="text-xs font-medium text-gray-500 hover:text-gray-700 uppercase tracking-wide transition-colors">
            Back Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminSignupPage;
