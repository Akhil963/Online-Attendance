import React, { useState, useEffect, useCallback } from 'react';
import { departmentAPI } from '../services/api';
import { Trash2, Edit2, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import useLiveDataSync from '../hooks/useLiveDataSync';
import MobileBackButton from '../components/MobileBackButton';

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    head: '',
    budget: '',
    status: 'active'
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getAllDepartments();
      // Handle both array and object responses
      const data = Array.isArray(response.data) ? response.data : response.data.departments || [];
      setDepartments(data);
    } catch (error) {
      toast.error('Failed to fetch departments');
      console.error(error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const { isLive, lastSyncAt } = useLiveDataSync({
    onRefresh: fetchDepartments,
    events: ['department:created', 'department:updated', 'department:deleted', 'stats:updated'],
    soundEvents: [],
    pollMs: 30000,
    enabled: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        head: formData.head,
        budget: formData.budget ? Number(formData.budget) : 0,
        status: formData.status
      };

      if (editingId) {
        await departmentAPI.updateDepartment(editingId, submitData);
        toast.success('Department updated successfully');
      } else {
        await departmentAPI.createDepartment(submitData);
        toast.success('Department created successfully');
      }

      setFormData({ name: '', description: '', head: '', budget: '', status: 'active' });
      setEditingId(null);
      setShowForm(false);
      await fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save department');
      console.error(error);
    }
  };

  const handleEdit = (dept) => {
    setFormData({
      name: dept.name,
      description: dept.description || '',
      head: dept.head || '',
      budget: dept.budget || '',
      status: dept.status || 'active'
    });
    setEditingId(dept._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    try {
      await departmentAPI.deleteDepartment(confirmDeleteId);
      toast.success('Department deleted successfully');
      setConfirmDeleteId(null);
      await fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
      console.error(error);
      setConfirmDeleteId(null);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', head: '', budget: '', status: 'active' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredDepartments = (Array.isArray(departments) ? departments : []).filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Back Button */}
        <MobileBackButton label="Back" customPath="/admin-dashboard" />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Departments
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Manage organizational structure and budgets</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/70">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                {isLive ? 'Live' : 'Syncing'}
              </span>
              {lastSyncAt && (
                <span className="text-[10px] text-gray-400 font-semibold">
                  {new Date(lastSyncAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span>{showForm ? 'Close Form' : 'New Department'}</span>
          </button>
        </div>

        {/* Stats Cards - Premium accent style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/60 p-6 border-l-4 border-l-blue-500">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Departments</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{Array.isArray(departments) ? departments.length : 0}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/60 p-6 border-l-4 border-l-emerald-500">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Active Units</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              {Array.isArray(departments) ? departments.filter(d => d.status === 'active').length : 0}
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/60 p-6 border-l-4 border-l-blue-500">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Annual Budget</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              ₹{Array.isArray(departments) ? departments.reduce((sum, d) => sum + (Number(d.budget) || 0), 0).toLocaleString() : 0}
            </p>
          </div>
        </div>

        {/* Add/Edit Form - Glassmorphism */}
        {showForm && (
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/20 p-4 md:p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">
              {editingId ? 'Edit Department' : 'Create New Unit'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Creative Arts, Tech Engine"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                  Unit Head
                </label>
                <input
                  type="text"
                  name="head"
                  value={formData.head}
                  onChange={handleInputChange}
                  placeholder="Manager / Director"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Vision and core objectives..."
                  rows="3"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                  Budget (Annual)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2 flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg"
                >
                  {editingId ? 'Update Department' : 'Launch Department'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search - Glassmorphism */}
        <div className="mb-8">
          <div className="relative group">
            <Search className="absolute left-6 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 bg-white/70 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-lg"
            />
          </div>
        </div>

        {/* Departments Grid - Premium Cards */}
        {filteredDepartments.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 md:p-12 text-center border border-gray-200/60">
            <p className="text-gray-500 text-lg font-bold">
              {searchTerm ? 'No results found' : 'No departments launched yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDepartments.map(dept => (
              <div key={dept._id} className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm hover:shadow-lg border border-gray-200/60 transition-all overflow-hidden flex flex-col hover:-translate-y-2">
                <div className="p-4 md:p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                      <span className="text-xl font-black">{dept.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${dept.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                      {dept.status || 'Active'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{dept.name}</h3>

                  {dept.description && (
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
                      {dept.description}
                    </p>
                  )}

                  <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 mb-4">
                    {dept.head && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                          <Plus size={14} className="rotate-45" />
                        </div>
                        <p className="text-sm font-bold text-gray-700">
                          <span className="text-gray-400 font-medium">Head:</span> {dept.head}
                        </p>
                      </div>
                    )}
                    {dept.budget && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                          <span className="text-xs font-bold">₹</span>
                        </div>
                        <p className="text-sm font-bold text-gray-700">
                          <span className="text-gray-400 font-medium">Budget:</span> ₹{Number(dept.budget).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="flex-1 bg-white hover:bg-blue-600 hover:text-white text-gray-700 px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-gray-200 shadow-sm"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="flex-1 bg-white hover:bg-red-600 hover:text-white text-gray-700 px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-gray-200 shadow-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-white/20 transform animate-in slide-in-from-bottom-8 duration-500 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100/50">
              <Trash2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Remove Unit?</h2>
            <p className="text-gray-500 mb-8 font-medium leading-relaxed">
              This will dissolve the department and archive its data. This action <span className="text-red-600 font-bold">cannot be undone</span>.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-4 rounded-2xl transition-all font-bold active:scale-95"
              >
                No, Keep
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl transition-all font-bold active:scale-95 shadow-lg shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagementPage;
