import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useHeroSlideshow from '../useHeroSlideshow';
import { getHeroImageSource } from '../heroSlideshowUtils';
import { 
  ArrowRight, 
  ShieldCheck, 
  Building2,
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

import { API_URL } from '../apiConfig';

function getImageSource(imageUrl) {
  if (!imageUrl || imageUrl === 'default-product.jpg') return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_URL}${imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`}`;
}

const businessIcons = { Building2, TrendingUp, ShieldCheck };

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [businessFields, setBusinessFields] = useState([]);
  const { slides: heroSlides, activeIndex: activeHeroSlide } = useHeroSlideshow();
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [businessFieldsLoading, setBusinessFieldsLoading] = useState(true);
  const [businessFieldsError, setBusinessFieldsError] = useState(false);

  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/api/products`)
      .then(({ data }) => {
        if (active && data.success) setFeaturedProducts(data.data.slice(0, 4));
      })
      .catch((error) => {
        console.error('Gagal memuat produk unggulan:', error);
        if (active) setProductsError(true);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });
    axios.get(`${API_URL}/api/business-fields`)
      .then(({ data }) => {
        if (active && data.success) setBusinessFields(data.data);
      })
      .catch((error) => {
        console.error('Gagal memuat bidang usaha:', error);
        if (active) setBusinessFieldsError(true);
      })
      .finally(() => {
        if (active) setBusinessFieldsLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Data Keunggulan Perusahaan (Why Choose Us) berdasarkan profil KGA
  const advantages = [
    { title: "Jaringan Pemasok Luas", desc: "Mengembangkan jaringan mitra dan pemasok terpercaya untuk kelancaran pasokan." },
    { title: "Komitmen Kualitas", desc: "Menjamin mutu produk pangan yang aman, berkualitas, dan sesuai standar yang berlaku." },
    { title: "Pengiriman Tepat Waktu", desc: "Sistem distribusi terstruktur untuk memastikan ketepatan waktu sampai di tujuan." },
    { title: "Harga Kompetitif", desc: "Menawarkan nilai terbaik dan harga bersaing untuk seluruh mitra bisnis." },
    { title: "Pelayanan Responsif", desc: "Didukung tim profesional yang cepat tanggap melayani kebutuhan pelanggan." }
  ];

  // Target Pasar (Our Market) berdasarkan profil KGA
  const markets = [
    "Instansi Pemerintah",
    "BUMN / BUMD",
    "Perusahaan Swasta",
    "Rumah Sakit",
    "Hotel dan Restoran",
    "Distributor dan Retail",
    "Program Bantuan Sosial",
    "Kebutuhan Industri"
  ];
  const visibleHeroSlide = heroSlides.length ? activeHeroSlide % heroSlides.length : 0;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative isolate -mt-16 overflow-hidden bg-brand-dark pt-28 pb-12 text-white sm:-mt-20 sm:pt-[8.5rem] sm:pb-14">
        {heroSlides.map((slide, index) => {
          return (
            <div
              key={slide.id}
              aria-hidden="true"
              className={`absolute inset-0 bg-center bg-no-repeat bg-cover transition-opacity duration-1000 ${
                index === visibleHeroSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url("${getHeroImageSource(slide.image_url).replaceAll('"', '%22')}")` }}
            />
          );
        })}
        <div className="absolute inset-0 bg-brand-dark/70" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8CBF43_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
              PT Karyaguna Aditama (Est. 1997)
            </span>
            <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-5xl">
              Your Trusted Partner in Construction & Food Trading
            </h1>
            <p className="mb-8 font-sans text-lg leading-relaxed text-gray-300 sm:text-xl">
              Berkomitmen menghadirkan solusi konstruksi berkualitas serta mendukung ketahanan rantai pasok pangan nasional melalui profesionalisme dan kemitraan yang berkelanjutan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/products" 
                className="bg-brand-light hover:bg-lime-600 text-brand-dark font-bold px-8 py-4 rounded-md transition-colors text-center flex items-center justify-center gap-2 shadow-lg"
              >
                Explore Our Business <ArrowRight size={18} />
              </Link>
              <Link 
                to="/contact" 
                className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-md transition-colors text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT COMPANY (SUMMARY) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-brand-primary font-semibold text-sm uppercase tracking-wider">Tentang Perusahaan</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-6 text-brand-dark">
                Transformasi Strategis untuk Ketahanan Pangan Nasional
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 font-sans text-justify">
                Didirikan sejak tahun 1997, PT Karyaguna Aditama awalnya bergerak di bidang jasa konstruksi pembangunan gedung. Seiring dinamika pasar, perusahaan melakukan diversifikasi bisnis strategis ke sektor perdagangan komoditas pangan.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8 font-sans text-justify">
                Berbekal pengalaman manajerial yang solid, kami memperluas kontribusi dalam pemenuhan kebutuhan pangan bagi instansi pemerintah, BUMN, swasta, hingga masyarakat luas dengan memegang teguh prinsip integritas dan profesionalisme.
              </p>
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-dark transition-colors"
              >
                Baca Selengkapnya Tentang Kami <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-brand-bg p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <span className="block text-4xl font-bold text-brand-primary mb-2">1997</span>
                  <span className="text-sm text-gray-500 font-medium">Tahun Berdiri</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <span className="block text-4xl font-bold text-brand-primary mb-2">11+</span>
                  <span className="text-sm text-gray-500 font-medium">Komoditas Utama</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center col-span-2">
                  <span className="block text-3xl font-bold text-brand-dark mb-1">8 Segmen</span>
                  <span className="text-sm text-gray-500 font-medium">Target Pasar Nasional & Institusional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BUSINESS OVERVIEW */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-primary font-semibold text-sm uppercase tracking-wider">Bidang Usaha</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">Pilar Kegiatan Operasional</h2>
            <p className="text-gray-600">Fokus layanan profesional yang dirancang untuk memenuhi standar pengadaan dan rantai pasok modern.</p>
          </div>

          {businessFieldsLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">Memuat bidang usaha...</div>
          ) : businessFieldsError ? (
            <div role="status" className="py-10 text-center text-sm text-red-700">Bidang usaha belum dapat dimuat.</div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {businessFields.map((item) => {
                const BusinessIcon = businessIcons[item.icon] || Building2;
                return (
                  <div key={item.id} className="rounded-xl border-t-4 border-brand-primary bg-white p-8 shadow-card transition-transform hover:-translate-y-1">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-brand-bg text-brand-primary">
                      <BusinessIcon size={28} />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-brand-dark">{item.title}</h3>
                    <p className="mb-6 text-sm leading-relaxed text-gray-600">{item.description}</p>
                    <Link to="/business" className="flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline">
                      Pelajari Lebih Lanjut <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. OUR PRODUCTS PREVIEW */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-brand-primary font-semibold text-sm uppercase tracking-wider">Katalog Komoditas</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">Produk Pangan Unggulan</h2>
            </div>
            <Link to="/products" className="mt-4 md:mt-0 bg-brand-dark hover:bg-brand-primary text-white px-6 py-3 rounded-md font-semibold text-sm transition-colors inline-flex items-center gap-2">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>

          {productsLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Memuat produk unggulan...</div>
          ) : productsError ? (
            <div role="status" className="py-12 text-center text-sm text-red-700">Produk unggulan belum dapat dimuat.</div>
          ) : featuredProducts.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">Belum ada produk yang tersedia.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <article key={product.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-brand-bg transition-shadow hover:shadow-card">
                  <div className="relative flex h-48 items-center justify-center bg-gray-200 text-sm text-gray-500">
                    <span>Foto belum tersedia</span>
                    {getImageSource(product.image_url) && (
                      <img
                        src={getImageSource(product.image_url)}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => event.currentTarget.remove()}
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold uppercase text-brand-primary">{product.category_name || 'Umum'}</span>
                    <h3 className="mt-1 mb-2 text-lg font-bold text-brand-dark">{product.name}</h3>
                    <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-gray-600">{product.description}</p>
                    <Link to="/products" className="flex items-center gap-1 text-xs font-semibold text-brand-dark group-hover:text-brand-primary">
                      Lihat di katalog <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="bg-brand-dark py-12 text-white sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-light">Keunggulan Kami</span>
            <h2 className="mt-2 mb-4 text-3xl font-bold text-white sm:text-4xl">Mengapa Bermitra dengan PT Karyaguna Aditama?</h2>
            <p className="mx-auto max-w-2xl leading-relaxed text-gray-200">Dedikasi penuh untuk menghadirkan layanan profesional dan rantai pasok yang dapat diandalkan.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {advantages.map((adv, idx) => (
              <div key={idx} className="rounded-xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="text-brand-light flex-shrink-0" size={24} />
                  <h3 className="font-heading font-bold text-lg text-white">{adv.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-200">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OUR MARKET */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-primary font-semibold text-sm uppercase tracking-wider">Target Pasar</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">Dilayani dengan Standar Profesional Tertinggi</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">Kami bangga menjadi mitra terpercaya untuk berbagai sektor instansi dan industri di Indonesia.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {markets.map((market, idx) => (
              <div key={idx} className="bg-brand-bg p-6 rounded-xl border border-gray-100 flex items-center justify-center text-center font-semibold text-brand-dark text-sm sm:text-base">
                {market}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}