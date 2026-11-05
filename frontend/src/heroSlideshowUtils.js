const API_URL = 'http://localhost:5000';

export function getHeroImageSource(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_URL}${imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`}`;
}
