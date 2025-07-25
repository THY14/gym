import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Membership from './pages/Membership';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

import TrainerDashboard from './pages/TrainerDashboard';
import MemberDashboard from './pages/MemberDashboard';
import ReceptDashboard from './pages/ReceptDashboard';
import AdminDashboard from './pages/AdminDashboard';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Scroll to top on route change
const ScrollToTopWrapper = ({ children }) => {
  const location = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return children;
};

// Redirect to role-based dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'trainer':
      return <Navigate to="/trainer-dashboard" replace />;
    case 'member':
      return <Navigate to="/member-dashboard" replace />;
    case 'receptionist':
      return <Navigate to="/receptionist-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTopWrapper>
          <div className="min-h-screen bg-black text-white">
            <Navbar />
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Role-Based Dashboards */}
              <Route
                path="/trainer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['trainer']}>
                    <TrainerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/member-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['member']}>
                    <MemberDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receptionist-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['receptionist']}>
                    <ReceptDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Role-based Redirection */}
              <Route path="/dashboard" element={<DashboardRedirect />} />
            </Routes>
            <Footer />
          </div>
        </ScrollToTopWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;