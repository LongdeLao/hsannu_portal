import React from 'react';
import { Box } from '@mui/material';

function Dashboard() {
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
        <Box className="bg-white p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p>Welcome to your dashboard!</p>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
