/**
 * StaffAttendance Component
 * 
 * A component that allows staff members to manage student attendance.
 * It provides functionality to view year groups, take attendance for specific classes,
 * and update attendance records for multiple students at once.
 * 
 * API Endpoints Used:
 * 1. GET /api/attendance/year-groups
 *    Response: {
 *      "success": true,
 *      "yearGroups": [
 *        {
 *          "id": string,      // e.g., "pib-a"
 *          "name": string,    // e.g., "PIB A"
 *          "year": string,    // e.g., "PIB"
 *          "section": string, // e.g., "A"
 *          "students": number,
 *          "attendance": string // e.g., "95.5%"
 *        }
 *      ]
 *    }
 * 
 * 2. GET /api/attendance/students/:id
 *    Response: {
 *      "success": true,
 *      "yearGroup": {
 *        "year": string,
 *        "section": string,
 *        "fullName": string
 *      },
 *      "students": [
 *        {
 *          "user_id": number,
 *          "name": string,
 *          "year": string,
 *          "group_name": string,
 *          "today": string,
 *          "present": number,
 *          "absent": number,
 *          "late": number,
 *          "medical": number,
 *          "early": number
 *        }
 *      ],
 *      "date": string
 *    }
 * 
 * 3. POST /api/attendance/update
 *    Request Body: {
 *      "yearGroupId": string,
 *      "date": string,
 *      "students": [
 *        {
 *          "user_id": number,
 *          "status": string // "Present", "Absent", "Late", "Medical", "Early", or "Pending"
 *        }
 *      ]
 *    }
 *    Response: {
 *      "success": true,
 *      "message": string,
 *      "updatedCount": number
 *    }
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  alpha,
  InputBase,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, X, ArrowLeft } from 'lucide-react';
import SearchBar from './SearchBar';
import { API_URL } from '../config';

const StaffAttendance = () => {
  const [yearGroups, setYearGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const canMarkAttendance = userData.additional_roles?.includes('attendance');

  // Fetch year groups on component mount
  useEffect(() => {
    fetchYearGroups();
  }, []);

  // Fetch students when a class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  // Filter students based on search query
  useEffect(() => {
    if (searchQuery && students.length > 0) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) => student.name.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  /**
   * Fetches all year groups and their attendance statistics from the server.
   * Called when the component mounts.
   * 
   * @throws {Error} If the API request fails
   */
  const fetchYearGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/attendance/year-groups`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setYearGroups(data.yearGroups);
      } else {
        throw new Error(data.message || "Failed to fetch year groups");
      }
    } catch (err) {
      console.error("Error fetching year groups:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches students for a specific year group from the server.
   * Called when a class is selected.
   * 
   * @param {string} classId - The year group ID (e.g., "pib-a")
   * @throws {Error} If the API request fails
   */
  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/attendance/students/${classId}`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
        setFilteredStudents(data.students);
      } else {
        throw new Error(data.message || "Failed to fetch students");
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates a student's attendance status in the local state.
   * 
   * @param {number} userId - The student's user ID
   * @param {string|null} status - The new attendance status or null to reset to "Pending"
   */
  const markAttendance = (userId, status) => {
    // If resetting status, explicitly set it to "Pending" instead of null
    const actualStatus = status === null ? "Pending" : status;
    
    const updatedStudents = students.map(student => 
      student.user_id === userId ? { ...student, today: actualStatus } : student
    );
    setStudents(updatedStudents);
    
    // Also update filtered students
    setFilteredStudents(filteredStudents.map(student => 
      student.user_id === userId ? { ...student, today: actualStatus } : student
    ));
    
    setSaveSuccess(false);
  };

  /**
   * Saves all attendance changes to the server.
   * Updates the attendance status for all students in the selected class.
   * 
   * @throws {Error} If the API request fails or if there are no valid students to update
   */
  const saveAttendance = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Filter out any invalid students and ensure valid user_id values
      const studentsToUpdate = students
        .filter(student => student && typeof student.user_id === 'number' && student.user_id > 0)
        .map(student => ({
          user_id: student.user_id,
          status: student.today || "Pending" // Use "Pending" for null or undefined values
        }));
      
      // Check if we have any valid students to update
      if (studentsToUpdate.length === 0) {
        setSaveError("No valid students to update");
        setIsSaving(false);
        return;
      }
      
      // Prepare the request payload
      const payload = {
        yearGroupId: selectedClass,
        date: new Date().toISOString().split('T')[0],
        students: studentsToUpdate
      };
      
      console.log("Sending attendance data:", JSON.stringify(payload));
      
      const response = await fetch(`${API_URL}/api/attendance/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      // First try to get the response as text
      const responseText = await response.text();
      console.log("Server response:", responseText);
      
      // If the response is not OK, throw an error with details
      if (!response.ok) {
        // Try to parse the response text as JSON if possible
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || `Server returned ${response.status} ${response.statusText}`);
        } catch (jsonError) {
          // If we can't parse as JSON, just use the response text
          throw new Error(`Server returned ${response.status} ${response.statusText}: ${responseText}`);
        }
      }
      
      // Try to parse the response text as JSON
      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          setSaveSuccess(true);
          // Refresh student data after successful save
          fetchStudents(selectedClass);
        } else {
          throw new Error(data.message || "Failed to save attendance");
        }
      } catch (jsonError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles navigation back to the year groups list.
   * Resets the selected class and related state.
   */
  const handleBack = () => {
    // Return to class list view instead of dashboard
    setSelectedClass(null);
  };

  // Get selected class info
  const selectedClassInfo = yearGroups.find(group => group.id === selectedClass);
  
  // Column width definitions for consistency
  const columnWidths = {
    name: '25%',
    status: '15%',
    present: '10%',
    absent: '10%',
    late: '10%',
    medical: '10%',
    actions: '20%'
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        p: 3,
        pt: 3,
        pb: 0
      }}
    >
      {/* Back button - only show when inside taking attendance */}
      {selectedClass && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2
          }}
        >
          <IconButton 
            onClick={handleBack}
            sx={{ 
              mr: 2,
              color: 'text.primary',
              bgcolor: 'rgba(0, 0, 0, 0.03)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.06)'
              }
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
        </Box>
      )}
      
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" fontSize="1.5rem">
          Staff Attendance
        </Typography>
        
        {selectedClass && (
          <Button 
            onClick={() => setSelectedClass(null)}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              height: '42px',
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.08)',
              color: 'text.primary',
              '&:hover': { 
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              },
              whiteSpace: 'nowrap'
            }}
          >
            Back to Classes
          </Button>
        )}
      </Box>
      
      {error && (
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
      )}
      
      {selectedClass && (
        <Box mb={2}>
          <Typography variant="h5" fontWeight="semibold">
            {selectedClassInfo?.name} Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Mark attendance for today: {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      )}
      
      {selectedClass && (
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2
          }}
        >  
          <Box display="flex" alignItems="center" gap={2} width="100%">
            {/* Using the reusable SearchBar component */}
            <SearchBar 
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              width={{ xs: '100%', md: '450px' }}
            />

            {canMarkAttendance && (
              <Button 
                onClick={saveAttendance}
                disabled={isSaving}
                variant="contained"
                sx={{ 
                  bgcolor: 'black', 
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  height: '42px',
                  whiteSpace: 'nowrap'
                }}
              >
                {isSaving ? 'Saving...' : 'Save Attendance'}
              </Button>
            )}
          </Box>
        </Box>
      )}
          
      {saveSuccess && (
        <Box 
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            backgroundColor: alpha('#4caf50', 0.1),
            color: '#2e7d32',
            border: '1px solid',
            borderColor: alpha('#4caf50', 0.2),
          }}
        >
          <Typography>Attendance saved successfully!</Typography>
        </Box>
      )}
      
      {saveError && (
        <Box 
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            backgroundColor: alpha('#f44336', 0.1),
            color: '#d32f2f',
            border: '1px solid',
            borderColor: alpha('#f44336', 0.2),
          }}
        >
          <Typography>{saveError}</Typography>
        </Box>
      )}
      
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          mb: 1
        }}
      >
        {loading && !selectedClass ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <CircularProgress />
          </Box>
        ) : selectedClass ? (
          <>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                <CircularProgress />
              </Box>
            ) : filteredStudents.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                <Typography variant="subtitle1" color="text.secondary">
                  {students.length === 0 ? "No students found in this class." : "No students match your search."}
                </Typography>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                {/* Header Row */}
                <Box 
                  sx={{
                    display: 'flex',
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    py: 1.5,
                    px: 2,
                    mb: 0.5
                  }}
                >
                  <Box width={columnWidths.name} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Name</Box>
                  <Box width={columnWidths.status} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Status</Box>
                  <Box width={columnWidths.present} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Present</Box>
                  <Box width={columnWidths.absent} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Absent</Box>
                  <Box width={columnWidths.late} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Late</Box>
                  <Box width={columnWidths.medical} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Medical</Box>
                  {canMarkAttendance && (
                    <Box width={columnWidths.actions} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Actions</Box>
                  )}
                </Box>

                {/* Data List Container */}
                <Box 
                  sx={{ 
                    flex: 1,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      display: 'none'
                    },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                  }}
                >
                  {filteredStudents.map((student) => (
                    <Box 
                      key={student.user_id}
                      sx={{
                        display: 'flex',
                        py: 2,
                        px: 2,
                        borderBottom: '1px solid',
                        borderColor: 'rgba(0, 0, 0, 0.04)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.01)'
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <Box width={columnWidths.name}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{student.name}</Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          ID: {student.user_id}
                        </Typography>
                      </Box>
                      <Box width={columnWidths.status} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={student.today || 'Pending'} 
                          size="small"
                          sx={{
                            backgroundColor: 
                              student.today === 'Present' ? alpha('#4caf50', 0.1) : 
                              student.today === 'Absent' ? alpha('#f44336', 0.1) : 
                              student.today === 'Late' ? alpha('#ff9800', 0.1) : 
                              student.today === 'Medical' ? alpha('#2196f3', 0.1) : 
                              alpha('#9e9e9e', 0.1),
                            color: 
                              student.today === 'Present' ? '#2e7d32' : 
                              student.today === 'Absent' ? '#d32f2f' : 
                              student.today === 'Late' ? '#e65100' : 
                              student.today === 'Medical' ? '#0d47a1' : 
                              '#616161',
                            fontWeight: 500,
                            minWidth: '75px',
                            justifyContent: 'center'
                          }}
                        />
                        {canMarkAttendance && student.today && student.today !== 'Pending' ? (
                          <Box 
                            component="button"
                            onClick={() => markAttendance(student.user_id, null)}
                            sx={{ 
                              ml: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#d32f2f',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              p: 0.5,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              '&:hover': { 
                                backgroundColor: alpha('#f44336', 0.1)
                              }
                            }}
                            title="Reset to pending"
                          >
                            <X size={14} />
                          </Box>
                        ) : (
                          <Box sx={{ ml: 1, width: 24 }} /> 
                        )}
                      </Box>
                      <Box width={columnWidths.present} sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{student.present}</Box>
                      <Box width={columnWidths.absent} sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{student.absent}</Box>
                      <Box width={columnWidths.late} sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{student.late}</Box>
                      <Box width={columnWidths.medical} sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{student.medical}</Box>
                      {canMarkAttendance && (
                        <Box width={columnWidths.actions} sx={{ textAlign: 'left' }}>
                          <Button 
                            onClick={() => markAttendance(student.user_id, 'Present')}
                            size="small"
                            sx={{ 
                              mr: 0.5,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              backgroundColor: student.today === 'Present' ? '#4caf50' : alpha('#4caf50', 0.1),
                              color: student.today === 'Present' ? 'white' : '#2e7d32',
                              '&:hover': {
                                backgroundColor: student.today === 'Present' ? '#43a047' : alpha('#4caf50', 0.2)
                              }
                            }}
                          >
                            Present
                          </Button>
                          <Button 
                            onClick={() => markAttendance(student.user_id, 'Absent')}
                            size="small"
                            sx={{ 
                              mr: 0.5,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              backgroundColor: student.today === 'Absent' ? '#f44336' : alpha('#f44336', 0.1),
                              color: student.today === 'Absent' ? 'white' : '#d32f2f',
                              '&:hover': {
                                backgroundColor: student.today === 'Absent' ? '#e53935' : alpha('#f44336', 0.2)
                              }
                            }}
                          >
                            Absent
                          </Button>
                          <Button 
                            onClick={() => markAttendance(student.user_id, 'Late')}
                            size="small"
                            sx={{ 
                              mr: 0.5,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              backgroundColor: student.today === 'Late' ? '#ff9800' : alpha('#ff9800', 0.1),
                              color: student.today === 'Late' ? 'white' : '#e65100',
                              '&:hover': {
                                backgroundColor: student.today === 'Late' ? '#fb8c00' : alpha('#ff9800', 0.2)
                              }
                            }}
                          >
                            Late
                          </Button>
                          <Button 
                            onClick={() => markAttendance(student.user_id, 'Medical')}
                            size="small"
                            sx={{ 
                              mr: 0.5,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              backgroundColor: student.today === 'Medical' ? '#2196f3' : alpha('#2196f3', 0.1),
                              color: student.today === 'Medical' ? 'white' : '#0d47a1',
                              '&:hover': {
                                backgroundColor: student.today === 'Medical' ? '#1e88e5' : alpha('#2196f3', 0.2)
                              }
                            }}
                          >
                            Medical
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none'  // Hide scrollbar for Chrome, Safari and Opera
            },
            msOverflowStyle: 'none',  // Hide scrollbar for IE and Edge
            scrollbarWidth: 'none'  // Hide scrollbar for Firefox
          }}>
            <Typography variant="h5" fontWeight="semibold" mb={1}>
              Class Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Select a class to view or mark attendance:
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {yearGroups.map((group) => (
                <Box 
                  key={group.id}
                  onClick={() => setSelectedClass(group.id)}
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'black',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight="semibold">{group.name}</Typography>
                    <Chip 
                      label={group.attendance}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#2196f3', 0.1),
                        color: '#0d47a1',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {group.students} students
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClass(group.id);
                      }}
                      sx={{
                        color: 'black',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      View Students
                    </Button>
                    {canMarkAttendance && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClass(group.id);
                        }}
                        sx={{
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          color: 'black',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          borderRadius: 2,
                          px: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.08)'
                          }
                        }}
                      >
                        Take Attendance
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Attendance Overview Section */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="h4" fontWeight="bold" mb={3}>
                Today's Attendance Overview
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                {/* Late Students */}
                <Box sx={{ 
                  p: 4,
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  borderRadius: 2,
                  backgroundColor: alpha('#ff9800', 0.02)
                }}>
                  <Typography variant="h5" fontWeight="bold" mb={3} color="#e65100">
                    Late Students
                  </Typography>
                  {yearGroups.map((group) => (
                    group.late_students?.length > 0 && (
                      <Box key={group.id} sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="semibold" mb={2}>
                          {group.name}
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          {group.late_students.map((student) => (
                            <Typography 
                              key={student.user_id} 
                              variant="body1" 
                              color="text.secondary"
                              sx={{ mb: 1.5, fontSize: '1.1rem' }}
                            >
                              {student.name}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )
                  ))}
                  {!yearGroups.some(group => group.late_students?.length > 0) && (
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                      No late students today
                    </Typography>
                  )}
                </Box>

                {/* Absent and Medical Students */}
                <Box sx={{ 
                  p: 4,
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  borderRadius: 2,
                  backgroundColor: alpha('#f44336', 0.02)
                }}>
                  <Typography variant="h5" fontWeight="bold" mb={3} color="#d32f2f">
                    Absent & Medical Leave
                  </Typography>
                  {yearGroups.map((group) => (
                    (group.absent_students?.length > 0 || group.medical_students?.length > 0) && (
                      <Box key={group.id} sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="semibold" mb={2}>
                          {group.name}
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          {group.absent_students?.map((student) => (
                            <Typography 
                              key={student.user_id} 
                              variant="body1" 
                              color="text.secondary"
                              sx={{ mb: 1.5, fontSize: '1.1rem' }}
                            >
                              {student.name} (Absent)
                            </Typography>
                          ))}
                          {group.medical_students?.map((student) => (
                            <Typography 
                              key={student.user_id} 
                              variant="body1" 
                              color="text.secondary"
                              sx={{ mb: 1.5, fontSize: '1.1rem' }}
                            >
                              {student.name} (Medical)
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )
                  ))}
                  {!yearGroups.some(group => group.absent_students?.length > 0 || group.medical_students?.length > 0) && (
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                      No absent or medical leave students today
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        py={1}
        borderTop="1px solid"
        borderColor="rgba(0, 0, 0, 0.08)"
      >
        <Typography variant="caption" color="text.secondary">
          {selectedClass && filteredStudents.length > 0 ? `Showing ${filteredStudents.length} of ${students.length} students` : ""}
        </Typography>
      </Box>
    </Box>
  );
};

export default StaffAttendance; 