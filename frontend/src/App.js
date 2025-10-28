import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminLoginPage from './pages/Auth/AdminLoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import EnhancedFinancialDashboard from './pages/Dashboard/EnhancedFinancialDashboard';
import Properties from './pages/Properties/Properties';
import Units from './pages/Units/Units';
import UnitsForRent from './pages/UnitsForRent/UnitsForRent';
import Tenants from './pages/Tenants/Tenants';
import Payments from './pages/Payments/Payments';
import Analytics from './pages/Analytics/Analytics';
import Inspections from './pages/Inspections/Inspections';
import Utilities from './pages/Utilities/Utilities';
import PropertyQR from './pages/PropertyQR/PropertyQR';
import Communications from './pages/Communications/Communications';
import Reports from './pages/Reports/Reports';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ModernAdminDashboard from './pages/Admin/ModernAdminDashboard';
import AdminPropertyOwners from './pages/Admin/AdminPropertyOwners';
import AdminPropertiesOverview from './pages/Admin/AdminPropertiesOverview';
import AdminUnits from './pages/Admin/AdminUnits';
import AdminInspections from './pages/Admin/AdminInspections';
import AdminAgents from './pages/Admin/AdminAgents';
import AdminAirbnb from './pages/Admin/AdminAirbnb';
import AdminTenants from './pages/Admin/AdminTenants';
import AdminSystemHealth from './pages/Admin/AdminSystemHealth';
import AdminActivityLogs from './pages/Admin/AdminActivityLogs';
import AdminNotifications from './pages/Admin/AdminNotifications';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminPaymentMethods from './pages/Admin/AdminPaymentMethods';
import AdminSettings from './pages/Admin/AdminSettings';
import InspectionPayment from './pages/InspectionPayment/InspectionPayment';
import TestLogin from './pages/TestLogin';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthGuard from './components/Auth/AuthGuard';
import AgentLogin from './pages/Agent/AgentLogin';
import AgentLayout from './components/Layout/AgentLayout';
import AgentDashboard from './pages/Agent/AgentDashboard';
import AgentMyUnits from './pages/Agent/AgentMyUnits';
import AgentAddUnit from './pages/Agent/AgentAddUnit';
import AgentInspections from './pages/Agent/AgentInspections';
import AgentProfile from './pages/Agent/AgentProfile';
import AgentProtectedRoute from './components/Auth/AgentProtectedRoute';
import LandingPage from './pages/Landing/LandingPage';
import PublicRentals from './pages/Public/PublicRentals';
import RentalUnitDetails from './pages/Public/RentalUnitDetails';
import PublicAirbnb from './pages/Public/PublicAirbnb';
import AirbnbDetails from './pages/Public/AirbnbDetails';
import Guidelines from './pages/Public/Guidelines';
import OwnerAirbnb from './pages/Airbnb/OwnerAirbnb';

function App() {
  return (
    <Routes>
      {/* Home Page - Shows Rentals */}
      <Route path="/" element={<PublicRentals />} />
      
      {/* Public Routes */}
      <Route path="/rentals" element={<PublicRentals />} />
      <Route path="/rental/:id" element={<RentalUnitDetails />} />
      <Route path="/airbnb" element={<PublicAirbnb />} />
      <Route path="/airbnb/:id" element={<AirbnbDetails />} />
      <Route path="/guidelines" element={<Guidelines />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/agent-login" element={<AgentLogin />} />
      <Route path="/inspection-payment/:paymentId" element={<InspectionPayment />} />
      <Route path="/test" element={<div>Test Route</div>} />
      <Route path="/test-login" element={<TestLogin />} />
      
      {/* Property Owner Routes */}
      <Route path="/owner" element={
        <AuthGuard>
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        </AuthGuard>
      }>
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<EnhancedFinancialDashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="units" element={<Units />} />
        <Route path="units-for-rent" element={<UnitsForRent />} />
        <Route path="airbnb" element={<OwnerAirbnb />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="payments" element={<Payments />} />
        <Route path="utilities" element={<Utilities />} />
        <Route path="inspections" element={<Inspections />} />
        <Route path="property-qr" element={<PropertyQR />} />
        <Route path="communications" element={<Communications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      
      {/* Admin Routes - Separate Layout */}
      <Route path="/admin" element={
        <AuthGuard>
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        </AuthGuard>
      }>
        <Route index element={<ModernAdminDashboard />} />
        <Route path="owners" element={<AdminPropertyOwners />} />
        <Route path="properties" element={<AdminPropertiesOverview />} />
        <Route path="units" element={<AdminUnits />} />
        <Route path="inspections" element={<AdminInspections />} />
        <Route path="payment-methods" element={<AdminPaymentMethods />} />
        <Route path="agents" element={<AdminAgents />} />
        <Route path="airbnb" element={<AdminAirbnb />} />
        <Route path="tenants" element={<AdminTenants />} />
        <Route path="system" element={<AdminSystemHealth />} />
        <Route path="activity" element={<AdminActivityLogs />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="communications" element={<Communications />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      
      {/* Agent Routes - Mobile-Optimized Layout */}
      <Route path="/agent" element={
        <AgentProtectedRoute>
          <AgentLayout />
        </AgentProtectedRoute>
      }>
        <Route index element={<AgentDashboard />} />
        <Route path="my-units" element={<AgentMyUnits />} />
        <Route path="add-unit" element={<AgentAddUnit />} />
        <Route path="inspections" element={<AgentInspections />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
