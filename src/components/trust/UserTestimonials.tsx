import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, User, Verified } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  location?: string;
  tradingExperience?: string;
}

interface UserTestimonialsProps {
  testimonials?: Testimonial[];
  variant?: 'carousel' | 'grid' | 'list' | 'featured';
  autoPlay?: boolean;
  showRating?: boolean;
  maxItems?: number;
}

const UserTestimonials: React.FC<UserTestimonialsProps> = ({
  testimonials,
  variant = 'carousel',
  autoPlay = true,
  showRating = true,
  maxItems = 6
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default testimonials data
  const defaultTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      role: 'Software Engineer',
      rating: 5,
      text: 'NiftyBulk has transformed my trading experience. The platform is incredibly user-friendly and the zero brokerage policy has saved me thousands. Highly recommended!',
      date: '2024-01-15',
      verified: true,
      location: 'Mumbai',
      tradingExperience: '3 years'
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      role: 'Business Owner',
      rating: 5,
      text: 'The best trading platform I have used. Fast execution, transparent pricing, and excellent customer support. My portfolio has grown significantly since I started using NiftyBulk.',
      date: '2024-01-10',
      verified: true,
      location: 'Delhi',
      tradingExperience: '5 years'
    },
    {
      id: '3',
      name: 'Sneha Patel',
      role: 'Financial Analyst',
      rating: 4,
      text: 'Great platform with advanced charting tools and real-time data. The mobile app is fantastic and allows me to trade on the go. Very satisfied with the service.',
      date: '2024-01-08',
      verified: true,
      location: 'Bangalore',
      tradingExperience: '7 years'
    },
    {
      id: '4',
      name: 'Amit Singh',
      role: 'Doctor',
      rating: 5,
      text: 'As a beginner, I was worried about trading, but NiftyBulk made it so easy. The educational resources and demo trading helped me learn without risk. Now I am confident in my trades.',
      date: '2024-01-05',
      verified: true,
      location: 'Pune',
      tradingExperience: '1 year'
    },
    {
      id: '5',
      name: 'Kavya Reddy',
      role: 'Marketing Manager',
      rating: 5,
      text: 'Excellent platform with lightning-fast order execution. The research reports and market insights have helped me make better investment decisions. Truly professional service.',
      date: '2024-01-03',
      verified: true,
      location: 'Hyderabad',
      tradingExperience: '4 years'
    },
    {
      id: '6',
      name: 'Vikram Joshi',
      role: 'Entrepreneur',
      rating: 4,
      text: 'NiftyBulk offers everything I need for trading - from basic equity to advanced derivatives. The platform is stable, secure, and the fees are very competitive.',
      date: '2024-01-01',
      verified: true,
      location: 'Chennai',
      tradingExperience: '6 years'
    }
  ];

  const displayTestimonials = testimonials || defaultTestimonials.slice(0, maxItems);

  useEffect(() => {
    if (autoPlay && variant === 'carousel' && displayTestimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoPlay, variant, displayTestimonials.length]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderTestimonialCard = (testimonial: Testimonial, index: number) => (
    <div
      key={testimonial.id}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {testimonial.name}
            </h4>
            {testimonial.verified && (
              <Verified className="h-4 w-4 text-blue-500" />
            )}
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {testimonial.role}
            </span>
            {testimonial.location && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {testimonial.location}
                </span>
              </>
            )}
          </div>
          
          {showRating && (
            <div className="mb-3">
              {renderStars(testimonial.rating)}
            </div>
          )}
          
          <div className="relative mb-4">
            <Quote className="absolute -top-2 -left-2 h-6 w-6 text-blue-200 dark:text-blue-800" />
            <p className="text-gray-700 dark:text-gray-300 italic pl-4">
              "{testimonial.text}"
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{new Date(testimonial.date).toLocaleDateString()}</span>
            {testimonial.tradingExperience && (
              <span>Trading: {testimonial.tradingExperience}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === 'featured') {
    const featuredTestimonial = displayTestimonials[0];
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            What Our Users Say
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Real feedback from our trading community
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {renderTestimonialCard(featuredTestimonial, 0)}
        </div>
        
        <div className="flex justify-center mt-6 space-x-2">
          {displayTestimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-blue-600 dark:bg-blue-400'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Customer Reviews
        </h3>
        {displayTestimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {testimonial.name}
                </span>
                {testimonial.verified && (
                  <Verified className="h-3 w-3 text-blue-500" />
                )}
                {showRating && renderStars(testimonial.rating)}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "{testimonial.text}"
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Trusted by Traders
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            See what our community has to say about their experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTestimonials.map((testimonial, index) => 
            renderTestimonialCard(testimonial, index)
          )}
        </div>
      </div>
    );
  }

  // Default carousel variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Customer Testimonials
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentIndex((prev) => 
              prev === 0 ? displayTestimonials.length - 1 : prev - 1
            )}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => 
              (prev + 1) % displayTestimonials.length
            )}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {displayTestimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="w-full flex-shrink-0">
              {renderTestimonialCard(testimonial, index)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {displayTestimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex
                ? 'bg-blue-600 dark:bg-blue-400'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default UserTestimonials;