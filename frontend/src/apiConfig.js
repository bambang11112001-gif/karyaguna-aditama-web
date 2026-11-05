const configuredApiUrl = import.meta.env.VITE_API_URL || 'https://karyaguna-aditama-web.onrender.com/api';

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');
export const API_URL = API_BASE_URL.replace(/\/api$/i, '');
