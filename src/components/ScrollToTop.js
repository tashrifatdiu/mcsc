import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable smooth scroll and animations during route change
    document.documentElement.classList.add('route-changing');
    document.body.style.overflow = 'hidden';
    
    // Force immediate scroll to top
    window.scrollTo(0, 0);
    
    // Re-enable after a short delay
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('route-changing');
      document.body.style.overflow = '';
    }, 150);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [pathname]);

  return null;
}
