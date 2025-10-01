import React from 'react';
import {
  SecurityBadge,
  SocialProofWidget,
  TrustMetrics,
  PlatformStats,
  SecurityStatusBar,
  UserTestimonials,
  LiveActivityFeed,
  SupportWidget,
  FAQSection,
  OnboardingTour,
  ProfessionalStockCard,
  FeeBreakdown,
  NoHiddenFeesIndicator
} from './index';
import { mockSecurityBadges, mockTrustMetrics, mockPlatformStats, getLiveSocialProofData } from '../../data/trustData';

const ResponsiveTestPage: React.FC = () => {
  const socialProofData = getLiveSocialProofData();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Trust Components Responsive Test
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Testing responsive design across all screen sizes
          </p>
        </div>

        {/* Security Badges - Responsive Flex Layout */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Security Badges (Responsive Flex)
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
            {mockSecurityBadges.map((badge, index) => (
              <SecurityBadge 
                key={index} 
                badge={badge} 
                size="sm" 
              />
            ))}
          </div>
        </section>

        {/* Social Proof - Multiple Variants */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Social Proof (Responsive Variants)
          </h2>
          
          {/* Compact for mobile, horizontal for desktop */}
          <div className="block sm:hidden">
            <SocialProofWidget data={socialProofData} variant="compact" />
          </div>
          <div className="hidden sm:block">
            <SocialProofWidget data={socialProofData} variant="horizontal" />
          </div>
        </section>

        {/* Trust Metrics - Responsive Grid */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Trust Metrics (Responsive Grid)
          </h2>
          <TrustMetrics 
            metrics={mockTrustMetrics}
            variant="detailed"
          />
        </section>

        {/* Platform Stats - Adaptive Layout */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Platform Stats (Adaptive Layout)
          </h2>
          <PlatformStats 
            stats={mockPlatformStats}
            variant="dashboard"
            showLiveIndicators={true}
          />
        </section>

        {/* Two Column Layout - Responsive */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Security Status (Mobile First)
            </h2>
            <SecurityStatusBar
              verificationStatus={{
                emailVerified: true,
                phoneVerified: true,
                kycCompleted: false,
                bankAccountLinked: true,
                twoFactorEnabled: false
              }}
              variant="detailed"
            />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Support Widget (Responsive)
            </h2>
            <SupportWidget variant="sidebar" />
          </div>
        </section>

        {/* Professional Stock Card - Responsive */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Professional Stock Card (Responsive)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProfessionalStockCard
              stock={{
                symbol: 'RELIANCE',
                name: 'Reliance Industries',
                price: 2450.50,
                change: 45.20,
                changePercent: 1.88,
                volume: '2.5M',
                lastUpdated: new Date(),
                dataSource: 'NSE',
                marketStatus: 'open',
                dataQuality: 'live'
              }}
              variant="compact"
            />
            <ProfessionalStockCard
              stock={{
                symbol: 'TCS',
                name: 'Tata Consultancy Services',
                price: 3650.75,
                change: -25.30,
                changePercent: -0.69,
                volume: '1.8M',
                lastUpdated: new Date(),
                dataSource: 'NSE',
                marketStatus: 'open',
                dataQuality: 'live'
              }}
              variant="compact"
            />
            <ProfessionalStockCard
              stock={{
                symbol: 'INFY',
                name: 'Infosys Limited',
                price: 1420.90,
                change: 12.45,
                changePercent: 0.88,
                volume: '3.2M',
                lastUpdated: new Date(),
                dataSource: 'NSE',
                marketStatus: 'open',
                dataQuality: 'live'
              }}
              variant="compact"
            />
          </div>
        </section>

        {/* Fee Breakdown - Mobile Optimized */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Fee Breakdown (Mobile Optimized)
          </h2>
          <FeeBreakdown
            baseAmount={10000}
            fees={[
              {
                name: 'Brokerage',
                amount: 0,
                description: 'Zero brokerage on equity trades',
                type: 'fixed',
                isWaived: true
              },
              {
                name: 'STT',
                amount: 10,
                description: 'Securities Transaction Tax',
                type: 'percentage'
              }
            ]}
            variant="detailed"
          />
        </section>

        {/* Testimonials - Responsive Variants */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            User Testimonials (Responsive Variants)
          </h2>
          
          {/* Mobile: List view, Desktop: Grid view */}
          <div className="block sm:hidden">
            <UserTestimonials variant="list" maxItems={3} />
          </div>
          <div className="hidden sm:block">
            <UserTestimonials variant="grid" maxItems={6} />
          </div>
        </section>

        {/* Live Activity Feed - Responsive */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Live Activity Feed (Responsive)
          </h2>
          
          {/* Mobile: Compact, Desktop: Full */}
          <div className="block lg:hidden">
            <LiveActivityFeed variant="compact" maxItems={5} />
          </div>
          <div className="hidden lg:block">
            <LiveActivityFeed variant="full" maxItems={8} />
          </div>
        </section>

        {/* FAQ Section - Mobile First */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            FAQ Section (Mobile First)
          </h2>
          <FAQSection variant="full" maxItems={5} />
        </section>

        {/* Trust Indicators - Responsive Spacing */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Trust Indicators (Responsive Spacing)
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
            <NoHiddenFeesIndicator variant="badge" size="sm" />
            <NoHiddenFeesIndicator variant="badge" size="md" />
            <NoHiddenFeesIndicator variant="badge" size="lg" />
          </div>
        </section>

        {/* Responsive Breakpoint Indicators */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Current Breakpoint Indicator
          </h2>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                <span className="sm:hidden">Mobile (< 640px)</span>
                <span className="hidden sm:block md:hidden">Small (640px - 768px)</span>
                <span className="hidden md:block lg:hidden">Medium (768px - 1024px)</span>