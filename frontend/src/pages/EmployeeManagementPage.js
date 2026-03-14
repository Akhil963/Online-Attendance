import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI } from '../services/api';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';
import { toast } from 'react-toastify';

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const filterAndSortEmployees = useCallback(() => {
    let filtered = employees.filter(emp => {
      const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = departmentFilter === 'all' || emp.department?.name === departmentFilter;
      const matchesGender = genderFilter === 'all' || emp.gender === genderFilter;
      const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
      return matchesSearch && matchesDept && matchesGender && matchesRole;
    });
    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      if (sortBy === 'department') {
        aValue = a.department?.name || '';
        bValue = b.department?.name || '';
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    setFilteredEmployees(filtered);
  }, [employees, searchTerm, departmentFilter, genderFilter, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortEmployees();
  }, [filterAndSortEmployees]);

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

  const fetchDepartments = async () => {
    try {
      const response = await employeeAPI.getAllEmployees();
      const uniqueDepts = [...new Set(response.data.employees?.map(e => e.department?.name))].filter(Boolean);
      setDepartments(uniqueDepts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };


  const handleExportExcel = () => {
    const data = filteredEmployees.map(emp => ({
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Email': emp.email,
      'Phone': emp.phone || '-',
      'Department': emp.department?.name || '-',
      'Designation': emp.designation || '-',
      'Gender': emp.gender || '-',
      'Role': emp.role,
      'Status': emp.status || 'Active'
    }));
    exportToExcel(data, 'employee_list', 'Employees');
    toast.success('Exported to Excel successfully!');
  };

  const handleExportCSV = () => {
    const data = filteredEmployees.map(emp => ({
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Email': emp.email,
      'Phone': emp.phone || '-',
      'Department': emp.department?.name || '-',
      'Designation': emp.designation || '-',
      'Gender': emp.gender || '-',
      'Role': emp.role
    }));
    exportToCSV(data, 'employee_list');
    toast.success('Exported to CSV successfully!');
  };

  const handleExportPDF = () => {
    const data = filteredEmployees.map(emp => ({
      'ID': emp.employeeId,
      'Name': emp.name,
      'Email': emp.email,
      'Department': emp.department?.name || '-',
      'Role': emp.role
    }));
    exportToPDF(data, 'employee_list', 'Employee List Report', Object.keys(data[0] || {}));
    toast.success('Exported to PDF successfully!');
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
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-outfit space-y-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="mb-14">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight uppercase leading-none mb-6">
            Employees
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full shadow-lg"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage Your Team</p>
          </div>
        </div>

        {/* Summary Cards - Elite Dashboard Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white/40 backdrop-blur-3xl rounded-2xl shadow-sm border border-gray-200/60 p-10 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 relative z-10">Total Workforce</p>
            <p className="text-6xl font-bold text-gray-900 tracking-tight relative z-10 leading-none">{employees.length}</p>
          </div>

          <div className="bg-white/40 backdrop-blur-3xl rounded-2xl shadow-sm border border-gray-200/60 p-10 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 relative z-10">Active Search</p>
            <p className="text-6xl font-bold text-emerald-600 tracking-tight relative z-10 leading-none">{filteredEmployees.length}</p>
          </div>

          <div className="bg-white/40 backdrop-blur-3xl rounded-2xl shadow-sm border border-gray-200/60 p-10 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 relative z-10">Male Employees</p>
            <div className="flex items-baseline gap-3 relative z-10">
              <p className="text-6xl font-bold text-blue-500 tracking-tight leading-none">
                {employees.filter(e => e.gender === 'Male').length}
              </p>
              <span className="text-xs font-bold text-gray-300 tracking-widest">UNITS</span>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-3xl rounded-2xl shadow-sm border border-gray-200/60 p-10 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 relative z-10">Female Employees</p>
            <div className="flex items-baseline gap-3 relative z-10">
              <p className="text-6xl font-bold text-red-500 tracking-tight leading-none">
                {employees.filter(e => e.gender === 'Female').length}
              </p>
              <span className="text-xs font-bold text-gray-300 tracking-widest">UNITS</span>
            </div>
          </div>
        </div>

        {/* Filters - High Precision Console */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-3xl shadow-sm border border-gray-200/60 p-6 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight flex items-center gap-5 uppercase">
            <div className="w-1 h-6 bg-blue-600 rounded-full shadow-lg"></div>
            Filter Console
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="group/field">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Search Employees</label>
              <input
                type="text"
                placeholder="Name, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-700"
              />
            </div>

            <div className="group/field text-gray-700">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Unit Filter</label>
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm appearance-none shadow-sm"
                >
                  <option value="all">All Units</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover/field:scale-110 transition-transform">
                  <svg className="w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="group/field text-gray-700">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Gender</label>
              <div className="relative">
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm appearance-none"
                >
                  <option value="all">Diversity</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="group/field text-gray-700">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Authority Level</label>
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm appearance-none"
                >
                  <option value="all">All Clearances</option>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="director">Director</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="group/field text-gray-700">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Sort Strategy</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm appearance-none"
                >
                  <option value="name">Full Identity</option>
                  <option value="employeeId">Serial ID</option>
                  <option value="email">Data Path</option>
                  <option value="department">Asset Unit</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="group/field text-gray-700">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Direction</label>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm appearance-none shadow-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover/field:scale-110 transition-transform">
                  <svg className="w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <button
            onClick={handleExportExcel}
            className="group relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white h-20 rounded-2xl font-bold uppercase tracking-wide text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-4 border-none"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="relative z-10 text-lg">📊</span>
            <span className="relative z-10">Spreadsheet Matrix</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white h-20 rounded-2xl font-bold uppercase tracking-wide text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-4 border-none"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="relative z-10 text-lg">📄</span>
            <span className="relative z-10">Data Extraction</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="group relative overflow-hidden bg-red-600 hover:bg-red-700 text-white h-20 rounded-2xl font-bold uppercase tracking-wide text-xs transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-4 border-none"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="relative z-10 text-lg">📑</span>
            <span className="relative z-10">Intelligence Report</span>
          </button>
        </div>

        <div className="bg-white/40 backdrop-blur-3xl rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900 text-white uppercase text-xs font-bold tracking-widest">
                  <th className="px-4 md:px-6 lg:px-10 py-4 md:py-6">Identity ID</th>
                  <th className="px-4 md:px-6 lg:px-10 py-4 md:py-6">Asset Profile</th>
                  <th className="px-4 md:px-6 lg:px-10 py-4 md:py-6 hidden sm:table-cell">Neural Hub</th>
                    <th className="px-4 md:px-6 lg:px-10 py-4 md:py-6 hidden md:table-cell">Phone</th>
                    <th className="px-4 md:px-6 lg:px-10 py-4 md:py-6">Department</th>
                  <th className="px-4 md:px-6 lg:px-10 py-4 md:py-6 hidden lg:table-cell">Asset Title</th>
                  <th className="px-4 md:px-6 lg:px-10 py-4 md:py-6">Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <tr key={emp._id} className="group hover:bg-blue-600/[0.03] transition-all duration-300">
                      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6 font-bold text-blue-600 italic tracking-widest text-sm">{emp.employeeId}</td>
                      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner uppercase">
                            {emp.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 tracking-tight leading-none">{emp.name}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 opacity-50 group-hover:opacity-100 transition-opacity">Asset Identity Verified</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6 text-gray-400 font-bold text-xs hidden sm:table-cell lowercase tracking-wider">{emp.email}</td>
                      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6 text-gray-400 font-bold text-xs hidden md:table-cell tracking-widest">{emp.phone || 'Not Provided'}</td>
                      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6">
                        <div className="px-5 py-2 bg-blue-600/5 text-blue-600 rounded-full inline-flex items-center text-xs font-bold uppercase tracking-widest border border-blue-600/10 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {emp.department?.name || 'Central Unit'}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6 text-gray-500 font-bold text-xs hidden lg:table-cell uppercase tracking-widest">{emp.designation || 'Specialist'}</td>
                      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6">
                        <div className={`px-5 py-2 rounded-full inline-flex items-center text-xs font-bold uppercase tracking-widest shadow-sm ${emp.role === 'admin' ? 'bg-red-500/10 text-red-600 border border-red-500/10' :
                          emp.role === 'manager' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/10' :
                            'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10'
                          }`}>
                          Lvl: {emp.role}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-2xl font-bold italic">!</div>
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs animate-pulse">No employees found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredEmployees.length > 0 && (
          <div className="mt-10 flex justify-center">
            <div className="px-6 py-2 bg-gray-900 rounded-full shadow-lg">
              <p className="text-xs font-bold text-white uppercase tracking-widest">
                Verified Deployment: {filteredEmployees.length} Units Active
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
