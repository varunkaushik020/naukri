import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MFAVerify from './pages/MFAVerify/MFAVerify';
import SeekerDashboard from './pages/SeekerDashboard/SeekerDashboard';
import MyApplications from './pages/MyApplications/MyApplications';
import SeekerProfile from './pages/SeekerProfile/SeekerProfile';
import RecruiterDashboard from './pages/RecruiterDashboard/RecruiterDashboard';
import RecruiterProfile from './pages/RecruiterProfile/RecruiterProfile';
import './App.css';


const AdminDashboard = () => (
  <div className="dashboard">
    <h1>ðŸ‘‘ Master Admin Dashboard</h1>
    <p>Verify companies and monitor global activity.</p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mfa-verify" element={<MFAVerify />} />

            <Route
              path="/seeker/dashboard"
              element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <SeekerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/seeker/applications"
              element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/seeker/profile"
              element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <SeekerProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recruiter/profile"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <RecruiterProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
