import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

const AdminPanel = () => {
  const navigate = useNavigate();
  
  return (
    <Box 
      className="flex flex-col min-h-screen mx-10"
      sx={{
        '& .MuiBox-root': {
          maxWidth: '100%'
        }
      }}
    >
      <Box className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <Box className="bg-white">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
            <p className="text-black/70 mb-6">Welcome to the admin panel. Here you can manage the system settings and users.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="bg-white p-6 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate('/staff/admin/users')}
              >
                <h3 className="font-semibold text-gray-800 text-lg">User Management</h3>
                <p className="text-sm text-gray-600 mt-2">Add, edit, or remove user accounts</p>
              </div>
              <div className="bg-white p-6 hover:shadow-md transition-all cursor-pointer">
                <h3 className="font-semibold text-gray-800 text-lg">Role Management</h3>
                <p className="text-sm text-gray-600 mt-2">Manage user roles and permissions</p>
              </div>
              <div className="bg-white p-6 hover:shadow-md transition-all cursor-pointer">
                <h3 className="font-semibold text-gray-800 text-lg">System Settings</h3>
                <p className="text-sm text-gray-600 mt-2">Configure global system settings</p>
              </div>
              <div className="bg-white p-6 hover:shadow-md transition-all cursor-pointer">
                <h3 className="font-semibold text-gray-800 text-lg">Reports</h3>
                <p className="text-sm text-gray-600 mt-2">Access system reports and statistics</p>
              </div>
            </div>
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPanel; 