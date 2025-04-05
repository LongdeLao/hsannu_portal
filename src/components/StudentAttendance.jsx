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
  CircularProgress,
  Alert,
  alpha,
  Card,
  CardContent,
  Divider,
  Chip,
  useTheme,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  AccessTime,
  LocalHospital,
  Cancel,
  Timeline,
  Event,
} from "@mui/icons-material";
import { API_URL } from '../config';
import { BarChart } from './ui/bar-chart';

// AttendanceChart component
const AttendanceChart = ({ studentId }) => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/attendance/history/${studentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.success) {
          throw new Error(data.message || 'Failed to fetch attendance history');
        }
        
        setAttendanceHistory(data.records || []);
        processChartData(data.records || []);
      } catch (error) {
        console.error('Error fetching attendance history:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAttendanceHistory();
    }
  }, [studentId]);

  // Process the attendance data for the chart
  const processChartData = (records) => {
    if (!records || records.length === 0) {
      setChartData(null);
      return;
    }

    // Group records by month
    const monthlyData = {};
    const statusCounts = {
      'present': 0,
      'late': 0,
      'absent': 0,
      'medical': 0,
      'early': 0
    };

    records.forEach(record => {
      const date = new Date(record.attendance_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { ...statusCounts };
      }
      
      // Lowercase the status to ensure consistent keys
      const status = record.status.toLowerCase();
      if (statusCounts.hasOwnProperty(status)) {
        monthlyData[monthYear][status]++;
      }
    });

    // Convert to chart format
    const months = Object.keys(monthlyData).sort();
    const chartData = {
      labels: months.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      }),
      datasets: [
        {
          label: 'Present',
          data: months.map(month => monthlyData[month].present),
          backgroundColor: '#96C896'
        },
        {
          label: 'Late',
          data: months.map(month => monthlyData[month].late),
          backgroundColor: '#FFC078'
        },
        {
          label: 'Early',
          data: months.map(month => monthlyData[month].early),
          backgroundColor: '#82C3F5'
        },
        {
          label: 'Medical',
          data: months.map(month => monthlyData[month].medical),
          backgroundColor: '#B482BE'
        },
        {
          label: 'Absent',
          data: months.map(month => monthlyData[month].absent),
          backgroundColor: '#F58282'
        }
      ]
    };

    setChartData(chartData);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress size={30} thickness={3} sx={{ color: 'black' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!chartData) {
    return (
      <Box 
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No attendance history available
        </Typography>
      </Box>
    );
  }

  return (
    <Card 
      elevation={0}
      sx={{
        borderRadius: 4,
        mb: 4,
        bgcolor: 'white',
        color: 'black',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="600" mb={3}>
          Monthly Attendance History
        </Typography>
        
        <Box sx={{ height: 300, width: '100%' }}>
          <BarChart 
            data={chartData} 
            options={{
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                  beginAtZero: true,
                }
              }
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

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
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" py={12} gap={3}>
        <CircularProgress size={42} thickness={3} sx={{ color: 'black' }} />
        <Typography variant="body2" color="text.secondary">
          Loading your attendance data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        variant="filled"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(211, 47, 47, 0.95)',
        }}
      >
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  if (!attendance) {
    return (
      <Box 
        sx={{
          p: 8,
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 2,
        }}
      >
        <Event sx={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.2)', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" fontWeight="500">
          No attendance records found
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Check back later or contact your administrator
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
    // Using black for all status types
    return "#000000";
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

  // Calculate percentage for progress bar
  const attendancePercentage = parseFloat(attendance.stats.percentage.replace('%', ''));

  // Get attendance rating text
  const getAttendanceRating = () => {
    if (attendancePercentage >= 90) return 'Excellent';
    if (attendancePercentage >= 75) return 'Good';
    if (attendancePercentage >= 50) return 'Average';
    return 'Needs improvement';
  };

  // Get color based on attendance percentage
  const getPercentageColor = () => {
    // Using black for all percentages
    return "#000000";
  };

  return (
    <Box px={3} py={4} sx={{ maxWidth: '1100px', mx: 'auto' }}>
      <Box mb={4.5} display="flex" justifyContent="space-between" alignItems="center">
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="700" 
          fontSize={{ xs: '1.5rem', md: '1.75rem' }}
        >
          Attendance
        </Typography>
        
        <Chip 
          icon={<Timeline sx={{ fontSize: 16 }} />} 
          label="Updated today" 
          size="small" 
          sx={{ 
            borderRadius: '16px',
            bgcolor: 'rgba(0, 0, 0, 0.05)',
            color: 'rgba(0, 0, 0, 0.7)',
            height: 28,
            '.MuiChip-icon': {
              color: 'black'
            }
          }} 
        />
      </Box>

      {/* Main attendance status card - Simplified */}
      <Card 
        elevation={0}
        sx={{
          borderRadius: 4,
          mb: 4,
          bgcolor: 'white',
          color: 'black',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 }, position: 'relative', zIndex: 2 }}>
          {/* Today's status section - align left and horizontal layout */}
          <Box py={2}>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1, mb: 2, display: 'block' }}>
              TODAY'S STATUS
            </Typography>
            
            <Box display="flex" alignItems="center" mt={1}>
              <Box 
                sx={{
                  mr: 3,
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  color: 'black',
                }}
              >
                {getStatusIcon(attendance.today)}
              </Box>
              
              <Typography variant="h3" fontWeight="700">
                {attendance.today || "Pending"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
      
      {/* Stats heading */}
      <Typography variant="h6" fontWeight="600" mb={3}>
        Attendance Breakdown
      </Typography>
      
      {/* Attendance stats cards - full width cards */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          mb: 4,
          gap: 2
        }}
      >
        {/* Present card */}
        <Card 
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid rgba(0,0,0,0.06)',
            flexGrow: 1,
            width: '25%',
            transition: 'all 0.2s',
            '&:hover': { 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* First row: Icon + Status */}
            <Box display="flex" alignItems="center" mb={2}>
              <Box 
                sx={{
                  borderRadius: '50%',
                  height: 36,
                  width: 36,
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(150, 200, 150, 0.2)',
                  color: '#96C896',
                }}
              >
                <CheckCircle fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ color: '#96C896', fontWeight: '500' }}>
                Present
              </Typography>
            </Box>
            
            {/* Second row: Number + Days side by side */}
            <Box display="flex" alignItems="baseline">
              <Typography variant="h3" sx={{ fontWeight: "800", color: 'black', mr: 1 }}>
                {attendance.stats.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Late card */}
        <Card 
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid rgba(0,0,0,0.06)',
            flexGrow: 1,
            width: '25%',
            transition: 'all 0.2s',
            '&:hover': { 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* First row: Icon + Status */}
            <Box display="flex" alignItems="center" mb={2}>
              <Box 
                sx={{
                  borderRadius: '50%',
                  height: 36,
                  width: 36,
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 192, 120, 0.2)',
                  color: '#FFC078',
                }}
              >
                <AccessTime fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ color: '#FFC078', fontWeight: '500' }}>
                Late
              </Typography>
            </Box>
            
            {/* Second row: Number + Days side by side */}
            <Box display="flex" alignItems="baseline">
              <Typography variant="h3" sx={{ fontWeight: "800", color: 'black', mr: 1 }}>
                {attendance.stats.late}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Medical card */}
        <Card 
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid rgba(0,0,0,0.06)',
            flexGrow: 1,
            width: '25%',
            transition: 'all 0.2s',
            '&:hover': { 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* First row: Icon + Status */}
            <Box display="flex" alignItems="center" mb={2}>
              <Box 
                sx={{
                  borderRadius: '50%',
                  height: 36,
                  width: 36,
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(180, 130, 190, 0.2)',
                  color: '#B482BE',
                }}
              >
                <LocalHospital fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ color: '#B482BE', fontWeight: '500' }}>
                Medical
              </Typography>
            </Box>
            
            {/* Second row: Number + Days side by side */}
            <Box display="flex" alignItems="baseline">
              <Typography variant="h3" sx={{ fontWeight: "800", color: 'black', mr: 1 }}>
                {attendance.stats.medical}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Absent card */}
        <Card 
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid rgba(0,0,0,0.06)',
            flexGrow: 1,
            width: '25%',
            transition: 'all 0.2s',
            '&:hover': { 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* First row: Icon + Status */}
            <Box display="flex" alignItems="center" mb={2}>
              <Box 
                sx={{
                  borderRadius: '50%',
                  height: 36,
                  width: 36,
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(245, 130, 130, 0.2)',
                  color: '#F58282',
                }}
              >
                <Cancel fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ color: '#F58282', fontWeight: '500' }}>
                Absent
              </Typography>
            </Box>
            
            {/* Second row: Number + Days side by side */}
            <Box display="flex" alignItems="baseline">
              <Typography variant="h3" sx={{ fontWeight: "800", color: 'black', mr: 1 }}>
                {attendance.stats.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Attendance Chart Section */}
      {attendance && attendance.user_id && (
        <AttendanceChart studentId={attendance.user_id} />
      )}

      {/* Bottom note */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          These records are updated daily at midnight. For any discrepancies, please contact the administrator.
        </Typography>
      </Box>
    </Box>
  );
};

export default StudentAttendance; 