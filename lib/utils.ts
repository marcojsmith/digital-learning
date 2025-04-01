import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes intelligently.
 * Uses `clsx` for flexible class name definition and `tailwind-merge` to handle conflicting styles.
 * @param inputs - A list of class values (strings, arrays, objects). See `clsx` documentation for details.
 * @returns A merged and optimized class name string.
 * @example
 * cn("p-4", "font-bold", { "bg-red-500": hasError }, ["mt-2", "mb-4"])
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
