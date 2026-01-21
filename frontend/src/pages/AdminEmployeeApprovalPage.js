import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Edit2, Trash2, Check, X, Eye } from 'lucide-react';

const AdminEmployeeApprovalPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, searchTerm, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAllEmployees();
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleEditClick = (employee) => {
    setEditingId(employee._id);
    setEditFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      designation: employee.designation || '',
      gender: employee.gender || '',
      status: employee.status || 'active'
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await employeeAPI.updateEmployee(editingId, editFormData);
      toast.success('Employee updated successfully');
      setEditingId(null);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update employee');
    }
  };

  const handleDeleteClick = (employeeId) => {
    setConfirmDelete(employeeId);
  };

  const handleConfirmDelete = async () => {
    try {
      await employeeAPI.deleteEmployee(confirmDelete);
      toast.success('Employee deleted successfully');
      setConfirmDelete(null);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete employee');
      setConfirmDelete(null);
    }
  };

  const handleApproveEmployee = async (employeeId) => {
    try {
      await employeeAPI.approveEmployee(employeeId);
      toast.success('Employee account approved! They can now login.');
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve employee');
    }
  };

  const handleRejectEmployee = async (employeeId) => {
    try {
      await employeeAPI.rejectEmployee(employeeId);
      toast.success('Employee account approval rejected');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to reject employee');
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Employee Account Management
          </h1>
          <p className="text-gray-600">Approve, edit, or delete employee accounts</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredEmployees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Employee</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Email</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Designation</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Approval</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => (
                    <tr key={emp._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.employeeId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell break-all max-w-xs">
                        {emp.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                        {emp.phone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {emp.designation || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          emp.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {emp.isApproved ? '✓ Approved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(emp.status)}`}>
                          {emp.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(emp)}
                            title="View Details"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditClick(emp)}
                            title="Edit"
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(emp._id)}
                            title="Delete"
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={18} />
                          </button>
                          {!emp.isApproved && (
                            <button
                              onClick={() => handleApproveEmployee(emp._id)}
                              title="Approve Account"
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition font-bold"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          {emp.isApproved && (
                            <button
                              onClick={() => handleRejectEmployee(emp._id)}
                              title="Revoke Approval"
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No employees found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Employee</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={editFormData.designation}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={editFormData.gender}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Employee Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-gray-800">{selectedEmployee.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Employee ID</p>
                <p className="text-gray-800">{selectedEmployee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-800 break-all">{selectedEmployee.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-gray-800">{selectedEmployee.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Gender</p>
                <p className="text-gray-800">{selectedEmployee.gender || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Designation</p>
                <p className="text-gray-800">{selectedEmployee.designation || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Department</p>
                <p className="text-gray-800">{selectedEmployee.department?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedEmployee.status)}`}>
                    {selectedEmployee.status || 'active'}
                  </span>
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-600">Account Approval</p>
                <p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedEmployee.isApproved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEmployee.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
                  </span>
                </p>
              </div>
              {selectedEmployee.approvalDate && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved On</p>
                  <p className="text-gray-800">{new Date(selectedEmployee.approvalDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
              >
                Close
              </button>
              {!selectedEmployee.isApproved && (
                <button
                  onClick={() => {
                    handleApproveEmployee(selectedEmployee._id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium"
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Employee?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this employee account? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeApprovalPage;
