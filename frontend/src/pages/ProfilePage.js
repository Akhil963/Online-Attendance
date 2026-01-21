import React, { useState } from 'react';
import ImageCropModal from '../components/ImageCropModal';
import { useAuth } from '../hooks/useAuth';
import { employeeAPI } from '../services/api';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useAuth();
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
      await employeeAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
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
      
      await employeeAPI.uploadProfilePicture(formDataWithFile);
      
      // Update local preview
      setProfilePic(croppedImage);
      setImageToCrop(null);
      
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="relative">
                <div className="w-20 md:w-24 h-20 md:h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl md:text-4xl font-bold text-blue-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    disabled={uploading}
                    className="hidden"
                  />
                  <svg className="w-4 md:w-5 h-4 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                </label>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">{user?.name}</h1>
                <p className="text-blue-100 text-sm md:text-base">{user?.employeeId}</p>
                <p className="text-blue-100 text-sm md:text-base">{user?.role}</p>
                {uploading && <p className="text-xs md:text-sm text-blue-200 mt-2">Uploading...</p>}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{formData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="px-4 py-2 bg-gray-50 rounded-lg break-all overflow-hidden">{user?.email || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{formData.phone || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{formData.designation}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">{user?.employeeId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">{user?.department?.name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{formData.gender || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      rows="3"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{formData.address || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition"
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
