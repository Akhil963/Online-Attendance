import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiLogOut, FiMenu, FiX, FiArrowLeft, FiSettings, FiChevronDown, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    toast.info('You have been logged out successfully');
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-b-2 border-blue-600">
      <div className="max-w-full px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transform hover:scale-105 transition-transform">
              ⚙️
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-400">Management Dashboard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2">
            {user && (
              <>
                {/* Back to Dashboard Button - New Design */}
                <Link
                  to="/dashboard"
                  className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
                  <span>Back to Dashboard</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
                </Link>

                {/* Profile & Settings */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                >
                  <FiSettings size={18} />
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:block">
                {/* User Dropdown Menu */}
                <div className="relative group">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.role}</p>
                    </div>
                    <FiChevronDown className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-700 mb-2">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Admin Menu</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-slate-700 transition-colors text-sm"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        👤 My Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogoutClick();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-600/20 hover:text-red-400 transition-colors text-sm border-t border-slate-700 mt-2 pt-2 flex items-center gap-2"
                      >
                        <FiLogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && user && (
          <nav className="md:hidden mt-6 space-y-3 border-t border-slate-700 pt-4">
            {/* Back to Dashboard - Mobile */}
            <Link
              to="/dashboard"
              className="block w-full px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-lg font-semibold transition-all flex items-center gap-2 text-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <FiArrowLeft size={18} />
              Back to Dashboard
            </Link>

            <Link
              to="/profile"
              className="block px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <FiSettings size={18} />
              Profile
            </Link>

            <button
              onClick={() => {
                handleLogoutClick();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </nav>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-8 max-w-sm mx-4 border border-slate-600 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600/20 border border-red-500/30 mx-auto mb-4">
                <FiAlertCircle className="text-red-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Confirm Logout</h3>
              <p className="text-gray-400 text-center mb-6">
                Are you sure you want to log out? You'll need to log in again to access the system.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FiLogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
