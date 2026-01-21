import React from 'react';
import AttendanceMarker from '../components/AttendanceMarker';
import DashboardStatistics from '../components/DashboardStatistics';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 mb-8">Employee ID: {user?.employeeId}</p>

        <AttendanceMarker />
        <DashboardStatistics />
      </div>
    </div>
  );
};

export default DashboardPage;
