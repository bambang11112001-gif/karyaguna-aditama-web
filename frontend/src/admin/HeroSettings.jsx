import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Image, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { API_URL, getBackendAssetUrl } from '../apiConfig';

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return { Authorization: ['Bearer', token].join(' ') };
}

export default function HeroSettings() {
  const [slides, setSlides] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const requestSlides = useCallback(
    () => axios.get(`${API_URL}/api/admin/hero`, { headers: getAuthHeaders() }),
    []
  );

  const refreshSlides = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await requestSlides();
      if (response.data.success) setSlides(response.data.data);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || 'Gagal memuat slideshow.');
    } finally {
      setLoading(false);
    }
  }, [requestSlides]);

  useEffect(() => {
    let active = true;
    requestSlides()
      .then((response) => {
        if (active && response.data.success) setSlides(response.data.data);
      })
      .catch((requestError) => {
        console.error(requestError);
        if (active) setError(requestError.response?.data?.message || 'Gagal memuat slideshow.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [requestSlides]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!image) {
      setError('Pilih foto background terlebih dahulu.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', image);
      await axios.post(
        `${API_URL}/api/admin/hero`,
        formData,
        { headers: getAuthHeaders() }
      );
      setImage(null);
      await refreshSlides();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || 'Gagal menambahkan foto slideshow.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slideId) => {
    if (!window.confirm('Hapus foto ini dari slideshow halaman utama?')) return;
    setError('');
    try {
      await axios.delete(`${API_URL}/api/admin/hero/${slideId}`, { headers: getAuthHeaders() });
      await refreshSlides();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || 'Gagal menghapus foto slideshow.');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">Background Slideshow</h1>
        <p className="mt-1 text-sm text-gray-600">Kelola foto latar yang tampil bergantian pada halaman utama.</p>
      </div>

      {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-brand-dark">Tambah Foto Slide</h2>
        <div>
          <label htmlFor="hero-image-file" className="mb-2 block text-sm font-semibold text-gray-700">Foto background *</label>
          <input
            id="hero-image-file"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => {
              const selectedImage = event.target.files?.[0] || null;
              if (selectedImage && selectedImage.size > 5 * 1024 * 1024) {
                setError('Ukuran foto maksimal 5 MB.');
                setImage(null);
                event.target.value = '';
                return;
              }
              setError('');
              setImage(selectedImage);
            }}
            className="w-full rounded-lg border border-gray-300 bg-brand-bg px-4 py-3 text-sm"
          />
          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG, WEBP, atau GIF. Maksimal 5 MB.
          </p>
        </div>
        {image && <p className="text-sm text-gray-600">{image.name}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={saving || !image} className="flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
            <Plus size={18} /> {saving ? 'Menyimpan...' : 'Tambah Foto'}
          </button>
        </div>
      </form>

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-brand-dark">Daftar Foto ({slides.length})</h2>
        <button type="button" onClick={refreshSlides} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-dark shadow-sm hover:bg-gray-100">
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500">Memuat foto slideshow...</div>
      ) : slides.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-gray-500">
          <Image className="mx-auto mb-3" />
          Belum ada foto slideshow. Hero akan menggunakan latar hijau bawaan.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {slides.map((slide, index) => (
            <article key={slide.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card">
              <img
                src={getBackendAssetUrl(slide.image_url)}
                alt={`Slide ${index + 1}`}
                className="h-48 w-full bg-brand-bg object-cover"
              />
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-dark" title={slide.image_url}>{slide.image_url}</p>
                  <p className="mt-1 text-xs text-gray-500">Urutan {slide.order_priority} · {slide.is_active ? 'Aktif' : 'Nonaktif'}</p>
                </div>
                <button type="button" onClick={() => handleDelete(slide.id)} aria-label={`Hapus slide ${index + 1}`} title="Hapus slide" className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50">
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
