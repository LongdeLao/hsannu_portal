import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  InputBase,
  alpha,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import { PencilLine, Trash2, X, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { API_URL } from '../config';

const UserManagement = () => {
  // State variables
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfiles, setUserProfiles] = useState({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  
  // Check if we're in the Admin Panel
  const location = useLocation();
  const isInAdminPanel = location.pathname === '/staff/admin';

  const navigate = useNavigate();

  // Fetch users from the API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/users`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        
        // Fetch user profiles for all users
        if (data.users && data.users.length > 0) {
          const userIds = data.users.map(user => user.id);
          fetchUserProfiles(userIds);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user profile information including profile pictures
  const fetchUserProfiles = async (userIds) => {
    if (!userIds.length) return;
    
    setLoadingProfiles(true);
    const profiles = {};
    
    try {
      // Fetch profiles for each user
      const promises = userIds.map(id => 
        fetch(`${API_URL}/api/profile/${id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              profiles[id] = data;
            }
          })
          .catch(err => console.error(`Error fetching profile for user ${id}:`, err))
      );
      
      await Promise.all(promises);
      setUserProfiles(profiles);
    } catch (err) {
      console.error("Error fetching user profiles:", err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerCaseQuery) ||
          user.username.toLowerCase().includes(lowerCaseQuery) ||
          user.email.toLowerCase().includes(lowerCaseQuery) ||
          user.role.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  // Get user role display with appropriate color
  const getRoleDisplay = (role) => {
    let color = 'default';
    
    switch(role.toLowerCase()) {
      case 'admin':
        color = 'error';
        break;
      case 'staff':
        color = 'primary';
        break;
      case 'student':
        color = 'success';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={role} color={color} size="small" />;
  };
  
  // Function to get a consistent color based on name
  const getNameColor = (name) => {
    const colors = [
      '#4caf50', '#2196f3', '#ff9800', '#f44336', 
      '#9c27b0', '#3f51b5', '#009688', '#607d8b'
    ];
    
    // Simple hash function to get a number from a string
    const hash = name.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };
  
  // Get user avatar based on profile picture or generate initials if not available
  const getUserAvatar = (user) => {
    const profile = userProfiles[user.id];
    const hasProfilePicture = profile && profile.profile_picture && profile.profile_picture.trim() !== '';
    
    if (hasProfilePicture) {
      return (
        <Avatar 
          src={`${API_URL}${profile.profile_picture}`}
          alt={user.name}
          sx={{ width: 32, height: 32, mr: 2 }}
        />
      );
    } else {
      // Get initials from name
      const nameParts = user.name.split(' ');
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : user.name.substring(0, 2);
        
      return (
        <Avatar 
          sx={{ 
            bgcolor: getNameColor(user.name),
            width: 32, 
            height: 32,
            fontSize: '0.75rem',
            mr: 2
          }}
        >
          {initials.toUpperCase()}
        </Avatar>
      );
    }
  };

  // Column width definitions for consistency
  const columnWidths = {
    id: '8%',
    name: '25%',
    username: '20%',
    email: '25%',
    role: '12%',
    actions: '10%'
  };

  // Handle navigation back
  const handleBack = () => {
    navigate('/staff/admin');
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
      
      {/* Title */}
      <Typography variant="h4" component="h1" fontWeight="bold" fontSize="1.5rem" sx={{ mb: 3 }}>
        User Management
      </Typography>

      <Box 
        display="flex" 
        alignItems="center" 
        gap={2} 
        mb={2}
        width="100%"
      >
        {/* Using the reusable SearchBar component */}
        <SearchBar 
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          width={{ xs: '100%', md: '450px' }}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
            whiteSpace: 'nowrap',
            minWidth: { xs: 'auto', md: '130px' }
          }}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
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
        {/* Separate Header Row */}
        <Box 
          sx={{
            display: 'flex',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            py: 1.5,
            px: 2,
            mb: 0.5
          }}
        >
          <Box width={columnWidths.id} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>ID</Box>
          <Box width={columnWidths.name} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Name</Box>
          <Box width={columnWidths.username} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Username</Box>
          <Box width={columnWidths.email} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Email</Box>
          <Box width={columnWidths.role} sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Role</Box>
          <Box width={columnWidths.actions} sx={{ fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'right' }}>Actions</Box>
        </Box>

        {/* Data List Container */}
        <Box 
          sx={{ 
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none'  // Hide scrollbar for Chrome, Safari and Opera
            },
            msOverflowStyle: 'none',  // Hide scrollbar for IE and Edge
            scrollbarWidth: 'none'  // Hide scrollbar for Firefox
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1} py={4}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1} py={4}>
              <Typography variant="subtitle1" color="text.secondary">
                No users found
              </Typography>
            </Box>
          ) : (
            <Box>
              {filteredUsers.map((user) => (
                <Box 
                  key={user.id}
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
                  <Box width={columnWidths.id}>{user.id}</Box>
                  <Box width={columnWidths.name} sx={{ display: 'flex', alignItems: 'center' }}>
                    {getUserAvatar(user)}
                    <Box>
                      {user.name}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {user.first_name} {user.last_name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box width={columnWidths.username}>{user.username}</Box>
                  <Box width={columnWidths.email}>{user.email}</Box>
                  <Box width={columnWidths.role}>{getRoleDisplay(user.role)}</Box>
                  <Box width={columnWidths.actions} sx={{ textAlign: 'right' }}>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        mr: 1, 
                        color: '#4a7aff',
                        backgroundColor: alpha('#4a7aff', 0.1),
                        '&:hover': {
                          backgroundColor: alpha('#4a7aff', 0.2),
                        }
                      }}
                    >
                      <PencilLine size={16} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        color: '#ff4a4a',
                        backgroundColor: alpha('#ff4a4a', 0.1),
                        '&:hover': {
                          backgroundColor: alpha('#ff4a4a', 0.2),
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
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
          * Device IDs are hidden for security reasons
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Showing {filteredUsers.length} users
        </Typography>
      </Box>
    </Box>
  );
};

export default UserManagement; 