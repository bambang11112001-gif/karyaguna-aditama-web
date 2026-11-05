import { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';

const API_URL = 'http://localhost:5000';

function getImageSource(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_URL}${imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`}`;
}

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [modalWidth, setModalWidth] = useState(null);

  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/api/gallery`)
      .then((response) => {
        if (active && response.data.success) setItems(response.data.data);
      })
      .catch((requestError) => {
        console.error(requestError);
        if (active) setError(requestError.response?.data?.message || 'Gagal memuat galeri.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activeAlbum) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveAlbum(null);
      if (event.key === 'ArrowRight') {
        setActivePhotoIndex((index) => (index + 1) % activeAlbum.photos.length);
      }
      if (event.key === 'ArrowLeft') {
        setActivePhotoIndex((index) => (index - 1 + activeAlbum.photos.length) % activeAlbum.photos.length);
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeAlbum]);

  const openAlbum = (album) => {
    setActiveAlbum(album);
    setActivePhotoIndex(0);
    setModalWidth(null);
  };

  const handlePhotoLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;

    const maxWidth = window.innerWidth * 0.94;
    const maxHeight = window.innerHeight * 0.62;
    const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
    setModalWidth(naturalWidth * scale);
  };

  const showPreviousPhoto = () => {
    setActivePhotoIndex((index) => (index - 1 + activeAlbum.photos.length) % activeAlbum.photos.length);
  };

  const showNextPhoto = () => {
    setActivePhotoIndex((index) => (index + 1) % activeAlbum.photos.length);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <section className="bg-brand-dark py-12 text-white sm:py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-light">Dokumentasi</span>
          <h1 className="mt-2 mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Galeri Perusahaan</h1>
          <p className="mx-auto max-w-2xl font-sans text-base text-gray-200 sm:text-lg">
            Rekaman visual aktivitas operasional, komoditas pangan, dan jaringan distribusi PT Karyaguna Aditama.
          </p>
        </div>
      </section>

      <section className="flex-grow bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="py-16 text-center text-gray-500">Memuat galeri...</p>
          ) : error ? (
            <p className="py-16 text-center text-red-700">{error}</p>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-gray-500">Belum ada dokumentasi yang tersedia.</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openAlbum(item)}
                  aria-label={`Buka album ${item.title}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-brand-bg text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-300">
                    <img
                      src={getImageSource(item.image_url)}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
                      <Images size={15} /> {item.photos?.length || 1} foto
                    </span>
                  </div>
                  <div className="min-h-32 p-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-primary">{item.category || item.description}</p>
                    <h2 className="mt-2 text-lg font-bold text-brand-dark">{item.title}</h2>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {activeAlbum && (
        <div
          role="presentation"
          onClick={() => setActiveAlbum(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Album ${activeAlbum.title}`}
            onClick={(event) => event.stopPropagation()}
            style={modalWidth ? { width: `${modalWidth}px` } : undefined}
            className="relative flex max-h-[95vh] w-fit max-w-[94vw] flex-col overflow-hidden rounded-2xl bg-brand-dark shadow-2xl animate-[galleryFadeIn_180ms_ease-out]"
          >
            <header className="flex min-w-0 items-start justify-between gap-4 px-5 py-4 text-white sm:px-7">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-light">{activeAlbum.category || activeAlbum.description}</p>
                <h2 className="mt-1 break-words text-xl font-bold text-white sm:text-2xl">{activeAlbum.title}</h2>
                <p className="mt-1 text-sm text-gray-300">{activePhotoIndex + 1} dari {activeAlbum.photos.length} foto</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAlbum(null)}
                aria-label="Tutup galeri"
                className="rounded-full p-2 text-white transition hover:bg-white/15"
              >
                <X size={24} />
              </button>
            </header>

            <div className="relative flex min-h-0 w-full items-center justify-center bg-black">
              <img
                src={getImageSource(activeAlbum.photos[activePhotoIndex].image_url)}
                alt={`${activeAlbum.title} - foto ${activePhotoIndex + 1}`}
                onLoad={handlePhotoLoad}
                className="block h-auto w-full"
              />
              {activeAlbum.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousPhoto}
                    aria-label="Foto sebelumnya"
                    className="absolute left-3 rounded-full bg-black/55 p-3 text-white transition hover:bg-brand-primary sm:left-5"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextPhoto}
                    aria-label="Foto berikutnya"
                    className="absolute right-3 rounded-full bg-black/55 p-3 text-white transition hover:bg-brand-primary sm:right-5"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            <div className="flex min-w-0 w-full gap-3 overflow-x-auto bg-brand-dark p-4 sm:p-5">
              {activeAlbum.photos.map((photo, index) => (
                <button
                  key={photo.id || photo.image_url}
                  type="button"
                  onClick={() => setActivePhotoIndex(index)}
                  aria-label={`Tampilkan foto ${index + 1}`}
                  aria-current={index === activePhotoIndex ? 'true' : undefined}
                  className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-28 ${
                    index === activePhotoIndex ? 'border-brand-light opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getImageSource(photo.image_url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
