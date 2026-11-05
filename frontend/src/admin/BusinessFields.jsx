import { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { API_URL } from '../apiConfig';

const emptyForm = { title: '', description: '', icon: 'Building2' };

function getImageSource(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

export default function AdminBusinessFields() {
  const [businessFields, setBusinessFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const fetchBusinessFields = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get(`${API_URL}/api/admin/business-fields`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setBusinessFields(data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Gagal memuat bidang usaha.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('adminToken');
    axios.get(`${API_URL}/api/admin/business-fields`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(({ data }) => {
        if (active && data.success) setBusinessFields(data.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Gagal memuat bidang usaha.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setEditingField(null);
    setForm(emptyForm);
    setExistingImages([]);
    setSelectedImages([]);
  };

  const openCreateForm = () => {
    setError('');
    setSuccess('');
    setEditingField(null);
    setForm(emptyForm);
    setExistingImages([]);
    setSelectedImages([]);
    setShowForm(true);
  };

  const openEditForm = (field) => {
    setError('');
    setSuccess('');
    setEditingField(field);
    setForm({ title: field.title, description: field.description, icon: field.icon || 'Building2' });
    setExistingImages(field.image_urls || (field.image_url ? [field.image_url] : []));
    setSelectedImages([]);
    setShowForm(true);
  };

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 10) {
      setError('Pilih maksimal 10 foto sekaligus.');
      event.target.value = '';
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError('Ukuran setiap foto maksimal 5 MB.');
      event.target.value = '';
      return;
    }
    setError('');
    setSelectedImages(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('adminToken');
    const body = new FormData();
    body.append('title', form.title);
    body.append('description', form.description);
    body.append('icon', form.icon);
    body.append('keep_image_urls', JSON.stringify(existingImages));
    selectedImages.forEach((image) => body.append('images', image));

    try {
      const request = editingField
        ? axios.put(`${API_URL}/api/admin/business-fields/${editingField.id}`, body, {
          headers: { Authorization: `Bearer ${token}` }
        })
        : axios.post(`${API_URL}/api/admin/business-fields`, body, {
          headers: { Authorization: `Bearer ${token}` }
        });
      const { data } = await request;
      setSuccess(data.message);
      closeForm();
      await fetchBusinessFields();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Gagal menyimpan bidang usaha.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (field) => {
    if (!window.confirm(`Hapus bidang usaha "${field.title}" beserta fotonya?`)) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.delete(`${API_URL}/api/admin/business-fields/${field.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBusinessFields((current) => current.filter((item) => item.id !== field.id));
      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Gagal menghapus bidang usaha.');
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Business Fields</h1>
          <p className="mt-1 text-sm text-gray-600">Kelola deskripsi layanan dan galeri foto pada halaman publik.</p>
        </div>
        <button onClick={openCreateForm} className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          <Plus size={17} /> Tambah Bidang Usaha
        </button>
      </div>

      {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? <div className="p-8 text-center text-sm text-gray-500">Memuat bidang usaha...</div> : businessFields.length === 0 ? <div className="p-8 text-center text-sm text-gray-500">Belum ada bidang usaha.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr><th className="p-4">Bidang Usaha</th><th className="p-4">Deskripsi</th><th className="p-4">Foto</th><th className="p-4 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {businessFields.map((field) => (
                  <tr key={field.id}>
                    <td className="p-4 font-semibold text-brand-dark">{field.title}</td>
                    <td className="max-w-lg p-4 text-gray-600">{field.description}</td>
                    <td className="p-4 text-gray-600">{(field.image_urls || []).length} foto</td>
                    <td className="whitespace-nowrap p-4 text-right">
                      <button onClick={() => openEditForm(field)} title="Edit bidang usaha" aria-label={`Edit ${field.title}`} className="rounded-lg p-2 text-brand-primary hover:bg-brand-bg"><Edit2 size={17} /></button>
                      <button onClick={() => handleDelete(field)} title="Hapus bidang usaha" aria-label={`Hapus ${field.title}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeForm}>
          <section role="dialog" aria-modal="true" aria-labelledby="business-field-form-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h2 id="business-field-form-title" className="text-xl font-bold text-brand-dark">{editingField ? 'Edit Bidang Usaha' : 'Tambah Bidang Usaha'}</h2>
              <button onClick={closeForm} aria-label="Tutup" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <label className="block text-sm font-semibold text-gray-700">Nama bidang usaha *
                <input required maxLength={100} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" />
              </label>
              <label className="block text-sm font-semibold text-gray-700">Deskripsi *
                <textarea required rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" />
              </label>
              <label className="block text-sm font-semibold text-gray-700">Ikon
                <select value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal">
                  <option value="Building2">Jasa Konstruksi</option>
                  <option value="TrendingUp">Food Trading</option>
                  <option value="ShieldCheck">Procurement</option>
                </select>
              </label>
              <div>
                <label htmlFor="business-field-images" className="block text-sm font-semibold text-gray-700">Foto bidang usaha</label>
                <input id="business-field-images" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelection} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm" />
                <p className="mt-1 text-xs text-gray-500">Pilih maksimal 10 foto sekaligus. Format JPG, PNG, WEBP, atau GIF; maksimal 5 MB per foto.</p>
              </div>

              {(existingImages.length > 0 || selectedImages.length > 0) && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Foto terpilih</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingImages.map((url) => (
                      <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200">
                        <img src={getImageSource(url)} alt="Foto bidang usaha tersimpan" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => setExistingImages((current) => current.filter((item) => item !== url))} aria-label="Hapus foto tersimpan" className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-600 shadow hover:bg-white"><X size={15} /></button>
                      </div>
                    ))}
                    {selectedImages.map((file) => (
                      <div key={`${file.name}-${file.lastModified}`} className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-xs text-gray-600">
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700">Batal</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">{saving ? 'Menyimpan...' : editingField ? 'Simpan Perubahan' : 'Simpan Bidang Usaha'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}