"use client"

import { useState, useEffect } from "react";

// Define the breakpoint for mobile devices according to common practice (e.g., Tailwind's md breakpoint)
const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to determine if the current viewport width is considered mobile.
 * Listens for resize events to update the state.
 *
 * @returns {boolean} True if the viewport width is less than or equal to MOBILE_BREAKPOINT, false otherwise.
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }

    // Initial check
    checkMobile()

    // Add event listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile // Return just the boolean value
}

