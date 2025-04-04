import React, { useState, useEffect, Suspense, lazy } from 'react';
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
  Info,
  HelpCircle,
  Network,
  BrainCircuit,
  Sun,
  Moon
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
import ProjectAbout from './components/ProjectAbout';
import Support from './components/Support';
import AIAssistant from './components/AIAssistant';
import StaffDashboard from './components/StaffDashboard';
import StudentDashboard from './components/StudentDashboard';
import { API_URL } from './config';

// Version log
console.log(
  '%cHSANNU Portal%c v1.0.0',
  'color: #4caf50; font-size: 24px; font-weight: bold;',
  'color: #666; font-size: 16px; margin-left: 8px;'
);
console.log('Build Date:', new Date().toLocaleString());
console.log('API URL:', API_URL);

// Theme Provider component
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Set initial theme based on saved preference or system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { toggleTheme, isDarkMode });
        }
        return child;
      })}
    </div>
  );
};

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
      title: 'Dashboard ',
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
        className={`flex flex-col bg-white text-gray-800 transition-all duration-300 ease-in-out h-full shadow-lg rounded-r-xl ${
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
                  src={`${API_URL}/api${userData.profile_picture}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onLoad={() => console.log('Sidebar profile picture URL:', `${API_URL}/api${userData.profile_picture}`)}
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
                  ? 'bg-black text-white'
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
          {/* AI Assistant Button */}
          <div
            className="flex h-14 mb-2 cursor-pointer transition-colors rounded-lg mx-2 text-gray-500 hover:text-black hover:bg-gray-100"
            onClick={() => navigate(`/${userRole}/ai-assistant`)}
          >
            <div className="flex items-center justify-center w-16 h-full flex-shrink-0">
              <BrainCircuit size={20} />
            </div>
            <div className={`flex items-center transition-all duration-300 overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            }`}>
              <span className="font-medium whitespace-nowrap">
                AI Assistant
              </span>
            </div>
          </div>
          
          {/* Alumni Network Button */}
          <div
            className="flex h-14 mb-2 cursor-pointer transition-colors rounded-lg mx-2 text-gray-500 hover:text-black hover:bg-gray-100"
            onClick={() => navigate(`/${userRole}/alumni`)}
          >
            <div className="flex items-center justify-center w-16 h-full flex-shrink-0">
              <Network size={20} />
            </div>
            <div className={`flex items-center transition-all duration-300 overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            }`}>
              <span className="font-medium whitespace-nowrap">
                Alumni Network
              </span>
            </div>
          </div>
          
          {/* Support Button */}
          <div
            className="flex h-14 mb-2 cursor-pointer transition-colors rounded-lg mx-2 text-gray-500 hover:text-black hover:bg-gray-100"
            onClick={() => navigate(`/${userRole}/support`)}
          >
            <div className="flex items-center justify-center w-16 h-full flex-shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className={`flex items-center transition-all duration-300 overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            }`}>
              <span className="font-medium whitespace-nowrap">
                Support
              </span>
            </div>
          </div>
          
          {/* Version Log Button */}
          <div
            className="flex h-14 mb-2 cursor-pointer transition-colors rounded-lg mx-2 text-gray-500 hover:text-black hover:bg-gray-100"
            onClick={() => navigate(`/${userRole}/about`)}
          >
            <div className="flex items-center justify-center w-16 h-full flex-shrink-0">
              <Info size={20} />
            </div>
            <div className={`flex items-center transition-all duration-300 overflow-hidden ${
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            }`}>
              <span className="font-medium whitespace-nowrap">
                About Project
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
        className={`flex-1 transition-all duration-300 bg-white ${
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

// Create a PageContainer component to standardize spacing
const PageContainer = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen mx-10">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        {children}
      </div>
    </div>
  );
};

// Page components
const StudentEvents = () => (
  <PageContainer>
    <div className="bg-white p-6">
      <h1 className="text-2xl font-bold mb-4">Student Events</h1>
      <p>View and manage your events here.</p>
    </div>
  </PageContainer>
);

const StudentSettings = () => (
  <PageContainer>
    <div className="bg-white p-6">
      <h1 className="text-2xl font-bold mb-4">Student Settings</h1>
      <p>Manage your account preferences.</p>
    </div>
  </PageContainer>
);

const StaffEvents = () => (
  <PageContainer>
    <div className="bg-white p-6">
      <h1 className="text-2xl font-bold mb-4">Staff Events</h1>
      <p>Manage school events here.</p>
    </div>
  </PageContainer>
);

const StaffSettings = () => (
  <PageContainer>
    <div className="bg-white p-6">
      <h1 className="text-2xl font-bold mb-4">Staff Settings</h1>
      <p>Configure your staff account settings.</p>
    </div>
  </PageContainer>
);

// Preload the Alumni component for better performance
const Alumni = lazy(() => {
  // Preload immediately in the background after the app loads
  const preloadPromise = import('./components/Alumni');
  
  // You could add a small delay if you want to prioritize initial app render
  // return new Promise(resolve => setTimeout(() => resolve(preloadPromise), 500));
  
  return preloadPromise;
});

// Simple loading fallback that matches Alumni layout
const AlumniLoadingFallback = () => (
  <PageContainer>
    <div className="bg-white p-6">
      <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 w-full max-w-md bg-gray-200 rounded mb-6"></div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-4 animate-pulse">
            <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
          </div>
        ))}
      </div>
      
      <div className="py-8 bg-white w-full">
        <div className="h-96 bg-white animate-pulse"></div>
      </div>
    </div>
  </PageContainer>
);

// Prefetch component for Alumni to start loading it early
const PrefetchAlumni = () => {
  useEffect(() => {
    // Start loading the Alumni component in the background
    const prefetch = () => {
      try {
        import('./components/Alumni');
        import('./components/ui/world-map');
      } catch (e) {
        console.error('Error prefetching Alumni:', e);
      }
    };
    
    prefetch();
  }, []);
  
  return null;
};

// Main App Component with Routing
function App() {
  const [prefetchedAlumni, setPrefetchedAlumni] = useState(false);
  
  useEffect(() => {
    // Prefetch Alumni component after initial render
    const timer = setTimeout(() => {
      setPrefetchedAlumni(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200">
        {prefetchedAlumni && <PrefetchAlumni />}
      
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DefaultRedirect />} />
          
          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={<ProtectedRoute allowedRole="staff"><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/events" element={<ProtectedRoute allowedRole="staff"><EventsView /></ProtectedRoute>} />
          <Route path="/staff/event/:id" element={<ProtectedRoute allowedRole="staff"><EventDetailView /></ProtectedRoute>} />
          <Route path="/staff/new-event" element={<ProtectedRoute allowedRole="staff"><NewEventForm /></ProtectedRoute>} />
          <Route path="/staff/settings" element={<ProtectedRoute allowedRole="staff"><StaffSettings /></ProtectedRoute>} />
          <Route path="/staff/profile" element={<ProtectedRoute allowedRole="staff"><ProfileView /></ProtectedRoute>} />
          <Route path="/staff/attendance" element={<ProtectedRoute allowedRole="staff"><StaffAttendance /></ProtectedRoute>} />
          <Route path="/staff/classes" element={<ProtectedRoute allowedRole="staff"><StaffClasses /></ProtectedRoute>} />
          <Route path="/staff/class-details/:id" element={<ProtectedRoute allowedRole="staff"><StaffClassDetailView /></ProtectedRoute>} />
          <Route path="/staff/admin" element={<ProtectedRoute allowedRole="staff"><AdminPanel /></ProtectedRoute>} />
          <Route path="/staff/admin/users" element={<ProtectedRoute allowedRole="staff"><UserManagement /></ProtectedRoute>} />
          <Route path="/staff/about" element={<ProtectedRoute allowedRole="staff"><ProjectAbout /></ProtectedRoute>} />
          <Route path="/staff/support" element={<ProtectedRoute allowedRole="staff"><Support /></ProtectedRoute>} />
          <Route path="/staff/alumni" element={
            <ProtectedRoute allowedRole="staff">
              <Suspense fallback={<AlumniLoadingFallback />}>
                <Alumni />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/staff/ai-assistant" element={<ProtectedRoute allowedRole="staff"><AIAssistant /></ProtectedRoute>} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/events" element={<ProtectedRoute allowedRole="student"><EventsView /></ProtectedRoute>} />
          <Route path="/student/event/:id" element={<ProtectedRoute allowedRole="student"><EventDetailView /></ProtectedRoute>} />
          <Route path="/student/settings" element={<ProtectedRoute allowedRole="student"><StudentSettings /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><ProfileView /></ProtectedRoute>} />
          <Route path="/student/classes" element={<ProtectedRoute allowedRole="student"><StudentClasses /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRole="student"><StudentAttendance /></ProtectedRoute>} />
          <Route path="/student/about" element={<ProtectedRoute allowedRole="student"><ProjectAbout /></ProtectedRoute>} />
          <Route path="/student/support" element={<ProtectedRoute allowedRole="student"><Support /></ProtectedRoute>} />
          <Route path="/student/alumni" element={
            <ProtectedRoute allowedRole="student">
              <Suspense fallback={<AlumniLoadingFallback />}>
                <Alumni />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/student/ai-assistant" element={<ProtectedRoute allowedRole="student"><AIAssistant /></ProtectedRoute>} />
          
          {/* PrefetchAlumni Component */}
          <Route path="*" element={<PrefetchAlumni />} /> 
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;