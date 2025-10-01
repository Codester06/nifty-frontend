import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, HelpCircle, Clock, User, Send, X, CheckCircle } from 'lucide-react';
import { SupportOption } from '../../types/trust';

interface SupportWidgetProps {
  options?: SupportOption[];
  variant?: 'floating' | 'inline' | 'modal' | 'sidebar';
  showResponseTimes?: boolean;
  onOptionClick?: (option: SupportOption) => void;
}

const SupportWidget: React.FC<SupportWidgetProps> = ({
  options,
  variant = 'floating',
  showResponseTimes = true,
  onOptionClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SupportOption | null>(null);
  const [quickMessage, setQuickMessage] = useState('');

  const defaultOptions: SupportOption[] = [
    {
      type: 'chat',
      label: 'Live Chat',
      availability: 'online',
      responseTime: '< 2 min',
      icon: 'message-circle'
    },
    {
      type: 'phone',
      label: 'Phone Support',
      availability: 'online',
      responseTime: '< 5 min',
      icon: 'phone'
    },
    {
      type: 'email',
      label: 'Email Support',
      availability: 'online',
      responseTime: '< 2 hours',
      icon: 'mail'
    },
    {
      type: 'faq',
      label: 'Help Center',
      availability: 'online',
      responseTime: 'Instant',
      icon: 'help-circle'
    }
  ];

  const supportOptions = options || defaultOptions;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'message-circle':
        return MessageCircle;
      case 'phone':
        return Phone;
      case 'mail':
        return Mail;
      case 'help-circle':
        return HelpCircle;
      default:
        return MessageCircle;
    }
  };

  const getAvailabilityConfig = (availability: string) => {
    switch (availability) {
      case 'online':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          dotColor: 'bg-green-500',
          label: 'Online'
        };
      case 'busy':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          dotColor: 'bg-yellow-500',
          label: 'Busy'
        };
      case 'offline':
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          dotColor: 'bg-gray-500',
          label: 'Offline'
        };
      default:
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          dotColor: 'bg-green-500',
          label: 'Available'
        };
    }
  };

  const handleOptionClick = (option: SupportOption) => {
    setSelectedOption(option);
    onOptionClick?.(option);
  };

  const quickMessages = [
    "I need help with my account",
    "How do I make a trade?",
    "I have a technical issue",
    "Question about fees",
    "Account verification help"
  ];

  if (variant === 'floating') {
    return (
      <>
        {/* Floating Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Floating Panel */}
        {isOpen && (
          <div className="fixed bottom-24 right-6 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Need Help?
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Support Online
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose how you'd like to get help
              </p>
            </div>

            <div className="p-4 space-y-3">
              {supportOptions.map((option, index) => {
                const Icon = getIcon(option.icon);
                const availabilityConfig = getAvailabilityConfig(option.availability);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors hover:shadow-sm ${availabilityConfig.bgColor} border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600`}
                  >
                    <div className={`p-2 rounded-lg ${availabilityConfig.bgColor}`}>
                      <Icon className={`h-5 w-5 ${availabilityConfig.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${availabilityConfig.dotColor} ${option.availability === 'online' ? 'animate-pulse' : ''}`}></div>
                      </div>
                      {showResponseTimes && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {option.responseTime}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Message Section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Quick Message
              </h4>
              <div className="space-y-2">
                <textarea
                  value={quickMessage}
                  onChange={(e) => setQuickMessage(e.target.value)}
                  placeholder="Describe your issue..."
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
                <div className="flex flex-wrap gap-1">
                  {quickMessages.slice(0, 3).map((msg, index) => (
                    <button
                      key={index}
                      onClick={() => setQuickMessage(msg)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Get Support
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Our support team is here to help you 24/7
        </p>

        <div className="space-y-3">
          {supportOptions.map((option, index) => {
            const Icon = getIcon(option.icon);
            const availabilityConfig = getAvailabilityConfig(option.availability);
            
            return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors hover:shadow-sm ${availabilityConfig.bgColor} border-gray-200 dark:border-gray-600`}
              >
                <Icon className={`h-5 w-5 ${availabilityConfig.color}`} />
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${availabilityConfig.dotColor} ${option.availability === 'online' ? 'animate-pulse' : ''}`}></div>
                  </div>
                  {showResponseTimes && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {option.responseTime}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Contact Support
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  We're here to help you succeed
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {supportOptions.map((option, index) => {
                const Icon = getIcon(option.icon);
                const availabilityConfig = getAvailabilityConfig(option.availability);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className={`p-4 rounded-xl border transition-all hover:shadow-md ${availabilityConfig.bgColor} border-gray-200 dark:border-gray-600`}
                  >
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${availabilityConfig.bgColor}`}>
                        <Icon className={`h-6 w-6 ${availabilityConfig.color}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {option.label}
                      </h3>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        <div className={`w-2 h-2 rounded-full ${availabilityConfig.dotColor} ${option.availability === 'online' ? 'animate-pulse' : ''}`}></div>
                        <span className={`text-xs font-medium ${availabilityConfig.color}`}>
                          {availabilityConfig.label}
                        </span>
                      </div>
                      {showResponseTimes && (
                        <div className="flex items-center justify-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {option.responseTime}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    24/7 Support Guarantee
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Our dedicated support team is available around the clock to assist you with any questions or issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Need Help?
        </h3>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 dark:text-green-400">
            Online
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {supportOptions.slice(0, 4).map((option, index) => {
          const Icon = getIcon(option.icon);
          const availabilityConfig = getAvailabilityConfig(option.availability);
          
          return (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors hover:shadow-sm ${availabilityConfig.bgColor} border-gray-200 dark:border-gray-600`}
            >
              <Icon className={`h-4 w-4 ${availabilityConfig.color}`} />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </div>
                {showResponseTimes && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.responseTime}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SupportWidget;