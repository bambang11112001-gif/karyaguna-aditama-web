import { useEffect, useState } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const CURRENT_YEAR = new Date().getFullYear();
const initialProfile = {
  company_name: '',
  year_established: '',
  background: '',
  vision: '',
  mission: ''
};

export default function AdminCompanyProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('adminToken');
    axios.get(`${API_URL}/api/admin/company-profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (active && response.data.success && response.data.data) {
          setProfile({
            company_name: response.data.data.company_name || '',
            year_established: response.data.data.year_established || '',
            background: response.data.data.background || '',
            vision: response.data.data.vision || '',
            mission: response.data.data.mission || ''
          });
        }
      })
      .catch((requestError) => {
        console.error(requestError);
        if (active) setError(requestError.response?.data?.message || 'Gagal memuat profil perusahaan.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_URL}/api/admin/company-profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.data);
      setSuccess(response.data.message);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || 'Gagal menyimpan profil perusahaan.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
  };

  if (loading) return <div className="rounded-2xl bg-white p-8 text-center text-gray-500">Memuat profil perusahaan...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">Profil Perusahaan</h1>
        <p className="mt-1 text-sm text-gray-600">Informasi ini ditampilkan di halaman Tentang Kami.</p>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="company-name" className="mb-2 block text-sm font-semibold text-gray-700">Nama Perusahaan *</label>
            <input id="company-name" required maxLength={100} value={profile.company_name} onChange={updateField('company_name')} className="w-full rounded-lg border border-gray-300 bg-brand-bg px-4 py-3 text-sm" />
          </div>
          <div>
            <label htmlFor="year-established" className="mb-2 block text-sm font-semibold text-gray-700">Tahun Berdiri *</label>
            <input id="year-established" required type="number" min="1800" max={CURRENT_YEAR} value={profile.year_established} onChange={updateField('year_established')} className="w-full rounded-lg border border-gray-300 bg-brand-bg px-4 py-3 text-sm" />
          </div>
        </div>
        <div>
          <label htmlFor="company-background" className="mb-2 block text-sm font-semibold text-gray-700">Sejarah / Latar Belakang *</label>
          <textarea id="company-background" required rows={6} value={profile.background} onChange={updateField('background')} className="w-full rounded-lg border border-gray-300 bg-brand-bg px-4 py-3 text-sm" />
        </div>
        <div>
          <label htmlFor="company-vision" className="mb-2 block text-sm font-semibold text-gray-700">Visi *</label>
          <textarea id="company-vision" required rows={3} value={profile.vision} onChange={updateField('vision')} className="w-full rounded-lg border border-gray-300 bg-brand-bg px-4 py-3 text-sm" />
        </div>
        <div>
          <label htmlFor="company-mission" className="mb-2 block text-sm font-semibold text-gray-700">Misi *</label>
          <textarea id="company-mission" required rows={6} value={profile.mission} onChange={updateField('mission')} className="w-full rounded-lg border border-gray-300 bg-brand-bg px-4 py-3 text-sm" />
          <p className="mt-1 text-xs text-gray-500">Pisahkan setiap poin misi dengan baris baru.</p>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
            <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </div>
  );
}
