import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL, getBackendAssetUrl } from '../apiConfig';

function getImageSource(imageUrl) {
  if (!imageUrl || imageUrl === 'default-product.jpg') return '';
  return getBackendAssetUrl(imageUrl);
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    axios.get(`${API_URL}/api/products`)
      .then((response) => {
        if (active && response.data.success) {
          setProducts(response.data.data);
        }
      })
      .catch((requestError) => {
        console.error(requestError);
        if (active) {
          setError(requestError.response?.data?.message || 'Gagal memuat katalog produk.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = ['All', ...new Set(products.map((product) => product.category_name).filter(Boolean))];
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category_name === selectedCategory;
    const matchesSearch = `${product.name} ${product.description || ''}`.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-brand-dark py-12 text-white sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-light font-semibold text-sm uppercase tracking-wider">Katalog Komoditas</span>
          <h1 className="mt-2 mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Produk Pangan & Distribusi</h1>
          <p className="mx-auto max-w-2xl font-sans text-base text-gray-200 sm:text-lg">
            Menyediakan berbagai komoditas pangan pilihan dengan standar mutu dan keamanan yang terjamin.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedCategory === category
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-brand-bg text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari komoditas pangan..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-bg flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16 text-gray-500">Memuat katalog produk...</div>
          ) : error ? (
            <div className="text-center py-16 text-red-700">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                {products.length === 0 ? 'Belum ada produk yang tersedia.' : 'Komoditas yang Anda cari tidak ditemukan.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-card transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 font-medium relative">
                      <span>Foto {product.name}</span>
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
                      <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">{product.category_name || 'Umum'}</span>
                      <h3 className="text-xl font-bold text-brand-dark mt-1 mb-3">{product.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>
                    </div>
                  </div>
                  <div className="p-6 pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-brand-primary" /> Mutu Terjamin
                    </span>
                    <Link to="/contact" className="bg-brand-bg hover:bg-brand-primary hover:text-white text-brand-dark text-xs font-semibold px-4 py-2 rounded transition-colors flex items-center gap-1">
                      Request Inquiry <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
