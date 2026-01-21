import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const EmployeeLoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      setIdentifier(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(identifier, password, 'employee');
      if (rememberMe) {
        localStorage.setItem('rememberedUser', identifier);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      navigate('/dashboard');
      toast.success('Login successful!');
    } catch (error) {
      // Check if it's a pending approval error (403 Forbidden)
      if (error.response?.status === 403) {
        // Extract email from error response if available
        const email = error.response?.data?.email;
        if (email) {
          localStorage.setItem('pendingApprovalEmail', email);
        }
        toast.info('Your account is pending admin approval. Redirecting...');
        // Wait a moment then redirect to pending approval page
        setTimeout(() => {
          navigate('/pending-approval');
        }, 1500);
      } else {
        toast.error(error.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">AS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Attendance System</h1>
          <p className="text-gray-600 mt-2">Employee Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID or Name
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Enter your Employee ID or Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <a href="/signup/employee" className="text-blue-600 hover:underline font-medium">
            Sign up here
          </a>
        </p>

        <p className="text-center text-gray-600 mt-2">
          <Link to="/forgot-password" className="text-blue-600 hover:underline font-medium">
            Forgot password?
          </Link>
        </p>

        <p className="text-center text-gray-600 mt-4">
          <a href="/" className="text-blue-600 hover:underline font-medium">
            Back to role selection
          </a>
        </p>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;
