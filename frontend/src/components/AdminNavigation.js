import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ShieldUser
} from 'lucide-react';

const AdminNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const adminMenuItems = [
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
          path: "../signup/employee",
          icon: Users,
          description: 'Create profiles for employees'
        },
        {
          label: 'Create Admin Profiles',
          path: "../signup/admin",
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-40"
        title="Admin Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Admin Navigation Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-700 z-50 ${
          isOpen ? 'w-80' : 'w-0 md:w-80'
        } overflow-hidden flex flex-col font-outfit`}
      >
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-gray-200">
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
        <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-8">
          {adminMenuItems.map((category, idx) => (
            <div key={idx} className="mb-2">
              {/* Category Header */}
              <h3 className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
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
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group relative ${
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

        {/* Footer Status */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700">System Status</p>
              <p className="text-xs text-gray-500">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
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
    </>
  );
};

export default AdminNavigation;
