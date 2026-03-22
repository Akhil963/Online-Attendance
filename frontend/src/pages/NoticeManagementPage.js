import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { Trash2, Edit2, Plus, Search, Mail, MessageCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import useLiveDataSync from '../hooks/useLiveDataSync';

const NoticeManagementPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'announcement',
    priority: 'normal',
    isUrgent: false,
    notificationChannels: ['dashboard'],
    departments: [],
    employees: []
  });

  const availableEmployees = useMemo(() => {
    const selectedDepartments = formData.departments || [];
    if (selectedDepartments.length === 0) {
      return employees;
    }

    return employees.filter((employee) => {
      const departmentId = String(employee?.department?._id || employee?.department || '');
      return selectedDepartments.map(String).includes(departmentId);
    });
  }, [employees, formData.departments]);

  const filteredDepartments = useMemo(() => {
    const term = departmentSearchTerm.trim().toLowerCase();
    if (!term) {
      return departments;
    }

    return departments.filter((department) =>
      (department?.name || '').toLowerCase().includes(term)
    );
  }, [departments, departmentSearchTerm]);

  const filteredAvailableEmployees = useMemo(() => {
    const term = employeeSearchTerm.trim().toLowerCase();
    if (!term) {
      return availableEmployees;
    }

    return availableEmployees.filter((employee) => {
      const name = (employee?.name || '').toLowerCase();
      const email = (employee?.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [availableEmployees, employeeSearchTerm]);

  const audienceSummary = useMemo(() => {
    const departmentCount = (formData.departments || []).length;
    const employeeCount = (formData.employees || []).length;

    if (departmentCount === 0 && employeeCount === 0) {
      return 'This notice will be sent to all employees.';
    }

    if (departmentCount > 0 && employeeCount === 0) {
      return `This notice will be sent only to selected departments (${departmentCount}).`;
    }

    if (departmentCount === 0 && employeeCount > 0) {
      return `This notice will be sent only to selected employees (${employeeCount}).`;
    }

    return `This notice will be sent to selected departments (${departmentCount}) and selected employees (${employeeCount}) only.`;
  }, [formData.departments, formData.employees]);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/notice/all');
      const data = Array.isArray(response.data) ? response.data : response.data.notices || [];
      setNotices(data);
    } catch (error) {
      toast.error('Failed to fetch notices');
      console.error(error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.get('/department');
      const depts = Array.isArray(response.data) ? response.data : response.data.departments || [];
      setDepartments(depts);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await api.get('/employee/all');
      const emps = Array.isArray(response.data) ? response.data : response.data.employees || [];
      setEmployees(emps);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
    fetchDepartments();
    fetchEmployees();
  }, [fetchNotices, fetchDepartments, fetchEmployees]);

  useLiveDataSync({
    onRefresh: fetchNotices,
    events: ['notification:new'],
    soundEvents: ['notification:new'],
    pollMs: 30000,
    enabled: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleChannelChange = (channel) => {
    setFormData(prev => {
      const channels = prev.notificationChannels || [];
      return {
        ...prev,
        notificationChannels: channels.includes(channel)
          ? channels.filter(c => c !== channel)
          : [...channels, channel]
      };
    });
  };

  const handleDepartmentChange = (deptId) => {
    setFormData(prev => {
      const depts = prev.departments || [];
      const newDepts = depts.includes(deptId)
        ? depts.filter(d => d !== deptId)
        : [...depts, deptId];

      const filteredEmployeeIds = employees
        .filter((employee) => {
          if (newDepts.length === 0) {
            return true;
          }
          const departmentId = String(employee?.department?._id || employee?.department || '');
          return newDepts.map(String).includes(departmentId);
        })
        .map((employee) => String(employee._id));

      return {
        ...prev,
        departments: newDepts,
        employees: prev.employees.filter((employeeId) => filteredEmployeeIds.includes(String(employeeId)))
      };
    });
  };

  const handleEmployeeChange = (empId) => {
    setFormData(prev => {
      const emps = prev.employees || [];
      return {
        ...prev,
        employees: emps.includes(empId)
          ? emps.filter(e => e !== empId)
          : [...emps, empId]
      };
    });
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
        await api.put(`/notice/${editingId}`, formData);
        toast.success('Notice updated successfully');
      } else {
        await api.post('/notice', formData);
        toast.success('Notice created successfully');
      }

      setFormData({
        title: '',
        content: '',
        category: 'announcement',
        priority: 'normal',
        isUrgent: false,
        notificationChannels: ['dashboard'],
        departments: [],
        employees: []
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
    const normalizedDepartments = (notice.departments || []).map((department) => String(department?._id || department));
    const normalizedEmployees = (notice.employees || []).map((employee) => String(employee?._id || employee));

    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category || 'announcement',
      priority: notice.priority || 'normal',
      isUrgent: notice.isUrgent || false,
      notificationChannels: notice.notificationChannels || ['dashboard'],
      departments: normalizedDepartments,
      employees: normalizedEmployees
    });
    setEditingId(notice._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`/notice/${id}`);
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
      notificationChannels: ['dashboard'],
      departments: [],
      employees: []
    });
    setEditingId(null);
    setDepartmentSearchTerm('');
    setEmployeeSearchTerm('');
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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tighter mb-4">Notices</h1>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Manage Important Announcements</p>
          </div>
        </div>

        {/* Stats - Elite Transmission Analytics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-8 group hover:shadow-xl transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Notices</p>
            <p className="text-5xl font-bold text-gray-900 tracking-tighter italic">
              {Array.isArray(notices) ? notices.filter(n => n && n.title).length : 0}
            </p>
            <div className="mt-4 h-1 w-12 bg-blue-500 rounded-full group-hover:w-20 transition-all"></div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-8 group hover:shadow-xl transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Urgent Notices</p>
            <p className="text-5xl font-bold text-red-600 tracking-tighter italic">
              {Array.isArray(notices) ? notices.filter(n => n && n.isUrgent).length : 0}
            </p>
            <div className="mt-4 h-1 w-12 bg-red-500 rounded-full group-hover:w-20 transition-all"></div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-8 group hover:shadow-xl transition-all">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">This Month</p>
            <p className="text-5xl font-bold text-emerald-600 tracking-tighter italic">
              {Array.isArray(notices) ? notices.filter(n => n && n.createdAt && moment(n.createdAt).isSame(moment(), 'month')).length : 0}
            </p>
            <div className="mt-4 h-1 w-12 bg-emerald-500 rounded-full group-hover:w-20 transition-all"></div>
          </div>
        </div>

        {/* Meeting Announcements Section */}
        {Array.isArray(notices) && notices.filter(n => n && n.category === 'meeting').length > 0 && (
          <div className="mb-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tighter mb-3">📅 Meeting Announcements</h2>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Upcoming & Scheduled Meetings</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices
                .filter(n => n && n.category === 'meeting')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((meeting, index) => (
                  <div key={meeting._id || index} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-orange-100 p-6 hover:shadow-lg hover:border-orange-300 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 tracking-tight text-lg mb-2 group-hover:text-orange-600 transition-colors">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-orange-200">
                            Meeting
                          </span>
                          {meeting.isUrgent && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                      {meeting.content}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-400 font-bold">
                        {moment(meeting.createdAt).format('MMM DD, YYYY')}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(meeting)}
                          className="w-8 h-8 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center text-orange-600 hover:bg-orange-100 hover:border-orange-400 transition-all"
                          title="Edit Meeting"
                        >
                          <Edit2 size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(meeting._id)}
                          className="w-8 h-8 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-100 hover:border-red-400 transition-all"
                          title="Delete Meeting"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Search and Broadcast Initiation */}
        <div className="flex gap-6 mb-8 flex-wrap">
          <div className="flex-1 min-w-0 sm:min-w-[300px] relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} strokeWidth={3} />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="h-[64px] bg-gray-900 hover:bg-gray-800 text-white px-10 rounded-[2rem] font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-gray-900/10 active:scale-95 flex items-center gap-3 border-none whitespace-nowrap"
          >
            <Plus size={20} strokeWidth={3} />
            Send Notice
          </button>
        </div>

        {/* Add/Edit Form - Integrated Command Station */}
        {showForm && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-4 md:p-10 mb-12 animate-in fade-in slide-in-from-top duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tighter flex items-center gap-3 relative z-10">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              {editingId ? 'Update Notice' : 'Send New Notice'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group/field">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter title..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700"
                  />
                </div>
                <div className="group/field text-gray-700">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Category</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none"
                    >
                      <option value="announcement">Announcement</option>
                      <option value="meeting">Meeting</option>
                      <option value="policy">Policy</option>
                      <option value="event">Event</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group/field text-gray-700">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Priority</label>
                  <div className="relative">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-4 cursor-pointer group/check">
                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.isUrgent ? 'bg-red-600 border-red-600 shadow-lg shadow-red-200' : 'bg-gray-50 border-gray-200 group-hover/check:border-red-400'}`}>
                      {formData.isUrgent && <CheckCircle size={18} className="text-white" strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      name="isUrgent"
                      checked={formData.isUrgent}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <span className={`text-xs font-bold uppercase tracking-widest ${formData.isUrgent ? 'text-red-600' : 'text-gray-500'}`}>Mark as Urgent</span>
                  </label>
                </div>
              </div>

              <div className="group/field">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-blue-600 transition-colors">Message Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your message..."
                  rows="6"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700"
                />
              </div>

              {/* Department Selection */}
              <div className="group/field">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Select Departments (Optional)</label>
                <div className="relative mb-3">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={departmentSearchTerm}
                    onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                    placeholder="Search departments..."
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-semibold text-gray-700"
                  />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 max-h-48 overflow-y-auto">
                  {departments.length === 0 ? (
                    <p className="text-gray-400 text-sm font-bold">No departments available</p>
                  ) : filteredDepartments.length === 0 ? (
                    <p className="text-gray-400 text-sm font-bold">No matching departments</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredDepartments.map(dept => (
                        <label key={dept._id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={(formData.departments || []).map(String).includes(String(dept._id))}
                            onChange={() => handleDepartmentChange(dept._id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                          />
                          <span className="text-sm font-bold text-gray-700">{dept.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Selection */}
              <div className="group/field">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Select Employees (Optional)</label>
                <div className="relative mb-3">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    placeholder="Search employees by name or email..."
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-semibold text-gray-700"
                  />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 max-h-48 overflow-y-auto">
                  {availableEmployees.length === 0 && employees.length === 0 ? (
                    <p className="text-gray-400 text-sm font-bold">No employees available</p>
                  ) : availableEmployees.length === 0 && (formData.departments || []).length > 0 ? (
                    <p className="text-gray-400 text-sm font-bold">No employees in selected departments</p>
                  ) : filteredAvailableEmployees.length === 0 ? (
                    <p className="text-gray-400 text-sm font-bold">No matching employees</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredAvailableEmployees.map(emp => (
                        <label key={emp._id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={(formData.employees || []).map(String).includes(String(emp._id))}
                            onChange={() => handleEmployeeChange(emp._id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-bold text-gray-700 block">{emp.name}</span>
                            <span className="text-xs text-gray-500">{emp.email}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Details Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Target Logic</p>
                  <p className="text-sm text-blue-900 font-semibold mb-3">{audienceSummary}</p>
                  <div className="flex flex-wrap gap-2">
                    {(formData.departments || []).map(deptId => {
                      const dept = departments.find(d => String(d._id) === String(deptId));
                      return dept ? (
                        <span key={deptId} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          Department: {dept.name}
                        </span>
                      ) : null;
                    })}
                    {(formData.employees || []).map(empId => {
                      const emp = employees.find(e => String(e._id) === String(empId));
                      return emp ? (
                        <span key={empId} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          Employee: {emp.name}
                        </span>
                      ) : null;
                    })}
                  </div>
              </div>

              {/* Advanced Transmission Channels */}
              <div className="bg-gray-900 rounded-[2rem] p-4 md:p-8">
                <label className="block text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mb-6">Delivery Channels:</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    type="button"
                    onClick={() => handleChannelChange('dashboard')}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${(formData.notificationChannels || []).includes('dashboard') ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}
                  >
                    <CheckCircle size={20} className={(formData.notificationChannels || []).includes('dashboard') ? 'text-blue-400' : 'text-gray-600'} />
                    <span className="font-bold uppercase tracking-widest text-xs">Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChannelChange('email')}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${(formData.notificationChannels || []).includes('email') ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}
                  >
                    <Mail size={20} className={(formData.notificationChannels || []).includes('email') ? 'text-emerald-400' : 'text-gray-600'} />
                    <span className="font-bold uppercase tracking-widest text-xs">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChannelChange('whatsapp')}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${(formData.notificationChannels || []).includes('whatsapp') ? 'bg-green-600/10 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}
                  >
                    <MessageCircle size={20} className={(formData.notificationChannels || []).includes('whatsapp') ? 'text-green-400' : 'text-gray-600'} />
                    <span className="font-bold uppercase tracking-widest text-xs">WhatsApp</span>
                  </button>
                </div>
                <div className="mt-6 flex items-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest italic opacity-70">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  Note: WhatsApp requires setup via a messaging service.
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="h-14 bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 border-none"
                >
                  {editingId ? 'Update' : 'Send'}
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

        {/* Signal Stream List - Elite Grid */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredNotices.length === 0 ? (
            <div className="p-8 md:p-24 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <MessageCircle className="text-gray-300" size={48} strokeWidth={2.5} />
              </div>
              <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">No notices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-900 text-white uppercase text-xs font-bold tracking-[0.2em]">
                    <th className="px-4 sm:px-6 lg:px-10 py-4 md:py-6">Title</th>
                    <th className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 hidden sm:table-cell">Category</th>
                    <th className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 hidden md:table-cell">Status</th>
                    <th className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 hidden lg:table-cell">Posted By</th>
                    <th className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 hidden lg:table-cell">Created On</th>
                    <th className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredNotices.map((notice, index) => (
                    <tr key={notice._id || index} className="group hover:bg-blue-50/50 transition-all duration-300">
                      <td className="px-4 sm:px-6 lg:px-10 py-4 md:py-6">
                        <div className="flex items-center gap-4">
                          {notice.isUrgent && (
                            <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping shrink-0" title="Urgent Signal"></div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 tracking-tight block uppercase text-sm group-hover:text-blue-600 transition-colors">
                              {notice.title || 'Untitled'}
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Published</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 hidden sm:table-cell">
                        <div className={`px-4 py-1.5 rounded-full inline-flex items-center text-xs font-bold uppercase tracking-widest border ${notice.category === 'announcement' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            notice.category === 'policy' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              notice.category === 'event' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-red-50 text-red-700 border-red-100'
                          }`}>
                          {notice.category}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 hidden md:table-cell">
                        <div className="flex gap-2 flex-wrap">
                          {notice.notificationChannels?.map(channel => (
                            <div key={channel} className="px-3 py-1 bg-gray-900 text-gray-400 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-gray-700">
                              {channel}
                            </div>
                          ))}
                          {(!notice.notificationChannels || notice.notificationChannels.length === 0) && (
                            <span className="text-gray-400 font-bold italic text-xs">Silent Stream</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 tracking-tighter text-sm italic uppercase">
                            {notice.postedBy?.name || 'Unknown'}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Posted By</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 tracking-tighter text-sm italic uppercase">
                            {notice.createdAt ? moment(notice.createdAt).format('MMM DD') : 'N/A'}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entry Cycle</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-10 py-4 md:py-6 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => handleEdit(notice)}
                            className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-90"
                            title="Intercept Stream"
                          >
                            <Edit2 size={16} strokeWidth={3} />
                          </button>
                          <button
                            onClick={() => handleDelete(notice._id)}
                            className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg transition-all active:scale-90"
                            title="Terminate Signal"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeManagementPage;
