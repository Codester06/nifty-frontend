import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useAuth } from '@/shared/hooks/useAuth';
import MobileOptionChain from '@/components/options/MobileOptionChain';
import OptionChain from '@/components/options/OptionChain';
import TradingModal from '@/components/forms/TradingModal';
import type { OptionContract } from '@/shared/types';

const OptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const [selectedOption, setSelectedOption] = useState<OptionContract | null>(null);
  const [tradingModal, setTradingModal] = useState({
    isOpen: false,
    type: 'buy' as 'buy' | 'sell',
  });
  const [viewMode, setViewMode] = useState<'auto' | 'mobile' | 'desktop'>('auto');

  // Determine effective view mode
  const getEffectiveViewMode = () => {
    if (viewMode !== 'auto') return viewMode;
    return isMobile ? 'mobile' : 'desktop';
  };

  const effectiveViewMode = getEffectiveViewMode();

  const handleOptionSelect = (option: OptionContract) => {
    setSelectedOption(option);
    setTradingModal({ isOpen: true, type: 'buy' });
  };

  const handleCloseTradingModal = () => {
    setTradingModal({ ...tradingModal, isOpen: false });
    setSelectedOption(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div 
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Options Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Please log in to access the option chain and start trading options with demo coins
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
              >
                Login to Trade Options
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-8 py-4 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Desktop Header */}
      {effectiveViewMode === 'desktop' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-3 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Options Trading
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Real-time option chains and trading platform
                  </p>
                </div>
              </div>
              
              {/* View Mode Selector */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('auto')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'auto'
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span>Auto</span>
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'mobile'
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile</span>
                </button>
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'desktop'
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  <span>Desktop</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={effectiveViewMode === 'desktop' ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}>
        {effectiveViewMode === 'mobile' ? (
          <MobileOptionChain
            underlying="NIFTY"
            onOptionSelect={handleOptionSelect}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <OptionChain
              underlying="NIFTY"
              variant="full-page"
              onOptionSelect={handleOptionSelect}
              className="rounded-3xl"
            />
          </motion.div>
        )}
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={tradingModal.isOpen}
        onClose={handleCloseTradingModal}
        type={tradingModal.type}
        instrumentType="option"
        optionContract={selectedOption || undefined}
      />

      {/* Mobile Back Button */}
      {effectiveViewMode === 'mobile' && (
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OptionsPage;