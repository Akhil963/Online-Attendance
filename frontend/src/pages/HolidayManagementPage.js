import React, { useState, useEffect } from 'react';
import api from '../services/api';
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
      const response = await api.get('/holiday/holidays');
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
        await api.put(`/holiday/${editingId}`, formData);
        toast.success('Holiday updated successfully');
      } else {
        await api.post('/holiday', formData);
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
        await api.delete(`/holiday/${id}`);
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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* Header - Elite Aesthetic */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Holidays</h1>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage Company Holidays</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-11 sm:h-14 bg-gray-900 hover:bg-gray-800 text-white px-5 sm:px-8 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-lg active:scale-95 flex items-center gap-2 sm:gap-3 border-none"
          >
            <Plus size={18} strokeWidth={2} />
            Add Holiday
          </button>
        </div>

        {/* Stats - Vibrant Operational Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-8 group hover:shadow-lg transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Holidays</p>
            <p className="text-5xl font-bold text-gray-900 tracking-tight">
              {Array.isArray(holidays) ? holidays.filter(h => h && h.date).length : 0}
            </p>
            <div className="mt-4 h-1 w-12 bg-blue-500 rounded-full group-hover:w-20 transition-all"></div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-8 group hover:shadow-lg transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">National Holidays</p>
            <p className="text-5xl font-bold text-emerald-600 tracking-tight">
              {Array.isArray(holidays) ? holidays.filter(h => h && h.type === 'national' && h.date).length : 0}
            </p>
            <div className="mt-4 h-1 w-12 bg-emerald-500 rounded-full group-hover:w-20 transition-all"></div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-8 group hover:shadow-lg transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Holidays in {filterYear}</p>
            <p className="text-5xl font-bold text-blue-600 tracking-tight">
              {Array.isArray(holidays) ? holidays.filter(h => h && h.date && moment(h.date).format('YYYY') === filterYear).length : 0}
            </p>
            <div className="mt-4 h-1 w-12 bg-blue-500 rounded-full group-hover:w-20 transition-all"></div>
          </div>
        </div>

        {/* Add/Edit Form - Integrated Console */}
        {showForm && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-4 md:p-10 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              {editingId ? 'Update Holiday' : 'Add New Holiday'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group/field">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Diwali, Independence Day"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-gray-700"
                />
              </div>

              <div className="group/field">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-gray-700"
                />
              </div>

              <div className="md:col-span-2 group/field">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add description..."
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-gray-700"
                />
              </div>

              <div className="group/field text-gray-700">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Type</label>
                <div className="relative">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold appearance-none"
                  >
                    <option value="national">National Standard</option>
                    <option value="state">Provincial/State</option>
                    <option value="company">Corporate Internal</option>
                    <option value="special">Executive/Special</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-4 pt-4">
                <button
                  type="submit"
                  className="h-14 bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 border-none"
                >
                  {editingId ? 'Commit Changes' : 'Execute Creation'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="h-14 bg-gray-100 hover:bg-gray-200 text-gray-500 px-10 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 border-none"
                >
                  Intercept
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters - Search and Selection Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search Observances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-gray-700"
            />
          </div>
          <div className="relative group text-gray-700">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full pl-8 pr-12 py-5 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold appearance-none"
            >
              {years.map(year => (
                <option key={year} value={year}>Cycle Year: {year}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Holidays List */}
        {filteredHolidays.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-8 md:p-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Calendar className="text-gray-300" size={48} strokeWidth={2.5} />
            </div>
            <p className="font-bold text-gray-500 uppercase text-xs">
              {searchTerm ? 'No holidays found' : 'No holidays found for this period'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {filteredHolidays.map((holiday, index) => (
                <div key={holiday._id || index} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-14 h-14 bg-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                        <span className="text-base font-extrabold text-blue-600 leading-none">
                          {holiday.date ? moment(holiday.date).format('DD') : '--'}
                        </span>
                        <span className="text-[10px] font-bold text-blue-400 uppercase">
                          {holiday.date ? moment(holiday.date).format('MMM') : ''}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{holiday.name || 'Undefined'}</p>
                        <div className={`mt-1 px-2.5 py-0.5 rounded-full inline-flex items-center text-[10px] font-bold uppercase border ${
                          (holiday.type || 'other') === 'national' ? 'bg-red-50 text-red-600 border-red-100' :
                            (holiday.type || 'other') === 'state' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              (holiday.type || 'other') === 'company' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {holiday.type || 'Standard'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(holiday)}
                        className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 active:scale-90"
                      >
                        <Edit2 size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(holiday._id)}
                        className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 active:scale-90"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  {holiday.description && (
                    <p className="text-xs text-gray-400 font-medium line-clamp-2 pl-[4.25rem]">{holiday.description}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-900 text-white uppercase text-xs font-bold">
                      <th className="px-6 lg:px-10 py-6">Timeline</th>
                      <th className="px-6 lg:px-10 py-6">Name</th>
                      <th className="px-6 lg:px-10 py-6">Type</th>
                      <th className="px-6 lg:px-10 py-6 hidden lg:table-cell">Description</th>
                      <th className="px-6 lg:px-10 py-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredHolidays.map((holiday, index) => (
                      <tr key={holiday._id || index} className="group hover:bg-blue-50/50 transition-all duration-300">
                        <td className="px-6 lg:px-10 py-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 tracking-tight text-lg italic uppercase">
                              {holiday.date ? moment(holiday.date).format('MMM DD') : 'N/A'}
                            </span>
                            <span className="text-xs font-bold text-gray-400 uppercase">Date</span>
                          </div>
                        </td>
                        <td className="px-6 lg:px-10 py-6">
                          <span className="font-bold text-gray-900 tracking-tight block group-hover:text-blue-600 transition-colors uppercase text-sm">
                            {holiday.name || 'Undefined'}
                          </span>
                        </td>
                        <td className="px-6 lg:px-10 py-6">
                          <div className={`px-4 py-1.5 rounded-full inline-flex items-center text-xs font-bold uppercase border ${
                            (holiday.type || 'other') === 'national' ? 'bg-red-50 text-red-600 border-red-100' :
                              (holiday.type || 'other') === 'state' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                (holiday.type || 'other') === 'company' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                            {holiday.type || 'Standard'}
                          </div>
                        </td>
                        <td className="px-6 lg:px-10 py-6 hidden lg:table-cell">
                          <span className="text-gray-500 font-bold text-xs line-clamp-2 max-w-xs leading-relaxed">
                            {holiday.description || '--'}
                          </span>
                        </td>
                        <td className="px-6 lg:px-10 py-6 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => handleEdit(holiday)}
                              className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-90"
                              title="Edit"
                            >
                              <Edit2 size={16} strokeWidth={3} />
                            </button>
                            <button
                              onClick={() => handleDelete(holiday._id)}
                              className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg transition-all active:scale-90"
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={3} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HolidayManagementPage;
