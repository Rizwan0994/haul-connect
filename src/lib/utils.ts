import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class names together, handles conditional classes,
 * and optimizes the resulting string using Tailwind Merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
