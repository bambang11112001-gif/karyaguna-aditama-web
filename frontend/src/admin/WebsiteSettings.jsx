import { useEffect, useState } from 'react';
import axios from 'axios';
import { ImageUp, Save, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const blankSettings = {
  website_name: '',
  tagline: '',
  logo_url: '',
  address: '',
  phone: '',
  email: '',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  youtube_url: ''
};

const imageUrl = (url) => !url ? '' : /^https?:\/\//i.test(url) ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;

export default function WebsiteSettings() {
  const [settings, setSettings] = useState(blankSettings);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [removeLogo, setRemoveLogo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('adminToken');
    axios.get(`${API_URL}/api/admin/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (active && data.success) setSettings({ ...blankSettings, ...data.data });
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Gagal memuat pengaturan website.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const updateField = (field) => (event) => setSettings((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body = new FormData();
      Object.entries(settings).forEach(([key, value]) => {
        if (key !== 'logo_url') body.append(key, value || '');
      });
      body.append('remove_logo', String(removeLogo));
      if (logoFile) body.append('image', logoFile);
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.put(`${API_URL}/api/admin/settings`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings({ ...blankSettings, ...data.data });
      setLogoFile(null);
      setLogoPreview('');
      setRemoveLogo(false);
      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Gagal menyimpan pengaturan website.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center text-sm text-gray-500">Memuat pengaturan website...</div>;

  const currentLogo = logoPreview || (!removeLogo ? imageUrl(settings.logo_url) : '');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-brand-dark">Informasi Website</h2>
        <p className="mt-1 text-sm text-gray-600">Informasi ini digunakan pada header, footer, dan halaman kontak publik.</p>
      </div>
      {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <section className="border-b border-gray-200 pb-8">
          <h3 className="mb-5 text-sm font-bold uppercase text-gray-500">Identitas Website</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">Nama website *
              <input required maxLength={150} value={settings.website_name} onChange={updateField('website_name')} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-gray-700">Tagline
              <input maxLength={255} value={settings.tagline} onChange={updateField('tagline')} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal" />
            </label>
          </div>
          <div className="mt-5">
            <span className="block text-sm font-semibold text-gray-700">Logo</span>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="flex h-20 w-36 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {currentLogo ? <img src={currentLogo} alt="Preview logo website" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-gray-400">Belum ada logo</span>}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-gray-50">
                <ImageUp size={17} /> Pilih logo
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setLogoFile(file);
                  setLogoPreview(file ? URL.createObjectURL(file) : '');
                  setRemoveLogo(false);
                }} />
              </label>
              {settings.logo_url && !removeLogo && <button type="button" onClick={() => { setLogoFile(null); setRemoveLogo(true); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={16} /> Hapus logo</button>}
              <span className="text-xs text-gray-500">JPG, PNG, WEBP, GIF. Maksimal 5 MB.</span>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200 pb-8">
          <h3 className="mb-5 text-sm font-bold uppercase text-gray-500">Informasi Kontak</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Alamat
              <textarea rows={2} maxLength={255} value={settings.address} onChange={updateField('address')} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-gray-700">Telepon / WhatsApp
              <input maxLength={50} value={settings.phone} onChange={updateField('phone')} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-gray-700">Email
              <input type="email" maxLength={150} value={settings.email} onChange={updateField('email')} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal" />
            </label>
          </div>
        </section>

        <section className="pb-2">
          <h3 className="mb-5 text-sm font-bold uppercase text-gray-500">Social Media</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            {['facebook', 'instagram', 'linkedin', 'youtube'].map((network) => (
              <label key={network} className="text-sm font-semibold capitalize text-gray-700">{network}
                <input type="url" maxLength={255} value={settings[`${network}_url`]} onChange={updateField(`${network}_url`)} placeholder="https://" className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal" />
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end border-t border-gray-200 pt-5">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
            <Save size={17} /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}