import { useState, useCallback, useMemo, memo } from 'react';
import { Building2, CheckCircle, Copy } from 'lucide-react';

const BankTransferDetails = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Bank details memoized to prevent recreation on each render
  const bankDetails = useMemo(() => ({
    accountNumber: '73130100004772',
    ifscCode: 'BARB0DBCNAG',
    accountName: 'Ranjeet Bahadur'
  }), []);

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Bank Details Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <h4 className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-300">
              Bank Transfer Details
            </h4>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Account Number */}
          <div className="bg-white dark:bg-slate-700 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-slate-600">
            <div className="flex justify-between items-start sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Account Number</p>
                <p className="text-sm sm:text-lg font-mono font-semibold text-gray-900 dark:text-white break-all">
                  {bankDetails.accountNumber}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                className="p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
              >
                {copiedField === 'account' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            </div>
          </div>

          {/* IFSC Code */}
          <div className="bg-white dark:bg-slate-700 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-slate-600">
            <div className="flex justify-between items-start sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">IFSC Code</p>
                <p className="text-sm sm:text-lg font-mono font-semibold text-gray-900 dark:text-white break-all">
                  {bankDetails.ifscCode}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.ifscCode, 'ifsc')}
                className="p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
              >
                {copiedField === 'ifsc' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div className="bg-white dark:bg-slate-700 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-slate-600">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Account Name</p>
            <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
              {bankDetails.accountName}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-3 sm:p-4">
        <div className="text-center">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Bank Transfer Information
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use the bank details above to make your transfer. After completing the payment, your wallet will be updated accordingly.
          </p>
        </div>
      </div>



      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Complete the bank transfer using your banking app with the details above
        </p>
      </div>
    </div>
  );
};

export default memo(BankTransferDetails);