import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface UseAutocompleteOptions {
  searchTerm: string;
  fetchSuggestions: (term: string) => Promise<string[]>;
  debounceMs?: number;
  minSearchLength?: number;
}

export function useAutocomplete({
  searchTerm,
  fetchSuggestions,
  debounceMs = 300,
  minSearchLength = 2,
}: UseAutocompleteOptions) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  useEffect(() => {
    const loadSuggestions = async () => {
      // Clear previous state
      if (debouncedSearchTerm.length < minSearchLength) {
        setSuggestions([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);      try {
        const results = await fetchSuggestions(debouncedSearchTerm);
        setSuggestions(results || []);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load suggestions";
        setError(errorMessage);
        setSuggestions([]);
        console.error("Error fetching suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [debouncedSearchTerm, fetchSuggestions, minSearchLength]);

  return {
    suggestions,
    isLoading,
    error,
  };
}
