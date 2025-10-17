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
import About from '@pages/Public/About';
import NewsList from '@pages/Public/NewsList';
import NewsDetail from '@pages/Public/NewsDetail';
import Gallery from '@pages/Public/Gallery';
import Contact from '@pages/Public/Contact';

// Admin Pages
import Dashboard from '@pages/Admin/Dashboard';
import Reports from '@pages/Admin/Reports';
import { MembersList, MemberForm, MemberView } from '@pages/Admin/Members';
import { ErrorBoundary } from '@components/ErrorBoundary';

// Admin News
import AdminNewsList from '@pages/Admin/News/NewsList';
import AdminNewsForm from '@pages/Admin/News/NewsForm';

// Admin Gallery
import AdminGalleryList from '@pages/Admin/Gallery/GalleryList';
import AdminGalleryForm from '@pages/Admin/Gallery/GalleryForm';
import PhotoManager from '@pages/Admin/Gallery/PhotoManager';

// Admin Other
import ContactManager from '@pages/Admin/ContactManager';
import AboutEditor from '@pages/Admin/AboutEditor';
import TestForm from '@pages/Admin/TestForm';
import SimpleTest from '@pages/Admin/SimpleTest';

// Admin Unions
import UnionsListComplete from '@pages/Admin/Unions/UnionsListComplete';
import UnionFormComplete from '@pages/Admin/Unions/UnionFormComplete';

// Admin Executives
import ExecutivesListComplete from '@pages/Admin/Executives/ExecutivesListComplete';
import ExecutivesFormComplete from '@pages/Admin/Executives/ExecutivesFormComplete';

// Admin CBAs
import CBAsListComplete from '@pages/Admin/CBAs/CBAsListComplete';
import CBAsFormComplete from '@pages/Admin/CBAs/CBAsFormComplete';

// Admin Archives
import ArchivesListComplete from '@pages/Admin/Archives/ArchivesListComplete';
import ArchivesFormComplete from '@pages/Admin/Archives/ArchivesFormComplete';

// Admin Terminated Unions
import TerminatedUnionsListComplete from '@pages/Admin/TerminatedUnions/TerminatedUnionsListComplete';
import TerminatedUnionsFormComplete from '@pages/Admin/TerminatedUnions/TerminatedUnionsFormComplete';

// Placeholder pages for routes not yet fully implemented

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
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
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
          
          {/* Members Management */}
          <Route path="members" element={
            <ErrorBoundary>
              <MembersList />
            </ErrorBoundary>
          } />
          <Route path="members/new" element={
            <ErrorBoundary>
              <MemberForm />
            </ErrorBoundary>
          } />
          <Route path="members/:id" element={
            <ErrorBoundary>
              <MemberView />
            </ErrorBoundary>
          } />
          <Route path="members/:id/edit" element={
            <ErrorBoundary>
              <MemberForm />
            </ErrorBoundary>
          } />
          
          {/* News Management */}
          <Route path="news" element={<AdminNewsList />} />
          <Route path="news/new" element={<AdminNewsForm />} />
          <Route path="news/:id/edit" element={<AdminNewsForm />} />
          
          {/* Gallery Management */}
          <Route path="gallery" element={<AdminGalleryList />} />
          <Route path="gallery/new" element={<AdminGalleryForm />} />
          <Route path="gallery/:id/edit" element={<AdminGalleryForm />} />
          <Route path="gallery/:galleryId/photos" element={<PhotoManager />} />
          
          {/* Contact & About */}
          <Route path="contacts" element={<ContactManager />} />
          <Route path="about-editor" element={<AboutEditor />} />
          
          {/* Test Form */}
          <Route path="test-form" element={<TestForm />} />
          <Route path="simple-test" element={<SimpleTest />} />
          
          {/* Unions Management */}
          <Route path="unions" element={<UnionsListComplete />} />
          <Route path="unions/new" element={<UnionFormComplete />} />
          <Route path="unions/:id/edit" element={<UnionFormComplete />} />
          
          {/* Executives Management */}
          <Route path="executives" element={<ExecutivesListComplete />} />
          <Route path="executives/new" element={<ExecutivesFormComplete />} />
          <Route path="executives/:id/edit" element={<ExecutivesFormComplete />} />
          
          {/* CBAs Management */}
          <Route path="cbas" element={<CBAsListComplete />} />
          <Route path="cbas/new" element={<CBAsFormComplete />} />
          <Route path="cbas/:id/edit" element={<CBAsFormComplete />} />

          {/* Archives Management */}
          <Route path="archives" element={<ArchivesListComplete />} />
          <Route path="archives/new" element={<ArchivesFormComplete />} />
          <Route path="archives/:id/edit" element={<ArchivesFormComplete />} />

          {/* Terminated Unions Management */}
          <Route path="terminated-unions" element={<TerminatedUnionsListComplete />} />
          <Route path="terminated-unions/new" element={<TerminatedUnionsFormComplete />} />
          <Route path="terminated-unions/:id/edit" element={<TerminatedUnionsFormComplete />} />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
