import { getBackendAssetUrl } from './apiConfig';

export function getHeroImageSource(imageUrl) {
  return getBackendAssetUrl(imageUrl);
}
