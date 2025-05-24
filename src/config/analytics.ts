// Google Analytics configuration
export const GA_MEASUREMENT_ID = 'G-PJ2E26LS9M';

// Helper functions for Google Analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Track page views
export const trackPageView = (url: string) => {
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}; 