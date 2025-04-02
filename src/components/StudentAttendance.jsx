/**
 * StudentAttendance Component
 * 
 * A component that displays a student's attendance records and statistics.
 * It fetches attendance data from the server and displays it in a modern, card-based layout.
 * 
 * Features:
 * - Today's attendance status
 * - Attendance statistics (Present, Late, Medical, Absent)
 * - Overall attendance percentage
 * - Responsive design with Material-UI components
 * 
 * API Endpoint: GET /api/attendance/student/:id
 * 
 * Expected Response:
 * {
 *   "success": true,
 *   "student": {
 *     "user_id": number,
 *     "name": string,
 *     "year": string,
 *     "group_name": string,
 *     "today": string, // "Present", "Absent", "Late", "Medical", "Early", or "Pending"
 *     "stats": {
 *       "present": number,
 *       "absent": number,
 *       "late": number,
 *       "medical": number,
 *       "early": number,
 *       "total": number,
 *       "percentage": string // e.g., "95.5%"
 *     }
 *   }
 * }
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  alpha,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import {
  CheckCircle,
  AccessTime,
  LocalHospital,
  Cancel,
  CalendarToday,
} from "@mui/icons-material";
import { XCircle, Clock } from 'lucide-react';
import { API_URL } from '../config';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches attendance data for the current student from the server.
   * Uses the student's ID from localStorage to make the API request.
   * 
   * @throws {Error} If user data is not found in localStorage or if the API request fails
   */
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          throw new Error('User data not found');
        }

        const response = await fetch(`${API_URL}/api/attendance/student/${userData.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Check if data has the expected structure
        if (!data || !data.success || !data.student) {
          console.error('Invalid response format:', data);
          throw new Error('Invalid response format');
        }

        setAttendance(data.student);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: alpha('#f44336', 0.1),
          color: '#d32f2f',
          border: '1px solid',
          borderColor: alpha('#f44336', 0.2),
        }}
      >
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!attendance) {
    return (
      <Box 
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No attendance records found.
        </Typography>
      </Box>
    );
  }

  /**
   * Returns the appropriate color for a given attendance status.
   * 
   * @param {string} status - The attendance status ("Present", "Late", "Medical", "Absent", or "Pending")
   * @returns {string} The color code in hex format
   */
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "present":
        return "#4CAF50";
      case "late":
        return "#FF9800";
      case "medical":
        return "#9C27B0";
      case "absent":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  /**
   * Returns the appropriate icon component for a given attendance status.
   * 
   * @param {string} status - The attendance status ("Present", "Late", "Medical", "Absent", or "Pending")
   * @returns {JSX.Element} The Material-UI icon component
   */
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "present":
        return <CheckCircle />;
      case "late":
        return <AccessTime />;
      case "medical":
        return <LocalHospital />;
      case "absent":
        return <Cancel />;
      default:
        return <AccessTime />;
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" fontWeight="bold" fontSize="1.5rem" mb={4}>
        Attendance Overview
      </Typography>

      {/* Today's Status Card */}
      <Card 
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Today's Status
            </Typography>
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: getStatusColor(attendance.today),
                bgcolor: alpha(getStatusColor(attendance.today), 0.1),
                px: 2,
                py: 1,
                borderRadius: 2,
              }}
            >
              {getStatusIcon(attendance.today)}
              <Typography variant="subtitle1" fontWeight="500">
                {attendance.today || "Pending"}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" alignItems="center" gap={1} color="text.secondary">
            <CalendarToday fontSize="small" />
            <Typography variant="body2">
              {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Attendance Summary Cards Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderColor: '#4CAF50'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CheckCircle sx={{ color: "#4CAF50" }} />
                <Typography variant="subtitle1" fontWeight="500">Present</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                {attendance.stats.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderColor: '#FF9800'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccessTime sx={{ color: "#FF9800" }} />
                <Typography variant="subtitle1" fontWeight="500">Late</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                {attendance.stats.late}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderColor: '#9C27B0'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LocalHospital sx={{ color: "#9C27B0" }} />
                <Typography variant="subtitle1" fontWeight="500">Medical</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                {attendance.stats.medical}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderColor: '#F44336'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Cancel sx={{ color: "#F44336" }} />
                <Typography variant="subtitle1" fontWeight="500">Absent</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                {attendance.stats.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Overall Attendance Percentage */}
      <Card 
        elevation={0}
        sx={{
          mt: 4,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Overall Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on {attendance.stats.total} total days
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#4CAF50',
              bgcolor: alpha('#4CAF50', 0.1),
              px: 3,
              py: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {attendance.stats.percentage}
            </Typography>
            <Typography variant="subtitle1" fontWeight="500">
              Attendance Rate
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentAttendance; 