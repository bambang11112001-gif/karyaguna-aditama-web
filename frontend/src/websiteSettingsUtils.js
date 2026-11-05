import { getBackendAssetUrl } from './apiConfig';

export const getWebsiteAssetUrl = (url) => getBackendAssetUrl(url, '/');