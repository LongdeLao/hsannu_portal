import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-600 mb-4">Welcome to the admin panel. Here you can manage the system settings and users.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className="border border-gray-200 rounded-lg p-4 hover:border-black hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate('/staff/admin/users')}
          >
            <h3 className="font-semibold text-gray-800 text-lg">User Management</h3>
            <p className="text-sm text-gray-600 mt-2">Add, edit, or remove user accounts</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-black hover:shadow-md transition-all cursor-pointer">
            <h3 className="font-semibold text-gray-800 text-lg">Role Management</h3>
            <p className="text-sm text-gray-600 mt-2">Manage user roles and permissions</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-black hover:shadow-md transition-all cursor-pointer">
            <h3 className="font-semibold text-gray-800 text-lg">System Settings</h3>
            <p className="text-sm text-gray-600 mt-2">Configure global system settings</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-black hover:shadow-md transition-all cursor-pointer">
            <h3 className="font-semibold text-gray-800 text-lg">Reports</h3>
            <p className="text-sm text-gray-600 mt-2">Access system reports and statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 