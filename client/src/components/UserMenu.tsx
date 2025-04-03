'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth(); // Using the logout method from your useAuth hook
  const router = useRouter();

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) {
      const [name] = user.email.split('@');
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'User';
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const handleLogout = async () => {
    try {
      logout(); // Use the logout method from your useAuth hook
      toast.success('Logged out successfully');
      // No need to push to sign-in page as your logout function already does that
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#ffc53a] flex items-center justify-center text-gray-900 font-semibold">
          {getInitials()}
        </div>
        <span className="text-sm font-medium">
          {getDisplayName()}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
          >
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}