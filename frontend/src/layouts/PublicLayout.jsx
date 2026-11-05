import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WebsiteSettingsProvider from '../WebsiteSettingsProvider';
import HeroSlideshowProvider from '../HeroSlideshowProvider';

export default function PublicLayout() {
  return (
    <WebsiteSettingsProvider>
      <HeroSlideshowProvider>
        <div className="flex flex-col min-h-screen bg-brand-bg">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </HeroSlideshowProvider>
    </WebsiteSettingsProvider>
  );
}
