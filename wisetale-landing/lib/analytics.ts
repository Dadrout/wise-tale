import { logEvent, Analytics } from "firebase/analytics";
import { analytics } from "./firebase";

// Track page views
export const trackPageView = (page_title: string, page_location: string) => {
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title,
      page_location,
    });
  }
};

// Track custom events
export const trackEvent = (event_name: string, parameters?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, event_name, parameters);
  }
};

// Track waitlist signups
export const trackWaitlistSignup = (email: string) => {
  if (analytics) {
    logEvent(analytics, 'sign_up', {
      method: 'waitlist',
      email_domain: email.split('@')[1],
    });
  }
};

// Track user engagement
export const trackUserEngagement = (engagement_time_msec: number) => {
  if (analytics) {
    logEvent(analytics, 'user_engagement', {
      engagement_time_msec,
    });
  }
}; 