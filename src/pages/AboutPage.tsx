import React from 'react';
import { Shield, TrendingUp, Smartphone, Award, BarChart3, Users, Target, Globe, Zap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-sm font-medium mb-6">
            <BarChart3 className="h-4 w-4 mr-2" />
            Professional Trading Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">About NiftyBulk</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Empowering traders with cutting-edge technology, real-time market insights, and professional-grade trading tools
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">50K+</div>
            <p className="text-gray-600 dark:text-gray-400">Active Traders</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">₹100Cr+</div>
            <p className="text-gray-600 dark:text-gray-400">Daily Volume</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">99.9%</div>
            <p className="text-gray-600 dark:text-gray-400">Uptime</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
            <p className="text-gray-600 dark:text-gray-400">Support</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time Trading</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Access live market data and execute trades instantly with professional-grade tools
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bank-Grade Security</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced encryption and security measures to protect your investments and data
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mobile Optimized</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Seamless trading experience across all devices with responsive design
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ultra-low latency execution with advanced order management system
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive market analysis tools and technical indicators
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Award Winning</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Recognized for excellence in fintech innovation and user experience
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700 mb-16">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6 text-center">
              At NiftyBulk, we believe that investing should be accessible to everyone. Our mission is to democratize stock market investing by providing a simple, secure, and powerful platform that empowers individuals to build wealth through smart investment decisions.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed text-center">
              With cutting-edge technology, real-time market data, and user-friendly design, we're making it easier than ever for both beginners and experienced traders to navigate the stock market with confidence.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose NiftyBulk?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Join thousands of traders who trust NiftyBulk for their investment journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 border border-blue-100 dark:border-slate-600">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trusted by Thousands</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Over 50,000 active traders trust NiftyBulk for their daily trading needs. Our platform has facilitated over ₹100 crores in daily trading volume.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 border border-green-100 dark:border-slate-600">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">SEBI Registered</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We are a SEBI registered broker with NSE and BSE membership, ensuring complete regulatory compliance and investor protection.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join NiftyBulk today and experience the future of stock market trading with our professional-grade platform.
          </p>
          <button onClick={() => navigate('/login')} className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;