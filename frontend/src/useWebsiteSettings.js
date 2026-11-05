import { useContext } from 'react';
import { WebsiteSettingsContext } from './websiteSettingsContext';

export default function useWebsiteSettings() {
  return useContext(WebsiteSettingsContext);
}