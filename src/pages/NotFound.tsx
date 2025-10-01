import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-600 dark:text-gray-400 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
