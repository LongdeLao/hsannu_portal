import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Mail, Phone, School, BadgeCheck, Upload, Camera, Pencil, Check, X, Key, Eye, EyeOff, Activity, PauseCircle, AlertCircle, Clock, Briefcase, GraduationCap, Award } from 'lucide-react';
import { Box, IconButton } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';

function ProfileView() {
  const [userData, setUserData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdateStatus, setEmailUpdateStatus] = useState({ loading: false, success: false, error: '' });
  const [isEmailInputFocused, setIsEmailInputFocused] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordUpdateStatus, setPasswordUpdateStatus] = useState({ loading: false, success: false, error: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);
  const userRole = userData?.role || 'student';

  useEffect(() => {
    // Load user data from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserData(user);
        
        // Fetch updated profile info including profile picture
        if (user.id) {
          fetchProfileInfo(user.id);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchProfileInfo = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Debug log for roles
        console.log('Profile data from server:', data);
        console.log('Additional roles:', data.additional_roles);
        console.log('Status:', data.status);
        
        // Update local storage with the new data including status
        localStorage.setItem('user', JSON.stringify(data));
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching profile info:', error);
    }
  };

  const handleBack = () => {
    navigate(`/${userRole}/dashboard`);
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const fileType = file.type;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(fileType)) {
      setUploadError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    console.log('Uploading profile picture:', file.name, 'type:', file.type);

    // Reset states
    setUploadError('');
    setUploadSuccess(false);
    setIsUploading(true);

    // Create form data for the upload
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const uploadUrl = `${API_URL}/api/profile/upload-picture/${userData.id}`;
      console.log('Profile picture upload endpoint:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile picture upload response:', result);
        setUploadSuccess(true);
        
        // Update user data with new profile picture
        if (userData) {
          const updatedUserData = {
            ...userData,
            profile_picture: result.profile_picture
          };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          setUserData(updatedUserData);
          console.log('Updated profile picture path:', result.profile_picture);
        }
        
        // Refresh profile info
        fetchProfileInfo(userData.id);
      } else {
        const errorData = await response.json();
        setUploadError(errorData.error || 'Failed to upload profile picture');
        console.error('Profile picture upload failed:', errorData);
      }
    } catch (error) {
      setUploadError('Network error. Please try again later.');
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditEmail = () => {
    setNewEmail(userData.email || '');
    setIsEditingEmail(true);
    setEmailUpdateStatus({ loading: false, success: false, error: '' });
  };

  const handleCancelEditEmail = () => {
    setIsEditingEmail(false);
    setEmailUpdateStatus({ loading: false, success: false, error: '' });
  };

  const handleSaveEmail = async () => {
    if (!newEmail.trim()) {
      setEmailUpdateStatus({ loading: false, success: false, error: 'Email cannot be empty' });
      return;
    }

    setEmailUpdateStatus({ loading: true, success: false, error: '' });

    try {
      const response = await fetch(`${API_URL}/api/profile/update-email/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update user data with new email
        const updatedUserData = {
          ...userData,
          email: result.email
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        
        setEmailUpdateStatus({ loading: false, success: true, error: '' });
        
        // Reset edit mode after short delay
        setTimeout(() => {
          setIsEditingEmail(false);
          setEmailUpdateStatus({ loading: false, success: false, error: '' });
        }, 1500);
      } else {
        const errorData = await response.json();
        setEmailUpdateStatus({ 
          loading: false, 
          success: false, 
          error: errorData.error || 'Failed to update email' 
        });
      }
    } catch (error) {
      setEmailUpdateStatus({ 
        loading: false, 
        success: false, 
        error: 'Network error. Please try again later.' 
      });
      console.error('Error updating email:', error);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordUpdateStatus({ loading: false, success: false, error: '' });
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  const handleSubmitPassword = async () => {
    // Validate password data
    if (!passwordData.currentPassword.trim()) {
      setPasswordUpdateStatus({ loading: false, success: false, error: 'Current password is required' });
      return;
    }
    if (!passwordData.newPassword.trim()) {
      setPasswordUpdateStatus({ loading: false, success: false, error: 'New password is required' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordUpdateStatus({ loading: false, success: false, error: 'New passwords do not match' });
      return;
    }

    setPasswordUpdateStatus({ loading: true, success: false, error: '' });

    try {
      const response = await fetch(`${API_URL}/api/profile/change-password/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        setPasswordUpdateStatus({ loading: false, success: true, error: '' });
        
        // Close modal after short delay on success
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordUpdateStatus({ loading: false, success: false, error: '' });
        }, 1500);
      } else {
        const errorData = await response.json();
        setPasswordUpdateStatus({ 
          loading: false, 
          success: false, 
          error: errorData.error || 'Failed to update password' 
        });
      }
    } catch (error) {
      setPasswordUpdateStatus({ 
        loading: false, 
        success: false, 
        error: 'Network error. Please try again later.' 
      });
      console.error('Error updating password:', error);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl">
        {/* Header with profile pic and name */}
        <div className="flex items-center space-x-5 mb-10">
          <div 
            className="relative rounded-full h-20 w-20 flex items-center justify-center text-white font-bold text-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
            onClick={handleProfilePictureClick}
          >
            {userData.profile_picture ? (
              <img 
                src={`${API_URL}/api${userData.profile_picture}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onLoad={() => console.log('Profile picture URL loaded:', `${API_URL}${userData.profile_picture}`)}
              />
            ) : (
              <span className="text-gray-400">
                {userData.name?.charAt(0) || userData.username?.charAt(0) || 'U'}
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={20} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-1">{userData.name || userData.username}</h1>
            <div className="flex items-center">
              <span className="text-gray-500 capitalize mr-3">{userData.role}</span>
              {isUploading && <span className="text-xs text-gray-500">Uploading photo...</span>}
              {uploadSuccess && <span className="text-xs text-green-500">Upload successful!</span>}
              {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="flex space-x-4">
              <div className="flex-shrink-0 p-3 bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center">
                <UserCircle className="text-gray-400" size={22} />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Username</div>
                <div className="font-medium">{userData.username}</div>
              </div>
            </div>
            
            {/* Status Field */}
            <div className="flex space-x-4">
              <div className="flex-shrink-0 p-3 bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center">
                {userData.status === 'employed' && <Briefcase className="text-gray-400" size={22} />}
                {userData.status === 'enrolled' && <GraduationCap className="text-gray-400" size={22} />}
                {userData.status === 'alumni' && <Award className="text-gray-400" size={22} />}
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div className="font-medium capitalize">
                  {userData.status || 'Unknown'}
                </div>
              </div>
            </div>
            
            {/* User ID */}
            <div className="flex space-x-4">
              <div className="flex-shrink-0 p-3 bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center">
                <BadgeCheck className="text-gray-400" size={22} />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">User ID</div>
                <div className="font-medium">{userData.id}</div>
              </div>
            </div>
            
            {/* Email */}
            <div className="flex space-x-4">
              <div className="flex-shrink-0 p-3 bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center">
                <Mail className="text-gray-400" size={22} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">Email</div>
                {isEditingEmail ? (
                  <div className="relative">
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          onFocus={() => setIsEmailInputFocused(true)}
                          onBlur={() => setIsEmailInputFocused(false)}
                          className="w-full border-b border-gray-300 focus:border-black outline-none py-1 bg-transparent pr-16"
                          placeholder="Enter your email"
                        />
                        <div className="absolute right-0 top-0 flex">
                          <button 
                            onClick={handleSaveEmail}
                            disabled={emailUpdateStatus.loading}
                            className="p-1 text-black hover:text-gray-600 transition-colors"
                            title="Save"
                          >
                            {emailUpdateStatus.loading ? (
                              <div className="animate-spin h-4 w-4 border-2 border-black rounded-full border-t-transparent"></div>
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                          <button 
                            onClick={handleCancelEditEmail}
                            className="p-1 text-black hover:text-gray-600 transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="font-medium">{userData.email || 'not-registered'}</span>
                    <button 
                      onClick={handleEditEmail}
                      className="ml-2 p-1 text-gray-400 hover:text-black transition-colors"
                      title="Edit email"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Password */}
            <div className="flex space-x-4">
              <div className="flex-shrink-0 p-3 bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center">
                <Key className="text-gray-400" size={22} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">Password</div>
                <div className="flex items-center">
                  <span className="font-medium">••••••••</span>
                  <button 
                    onClick={handleChangePassword}
                    className="ml-2 p-1 text-gray-400 hover:text-black transition-colors"
                    title="Change password"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Roles section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">Roles & Permissions</h2>
            
            <div className="flex space-x-4">
              <div className="flex-shrink-0 p-3 bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center">
                <School className="text-gray-400" size={22} />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2">Your Roles</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-black text-white text-sm rounded-full capitalize">
                    {userData.role}
                  </span>
                  {userData.additional_roles && userData.additional_roles.map((role, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-full capitalize"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg">
            <button
              onClick={handleClosePasswordModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-black"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm text-gray-500 block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-b border-gray-300 focus:border-black outline-none py-2 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <label className="text-sm text-gray-500 block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-b border-gray-300 focus:border-black outline-none py-2 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border-b border-gray-300 focus:border-black outline-none py-2"
                />
              </div>
              
              {passwordUpdateStatus.error && (
                <p className="text-sm text-red-500">{passwordUpdateStatus.error}</p>
              )}
              
              {passwordUpdateStatus.success && (
                <p className="text-sm text-green-500">Password changed successfully!</p>
              )}
              
              <div className="pt-4">
                <button
                  onClick={handleSubmitPassword}
                  disabled={passwordUpdateStatus.loading}
                  className="w-full py-2 bg-black text-white font-semibold rounded-lg flex justify-center items-center"
                >
                  {passwordUpdateStatus.loading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileView; 