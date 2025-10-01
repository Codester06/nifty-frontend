import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = "December 15, 2024";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-sm font-medium mb-6">
            <Shield className="h-4 w-4 mr-2" />
            Privacy & Data Protection
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Privacy Policy</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Your privacy is our priority. Learn how we protect and handle your data.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-4">
              Last Updated: {lastUpdated}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This Privacy Policy describes how NiftyBulk collects, uses, and protects your information when you use our trading platform.
            </p>
          </div>

          <div className="space-y-8">
            {/* Information We Collect */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Information We Collect</h3>
              </div>
              <div className="ml-13 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Personal Information</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    We collect personal information you provide when creating an account, including your name, email address, phone number, and KYC documents required for regulatory compliance.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Trading Data</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    We collect information about your trading activities, portfolio holdings, transaction history, and investment preferences to provide our services.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Technical Information</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    We automatically collect device information, IP addresses, browser type, and usage patterns to improve our platform and ensure security.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How We Use Your Information</h3>
              </div>
              <div className="ml-13 space-y-3">
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Provide and maintain our trading platform and services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Process transactions and manage your account</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Comply with regulatory requirements and KYC obligations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Detect and prevent fraud, security threats, and illegal activities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Send important notifications about your account and transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Improve our services and develop new features</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Data Security</h3>
              </div>
              <div className="ml-13 space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  We implement industry-standard security measures to protect your personal and financial information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Encryption</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">256-bit SSL encryption for all data transmission</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Authentication</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Multi-factor authentication and secure login</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Monitoring</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">24/7 security monitoring and threat detection</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Compliance</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">SEBI regulations and data protection standards</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Information Sharing</h3>
              </div>
              <div className="ml-13 space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>With regulatory authorities as required by law (SEBI, RBI, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>With trusted service providers who assist in our operations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>In case of legal proceedings or to protect our rights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>With your explicit consent for specific purposes</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Rights</h3>
              </div>
              <div className="ml-13 space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  You have the following rights regarding your personal information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Access</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Request access to your personal data</p>
                  </div>
                  <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Correction</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Update or correct your information</p>
                  </div>
                  <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Deletion</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Request deletion of your data (subject to legal requirements)</p>
                  </div>
                  <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Portability</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Export your data in a structured format</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> privacy@niftybulk.com</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> 1800-123-4567</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Address:</strong> NiftyBulk Technologies Pvt. Ltd., Mumbai, Maharashtra, India</p>
              </div>
            </section>

            {/* Updates to Policy */}
            <section className="border-t border-gray-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Updates to This Policy</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
