import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { departmentAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAllDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.password || !formData.confirmPassword || !formData.departmentId || !formData.role) {
      toast.error('All fields are required');
      setLoading(false);
      return;
    }

    if (!formData.departmentId.trim()) {
      toast.error('Please select a valid department');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await register({
        employeeId: formData.employeeId || undefined,
        name: formData.name,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        password: formData.password,
        departmentId: formData.departmentId,
        role: formData.role
      });
      navigate('/dashboard');
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-6">
      <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/40 p-12 w-full max-w-2xl relative overflow-hidden group">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-blue-600/10"></div>

        <div className="text-center mb-12 relative z-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/20 active:scale-95 transition-transform">
            <span className="text-white text-2xl font-bold tracking-tight">AS</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Employee Registration</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Create your account to get started</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group/field">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
                Employee ID (Optional)
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                placeholder="Auto-Generated"
              />
            </div>

            <div className="group/field">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group/field">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                  placeholder="Min. 6 Characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                  {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <div className="group/field">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                  {showConfirmPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group/field">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="+00 000 000 0000"
              />
            </div>

            <div className="group/field">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group/field">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
                Department *
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="group/field">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
              >
                <option value="">Select Role</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-bold uppercase tracking-wide text-xs rounded-2xl transition-all shadow-xl shadow-blue-600/10 active:scale-95 border-none mt-4">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col gap-4 text-center relative z-10">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign In Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
