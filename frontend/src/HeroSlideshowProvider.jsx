import { useEffect, useState } from 'react';
import axios from 'axios';
import HeroSlideshowContext from './HeroSlideshowContext';
import { API_URL } from './apiConfig';

export default function HeroSlideshowProvider({ children }) {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let active = true;
    const loadSlides = () => {
      axios.get(`${API_URL}/api/hero-slides`)
        .then(({ data }) => {
          if (active && data.success) setSlides(data.data);
        })
        .catch((error) => {
          if (active) console.error('Gagal memuat background slideshow:', error);
        });
    };

    loadSlides();
    const refreshTimer = window.setInterval(loadSlides, 30000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const slideTimer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(slideTimer);
  }, [slides.length]);

  const value = {
    slides,
    activeIndex: slides.length ? activeIndex % slides.length : 0
  };

  return (
    <HeroSlideshowContext.Provider value={value}>
      {children}
    </HeroSlideshowContext.Provider>
  );
}
