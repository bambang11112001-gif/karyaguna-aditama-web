import { useContext } from 'react';
import HeroSlideshowContext from './HeroSlideshowContext';

export default function useHeroSlideshow() {
  return useContext(HeroSlideshowContext);
}
