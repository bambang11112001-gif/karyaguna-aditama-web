import { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, TrendingUp, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';
const businessIcons = { Building2, TrendingUp, ShieldCheck };

function getImageSource(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

const businessDetails = {
  'Jasa Konstruksi': [
    'Berpengalaman sejak 1997 dalam proyek pembangunan dan infrastruktur.',
    'Mengutamakan kualitas hasil pekerjaan dan ketepatan waktu.',
    'Memperhatikan standar keselamatan kerja dalam pelaksanaan proyek.'
  ],
  'Food Trading': [
    'Menyediakan komoditas pangan pilihan untuk kebutuhan pasar nasional.',
    'Mencakup bahan pokok dan berbagai komoditas pangan lainnya.',
    'Mengutamakan kualitas produk dan daya saing.'
  ],
  Procurement: [
    'Mengadakan barang dan komoditas sesuai kebutuhan pelanggan.',
    'Menjalankan proses secara profesional dan transparan.',
    'Memberikan layanan pengadaan yang terpercaya.'
  ]
};

function BusinessImageCarousel({ business, Icon }) {
  const images = Array.isArray(business.image_urls) && business.image_urls.length > 0
    ? business.image_urls
    : business.image_url ? [business.image_url] : [];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  const showImage = (index) => setActiveIndex((index + images.length) % images.length);

  return (
    <div role="region" aria-roledescription="carousel" aria-label={`Foto ${business.title}`} className="relative h-80 overflow-hidden rounded-2xl border border-gray-200 bg-brand-bg">
      {images.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-brand-primary">
          <Icon size={64} strokeWidth={1.5} />
          <span className="font-semibold text-brand-dark">{business.title}</span>
        </div>
      ) : (
        <>
          {images.map((image, index) => (
            <img
              key={image}
              src={getImageSource(image)}
              alt={`${business.title}, foto ${index + 1}`}
              aria-hidden={index !== activeIndex}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
              onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
            />
          ))}
          {images.length > 1 && <>
            <button type="button" onClick={() => showImage(activeIndex - 1)} aria-label="Foto sebelumnya" title="Foto sebelumnya" className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-dark shadow hover:bg-white">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => showImage(activeIndex + 1)} aria-label="Foto berikutnya" title="Foto berikutnya" className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-dark shadow hover:bg-white">
              <ChevronRight size={20} />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {images.map((image, index) => (
                <button key={image} type="button" onClick={() => showImage(index)} aria-label={`Tampilkan foto ${index + 1}`} aria-current={index === activeIndex} className={`h-2.5 w-2.5 rounded-full border border-white shadow ${index === activeIndex ? 'bg-white' : 'bg-black/40'}`} />
              ))}
            </div>
          </>}
        </>
      )}
    </div>
  );
}

export default function Business() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/api/business-fields`)
      .then(({ data }) => {
        if (active && data.success) setBusinesses(data.data);
      })
      .catch((requestError) => {
        console.error('Gagal memuat bidang usaha:', requestError);
        if (active) setError('Bidang usaha belum dapat dimuat.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Header Banner */}
      <section className="bg-brand-dark py-12 text-white sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-light font-semibold text-sm uppercase tracking-wider">Aktivitas Operasional</span>
          <h1 className="mt-2 mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Bidang Usaha PT Karyaguna Aditama</h1>
          <p className="mx-auto max-w-2xl font-sans text-base text-gray-200 sm:text-lg">
            Pengalaman jasa konstruksi sejak 1997, serta layanan perdagangan dan pengadaan komoditas pangan.
          </p>
        </div>
      </section>

      {/* Main Business Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Memuat bidang usaha...</div>
          ) : error ? (
            <div role="status" className="py-12 text-center text-red-700">{error}</div>
          ) : businesses.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Belum ada bidang usaha yang tersedia.</div>
          ) : businesses.map((biz, idx) => {
            const BusinessIcon = businessIcons[biz.icon] || Building2;
            return (
            <div key={biz.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
              <div className={idx % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="w-16 h-16 bg-brand-bg rounded-2xl flex items-center justify-center text-brand-primary mb-6 shadow-sm">
                  <BusinessIcon size={32} />
                </div>
                <h2 className="text-3xl font-bold text-brand-dark mb-4">{biz.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-6 font-sans text-lg">{biz.description}</p>
                <ul className="mb-8 space-y-3">
                  {(businessDetails[biz.title] || []).map((detail) => (
                    <li key={detail} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white px-6 py-3 rounded-md font-semibold text-sm transition-colors shadow-sm">
                  Ajukan Kerja Sama <ArrowRight size={16} />
                </Link>
              </div>
              <div className={idx % 2 === 1 ? 'lg:col-start-1' : ''}>
                <BusinessImageCarousel key={biz.id} business={biz} Icon={BusinessIcon} />
              </div>
            </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}