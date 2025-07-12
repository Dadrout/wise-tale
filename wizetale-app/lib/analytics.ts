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

// Track story events
export const trackStoryEvent = (action: string, story_id?: string, story_title?: string) => {
  if (analytics) {
    logEvent(analytics, 'story_interaction', {
      action,
      story_id,
      story_title,
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