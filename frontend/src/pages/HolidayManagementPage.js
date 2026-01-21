import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Plus, Search, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';

const HolidayManagementPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    type: 'national'
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/holiday/holidays', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Handle both array and object responses
      const data = Array.isArray(response.data) ? response.data : response.data.holidays || [];
      setHolidays(data);
    } catch (error) {
      toast.error('Failed to fetch holidays');
      console.error(error);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.date) {
      toast.error('Holiday name and date are required');
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/holiday/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Holiday updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/holiday',
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Holiday created successfully');
      }
      
      setFormData({ name: '', date: '', description: '', type: 'national' });
      setEditingId(null);
      setShowForm(false);
      fetchHolidays();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save holiday');
      console.error(error);
    }
  };

  const handleEdit = (holiday) => {
    const dateStr = moment(holiday.date).format('YYYY-MM-DD');
    setFormData({
      name: holiday.name,
      date: dateStr,
      description: holiday.description || '',
      type: holiday.type || 'national'
    });
    setEditingId(holiday._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await axios.delete(
          `http://localhost:5000/api/holiday/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Holiday deleted successfully');
        fetchHolidays();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete holiday');
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', date: '', description: '', type: 'national' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredHolidays = (Array.isArray(holidays) ? holidays : [])
    .filter(holiday => holiday && holiday.date)
    .filter(holiday => {
      const holidayYear = moment(holiday.date).format('YYYY');
      const matchesSearch = holiday.name && holiday.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = holidayYear === filterYear;
      return matchesSearch && matchesYear;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const years = [...new Set(
    (Array.isArray(holidays) ? holidays : [])
      .filter(h => h && h.date)
      .map(h => moment(h.date).format('YYYY'))
  )].sort().reverse();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading holidays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Holiday Management</h1>
            <p className="text-gray-600 mt-1">Manage company holidays and special days</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Holiday</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Holidays</p>
            <p className="text-4xl font-bold text-blue-600">
              {Array.isArray(holidays) ? holidays.filter(h => h && h.date).length : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">National Holidays</p>
            <p className="text-4xl font-bold text-green-600">
              {Array.isArray(holidays) ? holidays.filter(h => h && h.type === 'national' && h.date).length : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">This Year ({filterYear})</p>
            <p className="text-4xl font-bold text-purple-600">
              {Array.isArray(holidays) ? holidays.filter(h => h && h.date && moment(h.date).format('YYYY') === filterYear).length : 0}
            </p>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
              {editingId ? 'Edit Holiday' : 'Add New Holiday'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Republic Day, Diwali"
                  className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Holiday description"
                  rows="3"
                  className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="national">National</option>
                  <option value="state">State</option>
                  <option value="company">Company</option>
                  <option value="special">Special</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-2 md:gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Holidays List */}
        {filteredHolidays.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 md:p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-sm md:text-lg">
              {searchTerm ? 'No holidays match your search' : 'No holidays found for this year'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900">Date</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 hidden sm:table-cell">Holiday</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 hidden md:table-cell">Type</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 hidden lg:table-cell">Description</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHolidays.map((holiday, index) => (
                    <tr key={holiday._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                        {holiday.date ? moment(holiday.date).format('MMM DD') : 'N/A'}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-xs md:text-sm text-gray-700 hidden sm:table-cell">{holiday.name || 'N/A'}</td>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-xs hidden md:table-cell">
                        <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                          (holiday.type || 'other') === 'national'
                            ? 'bg-red-100 text-red-800'
                            : (holiday.type || 'other') === 'state'
                            ? 'bg-blue-100 text-blue-800'
                            : (holiday.type || 'other') === 'company'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {((holiday.type || 'other').charAt(0).toUpperCase() + (holiday.type || 'other').slice(1))}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-xs text-gray-700 truncate max-w-xs hidden lg:table-cell">
                        {holiday.description || '-'}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-4 text-center">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <button
                            onClick={() => handleEdit(holiday)}
                            className="p-1 md:p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(holiday._id)}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayManagementPage;
