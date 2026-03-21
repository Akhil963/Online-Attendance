import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, ArrowRight, Clock } from 'lucide-react';

const AuthSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-600/10 rounded-full blur-3xl -mr-24 sm:-mr-32 md:-mr-48 -mt-24 sm:-mt-32 md:-mt-48"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-600/10 rounded-full blur-3xl -ml-24 sm:-ml-32 md:-ml-48 -mb-24 sm:-mb-32 md:-mb-48"></div>
      
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <div className="inline-block mb-6 sm:mb-7 md:mb-8">
            <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/50">
              <Clock className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
            Attendance Management
          </h1>
          {/* <p className="text-xl font-medium text-slate-300 mb-2">
            Smart tracking for modern workplaces
          </p> */}
          {/* <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
            Real-time attendance • Leave management • Performance analytics
          </p> */}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Employee Login Card */}
          <div
            onClick={() => navigate('/login/employee')}
            className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 cursor-pointer hover:border-blue-500/50 hover:bg-white/10 transition-all duration-500 overflow-hidden"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600/20 rounded-2xl mb-6 sm:mb-7 md:mb-8 group-hover:bg-blue-600/30 group-hover:scale-110 transition-all duration-300">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-3 sm:mb-4 group-hover:text-blue-400 transition-colors">
                Employee Portal
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 font-medium mb-6 sm:mb-8 leading-relaxed">
                Access your attendance dashboard, mark check-in/check-out, view your attendance history, and submit leave requests with ease.
              </p>

              {/* Features List */}
              <div className="space-y-2 sm:space-y-3 mb-8 sm:mb-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-300">Daily attendance tracking</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-slate-300">Check-in & check-out management</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-slate-300">Leave request management</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-slate-300">Monthly attendance reports</span>
                </div>
              </div>

              {/* Button */}
              <button className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl flex items-center justify-between px-4 sm:px-6 transition-all duration-300 group/btn active:scale-95 shadow-lg shadow-blue-600/30">
                <span className="text-sm sm:text-base">Sign In as Employee</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              {/* Register Link */}
              {/* <p className="text-center text-sm text-slate-400 mt-6">
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
              </p> */}
            </div>
          </div>

          {/* Admin Login Card */}
          <div
            onClick={() => navigate('/login/admin')}
            className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 cursor-pointer hover:border-blue-500/50 hover:bg-white/10 transition-all duration-500 overflow-hidden"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600/20 rounded-2xl mb-6 sm:mb-7 md:mb-8 group-hover:bg-blue-600/30 group-hover:scale-110 transition-all duration-300">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-3 sm:mb-4 group-hover:text-blue-400 transition-colors">
                Admin Dashboard
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 font-medium mb-6 sm:mb-8 leading-relaxed">
                Manage your entire workforce, view detailed attendance analytics, approve leave requests, and generate comprehensive reports.
              </p>

              {/* Features List */}
              <div className="space-y-2 sm:space-y-3 mb-8 sm:mb-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-300">Employee management & insights</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-300">Advanced attendance analytics</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-300">Leave approval workflow</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-300">Manage Departments</span>
                </div>
              </div>

              {/* Button */}
              <button className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl flex items-center justify-between px-4 sm:px-6 transition-all duration-300 group/btn active:scale-95 shadow-lg shadow-blue-600/30">
                <span className="text-sm sm:text-base">Sign In as Admin</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              {/* Register Link */}
              {/* <p className="text-center text-sm text-gray-400 mt-6">
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
              </p> */}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
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
        </div> */}
      </div>
    </div>
  );
};

export default AuthSelectionPage;
