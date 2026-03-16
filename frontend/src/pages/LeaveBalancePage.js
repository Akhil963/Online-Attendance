import React, { useState, useEffect, useCallback } from 'react';
import { leaveAPI, employeeAPI } from '../services/api';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'react-toastify';
import moment from 'moment';

const LEAVE_LIMITS = Object.freeze({
  planned: 20,
  medical: 10,
  emergency: 5
});

const getLeaveDaysWithinYear = (leave, year) => {
  const leaveStart = moment(leave.startDate).startOf('day');
  const leaveEnd = moment(leave.endDate).endOf('day');
  const yearStart = moment(`${year}-01-01`, 'YYYY-MM-DD').startOf('day');
  const yearEnd = moment(`${year}-12-31`, 'YYYY-MM-DD').endOf('day');

  if (!leaveStart.isValid() || !leaveEnd.isValid()) {
    return 0;
  }

  if (leaveEnd.isBefore(yearStart) || leaveStart.isAfter(yearEnd)) {
    return 0;
  }

  const overlapStart = moment.max(leaveStart, yearStart);
  const overlapEnd = moment.min(leaveEnd, yearEnd);
  return overlapEnd.diff(overlapStart, 'days') + 1;
};

const getAvailableYears = (leaves) => {
  const years = new Set([moment().format('YYYY')]);

  leaves.forEach((leave) => {
    const startYear = moment(leave.startDate).year();
    const endYear = moment(leave.endDate).year();

    if (Number.isFinite(startYear)) {
      years.add(String(startYear));
    }

    if (Number.isFinite(endYear)) {
      years.add(String(endYear));
    }
  });

  return Array.from(years).sort((left, right) => Number(right) - Number(left));
};

const buildExportRows = (data, year) => data.map((employee) => ({
  year,
  employeeId: employee.employeeId,
  name: employee.name,
  department: employee.department,
  plannedUsed: employee.planned.used,
  plannedBalance: employee.planned.balance,
  medicalUsed: employee.medical.used,
  medicalBalance: employee.medical.balance,
  emergencyUsed: employee.emergency.used,
  emergencyBalance: employee.emergency.balance,
  totalBalance: employee.totalBalance
}));

const LeaveBalancePage = () => {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [empResponse, leaveResponse] = await Promise.all([
        employeeAPI.getAllEmployees(),
        leaveAPI.getAllLeaves()
      ]);
      setEmployees(empResponse.data.employees || []);
      setLeaves(leaveResponse.data.leaves || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load leave balance data');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterData = useCallback(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const filtered = leaveData.filter((item) => {
      if (!normalizedSearchTerm) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(normalizedSearchTerm) ||
        item.employeeId.toLowerCase().includes(normalizedSearchTerm) ||
        item.department.toLowerCase().includes(normalizedSearchTerm)
      );
    });

    setFilteredData(filtered);
  }, [leaveData, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateLeaveBalance = useCallback((employeeList, leaveList, year) => {
    const balanceData = employeeList.map((employee) => {
      const employeeLeaves = leaveList.filter((leave) => {
        const leaveEmployeeId = leave.employeeId?._id || leave.employeeId;
        return String(leaveEmployeeId) === String(employee._id);
      });

      const usage = {
        planned: 0,
        medical: 0,
        emergency: 0
      };

      employeeLeaves.forEach((leave) => {
        if (leave.status !== 'approved') {
          return;
        }

        const daysUsed = getLeaveDaysWithinYear(leave, year);
        if (daysUsed <= 0) {
          return;
        }

        if (Object.prototype.hasOwnProperty.call(usage, leave.leaveType)) {
          usage[leave.leaveType] += daysUsed;
        }
      });

      const plannedBalance = LEAVE_LIMITS.planned - usage.planned;
      const medicalBalance = LEAVE_LIMITS.medical - usage.medical;
      const emergencyBalance = LEAVE_LIMITS.emergency - usage.emergency;

      return {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department?.name || employee.designation || '-',
        planned: {
          limit: LEAVE_LIMITS.planned,
          used: usage.planned,
          balance: plannedBalance
        },
        medical: {
          limit: LEAVE_LIMITS.medical,
          used: usage.medical,
          balance: medicalBalance
        },
        emergency: {
          limit: LEAVE_LIMITS.emergency,
          used: usage.emergency,
          balance: emergencyBalance
        },
        totalBalance: plannedBalance + medicalBalance + emergencyBalance
      };
    });

    balanceData.sort((left, right) => left.name.localeCompare(right.name));
    setLeaveData(balanceData);
  }, []);

  useEffect(() => {
    calculateLeaveBalance(employees, leaves, selectedYear);
  }, [employees, leaves, selectedYear, calculateLeaveBalance]);

  useEffect(() => {
    filterData();
  }, [leaveData, searchTerm, filterData]);

  const handleExport = () => {
    exportToExcel(buildExportRows(filteredData, selectedYear), `leave_balance_report_${selectedYear}`);
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

  const getProgressWidth = (used, limit) => {
    if (!limit) {
      return '0%';
    }

    return `${Math.min((used / limit) * 100, 100)}%`;
  };

  const availableYears = getAvailableYears(leaves);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading leave balance report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Balance Report</h1>
          <p className="text-gray-600">Track employee leave usage and remaining balance for {selectedYear}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by name, employee ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
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
                        style={{ width: getProgressWidth(emp.planned.used, emp.planned.limit) }}
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
                        style={{ width: getProgressWidth(emp.medical.used, emp.medical.limit) }}
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
                        style={{ width: getProgressWidth(emp.emergency.used, emp.emergency.limit) }}
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
