import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, RefreshCcw, Edit2 } from 'lucide-react';
import { API_URL } from '../apiConfig';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: ''
  });

  const getImageSource = (imageUrl) => {
    if (!imageUrl || imageUrl === 'default-product.jpg') return '';
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    return `${API_URL}${imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`}`;
  };

  const requestData = useCallback(() => {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      return Promise.all([
        axios.get(`${API_URL}/api/admin/products`, { headers }),
        axios.get(`${API_URL}/api/admin/products/categories`, { headers })
      ]);
  }, []);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError('');
    }

    try {
      const [prodRes, catRes] = await requestData();
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memuat data produk.');
    } finally {
      setLoading(false);
    }
  }, [requestData]);

  useEffect(() => {
    let active = true;
    requestData()
      .then(([prodRes, catRes]) => {
        if (!active) return;
        if (prodRes.data.success) setProducts(prodRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError(err.response?.data?.message || 'Gagal memuat data produk.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const productData = new FormData();
      productData.append('category_id', formData.category_id);
      productData.append('name', formData.name);
      productData.append('description', formData.description);
      if (selectedImage) productData.append('image', selectedImage);

      const request = editingProduct
        ? axios.put(`${API_URL}/api/admin/products/${editingProduct.id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        : axios.post(`${API_URL}/api/admin/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await request;
      if (res.data.success) {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ category_id: '', name: '', description: '' });
        setSelectedImage(null);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal menambahkan produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ category_id: '', name: '', description: '' });
    setSelectedImage(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      category_id: String(product.category_id || ''),
      name: product.name || '',
      description: product.description || ''
    });
    setSelectedImage(null);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ category_id: '', name: '', description: '' });
    setSelectedImage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal menghapus produk.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Manajemen Katalog Produk</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola daftar komoditas dan produk pangan PT Karyaguna Aditama.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="bg-brand-bg text-brand-dark hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
            <RefreshCcw size={16} /> Refresh
          </button>
          <button onClick={openCreateModal} className="bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={16} /> Tambah Produk
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabel Produk */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data produk...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada data produk.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4">Nama Komoditas</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4">Foto / Gambar</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-brand-dark flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-bg rounded-lg flex items-center justify-center text-brand-primary">
                        <Package size={20} />
                      </div>
                      {prod.name}
                    </td>
                    <td className="p-4">
                      <span className="bg-brand-bg text-brand-primary px-2.5 py-1 rounded-full text-xs font-semibold">
                        {prod.category_name || 'Umum'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">{prod.description}</td>
                    <td className="p-4">
                      {getImageSource(prod.image_url) ? (
                        <img
                          src={getImageSource(prod.image_url)}
                          alt={prod.name}
                          className="h-12 w-16 rounded object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-500">Belum ada foto</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="rounded-lg p-2 text-brand-primary transition-colors hover:bg-brand-bg"
                        title="Edit produk"
                        aria-label={`Edit produk ${prod.name}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prod.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Produk */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border-t-4 border-brand-primary max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-brand-dark mb-6">{editingProduct ? 'Edit Komoditas' : 'Tambah Komoditas Baru'}</h3>
            <form onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Nama Komoditas *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Contoh: Beras Premium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Kategori *</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Pilih Kategori Komoditas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Deskripsi Produk *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Tuliskan spesifikasi singkat komoditas..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Foto Produk (Opsional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.size > 5 * 1024 * 1024) {
                      setError('Ukuran foto maksimal 5 MB.');
                      setSelectedImage(null);
                      e.target.value = '';
                      return;
                    }
                    setError('');
                    setSelectedImage(file);
                  }}
                  className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <p className="mt-1 text-xs text-gray-500">Format JPG, PNG, WEBP, atau GIF. Maksimal 5 MB.</p>
                {editingProduct?.image_url && !selectedImage && getImageSource(editingProduct.image_url) && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={getImageSource(editingProduct.image_url)} alt={`Foto ${editingProduct.name} saat ini`} className="h-14 w-20 rounded object-cover" />
                    <span className="text-xs text-gray-500">Foto saat ini dipertahankan jika tidak memilih foto baru.</span>
                  </div>
                )}
                {selectedImage && <p className="mt-2 text-sm text-gray-600">{selectedImage.name}</p>}
              </div>

              {error && <p className="text-sm text-red-700">{error}</p>}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition-colors shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : editingProduct ? 'Simpan Perubahan' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}