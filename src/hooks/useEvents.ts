import type { Event } from '../types/content';
import eventsData from '../data/events.json';

/**
 * Hook to get events data from the CMS
 */
export function useEvents(): Event[] {
  return eventsData as Event[];
}
