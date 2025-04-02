/**
 * StudentClasses component for displaying a student's classes
 * 
 * This component:
 * 1. Gets the student ID from the user data in localStorage
 * 2. Fetches classes from the get_subjects endpoint using the student's ID
 * 3. Groups classes by teaching group (e.g., IB1, IB2, PIB)
 * 4. Displays classes in a visually appealing card layout with subject and teacher information
 * 
 * @returns {JSX.Element} The StudentClasses component
 */
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Chip, Divider, Grid, Button, Avatar } from '@mui/material';
import { BookOpen, User, GraduationCap, Calendar } from 'lucide-react';
import { API_URL } from '../config';

// Helper function to sort teaching groups in correct order
const sortTeachingGroups = (a, b) => {
  // Define the priority order
  const order = { 'PIB': 1, 'IB1': 2, 'IB2': 3 };
  
  // If both are in our priority list, sort by priority
  if (order[a] && order[b]) {
    return order[a] - order[b];
  }
  
  // If only a is in priority list, it comes first
  if (order[a]) return -1;
  
  // If only b is in priority list, it comes first
  if (order[b]) return 1;
  
  // For groups not in our priority list, sort alphabetically
  return a.localeCompare(b);
};

const StudentClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherProfiles, setTeacherProfiles] = useState({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = userData.id;
  
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      
      if (!studentId) {
        setLoading(false);
        setError("User ID not found");
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/api/get_subjects/${studentId}`);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Fetched classes:", data);
        setClasses(data);
        
        // Extract unique teacher IDs for fetching profile pictures
        const teacherIds = [...new Set(data.map(cls => cls.teacher_id))];
        fetchTeacherProfiles(teacherIds);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, [studentId]);

  // Fetch teacher profile information including profile pictures
  const fetchTeacherProfiles = async (teacherIds) => {
    if (!teacherIds.length) return;
    
    setLoadingProfiles(true);
    const profiles = {};
    
    try {
      // Fetch profiles for each teacher
      const promises = teacherIds.map(id => 
        fetch(`${API_URL}/api/profile/${id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              profiles[id] = data;
            }
          })
          .catch(err => console.error(`Error fetching profile for teacher ${id}:`, err))
      );
      
      await Promise.all(promises);
      setTeacherProfiles(profiles);
    } catch (err) {
      console.error("Error fetching teacher profiles:", err);
    } finally {
      setLoadingProfiles(false);
    }
  };
  
  // Group classes by teaching_group
  const groupedClasses = classes.reduce((acc, cls) => {
    // Extract the program level prefix (PIB, IB1, IB2)
    let key = cls.teaching_group;
    
    // Group all PIB* teaching groups under "PIB"
    if (key.startsWith('PIB')) {
      key = 'PIB';
    } 
    // Group all IB1* teaching groups under "IB1"
    else if (key.startsWith('IB1')) {
      key = 'IB1';
    } 
    // Group all IB2* teaching groups under "IB2"
    else if (key.startsWith('IB2')) {
      key = 'IB2';
    }
    
    if (!acc[key]) {
      acc[key] = {
        HL: [],
        SL: [],
        Subjects: []
      };
    }

    // Categorize subjects based on their names
    if (cls.subject.endsWith('HL')) {
      acc[key].HL.push(cls);
    } else if (cls.subject.endsWith('SL')) {
      acc[key].SL.push(cls);
    } else {
      acc[key].Subjects.push(cls);
    }
    
    return acc;
  }, {});
  
  // Function to get a consistent color based on subject name
  const getSubjectColor = (subject) => {
    const colors = [
      '#4caf50', '#2196f3', '#ff9800', '#f44336', 
      '#9c27b0', '#3f51b5', '#009688', '#607d8b'
    ];
    
    // Simple hash function to get a number from a string
    const hash = subject.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };
  
  // Get teaching group color
  const getGroupColor = (group) => {
    switch (group) {
      case 'PIB':
        return '#4caf50'; // Green
      case 'IB1':
        return '#2196f3'; // Blue
      case 'IB2':
        return '#ff9800'; // Orange
      default:
        return '#9e9e9e'; // Gray
    }
  };

  // Get teacher profile picture or use initials as fallback
  const getTeacherAvatar = (teacherId, teacherName, initials) => {
    const profile = teacherProfiles[teacherId];
    const hasProfilePicture = profile && profile.profile_picture && profile.profile_picture.trim() !== '';
    
    if (hasProfilePicture) {
      // Use the profile picture
      return (
        <Avatar 
          src={`${API_URL}/api${profile.profile_picture}`}
          alt={teacherName}
          sx={{ 
            width: 36,
            height: 36,
            mr: 1.5
          }}
        />
      );
    } else {
      // Use initials as fallback
      return (
        <Avatar 
          sx={{ 
            bgcolor: getSubjectColor(teacherName),
            width: 36,
            height: 36,
            mr: 1.5
          }}
        >
          {initials}
        </Avatar>
      );
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" fontWeight="bold" fontSize="1.5rem" mb={4}>
        My Classes
      </Typography>
      
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
      ) : classes.length === 0 ? (
        <Box 
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            You aren't enrolled in any classes yet.
          </Typography>
        </Box>
      ) : (
        <>
          {Object.keys(groupedClasses)
            .sort(sortTeachingGroups)
            .map((teachingGroup) => (
              <Box key={teachingGroup} mb={4}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Box 
                    sx={{
                      width: 6,
                      height: 24,
                      borderRadius: 1,
                      backgroundColor: getGroupColor(teachingGroup),
                      mr: 2
                    }}
                  />
                  <Typography variant="h5" fontWeight="600">
                    {teachingGroup}
                  </Typography>
                </Box>

                {/* Higher Level Subjects */}
                {groupedClasses[teachingGroup].HL.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" fontWeight="600" mb={2} color="text.secondary">
                      Higher Level
                    </Typography>
                    <Grid container spacing={3}>
                      {groupedClasses[teachingGroup].HL.map((cls) => (
                        <Grid item xs={12} md={6} lg={4} key={cls.code}>
                          <Card 
                            elevation={0}
                            sx={{
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'rgba(0, 0, 0, 0.08)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderColor: getGroupColor(teachingGroup)
                              }
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Chip 
                                  label={cls.code} 
                                  size="small" 
                                  sx={{ 
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    fontWeight: 500
                                  }} 
                                />
                                <Chip 
                                  label={cls.teaching_group} 
                                  size="small"
                                  sx={{ 
                                    borderRadius: 1,
                                    bgcolor: `${getGroupColor(teachingGroup)}20`,
                                    color: getGroupColor(teachingGroup),
                                    fontWeight: 500
                                  }} 
                                />
                              </Box>
                              
                              <Typography variant="h6" fontWeight="600" mb={2}>
                                {cls.subject}
                              </Typography>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box 
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2
                                }}
                              >
                                {getTeacherAvatar(cls.teacher_id, cls.teacher_name, cls.initials)}
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="600">
                                    {cls.teacher_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Teacher
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Button
                                fullWidth
                                variant="outlined"
                                sx={{
                                  mt: 1,
                                  borderRadius: 1,
                                  textTransform: 'none',
                                  borderColor: 'rgba(0, 0, 0, 0.12)',
                                  color: 'text.primary',
                                  '&:hover': {
                                    borderColor: getGroupColor(teachingGroup),
                                    color: getGroupColor(teachingGroup),
                                    bgcolor: 'transparent'
                                  }
                                }}
                              >
                                View Class Details
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Standard Level Subjects */}
                {groupedClasses[teachingGroup].SL.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" fontWeight="600" mb={2} color="text.secondary">
                      Standard Level
                    </Typography>
                    <Grid container spacing={3}>
                      {groupedClasses[teachingGroup].SL.map((cls) => (
                        <Grid item xs={12} md={6} lg={4} key={cls.code}>
                          <Card 
                            elevation={0}
                            sx={{
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'rgba(0, 0, 0, 0.08)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderColor: getGroupColor(teachingGroup)
                              }
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Chip 
                                  label={cls.code} 
                                  size="small" 
                                  sx={{ 
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    fontWeight: 500
                                  }} 
                                />
                                <Chip 
                                  label={cls.teaching_group} 
                                  size="small"
                                  sx={{ 
                                    borderRadius: 1,
                                    bgcolor: `${getGroupColor(teachingGroup)}20`,
                                    color: getGroupColor(teachingGroup),
                                    fontWeight: 500
                                  }} 
                                />
                              </Box>
                              
                              <Typography variant="h6" fontWeight="600" mb={2}>
                                {cls.subject}
                              </Typography>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box 
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2
                                }}
                              >
                                {getTeacherAvatar(cls.teacher_id, cls.teacher_name, cls.initials)}
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="600">
                                    {cls.teacher_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Teacher
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Button
                                fullWidth
                                variant="outlined"
                                sx={{
                                  mt: 1,
                                  borderRadius: 1,
                                  textTransform: 'none',
                                  borderColor: 'rgba(0, 0, 0, 0.12)',
                                  color: 'text.primary',
                                  '&:hover': {
                                    borderColor: getGroupColor(teachingGroup),
                                    color: getGroupColor(teachingGroup),
                                    bgcolor: 'transparent'
                                  }
                                }}
                              >
                                View Class Details
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Other Subjects */}
                {groupedClasses[teachingGroup].Subjects.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" fontWeight="600" mb={2} color="text.secondary">
                      Subjects
                    </Typography>
                    <Grid container spacing={3}>
                      {groupedClasses[teachingGroup].Subjects.map((cls) => (
                        <Grid item xs={12} md={6} lg={4} key={cls.code}>
                          <Card 
                            elevation={0}
                            sx={{
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'rgba(0, 0, 0, 0.08)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderColor: getGroupColor(teachingGroup)
                              }
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Chip 
                                  label={cls.code} 
                                  size="small" 
                                  sx={{ 
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    fontWeight: 500
                                  }} 
                                />
                                <Chip 
                                  label={cls.teaching_group} 
                                  size="small"
                                  sx={{ 
                                    borderRadius: 1,
                                    bgcolor: `${getGroupColor(teachingGroup)}20`,
                                    color: getGroupColor(teachingGroup),
                                    fontWeight: 500
                                  }} 
                                />
                              </Box>
                              
                              <Typography variant="h6" fontWeight="600" mb={2}>
                                {cls.subject}
                              </Typography>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box 
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2
                                }}
                              >
                                {getTeacherAvatar(cls.teacher_id, cls.teacher_name, cls.initials)}
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="600">
                                    {cls.teacher_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Teacher
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Button
                                fullWidth
                                variant="outlined"
                                sx={{
                                  mt: 1,
                                  borderRadius: 1,
                                  textTransform: 'none',
                                  borderColor: 'rgba(0, 0, 0, 0.12)',
                                  color: 'text.primary',
                                  '&:hover': {
                                    borderColor: getGroupColor(teachingGroup),
                                    color: getGroupColor(teachingGroup),
                                    bgcolor: 'transparent'
                                  }
                                }}
                              >
                                View Class Details
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            ))}
        </>
      )}
    </Box>
  );
};

export default StudentClasses; 