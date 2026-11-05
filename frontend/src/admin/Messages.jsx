import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Trash2, RefreshCcw, Eye, EyeOff, X } from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const requestMessages = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    return axios.get('http://localhost:5000/api/admin/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await requestMessages();
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memuat data pesan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    requestMessages()
      .then((res) => {
        if (active && res.data.success) {
          setMessages(res.data.data);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError(err.response?.data?.message || 'Gagal memuat data pesan.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [requestMessages]);

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/admin/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages((currentMessages) => currentMessages.filter((message) => message.id !== id));
      setSelectedMessage((currentMessage) => currentMessage?.id === id ? null : currentMessage);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal menghapus pesan.');
    }
  };

  const handleStatusChange = async (message) => {
    const isRead = Number(message.is_read) === 1;
    setUpdatingId(message.id);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.put(`http://localhost:5000/api/admin/messages/${message.id}/status`, {
        is_read: isRead ? 0 : 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedMessage = { ...message, is_read: res.data.data.is_read };
      setMessages((currentMessages) => currentMessages.map((item) => item.id === message.id ? updatedMessage : item));
      setSelectedMessage((currentMessage) => currentMessage?.id === message.id ? updatedMessage : currentMessage);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memperbarui status pesan.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Message Management</h1>
          <p className="text-gray-600 text-sm mt-1">Lihat, baca, perbarui status, dan hapus pesan pengunjung.</p>
        </div>
        <button onClick={fetchMessages} className="bg-brand-bg text-brand-dark hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data pesan...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada pesan masuk dari pengunjung.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4">Pengirim</th>
                  <th className="p-4">Perusahaan</th>
                  <th className="p-4">Subjek</th>
                  <th className="p-4">Pesan</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {messages.map((msg) => (
                  <tr key={msg.id} className={`hover:bg-gray-50 ${Number(msg.is_read) !== 1 ? 'bg-amber-50/40' : ''}`}>
                    <td className="p-4 font-medium text-brand-dark">
                      {msg.name}
                      <span className="block text-xs text-gray-500">{msg.email} | {msg.phone}</span>
                    </td>
                    <td className="p-4 text-gray-600">{msg.company_name || '-'}</td>
                    <td className="p-4 font-medium text-brand-dark">{msg.subject}</td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">{msg.message}</td>
                    <td className="p-4 text-xs text-gray-500">{formatDate(msg.created_at)}</td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${Number(msg.is_read) === 1 ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'}`}>
                        {Number(msg.is_read) === 1 ? 'Dibaca' : 'Belum dibaca'}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="rounded-lg p-2 text-brand-primary transition-colors hover:bg-brand-bg"
                        title="Lihat detail pesan"
                        aria-label={`Lihat detail pesan dari ${msg.name}`}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(msg)}
                        disabled={updatingId === msg.id}
                        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
                        title={Number(msg.is_read) === 1 ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                        aria-label={Number(msg.is_read) === 1 ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                      >
                        {Number(msg.is_read) === 1 ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                        title="Hapus pesan"
                        aria-label={`Hapus pesan dari ${msg.name}`}
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

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedMessage(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-6">
              <div>
                <h2 id="message-detail-title" className="text-xl font-bold text-brand-dark">Detail Pesan</h2>
                <p className="mt-1 text-sm text-gray-500">Diterima {formatDate(selectedMessage.created_at)}</p>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title="Tutup detail" aria-label="Tutup detail">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div><dt className="text-xs font-semibold uppercase text-gray-500">Nama</dt><dd className="mt-1 text-sm text-brand-dark">{selectedMessage.name}</dd></div>
                <div><dt className="text-xs font-semibold uppercase text-gray-500">Perusahaan</dt><dd className="mt-1 text-sm text-brand-dark">{selectedMessage.company_name || '-'}</dd></div>
                <div><dt className="text-xs font-semibold uppercase text-gray-500">Email</dt><dd className="mt-1 break-all text-sm text-brand-dark">{selectedMessage.email}</dd></div>
                <div><dt className="text-xs font-semibold uppercase text-gray-500">Telepon</dt><dd className="mt-1 text-sm text-brand-dark">{selectedMessage.phone}</dd></div>
                <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-gray-500">Subjek</dt><dd className="mt-1 text-sm font-semibold text-brand-dark">{selectedMessage.subject}</dd></div>
              </dl>
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-500">Isi Pesan</h3>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-brand-bg p-4 text-sm leading-relaxed text-gray-700">{selectedMessage.message}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
                <span className="text-sm text-gray-600">Status: {Number(selectedMessage.is_read) === 1 ? 'Dibaca' : 'Belum dibaca'}</span>
                <button
                  onClick={() => handleStatusChange(selectedMessage)}
                  disabled={updatingId === selectedMessage.id}
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                >
                  {Number(selectedMessage.is_read) === 1 ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
