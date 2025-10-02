import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design using CSS media queries
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
};

/**
 * Predefined breakpoint hooks for common screen sizes
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1024px) and (min-width: 769px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsSmallScreen = () => useMediaQuery('(max-width: 640px)');
export const useIsLargeScreen = () => useMediaQuery('(min-width: 1280px)');

/**
 * Hook for detecting device orientation
 */
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)');
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)');

/**
 * Hook for detecting reduced motion preference
 */
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * Hook for detecting dark mode preference
 */
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');

/**
 * Hook for detecting high contrast preference
 */
export const usePrefersHighContrast = () => useMediaQuery('(prefers-contrast: high)');

/**
 * Breakpoint constants for consistency
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Hook that returns the current breakpoint
 */
export const useCurrentBreakpoint = () => {
  const isSmall = useMediaQuery(`(max-width: ${BREAKPOINTS.sm})`);
  const isMedium = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);
  const isLarge = useMediaQuery(`(max-width: ${BREAKPOINTS.lg})`);
  const isXLarge = useMediaQuery(`(max-width: ${BREAKPOINTS.xl})`);

  if (isSmall) return 'sm';
  if (isMedium) return 'md';
  if (isLarge) return 'lg';
  if (isXLarge) return 'xl';
  return '2xl';
};

export default useMediaQuery;