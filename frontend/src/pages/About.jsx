import { useEffect, useState } from 'react';
import axios from 'axios';
import { Target, Eye, History, CheckCircle } from 'lucide-react';

export default function About() {
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let active = true;
    axios.get('http://localhost:5000/api/company-profile')
      .then((response) => {
        if (active && response.data.success) setProfile(response.data.data);
      })
      .catch((error) => {
        console.error(error);
        if (active) setProfileError('Informasi profil perusahaan tidak dapat dimuat saat ini.');
      });

    return () => {
      active = false;
    };
  }, []);

  const companyName = profile?.company_name || 'PT Karyaguna Aditama';
  const yearEstablished = profile?.year_established || 1997;
  const backgroundParagraphs = profile?.background
    ? profile.background.split(/\n+/).filter(Boolean)
    : [
        'PT Karyaguna Aditama (KGA) didirikan pada tahun 1997 dengan fokus awal di bidang jasa konstruksi, melayani berbagai pekerjaan pembangunan gedung serta proyek infrastruktur lainnya dengan standar profesional tinggi.',
        'Seiring perkembangan dunia usaha dan kebutuhan pasar yang dinamis, perusahaan melakukan diversifikasi bisnis strategis dengan memperluas kegiatan usaha ke sektor perdagangan komoditas pangan.',
        'Transformasi ini merupakan bentuk nyata komitmen kami dalam mendukung ketahanan rantai pasok pangan di Indonesia, melayani instansi pemerintah, BUMN, swasta, hingga masyarakat luas.'
      ];
  const missionItems = profile?.mission
    ? profile.mission.split(/[\r\n;•]+/).map((item) => item.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim()).filter(Boolean)
    : [
        'Menyediakan produk pangan yang berkualitas dan sesuai standar.',
        'Membangun jaringan distribusi yang efektif dan efisien.',
        'Menjalin kemitraan yang saling menguntungkan dengan produsen, distributor, dan pelanggan.',
        'Menjalankan bisnis secara profesional, transparan, dan berintegritas.',
        'Berkontribusi terhadap ketersediaan serta kelancaran distribusi pangan di Indonesia.'
      ];

  const values = [
    { title: "Integritas", desc: "Menjalankan bisnis secara jujur, bertanggung jawab, dan dapat dipercaya." },
    { title: "Kualitas", desc: "Menjamin mutu produk sesuai standar yang berlaku." },
    { title: "Profesionalisme", desc: "Memberikan pelayanan terbaik melalui sumber daya manusia yang kompeten." },
    { title: "Kemitraan", desc: "Membangun hubungan kerja sama yang berkelanjutan dengan seluruh mitra usaha." },
    { title: "Inovasi", desc: "Terus mengembangkan strategi bisnis sesuai perkembangan pasar." }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Header Banner */}
      <section className="bg-brand-dark py-12 text-white sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-light font-semibold text-sm uppercase tracking-wider">Profil Perusahaan</span>
          <h1 className="mt-2 mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Tentang {companyName}</h1>
          <p className="mx-auto max-w-2xl font-sans text-base text-gray-200 sm:text-lg">
            Membangun reputasi atas dasar kepercayaan, kualitas, dan transformasi strategis yang berkelanjutan sejak {yearEstablished}.
          </p>
        </div>
      </section>

      {/* Company Overview & History */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span className="text-brand-primary font-semibold text-sm uppercase tracking-wider">Sejarah & Transformasi</span>
              <h2 className="text-3xl font-bold text-brand-dark mt-2 mb-6">Dari Jasa Konstruksi Menuju Ketahanan Pangan Nasional</h2>
              {backgroundParagraphs.map((paragraph, index) => (
                <p key={index} className={`text-gray-600 leading-relaxed font-sans text-justify ${index < backgroundParagraphs.length - 1 ? 'mb-4' : ''}`}>
                  {paragraph}
                </p>
              ))}
              {profileError && <p className="mt-4 text-sm text-amber-700">{profileError}</p>}
            </div>
            <div className="bg-brand-bg p-8 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                <History className="text-brand-primary" /> Identitas Perusahaan
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">Nama Perusahaan:</span>
                  <span className="text-brand-dark font-bold">{companyName}</span>
                </li>
                <li className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">Bentuk Badan Usaha:</span>
                  <span className="text-brand-dark">Perseroan Terbatas (PT)</span>
                </li>
                <li className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">Tahun Berdiri:</span>
                  <span className="text-brand-dark font-bold">{yearEstablished}</span>
                </li>
                <li className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="font-semibold text-gray-700">Sektor Utama:</span>
                  <span className="text-brand-dark">Perdagangan & Distribusi Pangan</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-700">Lokasi Utama:</span>
                  <span className="text-brand-dark">Jakarta, Indonesia</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Visi */}
            <div className="bg-white p-8 rounded-2xl shadow-card border-t-4 border-brand-primary">
              <div className="w-12 h-12 bg-brand-bg rounded-lg flex items-center justify-center text-brand-primary mb-6">
                <Eye size={24} />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-4">Visi Perusahaan</h3>
              <p className="text-gray-700 leading-relaxed font-sans text-lg">
                {profile?.vision || '"Menjadi perusahaan nasional yang terpercaya dalam bidang perdagangan pangan dengan mengutamakan kualitas produk, pelayanan prima, dan kemitraan yang berkelanjutan."'}
              </p>
            </div>

            {/* Misi */}
            <div className="bg-white p-8 rounded-2xl shadow-card border-t-4 border-brand-dark">
              <div className="w-12 h-12 bg-brand-bg rounded-lg flex items-center justify-center text-brand-dark mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-4">Misi Perusahaan</h3>
              <ul className="space-y-3 text-gray-700 text-sm font-sans">
                {missionItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-brand-primary flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-primary font-semibold text-sm uppercase tracking-wider">Nilai-Nilai Perusahaan</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-dark mt-2 mb-4">Company Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-16">Landasan etika dan profesionalisme yang membimbing setiap langkah operasional PT Karyaguna Aditama.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {values.map((val, idx) => (
              <div key={idx} className="bg-brand-bg p-6 rounded-xl border border-gray-200 text-left hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-brand-primary text-white rounded-lg flex items-center justify-center font-bold mb-4">
                  0{idx + 1}
                </div>
                <h4 className="font-heading font-bold text-lg text-brand-dark mb-2">{val.title}</h4>
                <p className="text-gray-600 text-xs leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}