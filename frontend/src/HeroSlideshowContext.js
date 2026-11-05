import { createContext } from 'react';

const HeroSlideshowContext = createContext({ slides: [], activeIndex: 0 });

export default HeroSlideshowContext;
