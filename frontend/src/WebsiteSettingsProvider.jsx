import { useEffect, useState } from 'react';
import axios from 'axios';
import { defaultWebsiteSettings, WebsiteSettingsContext } from './websiteSettingsContext';
import { API_URL } from './apiConfig';

export default function WebsiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultWebsiteSettings);

  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/api/settings`)
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