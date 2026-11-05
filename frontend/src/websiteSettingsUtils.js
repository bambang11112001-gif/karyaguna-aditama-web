import { API_URL } from './apiConfig';

export const getWebsiteAssetUrl = (url) => !url ? '' : /^https?:\/\//i.test(url) ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;