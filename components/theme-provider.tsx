"use client";

import * as React from "react";
import {
	ThemeProvider as NextThemesProvider,
	type ThemeProviderProps,
} from "next-themes";

/**
 * Provides theme context using next-themes.
 * Wraps the application to enable theme switching (e.g., light/dark mode).
 *
 * @param props - Props for the underlying NextThemesProvider, including children.
 * @returns The NextThemesProvider component wrapping the children.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
