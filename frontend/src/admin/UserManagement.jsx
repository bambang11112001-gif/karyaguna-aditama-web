import { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit2, KeyRound, Plus, Trash2, UserPlus, X } from 'lucide-react';
import { API_URL } from '../apiConfig';

const emptyAdmin = { name: '', username: '', email: '', password: '' };

export default function UserManagement() {
  const [isSuperAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminUser') || '{}').role === 'superadmin';
    } catch {
      return false;
    }
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(isSuperAdmin);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState(emptyAdmin);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    let active = true;
    axios.get(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(({ data }) => {
        if (active) setUsers(data.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Gagal memuat akun admin.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [isSuperAdmin]);

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = editingAdmin
        ? await axios.put(`${API_URL}/api/admin/users/${editingAdmin.id}`, adminForm, { headers })
        : await axios.post(`${API_URL}/api/admin/users`, adminForm, { headers });
      setUsers((current) => editingAdmin
        ? current.map((user) => user.id === editingAdmin.id ? data.data : user)
        : [...current, data.data]);
      setAdminForm(emptyAdmin);
      setEditingAdmin(null);
      setShowCreate(false);
      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Gagal membuat akun admin.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await axios.put(`${API_URL}/api/admin/users/${resetTarget.id}/password`, { new_password: resetPassword }, { headers });
      setResetTarget(null);
      setResetPassword('');
      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Gagal mengubah password admin.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus akun admin ${user.username}?`)) return;
    setError('');
    setSuccess('');
    try {
      const { data } = await axios.delete(`${API_URL}/api/admin/users/${user.id}`, { headers });
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Gagal menghapus akun admin.');
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('Konfirmasi password baru tidak sama.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await axios.put(`${API_URL}/api/admin/users/password`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      }, { headers });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}

      <section className="mb-10 max-w-3xl border-b border-gray-200 pb-10">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-brand-dark">Ubah Password</h2>
          <p className="mt-1 text-sm text-gray-600">Gunakan password baru minimal 12 karakter.</p>
        </div>
        <form onSubmit={handleChangePassword} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Password saat ini
            <input type="password" required autoComplete="current-password" value={passwordForm.current_password} onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal" />
          </label>
          <label className="text-sm font-semibold text-gray-700">Password baru
            <input type="password" required minLength={12} autoComplete="new-password" value={passwordForm.new_password} onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal" />
          </label>
          <label className="text-sm font-semibold text-gray-700">Konfirmasi password baru
            <input type="password" required minLength={12} autoComplete="new-password" value={passwordForm.confirm_password} onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal" />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
              <KeyRound size={16} /> {saving ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </section>

      {isSuperAdmin && (
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-dark">Akun Admin</h2>
              <p className="mt-1 text-sm text-gray-600">Kelola akses admin ke dashboard.</p>
            </div>
            <button onClick={() => { setEditingAdmin(null); setAdminForm(emptyAdmin); setShowCreate(true); }} className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              <Plus size={17} /> Tambah Admin
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            {loading ? <div className="p-8 text-center text-sm text-gray-500">Memuat akun admin...</div> : users.length === 0 ? <div className="p-8 text-center text-sm text-gray-500">Belum ada akun admin.</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4 text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="p-4 font-medium text-brand-dark">{user.name}</td>
                        <td className="p-4 text-gray-600">{user.username}</td>
                        <td className="p-4 text-gray-600">{user.email}</td>
                        <td className="p-4 capitalize text-gray-600">{user.role}</td>
                        <td className="p-4 text-right whitespace-nowrap">
                          {user.role === 'admin' && <>
                            <button onClick={() => { setEditingAdmin(user); setAdminForm({ name: user.name, username: user.username, email: user.email, password: '' }); setShowCreate(true); }} title="Edit akun admin" aria-label={`Edit akun ${user.username}`} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"><Edit2 size={17} /></button>
                            <button onClick={() => setResetTarget(user)} title="Reset password admin" aria-label={`Reset password ${user.username}`} className="rounded-lg p-2 text-brand-primary hover:bg-brand-bg"><KeyRound size={17} /></button>
                            <button onClick={() => handleDelete(user)} title="Hapus akun admin" aria-label={`Hapus akun ${user.username}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                          </>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowCreate(false); setEditingAdmin(null); setAdminForm(emptyAdmin); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-admin-title" className="w-full max-w-lg rounded-xl bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h3 id="create-admin-title" className="text-lg font-bold text-brand-dark">{editingAdmin ? 'Edit Akun Admin' : 'Tambah Akun Admin'}</h3>
              <button onClick={() => { setShowCreate(false); setEditingAdmin(null); setAdminForm(emptyAdmin); }} aria-label="Tutup" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={19} /></button>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-4 p-5">
              {[
                ['name', 'Nama', 'text'], ['username', 'Username', 'text'], ['email', 'Email', 'email'], ...(!editingAdmin ? [['password', 'Password awal (min. 12 karakter)', 'password']] : [])
              ].map(([field, label, type]) => (
                <label key={field} className="block text-sm font-semibold text-gray-700">{label}
                  <input required type={type} minLength={field === 'password' ? 12 : undefined} value={adminForm[field]} onChange={(event) => setAdminForm((current) => ({ ...current, [field]: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" />
                </label>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setEditingAdmin(null); setAdminForm(emptyAdmin); }} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700">Batal</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><UserPlus size={16} /> {editingAdmin ? 'Simpan Perubahan' : 'Buat Akun'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setResetTarget(null); setResetPassword(''); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="reset-admin-title" className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h3 id="reset-admin-title" className="text-lg font-bold text-brand-dark">Reset Password</h3>
              <button onClick={() => setResetTarget(null)} aria-label="Tutup" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={19} /></button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4 p-5">
              <p className="text-sm text-gray-600">Password baru untuk <strong>{resetTarget.username}</strong>.</p>
              <label className="block text-sm font-semibold text-gray-700">Password baru
                <input type="password" required minLength={12} autoComplete="new-password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" />
              </label>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Password'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}