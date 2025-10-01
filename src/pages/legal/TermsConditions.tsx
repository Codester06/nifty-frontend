import * as React from "react";

type TermsProps = {
  lastUpdated?: string;
};

export default function TermsAndConditions({
  lastUpdated = "August 2025",
}: TermsProps) {
  const Section: React.FC<{ title: string; children: React.ReactNode; id?: string }> = ({
    title,
    children,
    id,
  }) => (
    <section className="mb-8" id={id}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <div className="text-gray-700 dark:text-gray-300 space-y-4">
        {children}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-sm font-medium mb-6">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Legal Documentation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Terms & Conditions</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Please read these terms carefully before using NiftyBulk trading platform
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
              Terms and Conditions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Last updated: {lastUpdated}
            </p>
          </div>

          <Section title="1. Acceptance of Terms" id="acceptance">
            <p>
              By accessing and using NiftyBulk's trading platform and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </Section>

          <Section title="2. Eligibility" id="eligibility">
            <p>
              To use our services, you must:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding agreements</li>
              <li>Provide accurate and complete information during registration</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </Section>

          <Section title="3. Account Registration and Security" id="account">
            <p>
              When creating an account with NiftyBulk, you agree to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as necessary</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </Section>

          <Section title="4. Trading Services" id="trading">
            <p>
              NiftyBulk provides online trading services for securities listed on recognized stock exchanges. Our services include:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Real-time market data and analysis</li>
              <li>Order placement and execution</li>
              <li>Portfolio management tools</li>
              <li>Research and advisory services</li>
            </ul>
            <p className="mt-4">
              All trading activities are subject to market risks, and past performance does not guarantee future results.
            </p>
          </Section>

          <Section title="5. Fees and Charges" id="fees">
            <p>
              By using our services, you agree to pay all applicable fees and charges as outlined in our fee schedule. Fees may include:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Brokerage fees for trade execution</li>
              <li>Account maintenance charges</li>
              <li>Data subscription fees</li>
              <li>Transaction and processing fees</li>
            </ul>
            <p className="mt-4">
              We reserve the right to modify our fee structure with appropriate notice to users.
            </p>
          </Section>

          <Section title="6. Risk Disclosure" id="risk">
            <p className="font-semibold text-red-600 dark:text-red-400">
              IMPORTANT RISK WARNING:
            </p>
            <p>
              Trading in securities involves substantial risk of loss and may not be suitable for all investors. You should carefully consider your financial situation and risk tolerance before engaging in trading activities. Key risks include:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Market volatility and price fluctuations</li>
              <li>Liquidity risks</li>
              <li>Leverage and margin risks</li>
              <li>Counterparty risks</li>
              <li>Technology and operational risks</li>
            </ul>
          </Section>

          <Section title="7. Limitation of Liability" id="liability">
            <p>
              NiftyBulk shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Use or inability to use our services</li>
              <li>Trading losses or investment decisions</li>
              <li>System downtime or technical failures</li>
              <li>Data inaccuracies or delays</li>
              <li>Third-party actions or omissions</li>
            </ul>
          </Section>

          <Section title="8. Compliance and Regulations" id="compliance">
            <p>
              NiftyBulk is regulated by the Securities and Exchange Board of India (SEBI) and operates in compliance with all applicable laws and regulations. Users must also comply with:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>SEBI regulations and guidelines</li>
              <li>Exchange rules and procedures</li>
              <li>Anti-money laundering (AML) requirements</li>
              <li>Know Your Customer (KYC) norms</li>
              <li>Tax obligations and reporting requirements</li>
            </ul>
          </Section>

          <Section title="9. Termination" id="termination">
            <p>
              Either party may terminate this agreement at any time with appropriate notice. Upon termination:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Your access to our services will be suspended</li>
              <li>Outstanding obligations must be settled</li>
              <li>Data retention policies will apply</li>
              <li>Certain provisions will survive termination</li>
            </ul>
          </Section>

          <Section title="10. Modifications" id="modifications">
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Changes will be effective upon posting on our website. Continued use of our services after modifications constitutes acceptance of the updated terms.
            </p>
          </Section>

          <Section title="11. Contact Information" id="contact">
            <p>
              For questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mt-4">
              <p><strong>NiftyBulk Securities Pvt. Ltd.</strong></p>
              <p>Email: legal@niftybulk.com</p>
              <p>Phone: 1800-123-456 (Toll Free)</p>
              <p>Address: 123 Financial District, BKC, Mumbai, Maharashtra 400051</p>
            </div>
          </Section>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              These Terms and Conditions are governed by the laws of India and subject to the jurisdiction of Mumbai courts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
