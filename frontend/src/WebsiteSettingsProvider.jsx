import { useEffect, useState } from 'react';
import axios from 'axios';
import { defaultWebsiteSettings, WebsiteSettingsContext } from './websiteSettingsContext';

export default function WebsiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultWebsiteSettings);

  useEffect(() => {
    let active = true;
    axios.get('http://localhost:5000/api/settings')
      .then(({ data }) => {
        if (active && data.success) {
          const settingsData = { ...data.data };
          if (settingsData.tagline?.trim().toUpperCase() === 'FOOD TRADING & DISTRIBUTION') {
            settingsData.tagline = 'CONSTRUCTION & FOOD TRADING';
          }
          setSettings((current) => ({ ...current, ...settingsData }));
        }
      })
      .catch((error) => console.error('Gagal memuat pengaturan website:', error));
    return () => { active = false; };
  }, []);

  return <WebsiteSettingsContext.Provider value={settings}>{children}</WebsiteSettingsContext.Provider>;
}