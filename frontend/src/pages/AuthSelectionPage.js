import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, ArrowRight, Clock } from 'lucide-react';

const AuthSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
      
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/50">
              <Clock className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
            Attendance Management
          </h1>
          <p className="text-xl font-medium text-slate-300 mb-2">
            Smart tracking for modern workplaces
          </p>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
            Real-time attendance • Leave management • Performance analytics
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Employee Login Card */}
          <div
            onClick={() => navigate('/login/employee')}
            className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-12 cursor-pointer hover:border-blue-500/50 hover:bg-white/10 transition-all duration-500 overflow-hidden"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-2xl mb-8 group-hover:bg-blue-600/30 group-hover:scale-110 transition-all duration-300">
                <Users className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h2 className="text-3xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors">
                Employee Portal
              </h2>

              {/* Description */}
              <p className="text-gray-300 font-medium mb-8 leading-relaxed">
                Access your attendance dashboard, mark check-in/check-out, view your attendance history, and submit leave requests with ease.
              </p>

              {/* Features List */}
              <div className="space-y-3 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Daily attendance tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Check-in & check-out management</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Leave request management</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Monthly attendance reports</span>
                </div>
              </div>

              {/* Button */}
              <button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl flex items-center justify-between px-6 transition-all duration-300 group/btn active:scale-95 shadow-lg shadow-blue-600/30">
                <span>Sign In as Employee</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              {/* Register Link */}
              <p className="text-center text-sm text-slate-400 mt-6">
                Don't have an account?{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/signup/employee');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
                >
                  Create Account
                </span>
              </p>
            </div>
          </div>

          {/* Admin Login Card */}
          <div
            onClick={() => navigate('/login/admin')}
            className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-12 cursor-pointer hover:border-blue-500/50 hover:bg-white/10 transition-all duration-500 overflow-hidden"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-2xl mb-8 group-hover:bg-blue-600/30 group-hover:scale-110 transition-all duration-300">
                <Shield className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h2 className="text-3xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors">
                Admin Dashboard
              </h2>

              {/* Description */}
              <p className="text-gray-300 font-medium mb-8 leading-relaxed">
                Manage your entire workforce, view detailed attendance analytics, approve leave requests, and generate comprehensive reports.
              </p>

              {/* Features List */}
              <div className="space-y-3 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Employee management & insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Advanced attendance analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Leave approval workflow</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Custom reports & exports</span>
                </div>
              </div>

              {/* Button */}
              <button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl flex items-center justify-between px-6 transition-all duration-300 group/btn active:scale-95 shadow-lg">
                <span>Sign In as Admin</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-400 mt-6">
                New admin account?{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/signup/admin');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
                >
                  Get Started
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-black text-blue-400 mb-2">Real-Time</div>
            <p className="text-sm text-gray-400">Instant attendance updates</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-400 mb-2">Secure</div>
            <p className="text-sm text-gray-400">Enterprise-grade security</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-400 mb-2">Smart</div>
            <p className="text-sm text-gray-400">Intelligent analytics & insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSelectionPage;
