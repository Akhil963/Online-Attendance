import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ClientHeader from './ClientHeader';
import AdminHeader from './AdminHeader';
import AdminNavigation from './AdminNavigation';

const LayoutWrapper = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.role === 'director');

  return (
    <div className="flex">
      {/* Admin Sidebar - Only for admin users */}
      {isAdmin && <AdminNavigation />}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isAdmin ? 'md:ml-72' : ''}`}>
        {/* Header - Different based on role */}
        {isAdmin ? <AdminHeader /> : <ClientHeader />}

        {/* Page Content */}
        <main className="bg-gradient-to-br from-gray-50 via-white to-gray-100 flex-1 min-h-[calc(100vh-64px)] overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
