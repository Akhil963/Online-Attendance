import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">AS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Attendance System</h1>
          <p className="text-gray-600 mt-2">Select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Employee Section */}
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate('/login/employee')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Employee</h2>
              <p className="text-gray-600 mb-4">Login as an employee to mark attendance</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition mb-2">
                Employee Login
              </button>
              <p className="text-sm text-gray-600">
                New here?{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/signup/employee');
                  }}
                  className="text-blue-600 hover:underline cursor-pointer font-medium">
                  Sign up
                </span>
              </p>
            </div>
          </div>

          {/* Admin Section */}
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate('/login/admin')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Admin</h2>
              <p className="text-gray-600 mb-4">Login as admin to manage the system</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition mb-2">
                Admin Login
              </button>
              <p className="text-sm text-gray-600">
                New here?{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/signup/admin');
                  }}
                  className="text-blue-600 hover:underline cursor-pointer font-medium">
                  Sign up
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSelectionPage;
