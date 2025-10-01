import { useState, useEffect } from "react";
import { X, Smartphone, CreditCard } from "lucide-react";

import UPIPaymentDetails from "./UPIPaymentDetails";
import BankTransferDetails from "./BankTransferDetails";
import { useAuth } from "../hooks/useAuth";


interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}



// Payment method data - moved outside component for performance
const PAYMENT_METHODS = [
  { id: "upi" as const, label: "UPI Payment", icon: Smartphone },
  { id: "bank" as const, label: "Bank Transfer", icon: CreditCard },
];

const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { user, refreshWalletBalance } = useAuth();
  
  // Payment method state only
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "upi" | "bank" | null
  >(null);



  useEffect(() => {
    if (!isOpen) {
      // Reset selection when modal closes
      setSelectedPaymentMethod(null);
      return;
    }
    
    // Refresh wallet balance when modal opens
    refreshWalletBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Intentionally excluding refreshWalletBalance to prevent constant re-runs



  const handlePaymentMethodSelect = (method: "upi" | "bank") => {
    setSelectedPaymentMethod(method);
  };



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
          {/* Balance Display */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
              Current Balance
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              ₹{(user?.walletBalance ?? 0).toLocaleString()}
            </p>
          </div>



          {/* Buy Coins Section */}
          <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Add Funds to Wallet
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
                      onClick={() => handlePaymentMethodSelect(method.id as "upi" | "bank")}
                      className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center ${
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


    </div>
  );
};

export default WalletModal;
