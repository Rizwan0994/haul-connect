import apiClient from '../lib/api-client';

export interface AddressSuggestion {
  address: string;
  count: number;
}

export const addressSuggestionsApi = {
  // Get insurance company address suggestions
  async getInsuranceAddressSuggestions(searchTerm: string): Promise<string[]> {
    try {
      const response = await apiClient.get<{ suggestions: string[] }>(
        `/carriers/suggestions/insurance-addresses?search=${encodeURIComponent(searchTerm)}`
      );

      return response.data.suggestions || [];
    } catch (error: any) {
      console.error('Error fetching insurance address suggestions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch insurance address suggestions');
    }
  },

  // Get factoring company address suggestions
  async getFactoringAddressSuggestions(searchTerm: string): Promise<string[]> {
    try {
      const response = await apiClient.get<{ suggestions: string[] }>(
        `/carriers/suggestions/factoring-addresses?search=${encodeURIComponent(searchTerm)}`
      );

      return response.data.suggestions || [];
    } catch (error: any) {
      console.error('Error fetching factoring address suggestions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch factoring address suggestions');
    }
  },
};
