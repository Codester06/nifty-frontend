import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openProfile = () => {
    navigate('/profile');
    setIsOpen(false);
  };



  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200/30 dark:border-slate-700/50 rounded-xl hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg"
        >
          <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl z-50">
            <div className="p-3 border-b border-gray-200/50 dark:border-slate-700/50">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || user?.username}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{user?.mobile || user?.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={openProfile}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors rounded-xl mx-1"
              >
                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors rounded-xl mx-1"
              >
                <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>


    </>
  );
};

export default ProfileDropdown;