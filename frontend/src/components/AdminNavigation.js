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
  Clock
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
        className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-50 ${
          isOpen ? 'w-64' : 'w-0 md:w-64'
        } overflow-y-auto flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-xs text-gray-400 mt-1">Management & Analytics</p>
        </div>

        {/* Menu Items - Scrollable */}
        <nav className="p-4 flex-1 overflow-y-auto">
          {adminMenuItems.map((category, idx) => (
            <div key={idx} className="mb-6">
              {/* Category Header */}
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {category.category}
              </h3>

              {/* Category Items */}
              <div className="space-y-2">
                {category.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-colors group ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      title={item.description}
                    >
                      <Icon
                        size={20}
                        className={active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className={`text-xs ${
                          active ? 'text-blue-100' : 'text-gray-500'
                        } hidden md:block`}>
                          {item.description}
                        </p>
                      </div>
                      {active && (
                        <div className="w-2 h-2 rounded-full bg-white mt-1"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Info - Sticky at Bottom */}
        <div className="p-5 bg-gradient-to-t from-blue-900 via-gray-800 to-gray-800 border-t-2 border-blue-600 text-white mt-auto flex-shrink-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <p className="font-bold text-sm text-blue-300">Admin Tools v1.0</p>
            </div>
            <div className="h-px bg-gradient-to-r from-blue-600 via-gray-700 to-transparent opacity-50"></div>
            <p className="text-xs text-gray-300 font-medium pl-4">Multi-level analytics & management</p>
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
      <style>{`
        @media (min-width: 768px) {
          .main-content {
            margin-left: 16rem; /* w-64 = 16rem */
          }
        }
      `}</style>
    </>
  );
};

export default AdminNavigation;
