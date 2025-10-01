import { Mail, Phone, MessageCircle, Clock, Search, BookOpen, Video, Users, Headphones, Shield, HelpCircle, FileText } from 'lucide-react';

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-sm font-medium mb-6">
            <Headphones className="h-4 w-4 mr-2" />
            24/7 Customer Support
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Support Center</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            We're here to help you succeed. Get the support you need, when you need it.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Help Search */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            />
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get detailed help via email within 24 hours
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              support@niftybulk.com
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Speak with our trading experts directly
            </p>
            <p className="text-green-600 dark:text-green-400 font-medium">
              1800-123-4567
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Instant help through live chat support
            </p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium">
              Start Chat
            </button>
          </div>
        </div>

        {/* Help Resources */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Help Resources</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Find answers to common questions and learn how to make the most of NiftyBulk
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Trading Guide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete guide to get started with trading
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
              <Video className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Video Tutorials</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Step-by-step video tutorials
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">FAQs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Frequently asked questions
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Documentation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed platform documentation
            </p>
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700 mb-16">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Support Hours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="font-semibold text-gray-900 dark:text-white">Email Support</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400">24/7 - Always available</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="font-semibold text-gray-900 dark:text-white">Phone Support</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Mon-Fri: 9 AM - 6 PM IST</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <p className="font-semibold text-gray-900 dark:text-white">Live Chat</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Mon-Fri: 9 AM - 6 PM IST</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700 mb-16">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b border-gray-200 dark:border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How do I start trading with NiftyBulk?</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Getting started is simple: 1) Create your account with basic details, 2) Complete KYC verification with required documents, 3) Add funds to your trading account, 4) Start exploring and trading Nifty 50 stocks with real-time data.
              </p>
            </div>
            <div className="border-b border-gray-200 dark:border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What are the trading charges and fees?</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We offer competitive brokerage rates starting from ₹20 per trade for equity delivery and ₹20 per trade for intraday. No hidden charges, transparent pricing with detailed breakdown available in your account.
              </p>
            </div>
            <div className="border-b border-gray-200 dark:border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How secure are my investments and personal data?</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Your investments are protected by bank-grade security with 256-bit SSL encryption, two-factor authentication, and segregated client accounts. We are SEBI registered and follow all regulatory compliance requirements.
              </p>
            </div>
            <div className="border-b border-gray-200 dark:border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Can I trade on mobile devices?</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Yes! Our platform is fully optimized for mobile trading. Access all features including live market data, order placement, portfolio tracking, and technical analysis tools on any device.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What support is available for new traders?</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We provide comprehensive support including video tutorials, trading guides, webinars, and dedicated customer support. Our team of trading experts is available to help you learn and succeed.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 mr-3" />
            <h2 className="text-2xl font-bold">Emergency Support</h2>
          </div>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            For urgent trading issues or account security concerns, contact our emergency support line immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:1800-123-4567" className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Emergency Hotline: 1800-123-4567
            </a>
            <a href="mailto:emergency@niftybulk.com" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-colors duration-200">
              emergency@niftybulk.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;