import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const recalled = localStorage.getItem('rememberedUserIdentifier');
    const rememberMeState = localStorage.getItem('rememberMeUser');
    if (recalled) {
      setIdentifier(recalled);
    }
    if (rememberMeState === 'true') {
      setRememberMe(true);
    }
  }, []);

  const handleRememberMeChange = (checked) => {
    setRememberMe(checked);
    if (checked) {
      // Save identifier and checkbox state when checked
      localStorage.setItem('rememberedUserIdentifier', identifier);
      localStorage.setItem('rememberMeUser', 'true');
    } else {
      // Clear all stored data when unchecked
      localStorage.removeItem('rememberedUserIdentifier');
      localStorage.removeItem('rememberMeUser');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(identifier, password, 'employee', rememberMe);
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedUserIdentifier', identifier);
        localStorage.setItem('rememberMeUser', 'true');
      } else {
        // Clear if not checked
        localStorage.removeItem('rememberedUserIdentifier');
        localStorage.removeItem('rememberMeUser');
      }
      navigate('/dashboard');
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-6">
      <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/40 p-6 md:p-12 w-full max-w-md relative overflow-hidden group">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-blue-600/10"></div>

        <div className="text-center mb-12 relative z-10">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-900/20 active:scale-95 transition-transform">
            <span className="text-white text-2xl font-black italic tracking-tighter">OAS</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Employee Login</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="group/field">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
              Email or Employee ID
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="Employee ID or Alias"
            />
          </div>

          <div className="group/field">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="inline-flex items-center gap-2.5 cursor-pointer group/check">
              <span
                className="relative flex items-center justify-center flex-shrink-0"
                style={{ width: 20, height: 20, minWidth: 20, minHeight: 20 }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => handleRememberMeChange(e.target.checked)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ width: '100%', height: '100%', margin: 0 }}
                />
                <span
                  className={`flex items-center justify-center rounded border-2 transition-all ${
                    rememberMe
                      ? 'bg-blue-600 border-blue-600 shadow-md'
                      : 'bg-white border-slate-300'
                  }`}
                  style={{ width: 20, height: 20, minWidth: 20, minHeight: 20 }}
                >
                  {rememberMe && (
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="white">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/check:text-slate-600 transition-colors leading-none">Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-95 border-none">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col gap-4 text-center relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-black transition-colors">
              Sign Up Here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
