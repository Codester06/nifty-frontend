
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const fetchWallet = async () => {
  try {
    const token = localStorage.getItem('nifty-bulk-token');
    const response = await fetch(`${API_BASE_URL}/users/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch wallet');
    }
    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

