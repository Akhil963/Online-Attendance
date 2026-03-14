import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Header from '../components/Header';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);

  const calculatePasswordStrength = (password) => {
    let criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+={}[\];':"\\|,.<>/?]/.test(password)
    };

    const met = Object.values(criteria).filter(v => v).length;
    const score = (met / 5) * 100;

    return {
      score,
      level: score < 40 ? 'कमजोर' : score < 70 ? 'मध्यम' : 'मजबूत',
      levelEn: score < 40 ? 'Weak' : score < 70 ? 'Medium' : 'Strong',
      criteria,
      color: score < 40 ? 'red' : score < 70 ? 'yellow' : 'green'
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    setError('');
    setMessage('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Validate form
      if (!formData.oldPassword) {
        setError('पुराना पासवर्ड दर्ज करें');
        setLoading(false);
        return;
      }

      if (!formData.newPassword) {
        setError('नया पासवर्ड दर्ज करें');
        setLoading(false);
        return;
      }

      if (!formData.confirmPassword) {
        setError('पासवर्ड की पुष्टि करें');
        setLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('नए पासवर्ड मेल नहीं खाते');
        setLoading(false);
        return;
      }

      const response = await api.post('/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        setMessage('पासवर्ड सफलतापूर्वक बदल दिया गया है!');
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength(null);

        // Redirect after success
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'त्रुटि: पासवर्ड नहीं बदला जा सका');

      if (err.response?.data?.details) {
        setError(err.response.data.details.join('\n'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-6 md:py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Lock className="w-12 h-12 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">पासवर्ड बदलें</h1>
              <p className="text-gray-600 text-sm mt-2">अपने खाते की सुरक्षा के लिए अपना पासवर्ड अपडेट करें</p>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 whitespace-pre-wrap">{error}</div>
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-700">{message}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  पुराना पासवर्ड
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    placeholder="अपना पुराना पासवर्ड दर्ज करें"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('old')}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.old ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  नया पासवर्ड
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="एक मजबूत पासवर्ड चुनें"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordStrength && formData.newPassword && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.color === 'red'
                              ? 'bg-red-500'
                              : passwordStrength.color === 'yellow'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.color === 'red'
                          ? 'text-red-600'
                          : passwordStrength.color === 'yellow'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                        {passwordStrength.level}
                      </span>
                    </div>

                    {/* Requirements */}
                    <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                      <p className={passwordStrength.criteria.length ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.length ? '✓' : '○'}</span>
                        कम से कम 8 वर्ण
                      </p>
                      <p className={passwordStrength.criteria.uppercase ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.uppercase ? '✓' : '○'}</span>
                        कम से कम एक बड़ा अक्षर (A-Z)
                      </p>
                      <p className={passwordStrength.criteria.lowercase ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.lowercase ? '✓' : '○'}</span>
                        कम से कम एक छोटा अक्षर (a-z)
                      </p>
                      <p className={passwordStrength.criteria.number ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.number ? '✓' : '○'}</span>
                        कम से कम एक संख्या (0-9)
                      </p>
                      <p className={passwordStrength.criteria.special ? 'text-green-600' : 'text-gray-500'}>
                        <span className="mr-2">{passwordStrength.criteria.special ? '✓' : '○'}</span>
                        कम से कम एक विशेष वर्ण (!@#$%)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  पासवर्ड की पुष्टि करें
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="नया पासवर्ड दोबारा दर्ज करें"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {formData.newPassword && formData.confirmPassword && (
                  <div className="mt-2">
                    {formData.newPassword === formData.confirmPassword ? (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        पासवर्ड मेल खाते हैं
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        पासवर्ड मेल नहीं खाते
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'प्रक्रिया में है...' : 'पासवर्ड बदलें'}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                रद्द करें
              </button>
            </form>

            {/* Security Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center mb-3">सुरक्षा सुझाव:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• एक मजबूत, अद्वितीय पासवर्ड चुनें</li>
                <li>• पासवर्ड किसी के साथ साझा न करें</li>
                <li>• नियमित रूप से अपना पासवर्ड बदलें</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
