import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Menu, X, ArrowLeft, Settings, ChevronDown, AlertCircle } from 'lucide-react';
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
    toast.info('Session terminated successfully');
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <header className="bg-white/70 backdrop-blur-3xl border-b border-gray-200/60 sticky top-0 z-40 transition-all font-outfit">
      <div className="max-w-full px-10 py-5">
        <div className="flex justify-between items-center">
          {/* Dashboard Context Section */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col">
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight leading-none">
                Admin Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-none">System Management</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-4">
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="group relative flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 border-none"
                >
                  <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={14} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl font-medium text-sm transition-all shadow-sm active:scale-95"
                >
                  <Settings size={14} className="text-gray-400" />
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-6">
            {user && (
              <div className="hidden md:block">
                <div className="relative group">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-gray-200 shadow-sm group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                      <p className="text-xs font-medium text-blue-600 mt-1 opacity-80">{user.role}</p>
                    </div>
                    <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} size={14} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="px-5 py-4 mb-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-4 px-4 py-4 hover:bg-blue-50 rounded-2xl transition-all text-sm font-medium text-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">👤</div>
                        Edit Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogoutClick();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-50 text-red-600 rounded-2xl transition-all text-sm font-medium border-t border-gray-100 mt-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-100/50 flex items-center justify-center text-red-600"><LogOut size={14} /></div>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && user && (
          <nav className="md:hidden mt-6 space-y-3 border-t border-gray-200 pt-4">
            {/* Back to Dashboard - Mobile */}
            <Link
              to="/dashboard"
              className="block w-full px-5 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 text-center justify-center active:scale-95"
              onClick={() => setIsOpen(false)}
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="block px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center gap-2 text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} />
              Profile
            </Link>

            <button
              onClick={() => {
                handleLogoutClick();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center z-[100] p-6">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full border border-gray-200 shadow-xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-100 mx-auto mb-6">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">Confirm Logout</h3>
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                Are you sure you want to logout? You'll need to sign in again.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmLogout}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-base rounded-lg transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
                <button
                  onClick={cancelLogout}
                  className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-base rounded-lg transition-all active:scale-95"
                >
                  Cancel
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
