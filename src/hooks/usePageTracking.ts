import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type GTagConfig = {
  page_path?: string;
  page_location?: string;
  [key: string]: string | undefined;
};

type GTagEvent = {
  event: string;
  event_category?: string;
  event_label?: string;
  value?: string;
};
type GTagCommand = "config" | "event" | "js" | "set";

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    gtag: (command: GTagCommand, targetId: string, config?: GTagConfig) => void;
  }
}

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    if (!measurementId) {
      console.warn("Google Analytics Measurement ID is not defined");
      return;
    }

    if (typeof window.gtag !== "undefined") {
      window.gtag("config", measurementId, {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
      });
    }
  }, [location]);
};

export const trackEvent = ({
  event,
  event_category,
  event_label,
  value,
}: GTagEvent) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", event, {
      event_category,
      event_label,
      value,
    });
  } else {
    console.warn("Google Analytics no està carregat");
  }
};
