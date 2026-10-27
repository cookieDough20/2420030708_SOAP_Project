/**
 * Main Application Component.
 * Sets up routing and layout structure.
 */

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SOSBanner from './components/SOSBanner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import Donations from './pages/Donations';
import CreateDonation from './pages/CreateDonation';
import NGOs from './pages/NGOs';
import Logistics from './pages/Logistics';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Notifications from './pages/Notifications';
import Impact from './pages/Impact';
import AIRecommendations from './pages/AIRecommendations';
import Profile from './pages/Profile';
import CreateNGOProfile from './pages/CreateNGOProfile';
import CreateLogisticsProfile from './pages/CreateLogisticsProfile';
import CreateDonorProfile from './pages/CreateDonorProfile';

/**
 * Layout wrapper for authenticated pages (Navbar + Sidebar + Content).
 */
function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <SOSBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/donor-dashboard" element={<DonorDashboard />} />
            <Route path="/ngo-dashboard" element={<NGODashboard />} />
            <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
            <Route path="/ngo-setup" element={<CreateNGOProfile />} />
            <Route path="/donor-setup" element={<CreateDonorProfile />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/create-donation" element={<CreateDonation />} />
            <Route path="/ngos" element={<NGOs />} />
            <Route path="/logistics" element={<Logistics />} />
            <Route path="/logistics-setup" element={<CreateLogisticsProfile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/ai-recommendations" element={<AIRecommendations />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
