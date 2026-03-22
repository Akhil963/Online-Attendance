import React, { useState } from 'react';
import { X } from 'lucide-react';

const LeaveRejectionModal = ({ isOpen, onClose, onConfirm, leave, loading }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    // Validation
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters');
      return;
    }

    if (rejectionReason.length > 500) {
      setError('Rejection reason must not exceed 500 characters');
      return;
    }

    setError('');
    onConfirm(rejectionReason);
    setRejectionReason('');
  };

  const handleClose = () => {
    setRejectionReason('');
    setError('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Reject Leave Application</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Leave Details */}
          {leave && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Employee:</span> {leave.employeeId?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Leave Type:</span> {leave.leaveType}
              </p>
            </div>
          )}

          {/* Rejection Reason Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setError('');
              }}
              placeholder="Provide a clear reason for rejection (e.g., Budget constraint, Planning conflict, Insufficient notice)"
              rows="4"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <div className="mt-2 flex justify-between items-start">
              <div>
                {error && (
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {rejectionReason.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Rejecting...' : 'Reject Leave'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRejectionModal;
