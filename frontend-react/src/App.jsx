import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Importing your Architect-level pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import AdminFeed from './pages/AdminFeed';
import LostFound from './pages/LostFound';
import Leaderboard from './pages/Leaderboard';
import IssueMap from './pages/IssueMap';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/report" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <ReportIssue />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute allowedRoles={['Student', 'Admin']}>
              <Leaderboard />
            </ProtectedRoute>
          } />

          {/* Admin Exclusive Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminFeed />
            </ProtectedRoute>
          } />

          {/* Campus Features */}
          <Route path="/map" element={
            <ProtectedRoute>
              <IssueMap />
            </ProtectedRoute>
          } />

          {/* Community Features */}
          <Route path="/lost-found" element={
            <ProtectedRoute>
              <LostFound />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider >
  );
}

export default App;