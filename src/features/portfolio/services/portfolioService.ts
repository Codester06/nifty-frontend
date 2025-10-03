
import { PerformanceData } from '../types/portfolio';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const portfolioService = {
  async getPerformanceData(): Promise<PerformanceData[]> {
    const response = await fetch(`${API_BASE_URL}/portfolio/performance`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('nifty-bulk-token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch performance data');
    }

    return response.json();
  },
};
