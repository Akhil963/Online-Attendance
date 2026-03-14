import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DepartmentInfoPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getDepartmentsWithCount();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const chartData = departments.map(dept => ({
    name: dept.name,
    count: dept.employeeCount || dept.count || 0
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Department Information</h1>

        {/* Department Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Employees by Department</h2>
          {departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Number of Employees" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600">No departments found</p>
          )}
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => (
            <div key={dept._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <h3 className="text-2xl font-bold">{dept.name}</h3>
                <p className="text-blue-100 text-sm mt-2">{dept.description}</p>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Total Employees</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{dept.employeeCount || dept.count || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {departments.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">No departments available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentInfoPage;
