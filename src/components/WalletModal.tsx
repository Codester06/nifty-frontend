import { useState, useEffect, useCallback } from "react";
import { X, Smartphone, CreditCard } from "lucide-react";

import UPIPaymentDetails from "./UPIPaymentDetails";
import BankTransferDetails from "./BankTransferDetails";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Constants moved outside component to prevent recreation on each render
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

import type { PaymentMethod, ToastType } from '../types/wallet';

// Payment method data - moved outside component for performance
const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "upi", label: "UPI Payment", icon: Smartphone },
  { id: "bank", label: "Bank Transfer", icon: CreditCard },
];

const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  // Payment method state only
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "upi" | "bank" | null
  >(null);


  // Keep existing wallet state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");



  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    setWalletError("");
    try {
      const token = localStorage.getItem("nifty-bulk-token");
      const response = await fetch(`${API_BASE_URL}/users/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch wallet");
      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (err) {
      setWalletError(
        err instanceof Error ? err.message : "Failed to fetch wallet"
      );
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    fetchWallet();

    // Reset selection when modal opens
    setSelectedPaymentMethod(null);
  }, [isOpen, fetchWallet]);

  const showToastMessage = useCallback((
    message: string,
    type: ToastType = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), type === "error" ? 5000 : 3000); // Show errors longer
  }, []);

  const handlePaymentMethodSelect = useCallback((method: "upi" | "bank") => {
    setSelectedPaymentMethod(method);
  }, []);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200/50 dark:border-slate-700/50 rounded-3xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Wallet
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-all duration-300"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Balance Display with Loading/Error States */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Current Balance
            </p>
            {walletLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="text-lg text-blue-600 dark:text-blue-400">
                  Loading...
                </p>
              </div>
            ) : walletError ? (
              <div className="text-red-600 dark:text-red-400">
                <p className="text-lg font-semibold">Error loading balance</p>
                <p className="text-sm">{walletError}</p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                ₹{walletBalance.toLocaleString()}
              </p>
            )}
          </div>

          {/* Buy Coins Section */}
          {!walletLoading && !walletError && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Buy Coins
              </h2>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {PAYMENT_METHODS.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 min-h-[100px] flex items-center justify-center ${
                        selectedPaymentMethod === method.id
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg transform scale-105"
                          : "border-gray-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-600 bg-white dark:bg-slate-700 hover:shadow-md"
                      }`}
                    >
                      <div className="text-center w-full">
                        <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {method.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* UPI Payment Details */}
          {selectedPaymentMethod === "upi" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                UPI Payment Details
              </h3>
              <UPIPaymentDetails />
            </div>
          )}

          {/* Bank Transfer Payment Details */}
          {selectedPaymentMethod === "bank" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bank Transfer Details
              </h3>
              <BankTransferDetails />
            </div>
          )}


        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-xl z-50 ${
            toastType === "success"
              ? "border-green-200 dark:border-green-700"
              : toastType === "error"
              ? "border-red-200 dark:border-red-700"
              : "border-blue-200 dark:border-blue-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                toastType === "success"
                  ? "bg-green-500"
                  : toastType === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
            ></div>
            <span
              className={`font-semibold text-sm sm:text-base ${
                toastType === "success"
                  ? "text-green-600 dark:text-green-400"
                  : toastType === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {toastMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletModal;
