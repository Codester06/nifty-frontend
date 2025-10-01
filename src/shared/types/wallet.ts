// Shared interfaces for wallet components
export interface CoinPackage {
  id: 'package1' | 'package2' | 'package3';
  price: number;
  coins: number;
  label: string;
}

export interface PaymentMethod {
  id: 'upi' | 'bank';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type ToastType = 'success' | 'error' | 'info';