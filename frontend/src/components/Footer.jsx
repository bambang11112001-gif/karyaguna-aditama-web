import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Share2 } from 'lucide-react';
import useWebsiteSettings from '../useWebsiteSettings';
import { getWebsiteAssetUrl } from '../websiteSettingsUtils';

export default function Footer() {
  const settings = useWebsiteSettings();
  const socialLinks = [
    ['facebook_url', 'Facebook', Share2],
    ['instagram_url', 'Instagram', Share2],
    ['linkedin_url', 'LinkedIn', Share2],
    ['youtube_url', 'YouTube', Share2]
  ].filter(([field]) => settings[field]);

  return (
    <footer className="border-t-4 border-brand-light bg-brand-dark pt-12 pb-8 text-white sm:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:mb-12 lg:grid-cols-3 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              {settings.logo_url ? <img src={getWebsiteAssetUrl(settings.logo_url)} alt={`${settings.website_name} logo`} className="h-10 w-10 rounded object-contain" /> : <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-light font-heading font-bold text-brand-dark">KGA</div>}
              <span className="font-heading text-2xl font-bold">{settings.website_name}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md mb-6">
              Mitra terpercaya dalam perdagangan, pengadaan, dan distribusi komoditas pangan. Berkomitmen menghadirkan kualitas terbaik untuk mendukung ketahanan pangan nasional.
            </p>
            {socialLinks.length > 0 && <div className="flex gap-3">{socialLinks.map(([field, label, Icon]) => <a key={field} href={settings[field]} target="_blank" rel="noreferrer" aria-label={label} className="rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white"><Icon size={18} /></a>)}</div>}
          </div>

          {/* Contact Info (Berdasarkan data faktual KGA) */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 border-b border-gray-700 pb-2 inline-block text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <MapPin size={18} className="text-brand-light flex-shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Phone size={18} className="text-brand-light flex-shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Mail size={18} className="text-brand-light flex-shrink-0" />
                <span className="break-all">{settings.email}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} PT Karyaguna Aditama. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link to="/admin/login" className="hover:text-brand-light transition-colors">Admin Portal Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}