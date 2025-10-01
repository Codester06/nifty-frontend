import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, Star, Clock, User } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful?: number;
  lastUpdated?: Date;
  popular?: boolean;
}

interface FAQSectionProps {
  faqs?: FAQItem[];
  variant?: 'full' | 'compact' | 'searchable';
  showCategories?: boolean;
  showHelpful?: boolean;
  maxItems?: number;
}

const FAQSection: React.FC<FAQSectionProps> = ({
  faqs,
  variant = 'full',
  showCategories = true,
  showHelpful = true,
  maxItems = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const defaultFAQs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I start trading on NiftyBulk?',
      answer: 'To start trading, first complete your account registration and KYC verification. Then add funds to your wallet and you can begin placing trades. We recommend starting with our demo mode to familiarize yourself with the platform.',
      category: 'Getting Started',
      tags: ['trading', 'account', 'kyc', 'beginner'],
      helpful: 45,
      lastUpdated: new Date('2024-01-15'),
      popular: true
    },
    {
      id: '2',
      question: 'What are the trading fees and charges?',
      answer: 'NiftyBulk offers zero brokerage on equity trades. You only pay statutory charges like STT, exchange charges, and GST. There are no hidden fees - all charges are transparently displayed before you confirm any trade.',
      category: 'Fees & Charges',
      tags: ['fees', 'brokerage', 'charges', 'transparent'],
      helpful: 38,
      lastUpdated: new Date('2024-01-12'),
      popular: true
    },
    {
      id: '3',
      question: 'How secure is my money and data?',
      answer: 'Your funds are completely secure with bank-level encryption and are held in segregated accounts. We use 256-bit SSL encryption for all data transmission and are compliant with all regulatory requirements.',
      category: 'Security',
      tags: ['security', 'encryption', 'funds', 'data'],
      helpful: 42,
      lastUpdated: new Date('2024-01-10'),
      popular: true
    },
    {
      id: '4',
      question: 'How do I add funds to my wallet?',
      answer: 'You can add funds instantly using UPI, net banking, or bank transfer. Go to your wallet section, select the amount, choose your payment method, and complete the transaction. Funds are usually credited within minutes.',
      category: 'Wallet',
      tags: ['wallet', 'deposit', 'upi', 'bank transfer'],
      helpful: 33,
      lastUpdated: new Date('2024-01-08')
    },
    {
      id: '5',
      question: 'What is KYC and why is it required?',
      answer: 'KYC (Know Your Customer) is a regulatory requirement for all trading accounts. It involves verifying your identity and address using documents like Aadhaar, PAN, and bank statements. This ensures platform security and compliance.',
      category: 'Account',
      tags: ['kyc', 'verification', 'documents', 'compliance'],
      helpful: 29,
      lastUpdated: new Date('2024-01-05')
    },
    {
      id: '6',
      question: 'How do I withdraw my profits?',
      answer: 'Withdrawals are processed to your linked bank account within 1-2 business days. Go to your wallet, click withdraw, enter the amount, and confirm. There are no charges for withdrawals up to 5 times per month.',
      category: 'Wallet',
      tags: ['withdrawal', 'profits', 'bank account', 'processing'],
      helpful: 31,
      lastUpdated: new Date('2024-01-03')
    },
    {
      id: '7',
      question: 'Can I trade on mobile?',
      answer: 'Yes! Our mobile app is available for both Android and iOS. It offers all the features of the web platform including real-time charts, order placement, portfolio tracking, and account management.',
      category: 'Platform',
      tags: ['mobile', 'app', 'android', 'ios', 'features'],
      helpful: 27,
      lastUpdated: new Date('2024-01-01')
    },
    {
      id: '8',
      question: 'What support is available if I need help?',
      answer: 'We offer 24/7 customer support through live chat, phone, and email. Our average response time is under 2 minutes for chat and 2 hours for email. We also have a comprehensive help center with guides and tutorials.',
      category: 'Support',
      tags: ['support', 'help', 'chat', 'phone', 'email'],
      helpful: 35,
      lastUpdated: new Date('2023-12-28')
    }
  ];

  const faqData = faqs || defaultFAQs;

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(faqData.map(faq => faq.category))];
    return cats;
  }, [faqData]);

  const filteredFAQs = useMemo(() => {
    let filtered = faqData;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Sort by popularity and helpful votes
    filtered.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return (b.helpful || 0) - (a.helpful || 0);
    });

    return filtered.slice(0, maxItems);
  }, [faqData, selectedCategory, searchTerm, maxItems]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleHelpful = (id: string) => {
    // In a real app, this would update the helpful count via API
    console.log(`Marked FAQ ${id} as helpful`);
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-3">
          {filteredFAQs.slice(0, 5).map((faq) => (
            <div key={faq.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                {expandedItems.has(faq.id) ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {expandedItems.has(faq.id) && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default full variant with search
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {showCategories && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No FAQs found matching your search.
            </p>
          </div>
        ) : (
          filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-lg"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    {faq.popular && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      {faq.category}
                    </span>
                    {showHelpful && faq.helpful && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{faq.helpful} found helpful</span>
                      </div>
                    )}
                    {faq.lastUpdated && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Updated {faq.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {expandedItems.has(faq.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {expandedItems.has(faq.id) && (
                <div className="px-4 pb-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {faq.answer}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {faq.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Helpful Section */}
                    {showHelpful && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Was this helpful?
                        </span>
                        <button
                          onClick={() => handleHelpful(faq.id)}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                          <span>👍</span>
                          <span>Yes</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Contact Support CTA */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="text-center">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Still need help?
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;