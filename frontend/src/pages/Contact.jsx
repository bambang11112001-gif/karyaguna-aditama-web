import { useState } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import useWebsiteSettings from '../useWebsiteSettings';

export default function Contact() {
  const settings = useWebsiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    subject: 'Kerja Sama',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post('http://localhost:5000/api/contact', formData);
      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal mengirim pesan ke server. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Header Banner */}
      <section className="bg-brand-dark py-12 text-white sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-light font-semibold text-sm uppercase tracking-wider">Narahubung</span>
          <h1 className="mt-2 mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Hubungi Kami</h1>
          <p className="mx-auto max-w-2xl font-sans text-base text-gray-200 sm:text-lg">
            Diskusikan kebutuhan pengadaan dan distribusi komoditas pangan perusahaan Anda bersama tim profesional kami.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-brand-bg flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Information */}
            <div className="bg-brand-dark text-white p-8 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-6">Informasi Kontak</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-8">
                  Hubungi kami melalui saluran komunikasi resmi PT Karyaguna Aditama untuk penawaran dan kerja sama institusional.
                </p>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 text-sm text-gray-300">
                    <MapPin className="text-brand-light flex-shrink-0 mt-1" size={20} />
                    <div>
                      <strong className="block text-white">Lokasi Kantor</strong>
                      <span>{settings.address}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 text-sm text-gray-300">
                    <Phone className="text-brand-light flex-shrink-0 mt-1" size={20} />
                    <div>
                      <strong className="block text-white">Telepon / WhatsApp</strong>
                      <span>{settings.phone}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 text-sm text-gray-300">
                    <Mail className="text-brand-light flex-shrink-0 mt-1" size={20} />
                    <div>
                      <strong className="block text-white">Email Resmi</strong>
                      <span>{settings.email}</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="mt-12 pt-6 border-t border-gray-800 text-xs text-gray-400">
                PT Karyaguna Aditama &bull; Terpercaya & Profesional
              </div>
            </div>

            {/* Contact / Inquiry Form */}
            <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-2xl shadow-card border border-gray-200">
              <h3 className="text-2xl font-bold text-brand-dark mb-2">Kirim Pesan & Inquiry</h3>
              <p className="text-gray-600 text-sm mb-8">Lengkapi formulir di bawah ini dan tim kami akan segera merespons kebutuhan Anda.</p>

              {errorMsg && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {submitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl flex items-center gap-4">
                  <CheckCircle2 size={32} className="text-brand-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg">Pesan Berhasil Terkirim!</h4>
                    <p className="text-sm">Terima kasih telah menghubungi PT Karyaguna Aditama. Pesan inquiry Anda telah tersimpan di sistem kami.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Nama Lengkap *</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="Masukkan nama lengkap" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Nama Perusahaan / Instansi</label>
                      <input 
                        type="text" 
                        name="company_name" 
                        value={formData.company_name} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="Contoh: PT Swasta / Instansi" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Email Resmi *</label>
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        value={formData.email} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="email@perusahaan.com" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Nomor Telepon / WhatsApp *</label>
                      <input 
                        type="text" 
                        name="phone" 
                        required 
                        value={formData.phone} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="+62 8xx-xxxx-xxxx" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Subjek Pesan *</label>
                    <select 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                      <option value="Kerja Sama">Kerja Sama</option>
                      <option value="Permintaan Penawaran">Permintaan Penawaran</option>
                      <option value="Informasi Produk">Informasi Produk</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Pesan / Kebutuhan Inquiry *</label>
                    <textarea 
                      name="message" 
                      required 
                      rows={5} 
                      value={formData.message} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      placeholder="Tuliskan detail kebutuhan komoditas atau kerja sama Anda..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Send size={18} /> {loading ? 'Mengirim...' : 'Kirim Pesan Inquiry'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}