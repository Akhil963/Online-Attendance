import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiMenu, FiX, FiLogOut, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ClientHeader = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Company Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-blue-600">
              AS
            </div>
            <h1 className="text-xl font-bold">Attendance System</h1>
          </div>

          {/* Desktop Navigation - Client Links */}
          <nav className="hidden md:flex gap-6">
            {user && (
              <>
                <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                  Dashboard
                </Link>
                <Link to="/department-info" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                  Departments
                </Link>
                <Link to="/notices" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                  Notices
                </Link>
                <Link to="/leaves" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                  Leaves
                </Link>
                <Link to="/profile" className="hover:bg-blue-700 px-3 py-2 rounded transition-colors">
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs bg-blue-500 px-2 py-1 rounded">{user.role}</span>
                <button
                  onClick={handleLogoutClick}
                  className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded flex items-center gap-2 transition-colors"
                >
                  <FiLogOut />
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Client Links */}
        {isOpen && user && (
          <nav className="md:hidden mt-4 space-y-2 border-t border-blue-500 pt-4">
            <Link
              to="/dashboard"
              className="block hover:bg-blue-700 px-3 py-2 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/department-info"
              className="block hover:bg-blue-700 px-3 py-2 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Departments
            </Link>
            <Link
              to="/notices"
              className="block hover:bg-blue-700 px-3 py-2 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Notices
            </Link>
            <Link
              to="/leaves"
              className="block hover:bg-blue-700 px-3 py-2 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Leaves
            </Link>
            <Link
              to="/profile"
              className="block hover:bg-blue-700 px-3 py-2 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                handleLogoutClick();
                setIsOpen(false);
              }}
              className="w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <FiLogOut />
              Logout
            </button>
          </nav>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-sm mx-4 border border-gray-200 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 border border-red-300 mx-auto mb-4">
                <FiAlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Confirm Logout</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to log out? You'll need to log in again to access the system.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
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

export default ClientHeader;
