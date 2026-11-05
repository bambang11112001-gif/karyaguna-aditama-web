import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Image, Pencil, Plus, RefreshCcw, Trash2, X } from 'lucide-react';

const API_URL = 'http://localhost:5000';

function getImageSource(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_URL}${imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`}`;
}

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const requestGallery = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    return axios.get(`${API_URL}/api/admin/gallery`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }, []);

  useEffect(() => {
    let active = true;
    requestGallery()
      .then((response) => {
        if (active && response.data.success) setItems(response.data.data);
      })
      .catch((requestError) => {
        console.error(requestError);
        if (active) setError(requestError.response?.data?.message || 'Gagal memuat galeri.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [requestGallery]);

  const refreshGallery = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await requestGallery();
      if (response.data.success) setItems(response.data.data);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || 'Gagal memuat galeri.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editingItem && images.length === 0) {
      setError('Pilih foto dokumentasi terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      images.forEach((image) => formData.append('images', image));
      const token = localStorage.getItem('adminToken');
      const requestMethod = editingItem ? 'put' : 'post';
      const endpoint = editingItem ? `${API_URL}/api/admin/gallery/${editingItem.id}` : `${API_URL}/api/admin/gallery`;
      await axios[requestMethod](endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      closeForm();
      await refreshGallery();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || 'Gagal menyimpan dokumentasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const openNewForm = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('');
    setImages([]);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category || item.description || '');
    setImages([]);
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setTitle('');
    setCategory('');
    setImages([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus dokumentasi ini?')) return;
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/admin/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshGallery();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || 'Gagal menghapus dokumentasi.');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Manajemen Galeri</h1>
          <p className="mt-1 text-sm text-gray-600">Kelola foto dokumentasi kegiatan, distribusi, dan pergudangan.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={refreshGallery} className="flex items-center gap-2 rounded-lg bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-gray-200">
            <RefreshCcw size={16} /> Refresh
          </button>
          <button onClick={openNewForm} className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            <Plus size={16} /> Tambah Album
          </button>
        </div>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-dark">{editingItem ? 'Edit Album Dokumentasi' : 'Tambah Album Dokumentasi'}</h2>
            <button type="button" onClick={closeForm} aria-label="Tutup form" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div>
            <label htmlFor="gallery-category" className="mb-2 block text-sm font-semibold text-gray-700">Kategori *</label>
            <input id="gallery-category" list="gallery-category-options" required maxLength={60} value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-brand-bg px-4 py-3 text-sm" placeholder="Contoh: LOGISTIK & DISTRIBUSI" />
            <datalist id="gallery-category-options">
              <option value="LOGISTIK & DISTRIBUSI" />
              <option value="OPERASIONAL" />
              <option value="KOMODITAS" />
              <option value="PERTANIAN" />
              <option value="PROCUREMENT" />
              <option value="KORPORAT" />
            </datalist>
          </div>
          <div>
            <label htmlFor="gallery-title" className="mb-2 block text-sm font-semibold text-gray-700">Judul *</label>
            <input id="gallery-title" required maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-brand-bg px-4 py-3 text-sm" placeholder="Contoh: Distribusi Komoditas Pangan" />
          </div>
          <div>
            <label htmlFor="gallery-images" className="mb-2 block text-sm font-semibold text-gray-700">
              {editingItem ? 'Tambah foto pendukung' : 'Foto album *'}
            </label>
            <input
              id="gallery-images"
              type="file"
              required={!editingItem}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => {
                const selectedImages = Array.from(event.target.files || []);
                if (selectedImages.length > 10) {
                  setError('Maksimal 10 foto dapat dipilih sekaligus.');
                  setImages([]);
                  event.target.value = '';
                  return;
                }
                if (selectedImages.some((file) => file.size > 5 * 1024 * 1024)) {
                  setError('Ukuran setiap foto maksimal 5 MB.');
                  setImages([]);
                  event.target.value = '';
                  return;
                }
                setError('');
                setImages(selectedImages);
              }}
              className="w-full rounded-lg border border-gray-300 bg-brand-bg px-4 py-3 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG, WEBP, atau GIF. Maksimal 10 foto, masing-masing 5 MB.
              {editingItem ? ' Foto yang dipilih akan ditambahkan ke album yang sudah ada.' : ' Foto pertama menjadi cover album.'}
            </p>
            {editingItem?.photos?.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-sm text-gray-600">Foto dalam album saat ini:</p>
                <div className="flex flex-wrap gap-2">
                  {editingItem.photos.map((photo, index) => (
                    <img
                      key={photo.id || photo.image_url}
                      src={getImageSource(photo.image_url)}
                      alt={`Foto album ${index + 1}`}
                      title={photo.is_cover ? 'Cover album' : `Foto ${index + 1}`}
                      className={`h-16 w-20 rounded-lg object-cover ${photo.is_cover ? 'ring-2 ring-brand-primary' : ''}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {images.length > 0 && <p className="mt-2 text-sm text-gray-600">{images.length} foto dipilih</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeForm} className="rounded-lg bg-gray-100 px-5 py-3 font-semibold text-gray-700">Batal</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-brand-primary px-5 py-3 font-semibold text-white disabled:opacity-50">{submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Simpan Album'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500">Memuat galeri...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-gray-500">
          <Image className="mx-auto mb-3" />
          Belum ada foto dokumentasi.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card">
              <img src={getImageSource(item.image_url)} alt={item.title} className="h-56 w-full object-cover" />
              <div className="flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-primary">{item.category || item.description}</p>
                  <h2 className="mt-2 font-bold text-brand-dark">{item.title}</h2>
                  <p className="mt-2 text-xs text-gray-500">{item.photos?.length || 1} foto dalam album</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditForm(item)} title="Edit album" aria-label="Edit album" className="rounded-lg p-2 text-brand-primary hover:bg-brand-bg">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} title="Hapus dokumentasi" aria-label="Hapus album" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
