import React, { useState, useEffect, useCallback } from 'react';
import { leaveAPI, employeeAPI } from '../services/api';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Plus, X, Search, Calendar, User, FileText } from 'lucide-react';
import useLiveDataSync from '../hooks/useLiveDataSync';

const UnplannedLeaveManagementPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'unplanned'
  });

  const fetchUnplannedLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getUnplannedLeaves({ 
        status: filterStatus === 'all' ? undefined : filterStatus 
      });
      setLeaves(response.data.leaves || []);
    } catch (error) {
      console.error('Error fetching unplanned leaves:', error);
      toast.error('Failed to load unplanned leaves');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeeAPI.getAllEmployees();
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchUnplannedLeaves();
  }, [fetchEmployees, fetchUnplannedLeaves]);

  const refreshUnplannedData = useCallback(async () => {
    await Promise.all([fetchEmployees(), fetchUnplannedLeaves()]);
  }, [fetchEmployees, fetchUnplannedLeaves]);

  const { isLive, lastSyncAt } = useLiveDataSync({
    onRefresh: refreshUnplannedData,
    events: ['leave:updated', 'leave:statusChanged', 'notification:new'],
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

    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('All fields are required');
      return;
    }

    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate > endDate) {
        toast.error('Start date cannot be after end date');
        return;
      }

      await leaveAPI.createUnplannedLeave({
        employeeId: formData.employeeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        leaveType: formData.leaveType
      });

      toast.success('Unplanned leave created successfully!');
      setFormData({
        employeeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        leaveType: 'unplanned'
      });
      setShowForm(false);
      fetchUnplannedLeaves();
    } catch (error) {
      console.error('Error creating unplanned leave:', error);
      toast.error(error.response?.data?.error || 'Failed to create unplanned leave');
    }
  };

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return 'Unknown';
    const actualId = typeof employeeId === 'object' ? employeeId._id : employeeId;
    const employee = employees.find(e => e._id === actualId);
    return employee ? employee.name : 'Unknown';
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredLeaves = leaves.filter(leave => {
    if (!leave || !leave.employeeId) return false;
    const employeeId = typeof leave.employeeId === 'object' ? leave.employeeId._id : leave.employeeId;
    const employeeName = getEmployeeName(employeeId).toLowerCase();
    return employeeName.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Unplanned Leave Management
              </h1>
              <p className="text-gray-600 mt-2">Create and manage unplanned leaves for employees</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/70">
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{isLive ? 'Live' : 'Syncing'}</span>
                {lastSyncAt && (
                  <span className="text-[10px] text-gray-400 font-semibold">{new Date(lastSyncAt).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all shadow-lg"
            >
              <Plus size={20} />
              Create Unplanned Leave
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Unplanned Leave</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Select Employee
                  </label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Leave Type
                  </label>
                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                  >
                    <option value="unplanned">Unplanned Leave</option>
                    <option value="medical">Medical Leave</option>
                    <option value="emergency">Emergency Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-2" />
                  Reason for Leave
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Enter the reason for unplanned leave..."
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 h-24 resize-none"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg"
                >
                  Create Leave
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Search Employee
              </label>
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Leaves</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
            <p className="text-gray-600 text-sm font-semibold">Total Unplanned Leaves</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{leaves.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
            <p className="text-gray-600 text-sm font-semibold">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {leaves.filter(l => l.status === 'approved').length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-2 border-amber-200">
            <p className="text-gray-600 text-sm font-semibold">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {leaves.filter(l => l.status === 'pending').length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
            <p className="text-gray-600 text-sm font-semibold">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {leaves.filter(l => l.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Unplanned Leaves Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Leave Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">End Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Days</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Reason</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {leave.employeeId ? leave.employeeId.name : 'Unknown Employee'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {leave.employeeId ? leave.employeeId.employeeId : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {moment(leave.startDate).format('DD MMM YYYY')}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {moment(leave.endDate).format('DD MMM YYYY')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-900">
                          {calculateDays(leave.startDate, leave.endDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {leave.status === 'approved' && (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            ✓ Approved
                          </span>
                        )}
                        {leave.status === 'pending' && (
                          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                            ⏳ Pending
                          </span>
                        )}
                        {leave.status === 'rejected' && (
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            ✕ Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {moment(leave.createdAt).format('DD MMM YYYY')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No unplanned leaves found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnplannedLeaveManagementPage;
