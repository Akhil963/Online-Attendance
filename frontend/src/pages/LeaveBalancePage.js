import React, { useState, useEffect, useCallback } from 'react';
import { leaveAPI, employeeAPI } from '../services/api';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'react-toastify';
import moment from 'moment';

const ANNUAL_LEAVE_LIMIT = 20; // Days per year
const MEDICAL_LEAVE_LIMIT = 10; // Days per year
const EMERGENCY_LEAVE_LIMIT = 5; // Days per year

const LeaveBalancePage = () => {
  const [employees, setEmployees] = useState([]); // eslint-disable-line no-unused-vars
  const [leaveData, setLeaveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [empResponse, leaveResponse] = await Promise.all([
        employeeAPI.getAllEmployees(),
        leaveAPI.getAllLeaves({ status: 'all' })
      ]);
      const employees = empResponse.data.employees || [];
      const leaves = leaveResponse.data.leaves || [];
      setEmployees(employees);
      calculateLeaveBalance(employees, leaves);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load leave balance data');
    }
  }, []);

  const filterData = useCallback(() => {
    const filtered = leaveData.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [leaveData, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    filterData();
  }, [leaveData, searchTerm, filterData]);

  const calculateLeaveBalance = (employees, leaves) => {
    const currentYear = moment().format('YYYY');
    const balanceData = employees.map(emp => {
      const empLeaves = leaves.filter(l => l.employeeId?._id === emp._id);
      
      const yearLeaves = empLeaves.filter(l => 
        moment(l.startDate).format('YYYY') === currentYear && 
        l.status === 'approved'
      );

      const plannedUsed = yearLeaves
        .filter(l => l.leaveType === 'planned')
        .reduce((sum, l) => sum + (l.numberOfDays || 0), 0);

      const medicalUsed = yearLeaves
        .filter(l => l.leaveType === 'medical')
        .reduce((sum, l) => sum + (l.numberOfDays || 0), 0);

      const emergencyUsed = yearLeaves
        .filter(l => l.leaveType === 'emergency')
        .reduce((sum, l) => sum + (l.numberOfDays || 0), 0);

      return {
        _id: emp._id,
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department?.name || '-',
        planned: {
          limit: ANNUAL_LEAVE_LIMIT,
          used: plannedUsed,
          balance: ANNUAL_LEAVE_LIMIT - plannedUsed
        },
        medical: {
          limit: MEDICAL_LEAVE_LIMIT,
          used: medicalUsed,
          balance: MEDICAL_LEAVE_LIMIT - medicalUsed
        },
        emergency: {
          limit: EMERGENCY_LEAVE_LIMIT,
          used: emergencyUsed,
          balance: EMERGENCY_LEAVE_LIMIT - emergencyUsed
        },
        totalBalance: (ANNUAL_LEAVE_LIMIT - plannedUsed) + (MEDICAL_LEAVE_LIMIT - medicalUsed) + (EMERGENCY_LEAVE_LIMIT - emergencyUsed)
      };
    });

    setLeaveData(balanceData);
  };

  const handleExport = () => {
    exportToExcel(filteredData, 'leave_balance_report');
    toast.success('Exported to Excel successfully!');
  };

  const getBalanceColor = (totalBalance) => {
    if (totalBalance > 10) return 'border-green-400';
    if (totalBalance > 0) return 'border-yellow-400';
    return 'border-red-400';
  };

  const getProgressColor = (used, limit) => {
    const percentage = (used / limit) * 100;
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Balance Report</h1>
          <p className="text-gray-600">Track employee leave usage and remaining balance for {moment().format('YYYY')}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Total Employees</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{leaveData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Avg Planned Leave Balance</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {(leaveData.reduce((sum, e) => sum + e.planned.balance, 0) / (leaveData.length || 1)).toFixed(1)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Avg Medical Leave Balance</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {(leaveData.reduce((sum, e) => sum + e.medical.balance, 0) / (leaveData.length || 1)).toFixed(1)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Employees With Zero Balance</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {leaveData.filter(e => e.totalBalance <= 0).length}
            </p>
          </div>
        </div>

        {/* Search and Export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Filters</h2>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              📊 Export Excel
            </button>
          </div>
          <input
            type="text"
            placeholder="Search by name, employee ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredData.length > 0 ? (
            filteredData.map(emp => (
              <div key={emp._id} className={`rounded-lg shadow p-6 border-2 ${getBalanceColor(emp.totalBalance)}`}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{emp.name}</h3>
                  <p className="text-sm text-gray-600">{emp.employeeId} • {emp.department}</p>
                </div>

                {/* Leave Types */}
                <div className="space-y-4">
                  {/* Planned Leave */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Planned Leave</span>
                      <span className="text-sm font-bold text-gray-800">
                        {emp.planned.balance}/{emp.planned.limit} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(emp.planned.used, emp.planned.limit)}`}
                        style={{ width: `${(emp.planned.used / emp.planned.limit) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Used: {emp.planned.used} days</p>
                  </div>

                  {/* Medical Leave */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Medical Leave</span>
                      <span className="text-sm font-bold text-gray-800">
                        {emp.medical.balance}/{emp.medical.limit} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(emp.medical.used, emp.medical.limit)}`}
                        style={{ width: `${(emp.medical.used / emp.medical.limit) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Used: {emp.medical.used} days</p>
                  </div>

                  {/* Emergency Leave */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Emergency Leave</span>
                      <span className="text-sm font-bold text-gray-800">
                        {emp.emergency.balance}/{emp.emergency.limit} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(emp.emergency.used, emp.emergency.limit)}`}
                        style={{ width: `${(emp.emergency.used / emp.emergency.limit) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Used: {emp.emergency.used} days</p>
                  </div>
                </div>

                {/* Total Balance */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total Balance</span>
                    <span className={`text-lg font-bold ${
                      emp.totalBalance > 10 ? 'text-green-600' :
                      emp.totalBalance > 5 ? 'text-yellow-600' :
                      emp.totalBalance <= 0 ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      {emp.totalBalance} days
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-gray-500">
              No employees found
            </div>
          )}
        </div>

        {filteredData.length > 0 && (
          <p className="text-sm text-gray-600 mt-6 text-center">
            Showing {filteredData.length} of {leaveData.length} employees
          </p>
        )}
      </div>
    </div>
  );
};

export default LeaveBalancePage;
