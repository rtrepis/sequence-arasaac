import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);
};
