'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if a media query matches
 * SSR-safe: defaults to false on server, hydrates on client
 *
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Handler for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Listen for changes
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to detect mobile devices
 * Mobile: < 768px (below md breakpoint)
 */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

/**
 * Hook to detect tablet devices
 * Tablet: 768px - 1023px (md to lg breakpoints)
 */
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

/**
 * Hook to detect desktop devices
 * Desktop: >= 1024px (lg breakpoint and above)
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
