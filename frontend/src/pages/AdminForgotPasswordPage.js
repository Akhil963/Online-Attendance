import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft } from 'lucide-react';

const AdminForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: email.toLowerCase(),
        userType: 'admin'
      });

      setSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset link');
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!submitted ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <Mail className="text-slate-700" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Password Reset</h1>
              <p className="text-gray-600">Enter your email to receive a password reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-slate-700 transition"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/login/admin"
                className="flex items-center justify-center text-slate-700 hover:text-slate-800 font-medium gap-2"
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Mail className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <span className="font-semibold break-all">{email}</span>
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-slate-800">
                <span className="font-semibold">🔐 Security Note:</span> The reset link will expire in 24 hours. Please keep this email confidential.
              </p>
            </div>
            <button
              onClick={() => navigate('/login/admin')}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminForgotPasswordPage;
