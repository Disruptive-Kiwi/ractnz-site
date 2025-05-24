import { useEffect } from 'react';
import { trackPageView, trackEvent } from '../config/analytics';

// Hook to track page views automatically
export const useGoogleAnalytics = () => {
  useEffect(() => {
    // Track initial page view
    trackPageView(window.location.pathname + window.location.search);
  }, []);

  return {
    trackEvent,
    trackPageView,
  };
}; 