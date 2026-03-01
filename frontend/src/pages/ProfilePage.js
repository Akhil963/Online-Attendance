import React, { useState, useEffect } from 'react';
import ImageCropModal from '../components/ImageCropModal';
import { useAuth } from '../hooks/useAuth';
import { authAPI, employeeAPI } from '../services/api';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    designation: user?.designation || '',
    gender: user?.gender || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profilePicture || null);
  const [uploading, setUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const designationOptions = ['CEO', 'CTO', 'MD', 'COO', 'CFO', 'Director', 'Manager', 'Administrator', 'Other'];

  // Update form data when user changes
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      designation: user?.designation || '',
      gender: user?.gender || '',
      address: user?.address || ''
    });
    setProfilePic(user?.profilePicture || null);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let response;
      
      if (user?.role === 'admin') {
        // Use admin profile update endpoint
        response = await authAPI.updateAdminProfile(formData);
      } else {
        // Use employee profile update endpoint
        response = await employeeAPI.updateProfile(formData);
      }

      // Update auth context with new user data to persist changes
      if (response.data?.user) {
        setUser(response.data.user);
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB = 5242880 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Read file and show crop modal
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage) => {
    setShowCropModal(false);
    setUploading(true);

    try {
      // Convert data URL to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      const formDataWithFile = new FormData();
      formDataWithFile.append('profilePicture', blob, 'profile.jpg');

      let uploadResponse;
      if (user?.role === 'admin') {
        // For admin, we need to use a different endpoint or approach
        // For now, use the employee endpoint as it's generic
        uploadResponse = await employeeAPI.uploadProfilePicture(formDataWithFile);
      } else {
        uploadResponse = await employeeAPI.uploadProfilePicture(formDataWithFile);
      }

      // Update local preview
      setProfilePic(croppedImage);
      setImageToCrop(null);

      // Update auth context if user data is returned
      if (uploadResponse.data?.user) {
        setUser(uploadResponse.data.user);
      }

      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 overflow-hidden group">
          {/* Profile Header - Elite Banner */}
          <div className="bg-blue-600 p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-48 -mt-48 transition-colors group-hover:bg-blue-600/20"></div>
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="relative group/avatar">
                <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-white/10 shadow-2xl backdrop-blur-md">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110 duration-500"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-3 cursor-pointer transition-all shadow-lg active:scale-90 border-4 border-white">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    disabled={uploading}
                    className="hidden"
                  />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold text-white tracking-tight">{user?.name}</h1>
                  <div className="px-4 py-1.5 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-full inline-flex items-center justify-center">
                    <p className="text-xs font-medium text-blue-200 uppercase tracking-wide">{user?.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-200 font-semibold text-sm tracking-tight">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    ID: {user?.employeeId}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {user?.department?.name || 'External'} Unit
                  </div>
                </div>
                {uploading && (
                  <div className="mt-6 flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content - Precision Grid */}
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Personal Information */}
              <div className="space-y-8">
                <div className="group/field">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700"
                    />
                  ) : (
                    <div className="w-full bg-gray-50 border border-transparent group-hover/field:border-gray-100 rounded-2xl px-6 py-4 transition-all">
                      <p className="font-bold text-gray-900 tracking-tight">{formData.name}</p>
                    </div>
                  )}
                </div>

                <div className="group/field">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Email Address
                  </label>
                  <div className="w-full bg-gray-50 border border-transparent group-hover/field:border-gray-100 rounded-2xl px-6 py-4 transition-all">
                    <p className="font-bold text-gray-900 tracking-tight break-all uppercase text-xs">{user?.email || 'Unauthorized'}</p>
                  </div>
                </div>

                <div className="group/field">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700"
                    />
                  ) : (
                    <div className="w-full bg-gray-50 border border-transparent group-hover/field:border-gray-100 rounded-2xl px-6 py-4 transition-all">
                      <p className="font-bold text-gray-900 tracking-tight">{formData.phone || 'Undeclared'}</p>
                    </div>
                  )}
                </div>

                <div className="group/field">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    {user?.role === 'admin' ? 'Entity Identifier' : 'Job Title'}
                  </label>
                  {isEditing ? (
                    user?.role === 'admin' ? (
                      <select
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                      >
                        <option value="">Select Designation</option>
                        {designationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700"
                      />
                    )
                  ) : (
                    <div className="w-full bg-gray-50 border border-transparent group-hover/field:border-gray-100 rounded-2xl px-6 py-4 transition-all">
                      <p className="font-bold text-gray-900 tracking-tight">{formData.designation || (user?.role === 'admin' ? 'Not Set' : 'Specialist')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="space-y-8">
                <div className="group/field">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    {user?.role === 'admin' ? 'Admin ID' : 'Entity Identifier'}
                  </label>
                  <div className="w-full bg-gray-50 border border-gray-200 border-dashed rounded-2xl px-6 py-4">
                    <p className="font-bold text-blue-600 tracking-widest text-lg">{user?.adminId || user?.employeeId}</p>
                  </div>
                </div>

                <div className="group/field">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Department
                  </label>
                  <div className="w-full bg-gray-50 border border-transparent group-hover/field:border-gray-100 rounded-2xl px-6 py-4 transition-all">
                    <p className="font-bold text-gray-900 tracking-tight">{user?.department?.name || 'Not Assigned'}</p>
                  </div>
                </div>

                <div className="group/field">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="w-full bg-gray-50 border border-transparent group-hover/field:border-gray-100 rounded-2xl px-6 py-4 transition-all">
                      <p className="font-bold text-gray-900 tracking-tight">{formData.gender || 'Not Specified'}</p>
                    </div>
                  )}
                </div>

                <div className="group/field">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Geographic Coordinates
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700"
                      rows="3"
                    />
                  ) : (
                    <div className="w-full bg-gray-50 border border-transparent group-hover/field:border-gray-100 rounded-2xl px-6 py-4 transition-all">
                      <p className="font-bold text-gray-900 tracking-tight leading-relaxed">{formData.address || 'Field Location Pending'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-12 border-t border-gray-100 pt-10">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 border-none"
                >
                  Unlock Editing
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-300 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 border-none"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && imageToCrop && (
        <ImageCropModal
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropModal(false);
            setImageToCrop(null);
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
