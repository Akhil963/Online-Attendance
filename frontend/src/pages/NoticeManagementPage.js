import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Plus, Search, Mail, MessageCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';

const NoticeManagementPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'announcement',
    priority: 'normal',
    isUrgent: false,
    notificationChannels: ['dashboard']
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/notice', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Handle both array and object responses
      const data = Array.isArray(response.data) ? response.data : response.data.notices || [];
      setNotices(data);
    } catch (error) {
      toast.error('Failed to fetch notices');
      console.error(error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleChannelChange = (channel) => {
    setFormData(prev => ({
      ...prev,
      notificationChannels: (prev.notificationChannels || []).includes(channel)
        ? (prev.notificationChannels || []).filter(c => c !== channel)
        : [...(prev.notificationChannels || []), channel]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Notice title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Notice content is required');
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/notice/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Notice updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/notice',
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Notice created successfully');
      }
      
      setFormData({
        title: '',
        content: '',
        category: 'announcement',
        priority: 'normal',
        isUrgent: false
      });
      setEditingId(null);
      setShowForm(false);
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notice');
      console.error(error);
    }
  };

  const handleEdit = (notice) => {
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category || 'announcement',
      priority: notice.priority || 'normal',
      isUrgent: notice.isUrgent || false,
      notificationChannels: notice.notificationChannels || ['dashboard']
    });
    setEditingId(notice._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await axios.delete(
          `http://localhost:5000/api/notice/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Notice deleted successfully');
        fetchNotices();
      } catch (error) {
        toast.error('Failed to delete notice');
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      content: '',
      category: 'announcement',
      priority: 'normal',
      isUrgent: false,
      notificationChannels: ['dashboard']
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredNotices = (Array.isArray(notices) ? notices : [])
    .filter(notice => notice && notice.title)
    .filter(notice =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Notice Management</h1>
          <p className="text-gray-600">Create and manage notices for employees</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <p className="text-gray-600 text-xs md:text-sm">Total Notices</p>
            <p className="text-2xl md:text-4xl font-bold text-blue-600 mt-2">
              {Array.isArray(notices) ? notices.filter(n => n && n.title).length : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <p className="text-gray-600 text-xs md:text-sm">Urgent Notices</p>
            <p className="text-2xl md:text-4xl font-bold text-red-600 mt-2">
              {Array.isArray(notices) ? notices.filter(n => n && n.isUrgent).length : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <p className="text-gray-600 text-xs md:text-sm">This Month</p>
            <p className="text-2xl md:text-4xl font-bold text-green-600 mt-2">
              {Array.isArray(notices) ? notices.filter(n => n && n.createdAt && moment(n.createdAt).isSame(moment(), 'month')).length : 0}
            </p>
          </div>
        </div>

        {/* Search and Add Button */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Notice</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8 border-l-4 border-blue-600">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{editingId ? 'Edit Notice' : 'Add New Notice'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Notice title"
                    className="w-full px-2 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-2 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="policy">Policy</option>
                    <option value="event">Event</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-2 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isUrgent"
                      checked={formData.isUrgent}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded"
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-700">Mark as Urgent</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Notice content"
                  rows="6"
                  className="w-full px-2 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notification Channels */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-3">Send Notifications Via:</label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.includes('dashboard')}
                      onChange={() => handleChannelChange('dashboard')}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <CheckCircle size={16} className="ml-2 text-blue-600" />
                    <span className="ml-2 text-sm text-gray-700">Dashboard Alert</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.includes('email')}
                      onChange={() => handleChannelChange('email')}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <Mail size={16} className="ml-2 text-green-600" />
                    <span className="ml-2 text-sm text-gray-700">Email Notification</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationChannels.includes('whatsapp')}
                      onChange={() => handleChannelChange('whatsapp')}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <MessageCircle size={16} className="ml-2 text-green-600" />
                    <span className="ml-2 text-sm text-gray-700">WhatsApp Message</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">⚠️ Enable WhatsApp only if Ultramsg is configured</p>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium transition"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredNotices.length === 0 ? (
            <div className="p-6 md:p-8 text-center">
              <p className="text-gray-600 text-sm md:text-base">No notices found. Create one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900">Title</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 hidden sm:table-cell">Category</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 hidden md:table-cell">Channels</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 hidden lg:table-cell">Created</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotices.map((notice, index) => (
                    <tr key={notice._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-xs md:text-sm text-gray-900">
                        <div className="flex items-center gap-1 md:gap-2">
                          {notice.isUrgent && (
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-1 md:px-2 py-0.5 rounded hidden sm:inline">
                              U
                            </span>
                          )}
                          <span className="font-medium truncate">{notice.title || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-xs hidden sm:table-cell">
                        <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          notice.category === 'announcement'
                            ? 'bg-blue-100 text-blue-800'
                            : notice.category === 'policy'
                            ? 'bg-purple-100 text-purple-800'
                            : notice.category === 'event'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(notice.category || 'announcement').substring(0, 3)}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-xs hidden md:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {notice.notificationChannels?.includes('dashboard') && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">📱 Dashboard</span>
                          )}
                          {notice.notificationChannels?.includes('email') && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">✉️ Email</span>
                          )}
                          {notice.notificationChannels?.includes('whatsapp') && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">💬 WhatsApp</span>
                          )}
                          {(!notice.notificationChannels || notice.notificationChannels.length === 0) && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-xs text-gray-700 hidden lg:table-cell">
                        {notice.createdAt ? moment(notice.createdAt).format('MMM DD') : 'N/A'}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-center">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <button
                            onClick={() => handleEdit(notice)}
                            className="p-1 md:p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(notice._id)}
                            className="p-1 md:p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeManagementPage;
