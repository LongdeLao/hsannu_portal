import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  UserCircle,
  ClipboardList,
  Shield,
  Users,
  Sliders,
  ServerCog,
  Info
} from 'lucide-react';
import EventsView from './components/Events';
import EventDetailView from './components/EventDetailView';
import NewEventForm from './components/NewEventForm';
import Login from './components/Login';
import ProfileView from './components/ProfileView';
import StaffAttendance from './components/StaffAttendance';
import UserManagement from './components/UserManagement';
import StaffClasses from './components/StaffClasses';
import StaffClassDetailView from './components/StaffClassDetailView';
import AdminPanel from './components/AdminPanel';
import StudentClasses from './components/StudentClasses';
import StudentAttendance from './components/StudentAttendance';
import VersionLog from './components/VersionLog';
import { API_URL } from './config';

// Version log
console.log(
  '%cHSANNU Portal%c v1.0.0',
  'color: #4caf50; font-size: 24px; font-weight: bold;',
  'color: #666; font-size: 16px; margin-left: 8px;'
);
console.log('Build Date:', new Date().toLocaleString());
console.log('API URL:', API_URL);

const Sidebar = ({ userRole, onCollapsedChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = userData.name || (userRole === 'student' ? 'Student' : 'Staff');
  const isAdmin = userData.additional_roles?.includes('admin');
  const isTeacher = userData.additional_roles?.includes('teacher');
  const canMarkAttendance = userData.additional_roles?.includes('attendance');
  
  // Notify parent of initial state
  useEffect(() => {
    onCollapsedChange(collapsed);
  }, [collapsed, onCollapsedChange]);
  
  // Define navigation items based on user role
  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: `/${userRole}/dashboard`,
    },
    {
      title: 'Events',
      icon: <Calendar size={20} />,
      path: `/${userRole}/events`,
      // Also match when viewing event details
      isActive: (path) => path === `/${userRole}/events` || path.includes(`/${userRole}/event/`)
    },
    {
      title: 'Classes',
      icon: <GraduationCap size={20} />,
      path: `/${userRole}/classes`,
    }
  ];

  // Add Attendance option for all staff members and students
  if (userRole === 'staff' || userRole === 'student') {
    navItems.push({
      title: 'Attendance',
      icon: <ClipboardList size={20} />,
      path: `/${userRole}/attendance`,
    });
  }

  // Add Settings option
  navItems.push({
    title: 'Settings',
    icon: <Settings size={20} />,
    path: `/${userRole}/settings`,
  });
  
  // Add Admin Panel option only for staff users with admin role
  if (userRole === 'staff' && isAdmin) {
    navItems.push({
      title: 'Admin Panel',
      icon: <ServerCog size={20} />,
      path: `/${userRole}/admin`,
    });
  }

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapsedChange(newCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate(`/${userRole}/profile`);
  };

  // Check if an item should be active
  const isActive = (item) => {
    if (item.isActive) {
      return item.isActive(location.pathname);
    }
    return location.pathname === item.path;
  };

  return (
    <div className="fixed top-0 left-0 h-screen p-4 z-10">
      <div
        className={`flex flex-col bg-white text-gray-800 transition-all duration-300 ease-in-out h-full rounded-xl shadow-lg ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo and Title - Fixed Height */}
        <div className="border-b border-gray-100">
          <div
            className="flex h-20 cursor-pointer transition-colors rounded-lg mx-2 py-2 hover:bg-gray-100"
            onClick={handleProfileClick}
          >
            <div className="flex items-center justify-center w-16 h-full flex-shrink-0">
              {userData.profile_picture ? (
                <img 
                  src={`${API_URL}${userData.profile_picture}`} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex-shrink-0 rounded-full bg-black h-10 w-10 flex items-center justify-center text-white font-semibold">
                  {userData.name.charAt(0).toUpperCase()}

                </div>
              )}
            </div>
            <div className={`flex flex-col justify-center transition-all duration-300 overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            }`}>
              <span className="font-medium whitespace-nowrap">
                {userName}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items - Fixed Height per Item */}
        <div className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <div
              key={item.title}
              onClick={() => navigate(item.path)}
              className={`flex h-14 mb-2 cursor-pointer transition-colors rounded-lg mx-2 ${
                isActive(item)
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center w-16 h-full flex-shrink-0">
                {item.icon}
              </div>
              <div className={`flex items-center transition-all duration-300 overflow-hidden ${
                collapsed ? 'w-0 opacity-0' : 'opacity-100'
              }`}>
                <span className="font-medium whitespace-nowrap">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section - Fixed Height for Buttons */}
        <div className="border-t border-gray-100 pt-4 mt-auto">
          {/* Version Log Button */}
          <div
            className="flex h-14 mb-2 cursor-pointer transition-colors rounded-lg mx-2 text-gray-500 hover:text-black hover:bg-gray-100"
            onClick={() => navigate(`/${userRole}/version-log`)}
          >
            <div className="flex items-center justify-center w-16 h-full flex-shrink-0">
              <Info size={20} />
            </div>
            <div className={`flex items-center transition-all duration-300 overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            }`}>
              <span className="font-medium whitespace-nowrap">
                Version Log
              </span>
            </div>
          </div>

          {/* Collapse Button */}
          <div
            className="flex h-14 mb-2 cursor-pointer transition-colors rounded-lg mx-2 text-gray-500 hover:text-black hover:bg-gray-100"
            onClick={handleCollapse}
          >
            <div className="flex items-center justify-center w-16 h-full flex-shrink-0">
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </div>
            <div className={`flex items-center transition-all duration-300 overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            }`}>
              <span className="font-medium whitespace-nowrap">
                Collapse
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <div
            className="flex h-14 mb-2 cursor-pointer transition-colors rounded-lg mx-2 text-gray-500 hover:text-red-500 hover:bg-gray-100"
            onClick={handleLogout}
          >
            <div className="flex items-center justify-center w-16 h-full flex-shrink-0">
              <LogOut size={20} />
            </div>
            <div className={`flex items-center transition-all duration-300 overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            }`}>
              <span className="font-medium whitespace-nowrap">
                Logout
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Layout Component that combines Sidebar with content
const DashboardLayout = ({ children, userRole }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen">
      <Sidebar 
        userRole={userRole} 
        onCollapsedChange={(collapsed) => setSidebarCollapsed(collapsed)}
      />
      <div 
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-28' : 'ml-80'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

// Auth check component
const ProtectedRoute = ({ children, allowedRole }) => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!loggedIn || !user) {
    // Redirect to login if not logged in
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  
  // If role is allowed, wrap the children with the DashboardLayout
  return <DashboardLayout userRole={user.role}>{children}</DashboardLayout>;
};

// Component to handle the root path redirect logic
function DefaultRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (loggedIn && user && user.role) {
      // Navigate based on user role
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        // If unknown role, go to login
        navigate('/login');
      }
    } else {
      // Not logged in, go to login
      navigate('/login');
    }
  }, [navigate]);
  
  return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
}

// Dashboard components
const StudentDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <p>Welcome to your student dashboard!</p>
      {/* Dashboard content goes here */}
    </div>
  );
};

const StaffDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>
      <p>Welcome to your staff dashboard!</p>
      {/* Dashboard content goes here */}
    </div>
  );
};

// Page components
const StudentEvents = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Student Events</h1>
    <p>View and manage your events here.</p>
  </div>
);

const StudentSettings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Student Settings</h1>
    <p>Manage your account preferences.</p>
  </div>
);

const StaffEvents = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Staff Events</h1>
    <p>Manage school events here.</p>
  </div>
);


const StaffSettings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Staff Settings</h1>
    <p>Configure your staff account settings.</p>
  </div>
);

// Main App Component
function App() {
  return (
    <Routes>
      {/* Default route - checks login status and redirects accordingly */}
      <Route path="/" element={<DefaultRedirect />} />
      
      {/* Login route */}
      <Route path="/login" element={<Login />} />
      
      {/* Event detail route */}
      <Route path="/event/:id" element={<EventDetailView />} />
      
      {/* Protected Student routes */}
      <Route 
        path="/student/dashboard" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/events" 
        element={
          <ProtectedRoute allowedRole="student">
            <EventsView />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/classes" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentClasses />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/attendance" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentAttendance />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/settings" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentSettings />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/event/:id" 
        element={
          <ProtectedRoute allowedRole="student">
            <EventDetailView />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/profile" 
        element={
          <ProtectedRoute allowedRole="student">
            <ProfileView />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Staff routes */}
      <Route 
        path="/staff/dashboard" 
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/staff/events" 
        element={
          <ProtectedRoute allowedRole="staff">
            <EventsView />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/staff/classes" 
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffClasses />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/staff/attendance" 
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffAttendance />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/staff/settings" 
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffSettings />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/staff/event/:id" 
        element={
          <ProtectedRoute allowedRole="staff">
            <EventDetailView />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/staff/profile" 
        element={
          <ProtectedRoute allowedRole="staff">
            <ProfileView />
          </ProtectedRoute>
        } 
      />
      
      {/* Class Detail View Route */}
      <Route 
        path="/staff/class-details/:classId" 
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffClassDetailView />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Panel Route */}
      <Route 
        path="/staff/admin" 
        element={
          <ProtectedRoute allowedRole="staff">
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
      
      {/* User Management Route */}
      <Route 
        path="/staff/admin/users" 
        element={
          <ProtectedRoute allowedRole="staff">
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      
      {/* New Event Form Route - Staff Only */}
      <Route 
        path="/staff/new-event" 
        element={
          <ProtectedRoute allowedRole="staff">
            <NewEventForm />
          </ProtectedRoute>
        } 
      />
      
      {/* Version Log Route - Available for both staff and students */}
      <Route 
        path="/staff/version-log" 
        element={
          <ProtectedRoute allowedRole="staff">
            <VersionLog />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/version-log" 
        element={
          <ProtectedRoute allowedRole="student">
            <VersionLog />
          </ProtectedRoute>
        } 
      />
      
      {/* Handle undefined routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;