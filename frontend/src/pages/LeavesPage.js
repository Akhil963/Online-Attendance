import React, { useState, useEffect, useCallback } from 'react';
import { leaveAPI } from '../services/api';
import { toast } from 'react-toastify';
import moment from 'moment';
import useLiveDataSync from '../hooks/useLiveDataSync';

const LeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchLeaves = useCallback(async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.data.leaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const { isLive, lastSyncAt } = useLiveDataSync({
    onRefresh: fetchLeaves,
    events: ['leave:statusChanged', 'leave:updated'],
    soundEvents: ['leave:statusChanged'],
    pollMs: 0,  // Disabled - only update on socket events
    enabled: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('All fields are required');
      setLoading(false);
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      await leaveAPI.applyLeave(formData);
      toast.success('Leave application submitted!');
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      setShowForm(false);
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      'planned': 'bg-green-100 text-green-800',
      'medical': 'bg-purple-100 text-purple-800',
      'emergency': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Leave Applications</h1>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{isLive ? 'Live' : 'Syncing'}</span>
              {lastSyncAt && (
                <span className="text-[10px] text-gray-400 font-semibold">{new Date(lastSyncAt).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium transition w-full sm:w-auto"
          >
            {showForm ? 'Cancel' : 'Apply for Leave'}
          </button>
        </div>

        {/* Leave Application Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">New Leave Application</h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    required
                    className="w-full px-2 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="">Select leave type</option>
                    <option value="planned">Leave</option>
                    <option value="medical">Medical Leave</option>
                    <option value="emergency">Emergency Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-2 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-2 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-2 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Enter the reason for your leave"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium transition w-full"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        )}

        {/* Leaves List */}
        <div className="space-y-3 md:space-y-4">
          {leaves.length > 0 ? (
            leaves.map(leave => (
              <div
                key={leave._id}
                className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {moment(leave.startDate).format('(dddd) MMMM DD, YYYY')} - {moment(leave.endDate).format('(dddd) MMMM DD, YYYY')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {leave.numberOfDays} days ({leave.leaveType})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getLeaveTypeColor(leave.leaveType)}`}>
                      {leave.leaveType}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">
                  <span className="font-medium">Reason:</span> {leave.reason}
                </p>

                {leave.status === 'rejected' && leave.rejectionReason && (
                  <p className="text-red-600 text-sm mb-2">
                    <span className="font-medium">Rejection Reason:</span> {leave.rejectionReason}
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  Applied on {moment(leave.createdAt).format('MMMM DD YYYY')}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg">
              <p className="text-gray-600">No leave applications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeavesPage;
