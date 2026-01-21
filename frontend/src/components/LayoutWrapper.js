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
      <div className={`flex-1 flex flex-col ${isAdmin ? 'md:ml-64' : ''}`}>
        {/* Header - Different based on role */}
        {isAdmin ? <AdminHeader /> : <ClientHeader />}
        
        {/* Page Content */}
        <main className="bg-gray-50 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
