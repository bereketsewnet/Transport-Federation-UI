import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@components/Toast';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { PublicLayout } from '@components/Layout';
import { AdminLayout } from '@components/Layout';

// Auth Pages
import Login from '@pages/Auth/Login';
import ChangePassword from '@pages/Auth/ChangePassword';

// Public Pages
import Home from '@pages/Public/Home';

// Admin Pages
import Dashboard from '@pages/Admin/Dashboard';
import Reports from '@pages/Admin/Reports';
import MembersList from '@pages/Admin/Members/MembersList';

// Simple placeholder pages for routes not yet fully implemented
const NewsPage = () => (
  <div className="page">
    <div className="container">
      <h1>News</h1>
      <p>News listing will be displayed here.</p>
    </div>
  </div>
);

const GalleryPage = () => (
  <div className="page">
    <div className="container">
      <h1>Gallery</h1>
      <p>Photo galleries will be displayed here.</p>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="page">
    <div className="container">
      <h1>About Us</h1>
      <p>Information about the Transport & Communication Workers Federation.</p>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="page">
    <div className="container">
      <h1>Contact Us</h1>
      <p>Get in touch with us.</p>
    </div>
  </div>
);

const UnionsPage = () => (
  <div className="page">
    <div className="container">
      <h1>Unions Management</h1>
      <p>Manage all worker unions here.</p>
    </div>
  </div>
);

const ExecutivesPage = () => (
  <div className="page">
    <div className="container">
      <h1>Union Executives</h1>
      <p>Manage union executive members here.</p>
    </div>
  </div>
);

const CBAsPage = () => (
  <div className="page">
    <div className="container">
      <h1>Collective Bargaining Agreements</h1>
      <p>Manage CBAs here.</p>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="page">
    <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ color: 'var(--primary)' }}>
        Go back home
      </a>
    </div>
  </div>
);

const UnauthorizedPage = () => (
  <div className="page">
    <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1>401 - Unauthorized</h1>
      <p>You don't have permission to access this page.</p>
      <a href="/" style={{ color: 'var(--primary)' }}>
        Go back home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <>
      <ToastProvider />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth Routes - Standalone (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'member']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="members" element={<MembersList />} />
          <Route path="unions" element={<UnionsPage />} />
          <Route path="executives" element={<ExecutivesPage />} />
          <Route path="cbas" element={<CBAsPage />} />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
