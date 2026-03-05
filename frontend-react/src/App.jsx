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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex">
          {/* Sidebar logic is handled inside the component based on auth state */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Student Access */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Student']}><Dashboard /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute allowedRoles={['Student']}><ReportIssue /></ProtectedRoute>} />
            
            {/* Shared Access */}
            <Route path="/leaderboard" element={<ProtectedRoute allowedRoles={['Student', 'Admin', 'SuperAdmin']}><Leaderboard /></ProtectedRoute>} />

            {/* Admin Access */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminFeed /></ProtectedRoute>} />

            {/* SuperAdmin/Principal Access */}
            <Route path="/super-dashboard" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/manage-users" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><UserManagement /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;