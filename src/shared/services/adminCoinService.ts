import { coinService } from './coinService';
import type { 
  CoinTransaction, 
  CoinAdditionRequest, 
  CoinDeductionRequest,
  CoinServiceResponse,
  CoinTransactionResponse 
} from '../types/coin';

/**
 * Admin-specific coin service for manual coin management
 * This service provides admin-only functionality for managing user coins manually
 */
class AdminCoinService {
  
  /**
   * Manually add coins to a user's account (Admin only)
   */
  async manuallyAddCoins(request: CoinAdditionRequest): Promise<CoinTransactionResponse> {
    try {
      // Add admin-specific validation
      if (!this.validateAdminRequest(request)) {
        return {
          success: false,
          error: {
            name: 'CoinError',
            message: 'Invalid admin request',
            type: 'INVALID_AMOUNT' as any,
            code: 'ADMIN_VALIDATION_FAILED'
          },
          message: 'Invalid admin request',
          newBalance: 0
        };
      }

      // Use the existing coin service but with admin context
      const result = await coinService.addCoins({
        ...request,
        reason: `[ADMIN] ${request.reason}`
      });

      if (result.success) {
        // Log admin action for audit trail
        this.logAdminAction('ADD_COINS', request);
        
        return {
          ...result,
          message: `Successfully added ${request.amount} coins to user account`
        };
      }

      return result;
    } catch (error) {
      console.error('Admin add coins error:', error);
      return {
        success: false,
        error: {
          name: 'CoinError',
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'TRANSACTION_FAILED' as any,
          code: 'ADMIN_ADD_FAILED'
        },
        message: 'Failed to add coins',
        newBalance: 0
      };
    }
  }

  /**
   * Manually deduct coins from a user's account (Admin only)
   */
  async manuallyDeductCoins(request: CoinDeductionRequest): Promise<CoinTransactionResponse> {
    try {
      // Add admin-specific validation
      if (!this.validateAdminRequest(request)) {
        return {
          success: false,
          error: {
            name: 'CoinError',
            message: 'Invalid admin request',
            type: 'INVALID_AMOUNT' as any,
            code: 'ADMIN_VALIDATION_FAILED'
          },
          message: 'Invalid admin request',
          newBalance: 0
        };
      }

      // Check if user has sufficient balance before deduction
      const balanceCheck = await coinService.validateSufficientBalance(request.userId, request.amount);
      if (balanceCheck.success && balanceCheck.data && !balanceCheck.data.hasSufficientBalance) {
        return {
          success: false,
          error: {
            name: 'CoinError',
            message: `Insufficient balance. User has ${balanceCheck.data.currentBalance} coins, but ${request.amount} required`,
            type: 'INSUFFICIENT_BALANCE' as any,
            code: 'INSUFFICIENT_BALANCE'
          },
          message: 'Insufficient balance for deduction',
          newBalance: balanceCheck.data.currentBalance
        };
      }

      // Use the existing coin service but with admin context
      const result = await coinService.deductCoins({
        ...request,
        reason: `[ADMIN] ${request.reason}`
      });

      if (result.success) {
        // Log admin action for audit trail
        this.logAdminAction('DEDUCT_COINS', request);
        
        return {
          ...result,
          message: `Successfully deducted ${request.amount} coins from user account`
        };
      }

      return result;
    } catch (error) {
      console.error('Admin deduct coins error:', error);
      return {
        success: false,
        error: {
          name: 'CoinError',
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'TRANSACTION_FAILED' as any,
          code: 'ADMIN_DEDUCT_FAILED'
        },
        message: 'Failed to deduct coins',
        newBalance: 0
      };
    }
  }

  /**
   * Get comprehensive user coin information for admin view
   */
  async getUserCoinInfo(userId: string): Promise<CoinServiceResponse<{
    balance: number;
    totalPurchased: number;
    totalSpent: number;
    recentTransactions: CoinTransaction[];
  }>> {
    try {
      const [balanceResult, transactionsResult] = await Promise.all([
        coinService.getCoinBalanceDetails(userId),
        coinService.getCoinTransactionHistory(userId, { limit: 10 })
      ]);

      if (!balanceResult.success) {
        return balanceResult as any;
      }

      const balance = balanceResult.data;
      const transactions = transactionsResult.success ? transactionsResult.data : [];

      return {
        success: true,
        data: {
          balance: balance?.balance || 0,
          totalPurchased: balance?.totalPurchased || 0,
          totalSpent: balance?.totalSpent || 0,
          recentTransactions: transactions || []
        }
      };
    } catch (error) {
      console.error('Error getting user coin info:', error);
      return {
        success: false,
        error: {
          name: 'CoinError',
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'TRANSACTION_FAILED' as any,
          code: 'ADMIN_INFO_FAILED'
        }
      };
    }
  }

  /**
   * Get all users coin information for admin view
   */
  async getAllUsersCoinInfo(): Promise<CoinServiceResponse<any[]>> {
    try {
      // In a real implementation, this would be an API call to get all users with their coin balances
      // For now, we'll simulate this data
      const mockUsers = [
        {
          userId: '1',
          username: 'John Doe',
          email: 'john@example.com',
          mobile: '+91 9876543210',
          balance: 5000,
          totalPurchased: 10000,
          totalSpent: 5000,
          lastUpdated: new Date()
        },
        {
          userId: '2',
          username: 'Jane Smith',
          email: 'jane@example.com',
          mobile: '+91 9876543211',
          balance: 750,
          totalPurchased: 2000,
          totalSpent: 1250,
          lastUpdated: new Date()
        },
        {
          userId: '3',
          username: 'Mike Johnson',
          email: 'mike@example.com',
          mobile: '+91 9876543212',
          balance: 15000,
          totalPurchased: 20000,
          totalSpent: 5000,
          lastUpdated: new Date()
        }
      ];

      return {
        success: true,
        data: mockUsers
      };
    } catch (error) {
      console.error('Error getting all users coin info:', error);
      return {
        success: false,
        error: {
          name: 'CoinError',
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'TRANSACTION_FAILED' as any,
          code: 'ADMIN_INFO_FAILED'
        }
      };
    }
  }

  /**
   * Simulate payment success for manual coin additions
   * This replaces the actual payment gateway integration
   */
  async simulatePaymentSuccess(userId: string, coinAmount: number, adminReason: string): Promise<{
    success: boolean;
    transactionId: string;
    message: string;
    newBalance: number;
  }> {
    try {
      const result = await this.manuallyAddCoins({
        userId,
        amount: coinAmount,
        reason: adminReason || 'Manual coin addition by admin'
      });

      const transactionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: result.success,
        transactionId,
        message: result.success 
          ? `Payment processed successfully. ${coinAmount} coins added to user account.`
          : result.message || 'Payment processing failed',
        newBalance: result.newBalance
      };
    } catch (error) {
      console.error('Payment simulation error:', error);
      return {
        success: false,
        transactionId: '',
        message: 'Payment processing failed due to system error',
        newBalance: 0
      };
    }
  }

  /**
   * Simulate payment failure for testing purposes
   */
  async simulatePaymentFailure(reason: string = 'Payment gateway error'): Promise<{
    success: boolean;
    transactionId: string;
    message: string;
    errorCode: string;
  }> {
    const transactionId = `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: false,
      transactionId,
      message: `Payment failed: ${reason}`,
      errorCode: 'PAYMENT_FAILED'
    };
  }

  /**
   * Get admin coin management statistics
   */
  async getAdminCoinStats(): Promise<CoinServiceResponse<{
    totalCoinsInSystem: number;
    totalUsersWithCoins: number;
    averageUserBalance: number;
    totalAdminTransactions: number;
    recentAdminActions: CoinTransaction[];
  }>> {
    try {
      // In a real implementation, this would query the database for admin statistics
      // For now, we'll return mock data
      const mockStats = {
        totalCoinsInSystem: 1250000,
        totalUsersWithCoins: 1247,
        averageUserBalance: 5420,
        totalAdminTransactions: 156,
        recentAdminActions: []
      };

      return {
        success: true,
        data: mockStats
      };
    } catch (error) {
      console.error('Error getting admin coin stats:', error);
      return {
        success: false,
        error: {
          name: 'CoinError',
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'TRANSACTION_FAILED' as any,
          code: 'ADMIN_STATS_FAILED'
        }
      };
    }
  }

  /**
   * Validate admin request parameters
   */
  private validateAdminRequest(request: CoinAdditionRequest | CoinDeductionRequest): boolean {
    if (!request.userId || !request.amount || !request.reason) {
      return false;
    }

    if (request.amount <= 0 || request.amount > 100000) {
      return false;
    }

    if (request.reason.trim().length < 3) {
      return false;
    }

    return true;
  }

  /**
   * Log admin actions for audit trail
   */
  private logAdminAction(action: string, request: CoinAdditionRequest | CoinDeductionRequest): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId: request.userId,
      amount: request.amount,
      reason: request.reason,
      adminId: 'current_admin_id' // In real implementation, get from auth context
    };

    // In a real implementation, this would be sent to a logging service
    console.log('Admin Action Log:', logEntry);
    
    // Store in localStorage for demo purposes
    try {
      const existingLogs = JSON.parse(localStorage.getItem('admin_coin_logs') || '[]');
      existingLogs.unshift(logEntry);
      // Keep only last 100 logs
      const trimmedLogs = existingLogs.slice(0, 100);
      localStorage.setItem('admin_coin_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.warn('Failed to store admin log:', error);
    }
  }

  /**
   * Get admin action logs
   */
  getAdminActionLogs(limit: number = 20): Array<{
    timestamp: string;
    action: string;
    userId: string;
    amount: number;
    reason: string;
    adminId: string;
  }> {
    try {
      const logs = JSON.parse(localStorage.getItem('admin_coin_logs') || '[]');
      return logs.slice(0, limit);
    } catch (error) {
      console.warn('Failed to retrieve admin logs:', error);
      return [];
    }
  }
}

export const adminCoinService = new AdminCoinService();
export default adminCoinService;