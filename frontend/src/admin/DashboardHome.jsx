import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, Layers, MessageSquare, Image, RefreshCcw } from 'lucide-react';
import { API_URL } from '../apiConfig';

const EMPTY_STATS = {
  products: 0,
  categories: 0,
  messages: 0,
  unreadMessages: 0,
  gallery: 0
};

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return { Authorization: ['Bearer', token].join(' ') };
}

export default function DashboardHome() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshStats = useCallback(async () => {
    try {
      const headers = { headers: getAuthHeaders() };
      const [productsResponse, categoriesResponse, messagesResponse, galleryResponse] = await Promise.all([
        axios.get(`${API_URL}/api/admin/products`, headers),
        axios.get(`${API_URL}/api/admin/products/categories`, headers),
        axios.get(`${API_URL}/api/admin/messages`, headers),
        axios.get(`${API_URL}/api/admin/gallery`, headers)
      ]);
      const messages = messagesResponse.data.data;
      setStats({
        products: productsResponse.data.data.length,
        categories: categoriesResponse.data.data.length,
        messages: messages.length,
        unreadMessages: messages.filter((message) => Number(message.is_read) !== 1).length,
        gallery: galleryResponse.data.data.length
      });
      setLastUpdated(new Date());
      setError('');
    } catch (requestError) {
      console.error('Gagal memperbarui ringkasan dashboard:', requestError);
      setError(requestError.response?.data?.message || 'Data dashboard belum dapat diperbarui.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshStats();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refreshStats]);

  const statCards = [
    { title: 'Total Produk', count: stats.products, icon: Package, color: 'bg-blue-500', path: '/admin/products' },
    { title: 'Kategori Produk', count: stats.categories, icon: Layers, color: 'bg-green-500', path: '/admin/products' },
    { title: 'Pesan Belum Dibaca', count: stats.unreadMessages, icon: MessageSquare, color: 'bg-amber-500', path: '/admin/messages' },
    { title: 'Album Galeri', count: stats.gallery, icon: Image, color: 'bg-purple-500', path: '/admin/gallery' }
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-600">Selamat datang kembali di panel kontrol manajemen PT Karyaguna Aditama.</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-gray-500">Diperbarui {lastUpdated.toLocaleTimeString('id-ID')}</span>}
          <button type="button" onClick={refreshStats} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-dark shadow-sm hover:bg-gray-100">
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.path} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition-shadow hover:shadow-lg">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.title}</span>
              <h2 className="mt-1 text-3xl font-bold text-brand-dark">{loading ? '...' : stat.count}</h2>
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${stat.color} text-white shadow-md`}>
              <stat.icon size={26} />
            </div>
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        {stats.messages} pesan masuk · ringkasan diperbarui otomatis setiap 15 detik selama dashboard terbuka.
      </p>
    </div>
  );
}
