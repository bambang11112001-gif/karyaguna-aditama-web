import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import About from './pages/About';
import Business from './pages/Business';
import Products from './pages/Products';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

// Admin Imports
import AdminLogin from './admin/Login';
import DashboardLayout from './admin/DashboardLayout';
import DashboardHome from './admin/DashboardHome';
import AdminMessages from './admin/Messages';
import AdminProducts from './admin/Products';
import AdminGallery from './admin/Gallery';
import AdminCompanyProfile from './admin/CompanyProfile';
import SettingsLayout from './admin/SettingsLayout';
import WebsiteSettings from './admin/WebsiteSettings';
import UserManagement from './admin/UserManagement';
import AdminBusinessFields from './admin/BusinessFields';
import HeroSettings from './admin/HeroSettings';

// Placeholder untuk halaman admin lainnya
const AdminPlaceholder = ({ title }) => (
  <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-200">
    <h1 className="text-2xl font-bold text-brand-dark mb-2">{title} Management</h1>
    <p className="text-gray-600 text-sm">Modul CRUD untuk {title} siap dikonfigurasi.</p>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="business" element={<Business />} />
          <Route path="products" element={<Products />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Rute Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Rute Admin Dashboard (Protected) */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="company" element={<AdminCompanyProfile />} />
          <Route path="business-fields" element={<AdminBusinessFields />} />
          <Route path="categories" element={<AdminPlaceholder title="Category" />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="hero" element={<HeroSettings />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="site" replace />} />
            <Route path="site" element={<WebsiteSettings />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;