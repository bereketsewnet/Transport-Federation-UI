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

// Placeholder pages for routes not yet fully implemented
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
          
          {/* Placeholders - not yet implemented */}
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
