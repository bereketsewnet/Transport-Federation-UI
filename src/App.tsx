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
import MembersList from '@pages/Admin/Members/MembersList';

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
import { UnionsList, UnionsForm } from '@pages/Admin/Unions';
import UnionsFormFixed from '@pages/Admin/Unions/UnionsFormFixed';

// Admin Executives
import { ExecutivesList, ExecutivesForm } from '@pages/Admin/Executives';
import ExecutivesListFixed from '@pages/Admin/Executives/ExecutivesListFixed';

// Admin CBAs
import { CBAsList, CBAsForm } from '@pages/Admin/CBAs';
import CBAsListFixed from '@pages/Admin/CBAs/CBAsListFixed';

// Admin Archives
import { ArchivesList, ArchivesForm } from '@pages/Admin/Archives';

// Admin Terminated Unions
import { TerminatedUnionsList, TerminatedUnionsForm } from '@pages/Admin/TerminatedUnions';

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
          <Route path="members" element={<MembersList />} />
          
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
          <Route path="unions" element={<UnionsList />} />
          <Route path="unions/new" element={<UnionsFormFixed />} />
          <Route path="unions/:id/edit" element={<UnionsFormFixed />} />
          
          {/* Executives Management */}
          <Route path="executives" element={<ExecutivesListFixed />} />
          <Route path="executives/new" element={<ExecutivesForm />} />
          <Route path="executives/:id/edit" element={<ExecutivesForm />} />
          
              {/* CBAs Management */}
              <Route path="cbas" element={<CBAsListFixed />} />
              <Route path="cbas/new" element={<CBAsForm />} />
              <Route path="cbas/:id/edit" element={<CBAsForm />} />
              <Route path="cbas/:id/view" element={<CBAsForm />} />

              {/* Archives Management */}
              <Route path="archives" element={<ArchivesList />} />
              <Route path="archives/new" element={<ArchivesForm />} />
              <Route path="archives/:id/edit" element={<ArchivesForm />} />

              {/* Terminated Unions Management */}
              <Route path="terminated-unions" element={<TerminatedUnionsList />} />
              <Route path="terminated-unions/new" element={<TerminatedUnionsForm />} />
              <Route path="terminated-unions/:id/edit" element={<TerminatedUnionsForm />} />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
