import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Building2,
  AlertCircle,
  Menu,
  X,
  Clock,
  ShieldUser,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setIsOpen(false);
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const adminMenuItems = [
    {
      category: 'Account',
      items: [
        {
          label: 'My Profile',
          path: '/profile',
          icon: User,
          description: 'View & edit admin profile'
        }
      ]
    },
    {
      category: 'Dashboard',
      items: [
        {
          label: 'Admin Dashboard',
          path: '/admin-dashboard',
          icon: BarChart3,
          description: 'Main dashboard & metrics'
        },
        {
          label: 'Enhanced Dashboard',
          path: '/admin/enhanced-dashboard',
          icon: BarChart3,
          description: 'Overview & key metrics'
        },
        {
          label: 'Create Employee Profiles',
          path: '/admin-dashboard?open=create-employee',
          icon: Users,
          description: 'Create profiles for employees'
        },
        {
          label: 'Create Admin Profiles',
          path: '../signup/admin',
          icon: ShieldUser,
          description: 'Create profiles for admins'
        }
      ]
    },
    {
      category: 'Management',
      items: [
        {
          label: 'Employee Management',
          path: '/admin/employees',
          icon: Users,
          description: 'Manage all employees'
        },
        {
          label: 'Employee Approval',
          path: '/admin/employee-approval',
          icon: Users,
          description: 'Approve, edit, or delete accounts'
        },
        {
          label: 'Department Management',
          path: '/admin/departments',
          icon: Building2,
          description: 'Create & manage departments'
        },
        {
          label: 'Holiday Management',
          path: '/admin/holidays',
          icon: Calendar,
          description: 'Manage company holidays'
        },
        {
          label: 'Notice Management',
          path: '/admin/notices',
          icon: AlertCircle,
          description: 'Create & manage notices'
        },
        {
          label: 'Unplanned Leave',
          path: '/admin/unplanned-leave',
          icon: Clock,
          description: 'Manage unplanned employee leaves'
        }
      ]
    },
    {
      category: 'Analytics & Reports',
      items: [
        {
          label: 'Attendance Report',
          path: '/admin/attendance-report',
          icon: Calendar,
          description: 'Attendance analysis & trends'
        },
        {
          label: 'Leave Balance',
          path: '/admin/leave-balance',
          icon: AlertCircle,
          description: 'Employee leave tracking'
        },
        {
          label: 'Performance Analytics',
          path: '/admin/performance',
          icon: TrendingUp,
          description: 'Employee performance metrics'
        }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button - positioned at top for better thumb reach */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
        title="Admin Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Admin Navigation Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col font-outfit ${
          isOpen ? 'w-72 md:w-80' : 'w-0 md:w-80'
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 pt-safe">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white text-lg font-bold">AS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900">Attendance</span>
              <span className="text-xs font-medium text-gray-500">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-safe-bottom">
          {adminMenuItems.map((category, idx) => (
            <div key={idx} className="mb-2">
              {/* Category Header */}
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category.category}
              </h3>

              {/* Category Items */}
              <div className="space-y-1 px-2">
                {category.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                        active
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        active
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm truncate">{item.label}</p>
                        <p className={`text-xs mt-0.5 truncate ${
                          active ? 'text-blue-500/70' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                      {active && (
                        <div className="w-1 h-5 bg-blue-600 rounded-full absolute left-0 -ml-1"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Status & Logout */}
        <div className="p-4 md:p-5 border-t border-gray-200 pb-safe-bottom space-y-4">
          {/* System Status */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-700">System Status</p>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 group border border-red-200 hover:border-red-300"
            title="Logout from admin panel"
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
        ></div>
      )}

      {/* Desktop Push Content (Optional) */}
      {/* Desktop Push Content Alignment */}
      <style>{`
        @media (min-width: 768px) {
          .main-content {
            margin-left: 20rem; /* w-80 = 20rem */
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 md:p-8 animate-in fade-in zoom-in">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut size={32} className="text-red-600" />
              </div>
            </div>

            {/* Title & Message */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Confirm Logout?</h2>
            <p className="text-gray-600 text-center mb-8">
              Are you sure you want to logout? You'll need to login again to access the admin panel.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors duration-200 active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavigation;
