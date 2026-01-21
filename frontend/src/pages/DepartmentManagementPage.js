import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/department', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
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
    
    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/department/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Department updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/department',
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Department created successfully');
      }
      
      setFormData({ name: '', description: '', head: '', budget: '', status: 'active' });
      setEditingId(null);
      setShowForm(false);
      fetchDepartments();
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
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(
          `http://localhost:5000/api/department/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete department');
        console.error(error);
      }
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600 mt-1">Manage all company departments</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Department</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <p className="text-gray-600 text-xs md:text-sm">Total Departments</p>
            <p className="text-2xl md:text-4xl font-bold text-blue-600 mt-2">{Array.isArray(departments) ? departments.length : 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <p className="text-gray-600 text-xs md:text-sm">Active Departments</p>
            <p className="text-2xl md:text-4xl font-bold text-green-600 mt-2">
              {Array.isArray(departments) ? departments.filter(d => d.status === 'active').length : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <p className="text-gray-600 text-xs md:text-sm">Total Budget</p>
            <p className="text-2xl md:text-4xl font-bold text-purple-600 mt-2">
              ₹{departments.reduce((sum, d) => sum + (d.budget || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
              {editingId ? 'Edit Department' : 'Create New Department'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., HR, IT, Sales"
                  className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Department Head
                </label>
                <input
                  type="text"
                  name="head"
                  value={formData.head}
                  onChange={handleInputChange}
                  placeholder="Manager name"
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
                  placeholder="Department description"
                  rows="3"
                  className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Budget
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="Annual budget"
                  className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-2 md:gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'Update' : 'Create'}
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

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Departments Grid */}
        {filteredDepartments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 md:p-12 text-center">
            <p className="text-gray-600 text-sm md:text-lg">
              {searchTerm ? 'No departments match your search' : 'No departments found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {filteredDepartments.map(dept => (
              <div key={dept._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{dept.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dept.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dept.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {dept.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {dept.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm mb-6">
                    {dept.head && (
                      <p className="text-gray-700">
                        <span className="font-medium">Head:</span> {dept.head}
                      </p>
                    )}
                    {dept.budget && (
                      <p className="text-gray-700">
                        <span className="font-medium">Budget:</span> ₹{Number(dept.budget).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagementPage;
