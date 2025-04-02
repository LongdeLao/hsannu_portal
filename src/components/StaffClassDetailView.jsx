/**
 * StaffClassDetailView component for displaying detailed information about a class
 * 
 * This component:
 * 1. Receives class details via props or URL parameters
 * 2. Displays comprehensive information about the class
 * 3. Shows a complete list of all students in the class with details
 * 
 * @returns {JSX.Element} The StaffClassDetailView component
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button,
  IconButton,
  Paper, 
  Chip,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  alpha,
  Card,
  CardContent
} from '@mui/material';
import { ArrowLeft, UserPlus, Mail, Download } from 'lucide-react';
import SearchBar from './SearchBar';
import { API_URL } from '../config';

const StaffClassDetailView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentProfiles, setStudentProfiles] = useState({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if class data was passed via location state
  useEffect(() => {
    if (location.state?.classData) {
      const data = location.state.classData;
      setClassDetails(data);
      setFilteredStudents(data.students || []);
      setLoading(false);
      
      // Fetch student profile pictures
      if (data.students && data.students.length > 0) {
        const studentIds = data.students.map(student => student.id);
        fetchStudentProfiles(studentIds);
      }
    } else if (classId) {
      // Otherwise, fetch the data using the classId from URL params
      fetchClassDetails(classId);
    } else {
      setError("No class information provided");
      setLoading(false);
    }
  }, [location.state, classId]);
  
  // Fetch student profile information including profile pictures
  const fetchStudentProfiles = async (studentIds) => {
    if (!studentIds.length) return;
    
    setLoadingProfiles(true);
    const profiles = {};
    
    try {
      // Fetch profiles for each student
      const promises = studentIds.map(id => 
        fetch(`${API_URL}/api/profile/${id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              profiles[id] = data;
            }
          })
          .catch(err => console.error(`Error fetching profile for student ${id}:`, err))
      );
      
      await Promise.all(promises);
      setStudentProfiles(profiles);
    } catch (err) {
      console.error("Error fetching student profiles:", err);
    } finally {
      setLoadingProfiles(false);
    }
  };
  
  // Filter students when search query changes
  useEffect(() => {
    if (!classDetails) return;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = classDetails.students.filter(student => 
        student.name?.toLowerCase().includes(query) || 
        student.last_name?.toLowerCase().includes(query) || 
        String(student.id).includes(query)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(classDetails.students || []);
    }
  }, [searchQuery, classDetails]);
  
  // Fetch class details from the API
  const fetchClassDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/get_class_details/${id}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setClassDetails(data);
      setFilteredStudents(data.students || []);
      
      // Fetch student profile pictures
      if (data.students && data.students.length > 0) {
        const studentIds = data.students.map(student => student.id);
        fetchStudentProfiles(studentIds);
      }
    } catch (err) {
      console.error("Error fetching class details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Get student avatar with profile picture or fallback to initials
  const getStudentAvatar = (student) => {
    const profile = studentProfiles[student.id];
    const hasProfilePicture = profile && profile.profile_picture && profile.profile_picture.trim() !== '';
    
    if (hasProfilePicture) {
      return (
        <Avatar 
          src={`${API_URL}${profile.profile_picture}`}
          alt={`${student.name} ${student.last_name}`}
          sx={{ width: 36, height: 36 }}
        />
      );
    } else {
      return (
        <Avatar 
          sx={{ 
            bgcolor: getSubjectColor(`${student.name}${student.last_name}`),
            width: 36, 
            height: 36
          }}
        >
          {getInitials(student.name, student.last_name)}
        </Avatar>
      );
    }
  };
  
  // Get color based on teaching group
  const getGroupColor = (group) => {
    if (group?.startsWith('PIB')) {
      return '#4caf50'; // Green
    } else if (group?.startsWith('IB1')) {
      return '#2196f3'; // Blue
    } else if (group?.startsWith('IB2')) {
      return '#ff9800'; // Orange
    } else {
      return '#9e9e9e'; // Gray
    }
  };
  
  // Get function to generate a consistent color based on text
  const getSubjectColor = (text) => {
    const colors = [
      '#4caf50', '#2196f3', '#ff9800', '#f44336', 
      '#9c27b0', '#3f51b5', '#009688', '#607d8b'
    ];
    
    // Simple hash function to get a number from a string
    const hash = text.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };
  
  // Generate initials for a student
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };
  
  // Handle navigation back to classes view
  const handleBack = () => {
    navigate('/staff/classes');
  };
  
  // Get sample class data for display when classDetails is not available
  const getSampleClassDetails = () => {
    return classDetails || {
      subject_name: "Subject Name",
      code: "Subject Code",
      teaching_group: location.state?.teachingGroup || "Teaching Group",
      students: []
    };
  };
  
  const displayClass = getSampleClassDetails();
  const groupColor = getGroupColor(displayClass.teaching_group);
  
  return (
    <Box p={3}>
      {/* Modern header with back button */}
      <Box 
        sx={{ 
          mb: 4
        }}
      >
        {/* Back button */}
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
        
        {/* Title and actions */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" fontSize="1.5rem" sx={{ mb: 0.5 }}>
              {displayClass.subject_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {displayClass.code} · {displayClass.teaching_group} · {displayClass.students.length} Students
            </Typography>
          </Box>
          <Box 
            sx={{
              display: 'flex',
              gap: 1
            }}
          >
            <Button
              startIcon={<Mail size={16} />}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'text.primary',
                height: '42px',
                px: 2,
                '&:hover': {
                  borderColor: groupColor,
                  color: groupColor,
                  bgcolor: 'transparent'
                }
              }}
            >
              Email Class
            </Button>
            <Button
              startIcon={<Download size={16} />}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'text.primary',
                height: '42px',
                px: 2,
                '&:hover': {
                  borderColor: groupColor,
                  color: groupColor,
                  bgcolor: 'transparent'
                }
              }}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Box>
      
      {error && (
        <Box 
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            color: '#d32f2f',
            border: '1px solid rgba(244, 67, 54, 0.2)',
          }}
        >
          <Typography>{error}</Typography>
        </Box>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Students List Section */}
          <Box mb={3}>
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}
            >
              <Typography variant="h6" fontWeight="600">
                Student List
              </Typography>
              <SearchBar 
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                width={{ xs: '100%', sm: '300px' }}
              />
            </Box>
            
            {filteredStudents.length === 0 ? (
              <Box 
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  {classDetails?.students?.length === 0 
                    ? "No students in this class." 
                    : "No students match your search."}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} 
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)'
                }}
              >
                <Table sx={{ minWidth: 650 }} aria-label="students table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getStudentAvatar(student)}
                            <Box ml={2}>
                              <Typography variant="body2" fontWeight="500">
                                {student.name} {student.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {student.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="Active" 
                            size="small"
                            sx={{ 
                              borderRadius: 1,
                              bgcolor: '#4caf5020',
                              color: '#4caf50',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default StaffClassDetailView; 