const configuredApiUrl = import.meta.env.VITE_API_URL || 'https://karyaguna-aditama-web.onrender.com/api';

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');
export const API_URL = API_BASE_URL.replace(/\/api$/i, '');

export function getBackendAssetUrl(url, relativePrefix = '/uploads/') {
  if (!url || typeof url !== 'string') return '';

  let assetPath = url.trim();
  if (!assetPath) return '';

  if (/^https?:\/\//i.test(assetPath)) {
    try {
      const parsedUrl = new URL(assetPath);
      if (!['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname)) return assetPath;
      assetPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
      return assetPath;
    }
  }

  if (!assetPath.startsWith('/')) {
    assetPath = `${relativePrefix}${assetPath}`;
  }

  return `${API_URL}${assetPath}`;
}
