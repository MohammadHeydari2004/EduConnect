import { useEffect, useState } from "react";

/**
 * Hook to track a media query match state.
 * @param query - Media query string (e.g., "(min-width: 768px)")
 * @returns True if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Hook to check if viewport is below md breakpoint (768px).
 * Uses max-width: 767px which is the exact complement of Tailwind's
 * md breakpoint (min-width: 768px). Returns true for mobile viewports.
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}