import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import NotificationBadge from './NotificationBadge';

const Header = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            {user && (
              <>
                <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Dashboard
                </Link>
                <Link to="/department-info" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Departments
                </Link>
                <Link to="/notices" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Notices
                </Link>
                <Link to="/leaves" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Leaves
                </Link>
                <Link to="/profile" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Notification Badge */}
            {user && (
              <NotificationBadge />
            )}
            
            {user && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded flex items-center gap-2"
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

        {/* Mobile Navigation */}
        {isOpen && user && (
          <nav className="md:hidden mt-4 space-y-2">
            <Link
              to="/dashboard"
              className="block hover:bg-blue-700 px-3 py-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/department-info"
              className="block hover:bg-blue-700 px-3 py-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              Departments
            </Link>
            <Link
              to="/notices"
              className="block hover:bg-blue-700 px-3 py-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              Notices
            </Link>
            <Link
              to="/leaves"
              className="block hover:bg-blue-700 px-3 py-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              Leaves
            </Link>
            <Link
              to="/profile"
              className="block hover:bg-blue-700 px-3 py-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded flex items-center gap-2"
            >
              <FiLogOut />
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
