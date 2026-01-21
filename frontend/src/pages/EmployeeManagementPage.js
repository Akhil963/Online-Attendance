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
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Management</h1>
          <p className="text-gray-600">Manage and view all employees</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Total Employees</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{employees.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Filtered Results</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{filteredEmployees.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Male Employees</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {employees.filter(e => e.gender === 'Male').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Female Employees</p>
            <p className="text-3xl font-bold text-pink-600 mt-2">
              {employees.filter(e => e.gender === 'Female').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Filters & Search</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Search</label>
              <input
                type="text"
                placeholder="Name, ID, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="name">Name</option>
                <option value="employeeId">Employee ID</option>
                <option value="email">Email</option>
                <option value="department">Department</option>
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-2 text-sm md:text-base rounded-lg font-medium transition"
          >
            📊 Export Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 text-sm md:text-base rounded-lg font-medium transition"
          >
            📄 Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 text-sm md:text-base rounded-lg font-medium transition"
          >
            📑 Export PDF
          </button>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700">ID</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700">Name</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700 hidden sm:table-cell">Email</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700 hidden md:table-cell">Phone</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700">Dept</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700 hidden lg:table-cell">Designation</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700 hidden md:table-cell">Gender</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-700">Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <tr key={emp._id} className="border-b hover:bg-gray-50">
                      <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-blue-600 text-xs md:text-sm">{emp.employeeId}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-gray-800 text-xs md:text-sm">{emp.name}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-gray-600 text-xs hidden sm:table-cell break-all max-w-48 md:max-w-xs">{emp.email}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-gray-600 text-xs hidden md:table-cell">{emp.phone || '-'}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {emp.department?.name || '-'}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-gray-600 text-xs hidden lg:table-cell">{emp.designation || '-'}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs hidden md:table-cell">
                        <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                          emp.gender === 'Male' ? 'bg-blue-500' : emp.gender === 'Female' ? 'bg-pink-500' : 'bg-gray-500'
                        }`}>
                          {emp.gender || '-'}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs">
                        <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                          emp.role === 'admin' ? 'bg-red-500' : emp.role === 'manager' ? 'bg-orange-500' : 'bg-green-500'
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredEmployees.length > 0 && (
          <p className="text-sm text-gray-600 mt-4 text-center">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
