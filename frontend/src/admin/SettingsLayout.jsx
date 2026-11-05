import { NavLink, Outlet } from 'react-router-dom';
import { Globe2, Users } from 'lucide-react';

export default function SettingsLayout() {
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  } catch {
    user = {};
  }

  const tabs = [
    { name: 'Website Settings', path: '/admin/settings/site', icon: Globe2 },
    ...(user.role === 'superadmin' ? [{ name: 'User Management', path: '/admin/settings/users', icon: Users }] : [])
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Pengaturan informasi website dan akses admin.</p>
      </div>
      <nav aria-label="Menu pengaturan" className="mb-8 flex gap-2 overflow-x-auto border-b border-gray-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${isActive ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-dark'}`}
          >
            <tab.icon size={17} /> {tab.name}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}