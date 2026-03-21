import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { User, ArrowLeft, Mail } from 'lucide-react';

const ForgotEmailPage = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundEmail, setFoundEmail] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.forgotEmail(name.trim(), 'employee');

      setFoundEmail(response.data.email);
      toast.success('Email found!');
    } catch (error) {
      const errorMessage = error.response?.data?.error;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to find email');
      }
      console.error('Forgot email error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setFoundEmail(null);
    setName('');
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md">
        {!foundEmail ? (
          <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/40 p-6 md:p-12 relative overflow-hidden group">
            {/* Abstract Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-blue-600/10"></div>

            <div className="text-center mb-10 relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-8 shadow-2xl shadow-blue-600/20 active:scale-95 transition-transform">
                <User className="text-blue-400" size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Forgot Email</h1>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Find Your Email</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="group/field">
                <label htmlFor="name" className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-bold uppercase tracking-wide text-xs rounded-2xl transition-all shadow-xl shadow-blue-600/10 active:scale-95 border-none">
                {loading ? 'Searching...' : 'Find My Email'}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-100 relative z-10 flex flex-col gap-4">
              <Link
                to="/login/employee"
                className="flex items-center justify-center text-xs font-medium text-gray-400 hover:text-blue-600 uppercase tracking-wide gap-3 transition-colors">
                <ArrowLeft size={16} strokeWidth={2.5} />
                Back to Login
              </Link>
              <Link
                to="/forgot-password"
                className="flex items-center justify-center text-xs font-medium text-gray-400 hover:text-blue-600 uppercase tracking-wide gap-3 transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/40 p-6 md:p-12 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-[2rem] mb-8 shadow-xl shadow-green-500/10">
                <Mail className="text-green-600" size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Email Found!</h2>
              <p className="text-gray-400 font-semibold text-xs uppercase tracking-wide leading-relaxed mb-8">
                Your registered email is <br />
                <span className="text-gray-900 font-semibold break-all underline decoration-green-500/30">{foundEmail}</span>
              </p>

              <div className="bg-gray-900 rounded-3xl p-6 mb-10 text-left border border-white/10 shadow-2xl">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide leading-relaxed">
                  <span className="text-blue-400">TIP:</span> Use this email to reset your password if needed.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wide text-xs rounded-2xl transition-all active:scale-95 border-none">
                  Reset Password
                </button>
                <button
                  onClick={handleBack}
                  className="w-full h-14 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold uppercase tracking-wide text-xs rounded-2xl transition-all active:scale-95 border-none">
                  Search Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotEmailPage;