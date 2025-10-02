import type { PaymentDetails, CoinPurchase } from '../types/coin';

export interface PaymentGatewayConfig {
  apiKey: string;
  merchantId: string;
  environment: 'sandbox' | 'production';
  webhookSecret: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING';
  returnUrl: string;
  webhookUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
  gatewayResponse?: any;
}

export interface PaymentVerificationRequest {
  paymentId: string;
  orderId: string;
  signature?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: number;
  currency: string;
  transactionId: string;
  paymentMethod: string;
  paidAt?: Date;
  error?: string;
}

export interface WebhookPayload {
  event: 'payment.success' | 'payment.failed' | 'payment.pending';
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  signature: string;
  timestamp: number;
  data: any;
}

class PaymentGatewayService {
  private config: PaymentGatewayConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_PAYMENT_API_KEY || 'demo_api_key',
      merchantId: import.meta.env.VITE_PAYMENT_MERCHANT_ID || 'demo_merchant',
      environment: (import.meta.env.VITE_PAYMENT_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      webhookSecret: import.meta.env.VITE_PAYMENT_WEBHOOK_SECRET || 'demo_webhook_secret'
    };

    this.baseUrl = this.config.environment === 'production' 
      ? 'https://api.paymentgateway.com/v1'
      : 'https://sandbox-api.paymentgateway.com/v1';
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Merchant-Id': this.config.merchantId
    };
  }

  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSignature(data: string): string {
    // In a real implementation, this would use HMAC-SHA256 with the webhook secret
    // For demo purposes, we'll use a simple hash
    return btoa(data + this.config.webhookSecret).replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // For demo purposes, simulate different payment gateway responses
      if (this.config.environment === 'sandbox') {
        return this.simulatePaymentInitiation(request);
      }

      const response = await fetch(`${this.baseUrl}/payments/initiate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...request,
          merchant_id: this.config.merchantId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          paymentId: '',
          orderId: request.orderId,
          status: 'FAILED',
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }

      return {
        success: true,
        paymentId: data.payment_id,
        orderId: data.order_id,
        status: data.status,
        paymentUrl: data.payment_url,
        transactionId: data.transaction_id,
        gatewayResponse: data
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        paymentId: '',
        orderId: request.orderId,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Payment initiation failed'
      };
    }
  }

  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      // For demo purposes, simulate payment verification
      if (this.config.environment === 'sandbox') {
        return this.simulatePaymentVerification(request);
      }

      const response = await fetch(`${this.baseUrl}/payments/verify`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: 'FAILED',
          amount: 0,
          currency: 'INR',
          transactionId: '',
          paymentMethod: '',
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }

      return {
        success: true,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        transactionId: data.transaction_id,
        paymentMethod: data.payment_method,
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        status: 'FAILED',
        amount: 0,
        currency: 'INR',
        transactionId: '',
        paymentMethod: '',
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount,
          reason: reason || 'Customer requested refund'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          paymentId,
          orderId: '',
          status: 'FAILED',
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }

      return {
        success: true,
        paymentId: data.refund_id,
        orderId: data.order_id,
        status: data.status,
        transactionId: data.transaction_id,
        gatewayResponse: data
      };
    } catch (error) {
      console.error('Payment refund error:', error);
      return {
        success: false,
        paymentId,
        orderId: '',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Payment refund failed'
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/status`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: 'FAILED',
          amount: 0,
          currency: 'INR',
          transactionId: '',
          paymentMethod: '',
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }

      return {
        success: true,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        transactionId: data.transaction_id,
        paymentMethod: data.payment_method,
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        status: 'FAILED',
        amount: 0,
        currency: 'INR',
        transactionId: '',
        paymentMethod: '',
        error: error instanceof Error ? error.message : 'Payment status check failed'
      };
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(payload);
    return signature === expectedSignature;
  }

  parseWebhookPayload(payload: string): WebhookPayload | null {
    try {
      return JSON.parse(payload) as WebhookPayload;
    } catch (error) {
      console.error('Webhook payload parsing error:', error);
      return null;
    }
  }

  // Demo/Sandbox simulation methods
  private async simulatePaymentInitiation(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate different success rates based on payment method
    const successRate = request.paymentMethod === 'UPI' ? 0.95 : 
                       request.paymentMethod === 'CARD' ? 0.90 : 0.85;

    const isSuccess = Math.random() < successRate;

    if (!isSuccess) {
      const errors = [
        'Insufficient funds',
        'Card declined',
        'Bank server unavailable',
        'Invalid payment details',
        'Transaction timeout'
      ];
      
      return {
        success: false,
        paymentId,
        orderId: request.orderId,
        status: 'FAILED',
        error: errors[Math.floor(Math.random() * errors.length)]
      };
    }

    // For redirect-based payments (like UPI), return payment URL
    const paymentUrl = request.paymentMethod === 'UPI' 
      ? `https://sandbox-payment.gateway.com/pay/${paymentId}`
      : undefined;

    return {
      success: true,
      paymentId,
      orderId: request.orderId,
      status: 'PENDING',
      paymentUrl,
      transactionId,
      gatewayResponse: {
        gateway: 'demo_gateway',
        method: request.paymentMethod,
        amount: request.amount,
        currency: request.currency
      }
    };
  }

  private async simulatePaymentVerification(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Extract amount from payment ID (in real implementation, this would come from the gateway)
    const mockAmount = Math.floor(Math.random() * 5000) + 100;
    
    // Simulate high success rate for verification
    const isSuccess = Math.random() < 0.95;

    if (!isSuccess) {
      return {
        success: false,
        status: 'FAILED',
        amount: mockAmount,
        currency: 'INR',
        transactionId: `txn_${Date.now()}`,
        paymentMethod: 'UPI',
        error: 'Payment verification failed'
      };
    }

    return {
      success: true,
      status: 'SUCCESS',
      amount: mockAmount,
      currency: 'INR',
      transactionId: `txn_${Date.now()}_verified`,
      paymentMethod: 'UPI',
      paidAt: new Date()
    };
  }

  // Utility methods for coin purchase integration
  async createCoinPurchasePayment(
    userId: string,
    coinAmount: number,
    priceInINR: number,
    paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING',
    customerInfo: { name: string; email: string; phone?: string }
  ): Promise<PaymentResponse> {
    const orderId = this.generateOrderId();
    
    const paymentRequest: PaymentRequest = {
      amount: priceInINR * 100, // Convert to paise for most Indian payment gateways
      currency: 'INR',
      orderId,
      customerInfo,
      paymentMethod,
      returnUrl: `${window.location.origin}/payment/success`,
      webhookUrl: `${window.location.origin}/api/webhooks/payment`
    };

    return this.initiatePayment(paymentRequest);
  }

  async verifyCoinPurchasePayment(
    paymentId: string,
    orderId: string,
    signature?: string
  ): Promise<PaymentVerificationResponse> {
    return this.verifyPayment({
      paymentId,
      orderId,
      signature
    });
  }

  // Error handling utilities
  getPaymentErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'insufficient_funds': 'Insufficient funds in your account',
      'card_declined': 'Your card was declined. Please try another card',
      'invalid_card': 'Invalid card details. Please check and try again',
      'expired_card': 'Your card has expired. Please use a different card',
      'bank_unavailable': 'Bank server is temporarily unavailable. Please try again',
      'transaction_timeout': 'Transaction timed out. Please try again',
      'invalid_upi': 'Invalid UPI ID. Please check and try again',
      'upi_declined': 'UPI payment was declined. Please try again',
      'network_error': 'Network error. Please check your connection and try again'
    };

    return errorMessages[error] || 'Payment failed. Please try again';
  }

  isRetryableError(error: string): boolean {
    const retryableErrors = [
      'network_error',
      'bank_unavailable',
      'transaction_timeout',
      'server_error'
    ];
    
    return retryableErrors.includes(error);
  }
}

export const paymentGatewayService = new PaymentGatewayService();
export default paymentGatewayService;