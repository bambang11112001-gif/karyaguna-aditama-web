import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Building2, Package, Image, PanelsTopLeft, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (!token) {
      navigate('/admin/login');
    } else {
      setAdminName(user.name || 'Administrator');
    }
  }, [navigate]);

  const refreshUnreadMessages = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:5000/api/admin/messages', {
        headers: { Authorization: ['Bearer', token].join(' ') }
      });
      if (response.data.success) {
        setUnreadMessages(response.data.data.filter((message) => Number(message.is_read) !== 1).length);
      }
    } catch (error) {
      console.error('Gagal memperbarui jumlah pesan belum dibaca:', error);
    }
  }, []);

  useEffect(() => {
    refreshUnreadMessages();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshUnreadMessages();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refreshUnreadMessages]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Company Profile', path: '/admin/company', icon: Building },
    { name: 'Business Fields', path: '/admin/business-fields', icon: Building2 },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Gallery', path: '/admin/gallery', icon: Image },
    { name: 'Hero Slideshow', path: '/admin/hero', icon: PanelsTopLeft },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
    { name: 'Settings', path: '/admin/settings/site', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path || (path.startsWith('/admin/settings') && location.pathname.startsWith('/admin/settings/'));

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar untuk Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-dark text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary text-white font-heading font-bold flex items-center justify-center rounded-lg">
              KGA
            </div>
            <div>
              <span className="font-heading font-bold text-lg block leading-tight">Admin CMS</span>
              <span className="text-[10px] text-gray-400">PT Karyaguna Aditama</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.path) ? 'bg-brand-primary text-white shadow-md' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span className="flex-1">{item.name}</span>
              {item.name === 'Messages' && unreadMessages > 0 && (
                <span className="min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="flex-grow lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-brand-dark">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <span className="block text-sm font-bold text-brand-dark">{adminName}</span>
              <span className="text-xs text-brand-muted">Super Administrator</span>
            </div>
            <div className="w-10 h-10 bg-brand-bg rounded-full border border-gray-300 flex items-center justify-center font-bold text-brand-primary">
              {adminName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Halaman Konten Dashboard */}
        <main className="flex-grow p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}