/**
 * StaffClasses component for displaying a teacher's classes
 * 
 * This component:
 * 1. Checks if the current user has a "teacher" role in their additional_roles
 * 2. Fetches classes from the get_subjects_by_teacher endpoint using the teacher's ID
 * 3. Groups classes by teaching group (e.g., IB1, IB2, PIB)
 * 4. Displays classes in a visually appealing card layout with subject and student information
 * 
 * @returns {JSX.Element} The StaffClasses component
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Chip, Divider, Grid, Button, Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { BookOpen, Users, GraduationCap, Calendar } from 'lucide-react';
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

const StaffClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentProfiles, setStudentProfiles] = useState({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const navigate = useNavigate();
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const isTeacher = userData.additional_roles?.includes('teacher');
  const teacherId = userData.id;
  
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      
      if (!isTeacher || !teacherId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/get_subjects_by_teacher/${teacherId}`);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Fetched classes:", data);
        setClasses(data);
        
        // Extract all student IDs for fetching profile pictures
        const studentIds = new Set();
        data.forEach(cls => {
          cls.students.forEach(student => {
            studentIds.add(student.id);
          });
        });
        fetchStudentProfiles(Array.from(studentIds));
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, [isTeacher, teacherId]);
  
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
      acc[key] = [];
    }
    acc[key].push(cls);
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
  
  // Generate initials for a student
  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
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
        />
      );
    } else {
      return (
        <Avatar 
          sx={{ 
            bgcolor: getSubjectColor(`${student.name}${student.last_name}`),
          }}
        >
          {getInitials(student.name, student.last_name)}
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
      ) : !isTeacher ? (
        <Box 
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            You don't have teaching privileges. Only teachers can view assigned classes.
          </Typography>
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
            No classes have been assigned to you yet.
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
                
                <Grid container spacing={3}>
                  {groupedClasses[teachingGroup].map((cls, index) => (
                    <Grid item xs={12} md={6} lg={4} key={`${cls.code}-${teachingGroup}-${index}`}>
                      <Card 
                        elevation={0}
                        onClick={() => {
                          // Navigate to class detail view with class data
                          navigate(`/staff/class-details/${cls.code}`, {
                            state: { 
                              classData: cls,
                              teachingGroup: teachingGroup
                            }
                          });
                        }}
                        sx={{
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer',
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
                            {cls.subject_name}
                          </Typography>
                          
                          <Box 
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              color: 'text.secondary',
                              mb: 1
                            }}
                          >
                            <Users size={16} style={{ marginRight: 8 }} />
                            <Typography variant="body2">
                              {cls.students.length} Students
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600" mb={1}>
                              Students
                            </Typography>
                            <AvatarGroup 
                              max={5}
                              sx={{
                                '& .MuiAvatar-root': { 
                                  width: 32, 
                                  height: 32,
                                  fontSize: '0.75rem',
                                  fontWeight: 500
                                }
                              }}
                            >
                              {cls.students.map((student) => (
                                <Tooltip 
                                  key={student.id} 
                                  title={`${student.name} ${student.last_name}`}
                                  arrow
                                >
                                  {getStudentAvatar(student)}
                                </Tooltip>
                              ))}
                            </AvatarGroup>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
        </>
      )}
    </Box>
  );
};

export default StaffClasses; 