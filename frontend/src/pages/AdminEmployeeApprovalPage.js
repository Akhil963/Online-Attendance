import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Edit2, Trash2, Check, X, Eye } from 'lucide-react';
import useLiveDataSync from '../hooks/useLiveDataSync';
import MobileBackButton from '../components/MobileBackButton';

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

  const fetchEmployees = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    filterEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, searchTerm, statusFilter]);

  useLiveDataSync({
    onRefresh: fetchEmployees,
    events: ['employee:statusUpdated', 'notification:new'],
    soundEvents: ['employee:statusUpdated'],
    pollMs: 0,  // Disabled - only update on socket events
    enabled: true
  });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 font-outfit">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold italic tracking-tighter text-xl">OAS</div>
          </div>
          <p className="text-gray-400 font-bold uppercase text-xs animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-outfit space-y-8 md:space-y-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile Back Button */}
        <MobileBackButton label="Back" customPath="/admin-dashboard" />

        {/* Header */}
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Employee Accounts
          </h1>
          <p className="text-gray-500 mt-2 sm:mt-3 text-xs sm:text-sm md:text-base">Approve, edit, or manage employee access and profiles</p>
        </div>

        {/* Filters - High Precision Console */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/60 p-4 sm:p-6 md:p-8 lg:p-12 mb-8 md:mb-12">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-10 tracking-tight flex items-center gap-2 md:gap-5">
            <div className="w-1 h-4 md:h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
            <span>Audit Console</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 md:gap-8">
            <div className="group/field">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2.5 ml-1">Search Employees</label>
              <input
                type="text"
                placeholder="Identity, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm text-gray-700 shadow-sm"
              />
            </div>
            <div className="group/field text-gray-700">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2.5 ml-1">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm appearance-none shadow-sm"
                >
                  <option value="all">All Channels</option>
                  <option value="active">Operational</option>
                  <option value="inactive">Standby</option>
                  <option value="on_leave">External</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover/field:scale-110 transition-transform">
                  <svg className="w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold uppercase text-xs transition-all active:scale-95 shadow-lg shadow-gray-200"
              >
                Reset Matrix
              </button>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-bold text-gray-400 uppercase">
              Identified <span className="text-blue-600 italic underline">{filteredEmployees.length}</span> Employees
            </p>
          </div>
        </div>

        {/* Employees Table - Elite Data Grid */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden shadow-2xl shadow-gray-200/50">
          {filteredEmployees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-900 text-white uppercase text-xs font-bold">
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-5">Asset Profile</th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-5 hidden sm:table-cell">Neural Hub</th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-5 hidden md:table-cell">Comms</th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-5 hidden lg:table-cell">Operation</th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-5">Security</th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="group hover:bg-blue-600/[0.03] transition-all duration-300">
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner font-bold text-lg uppercase">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 tracking-tight leading-none">{emp.name}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-2">{emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-5 text-xs text-gray-400 font-bold hidden sm:table-cell break-all max-w-xs">
                        {emp.email || 'Not Provided'}
                      </td>
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-5 text-xs text-gray-400 font-bold hidden md:table-cell">
                        {emp.phone || 'DATA_VACUUM'}
                      </td>
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-5 text-xs text-gray-400 font-bold hidden lg:table-cell uppercase">
                        {emp.designation || 'Specialist'}
                      </td>
                      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6">
                        <div className="flex flex-col gap-2">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] w-fit shadow-sm border border-transparent ${emp.isApproved
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/10'
                            }`}>
                            Sync: {emp.isApproved ? 'Verified' : 'Pending'}
                          </span>
                          <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit shadow-sm ${emp.status === 'active' ? 'bg-blue-500/10 text-blue-600' :
                            emp.status === 'inactive' ? 'bg-slate-100 text-slate-400' :
                              'bg-violet-500/10 text-violet-600'
                            }`}>
                            {emp.status || 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-5">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(emp)}
                            className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-95 group/btn"
                          >
                            <Eye size={20} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleEditClick(emp)}
                            className="p-3 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all active:scale-95 group/btn"
                          >
                            <Edit2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(emp._id)}
                            className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-95 group/btn"
                          >
                            <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                          {!emp.isApproved ? (
                            <button
                              onClick={() => handleApproveEmployee(emp._id)}
                              className="group relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-2 border-none"
                            >
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                              <Check size={14} className="relative z-10" />
                              <span className="relative z-10">Grant Access</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRejectEmployee(emp._id)}
                              className="p-3 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all active:scale-95 group/btn"
                              title="Reject"
                            >
                              <X size={20} className="group-hover/btn:scale-110 transition-transform" />
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

      {/* Edit Modal - Glassmorphism */}
      {editingId && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-500">
          <div className="bg-white/40 backdrop-blur-3xl rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-12 border border-white/20 transform animate-in zoom-in-95 duration-500 font-outfit">
            <h2 className="text-4xl font-bold text-gray-900 mb-10 tracking-tight">Edit Employee</h2>
            <div className="space-y-8">
              <div className="group/field">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Asset Identity</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm text-gray-700 shadow-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="group/field">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Neural Hub</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-xs text-slate-700 shadow-sm"
                  />
                </div>
                <div className="group/field">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-xs text-slate-700 shadow-sm"
                  />
                </div>
              </div>
              <div className="group/field">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Operational Title</label>
                <input
                  type="text"
                  name="designation"
                  value={editFormData.designation}
                  onChange={handleEditChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-xs text-slate-700 shadow-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="group/field">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Gender Node</label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={editFormData.gender}
                      onChange={handleEditChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-xs appearance-none text-slate-700 shadow-sm"
                    >
                      <option value="">Select Protocol</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                      <svg className="w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div className="group/field">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Operational State</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-xs appearance-none text-slate-700 shadow-sm"
                    >
                      <option value="active">Operational</option>
                      <option value="inactive">Standby</option>
                      <option value="on_leave">External Orbit</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                      <svg className="w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-6 mt-12">
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-8 py-5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] active:scale-95"
              >
                Discard Matrix
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] active:scale-95 shadow-2xl shadow-blue-500/20"
              >
                Execute Logic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal - Glassmorphism */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-500">
          <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl max-w-lg w-full p-6 md:p-12 border border-white/20 transform animate-in zoom-in-95 duration-500 font-outfit">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Telemetric View</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 text-slate-900 rounded-full transition-all active:scale-90 border border-white/20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-6 p-8 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-blue-100/50 shadow-inner">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl uppercase">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">{selectedEmployee.name}</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-3">ID: {selectedEmployee.employeeId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 px-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Hub</p>
                  <p className="text-xs font-black text-slate-900 break-all pl-6 text-right lowercase">{selectedEmployee.email || 'NODE_OFFLINE'}</p>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Comm Node</p>
                  <p className="text-xs font-black text-slate-900">{selectedEmployee.phone || 'DATA_VACUUM'}</p>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment</p>
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{selectedEmployee.department?.name || 'CENTRAL'}</p>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Job Title</p>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{selectedEmployee.designation || 'SPECIALIST'}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Approval Status</p>
                  <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border border-transparent ${selectedEmployee.isApproved ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' : 'bg-amber-500/10 text-amber-600 border-amber-500/10'}`}>
                    {selectedEmployee.isApproved ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 mt-12">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 bg-slate-900 text-white h-20 rounded-[1.5rem] font-black uppercase tracking-[0.25em] text-[10px] transition-all active:scale-95 shadow-2xl shadow-slate-900/40"
              >
                Terminate View
              </button>
              {!selectedEmployee.isApproved && (
                <button
                  onClick={() => {
                    handleApproveEmployee(selectedEmployee._id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-20 rounded-[1.5rem] font-black uppercase tracking-[0.25em] text-[10px] transition-all active:scale-95 shadow-2xl shadow-emerald-500/20"
                >
                  Grant Clearance
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Glassmorphism */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 border border-white/20 transform animate-in slide-in-from-bottom-8 duration-500">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-100/50">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 text-center tracking-tight">Remove Account?</h2>
            <p className="text-slate-500 mb-8 text-center font-medium leading-relaxed">
              This will permanently delete the employee record. This action is <span className="text-rose-600 font-bold underline">irreversible</span>.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-2xl transition-all font-bold active:scale-95"
              >
                Keep it
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-2xl transition-all font-bold active:scale-95 shadow-lg shadow-rose-200"
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
