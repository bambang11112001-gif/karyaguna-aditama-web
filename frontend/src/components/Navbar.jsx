import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import useWebsiteSettings from '../useWebsiteSettings';
import { getWebsiteAssetUrl } from '../websiteSettingsUtils';

export default function Navbar() {
  const settings = useWebsiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const heroHeader = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Business', path: '/business' },
    { name: 'Products', path: '/products' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${heroHeader ? 'border-b-0 bg-transparent shadow-none' : 'border-b border-gray-100 bg-white shadow-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative z-10 flex min-h-16 justify-between items-center transition-all duration-300 sm:min-h-20 ${scrolled ? 'sm:min-h-16' : ''}`}>
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {settings.logo_url ? <img src={getWebsiteAssetUrl(settings.logo_url)} alt={`${settings.website_name} logo`} className="h-10 w-10 shrink-0 rounded-lg object-contain sm:h-12 sm:w-12" /> : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary font-heading font-bold text-white shadow-sm transition-colors group-hover:bg-brand-dark sm:h-12 sm:w-12">KGA</div>
            )}
            <div className="flex flex-col">
              <span className={`font-heading text-sm font-bold leading-tight sm:text-xl ${heroHeader ? 'text-white' : 'text-brand-dark'}`}>{settings.website_name}</span>
              {settings.tagline && <span className={`text-[9px] font-medium sm:text-xs ${heroHeader ? 'text-white/80' : 'text-brand-muted'}`}>{settings.tagline}</span>}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Navigasi utama" className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(link.path) 
                    ? heroHeader ? 'bg-white/15 font-semibold text-white' : 'bg-brand-bg font-semibold text-brand-primary'
                    : heroHeader ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-brand-text hover:bg-gray-50 hover:text-brand-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-gray-200">
              <Link to="/contact" className="bg-brand-primary hover:bg-brand-dark text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
                Inquiry <ChevronRight size={16} />
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            type="button"
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className={`p-2 focus:outline-none md:hidden ${heroHeader ? 'text-white hover:text-brand-light' : 'text-brand-text hover:text-brand-primary'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <nav id="mobile-navigation" aria-label="Navigasi utama" className="absolute left-0 top-full w-full border-t border-gray-100 bg-white shadow-lg md:hidden">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  isActive(link.path) ? 'text-brand-primary bg-brand-bg font-bold' : 'text-brand-text hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2">
              <Link 
                to="/contact" 
                onClick={() => setIsOpen(false)}
                className="w-full bg-brand-primary text-white text-center py-3 rounded-md font-semibold block shadow-sm"
              >
                Inquiry / Hubungi Kami
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}