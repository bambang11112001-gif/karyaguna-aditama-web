import { createContext } from 'react';

export const defaultWebsiteSettings = {
  website_name: 'PT Karyaguna Aditama',
  tagline: 'CONSTRUCTION & FOOD TRADING',
  logo_url: '',
  address: 'Jakarta, Indonesia',
  phone: '+62 811-1182-6087',
  email: 'karyagunaaditama88@gmail.com',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  youtube_url: ''
};

export const WebsiteSettingsContext = createContext(defaultWebsiteSettings);