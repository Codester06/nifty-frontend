import { memo, useState, useCallback } from 'react';
import { QrCode, Copy, CheckCircle } from 'lucide-react';
import qrCode from "@/assets/images/upi-qr-code.png"

const UPIPaymentDetails = () => {
  const [copiedUPI, setCopiedUPI] = useState(false);

  const upiId = '9158411834@naviaxis';

  const copyUPIId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2000);
    } catch (err) {
      console.error('Failed to copy UPI ID: ', err);
    }
  }, [upiId]);

  return (
    <div className="space-y-6">
      {/* QR Code Section */}
      <div className="text-center">
        <div className="bg-white dark:bg-slate-700 rounded-2xl p-4 sm:p-6 border border-gray-300 dark:border-slate-600 mb-4">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <img 
                src={qrCode}
                alt="UPI QR Code for payment" 
                className="h-32 w-32 sm:h-40 sm:w-40 object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <QrCode className="h-32 w-32 sm:h-40 sm:w-40 text-gray-400 dark:text-slate-500 hidden" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 text-center font-medium">
              Scan this QR code with any UPI app
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">UPI ID</p>
                  <p className="text-xs sm:text-sm font-mono font-semibold text-blue-800 dark:text-blue-300 break-all">
                    {upiId}
                  </p>
                </div>
                <button
                  onClick={copyUPIId}
                  className="p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
                  title="Copy UPI ID"
                >
                  {copiedUPI ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        

      </div>

      {/* Payment Information */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-3 sm:p-4">
        <div className="text-center">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            UPI Payment Information
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use the UPI ID or QR code above to make your payment. After completing the payment, your wallet will be updated accordingly.
          </p>
        </div>
      </div>



      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Complete the payment using your UPI app by scanning the QR code above
        </p>
      </div>
    </div>
  );
};

export default memo(UPIPaymentDetails);