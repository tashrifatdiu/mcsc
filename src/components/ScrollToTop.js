import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Add class to disable smooth scroll temporarily
    document.documentElement.classList.add('route-changing');
    
    // Scroll to top instantly
    window.scrollTo(0, 0);
    
    // Remove class after a short delay to re-enable smooth scroll
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('route-changing');
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
