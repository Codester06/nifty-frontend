import type { OptionsOrder, OptionsPosition, OptionChainData, OptionGreeks, TradeResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('nifty-bulk-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Auth endpoints
  async sendMobileOtp(mobile: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/mobile`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile }),
    });
    return this.handleResponse(response);
  }

  async verifyMobileOtp(mobile: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/mobile/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile, otp }),
    });
    return this.handleResponse(response);
  }

  async sendEmailOtp(mobile: string, email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile, email }),
    });
    return this.handleResponse(response);
  }

  async verifyEmailOtp(mobile: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/email/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile, otp }),
    });
    return this.handleResponse(response);
  }

  async verifyPan(mobile: string, pan: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/pan`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile, pan }),
    });
    return this.handleResponse(response);
  }

  async setCredentials(mobile: string, username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/credentials`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile, username, password }),
    });
    return this.handleResponse(response);
  }

  // Login endpoints
  async sendLoginOtp(mobile: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login/mobile`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile }),
    });
    return this.handleResponse(response);
  }

  async verifyLoginOtp(mobile: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login/mobile/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile, otp }),
    });
    return this.handleResponse(response);
  }

  async loginEmail(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login/email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async superAdminLogin(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/superadmin/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  // Admin endpoints
  async activateUser(mobile: string) {
    const response = await fetch(`${API_BASE_URL}/auth/admin/activate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile }),
    });
    return this.handleResponse(response);
  }

  async deactivateUser(mobile: string) {
    const response = await fetch(`${API_BASE_URL}/auth/admin/deactivate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile }),
    });
    return this.handleResponse(response);
  }

  // User management endpoints
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUser(userId: string, userData: Record<string, unknown>) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getRecentActivity() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/activity`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Trading endpoints
  async getTrades() {
    const response = await fetch(`${API_BASE_URL}/admin/trades`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Margin management endpoints
  async getAllMargins() {
    const response = await fetch(`${API_BASE_URL}/margin`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async upsertUserMargin(userId: string, marginPercentage: number) {
    const response = await fetch(`${API_BASE_URL}/margin/user`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, marginPercentage }),
    });
    return this.handleResponse(response);
  }

  async deleteUserMargin(userId: string) {
    const response = await fetch(`${API_BASE_URL}/margin/user`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId }),
    });
    return this.handleResponse(response);
  }

  async upsertGlobalMargin(asset: string, marginPercentage: number) {
    const response = await fetch(`${API_BASE_URL}/margin/global`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ asset, marginPercentage }),
    });
    return this.handleResponse(response);
  }

  async deleteGlobalMargin(asset: string) {
    const response = await fetch(`${API_BASE_URL}/margin/global`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ asset }),
    });
    return this.handleResponse(response);
  }

  // Security logs endpoints
  async getSecurityLogs(params: Record<string, string> = {}) {
    const url = new URL(`${API_BASE_URL}/security-logs`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Admin Dashboard endpoints
  async getAdminDashboard() {
    const response = await fetch(`${API_BASE_URL}/users/admin/dashboard-stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getTradingStats() {
    const response = await fetch(`${API_BASE_URL}/admin/trading-stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // User role management
  async updateUserRole(userId: string, role: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ role }),
    });
    return this.handleResponse(response);
  }

  async toggleUserStatus(userId: string, isActive: boolean) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return this.handleResponse(response);
  }

  // Get recent activities for admin dashboard
  async getRecentActivities() {
    const response = await fetch(`${API_BASE_URL}/users/admin/recent-activities`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Options data methods
  async getOptionChain(underlying: string, expiry?: string) {
    const url = new URL(`${API_BASE_URL}/options/chain/${underlying}`);
    if (expiry) {
      url.searchParams.append('expiry', expiry);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getOptionGreeks(symbol: string, strike: number, expiry: string) {
    const response = await fetch(`${API_BASE_URL}/options/greeks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ symbol, strike, expiry }),
    });
    return this.handleResponse(response);
  }

  async subscribeToOptionsUpdates(symbols: string[], callback: Function) {
    // This would typically establish a WebSocket connection
    // For now, we'll implement a polling mechanism
    const pollInterval = setInterval(async () => {
      try {
        for (const symbol of symbols) {
          const response = await fetch(`${API_BASE_URL}/options/price/${symbol}`, {
            method: 'GET',
            headers: this.getHeaders(),
          });
          const data = await this.handleResponse(response);
          callback(symbol, data);
        }
      } catch (error) {
        console.error('Error polling options updates:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Return cleanup function
    return () => clearInterval(pollInterval);
  }

  // Options trading methods
  async placeOptionsOrder(order: {
    userId: string;
    symbol: string;
    optionType: 'CE' | 'PE';
    strike: number;
    expiry: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    orderType: 'MARKET' | 'LIMIT';
    price?: number;
    premium: number;
    totalCost: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/options/order`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(order),
    });
    return this.handleResponse(response);
  }

  async getOptionsPositions(userId: string) {
    const response = await fetch(`${API_BASE_URL}/options/positions/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async closeOptionsPosition(positionId: string) {
    const response = await fetch(`${API_BASE_URL}/options/position/${positionId}/close`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Options portfolio and analytics
  async getOptionsPortfolio(userId: string) {
    const response = await fetch(`${API_BASE_URL}/options/portfolio/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getOptionsTransactionHistory(userId: string, limit?: number, offset?: number) {
    const url = new URL(`${API_BASE_URL}/options/transactions/${userId}`);
    if (limit) url.searchParams.append('limit', limit.toString());
    if (offset) url.searchParams.append('offset', offset.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Options market data
  async getOptionsMarketStatus() {
    const response = await fetch(`${API_BASE_URL}/options/market/status`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUnderlyingAssets() {
    const response = await fetch(`${API_BASE_URL}/options/underlying`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Options risk management
  async validateOptionsOrder(order: {
    userId: string;
    symbol: string;
    optionType: 'CE' | 'PE';
    strike: number;
    expiry: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    premium: number;
    totalCost: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/options/order/validate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(order),
    });
    return this.handleResponse(response);
  }

  // Coin management endpoints
  async getUserCoinBalance(userId: string) {
    const response = await fetch(`${API_BASE_URL}/coins/balance/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUserCoinBalance(userId: string, amount: number, type: 'DEBIT' | 'CREDIT', reason: string) {
    const response = await fetch(`${API_BASE_URL}/coins/${type.toLowerCase()}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, amount, reason }),
    });
    return this.handleResponse(response);
  }

  async getCoinTransactionHistory(userId: string, limit?: number, offset?: number) {
    const url = new URL(`${API_BASE_URL}/coins/transactions/${userId}`);
    if (limit) url.searchParams.append('limit', limit.toString());
    if (offset) url.searchParams.append('offset', offset.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async purchaseCoins(userId: string, amount: number, paymentMethod: string, paymentDetails: any) {
    const response = await fetch(`${API_BASE_URL}/coins/purchase`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, amount, paymentMethod, paymentDetails }),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService; 