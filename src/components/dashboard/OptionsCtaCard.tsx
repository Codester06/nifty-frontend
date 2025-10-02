import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Smartphone, ArrowRight } from 'lucide-react';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

const OptionsCtaCard: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-xl overflow-hidden relative"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Options Trading
                </h3>
                <p className="text-orange-100">
                  {isMobile ? 'Mobile-optimized trading' : 'Advanced options trading platform'}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Real-time option chains</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Live Greeks calculations</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">{isMobile ? 'Touch-friendly interface' : 'Advanced filtering & sorting'}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Demo mode for learning</span>
              </div>
            </div>

            {isMobile && (
              <div className="flex items-center gap-2 text-orange-100 mb-4">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm">Optimized for mobile trading</span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/options')}
              className="group bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 shadow-lg transform hover:-translate-y-1 flex items-center gap-3"
            >
              <span>Start Trading Options</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">5+</div>
            <div className="text-xs text-orange-100">Underlyings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">100+</div>
            <div className="text-xs text-orange-100">Strike Prices</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">Live</div>
            <div className="text-xs text-orange-100">Real-time Data</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OptionsCtaCard;