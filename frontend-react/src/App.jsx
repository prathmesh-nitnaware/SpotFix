import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import AdminFeed from './pages/AdminFeed';
import Leaderboard from './pages/Leaderboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard'; // New
import UserManagement from './pages/UserManagement'; // New
import StaffDashboard from './pages/StaffDashboard'; // New Staff Mobile View
import LostFound from './pages/LostFound';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex w-full min-h-screen">
          {/* Sidebar logic is handled inside the component based on auth state */}
          <div className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Student Access */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Student']}><Dashboard /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute allowedRoles={['Student']}><ReportIssue /></ProtectedRoute>} />

              {/* Shared Access */}
              <Route path="/leaderboard" element={<ProtectedRoute allowedRoles={['Student', 'Admin', 'SuperAdmin', 'Staff']}><Leaderboard /></ProtectedRoute>} />
              <Route path="/lost-found" element={<ProtectedRoute allowedRoles={['Student', 'Admin', 'SuperAdmin', 'Staff']}><LostFound /></ProtectedRoute>} />

              {/* Staff Access */}
              <Route path="/staff-dashboard" element={<ProtectedRoute allowedRoles={['Staff']}><StaffDashboard /></ProtectedRoute>} />

              {/* Admin Access */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminFeed /></ProtectedRoute>} />

              {/* SuperAdmin/Principal Access */}
              <Route path="/super-dashboard" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/manage-users" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><UserManagement /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;