"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Upload, BookOpen, Settings, LogOut, User, Layers } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function AnimatedMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
    router.push('/');
  };

  const menuItems = [
    { icon: Home, label: 'Home', href: '/', show: true },
    { icon: Upload, label: 'Upload PDF', href: '/dashboard', show: mounted && !!user },
    { icon: BookOpen, label: 'My Flashcards', href: '/myflashcards', show: mounted && !!user },
    { icon: User, label: 'Profile', href: '/profile', show: mounted && !!user },
    { icon: Settings, label: 'Settings', href: '/settings', show: mounted && !!user },
  ].filter(item => item.show);

  const menuVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 30,
        mass: 0.8,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 30,
        mass: 0.8,
      },
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <>
      {/* Menu Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors hover:bg-accent"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <motion.nav
        variants={menuVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className="fixed top-0 left-0 h-full w-64 sm:w-72 md:w-80 max-w-xs z-40 shadow-2xl bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Navigation</h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="h-1 mt-2 rounded bg-primary"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(false)}
            className="p-2.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X size={24} />
          </motion.button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-3 sm:px-4 py-6 bg-white dark:bg-gray-900">
          <ul className="space-y-2">
            {menuItems.map((item, i) => (
              <motion.li
                key={item.label}
                custom={i}
                initial={{ x: -30, opacity: 0 }}
                animate={isOpen ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                transition={{
                  delay: isOpen ? 0.2 + i * 0.1 : 0,
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <item.icon size={20} />
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">{item.label}</span>
                </Link>
              </motion.li>
            ))}

            {/* Logout Button - Only show if user is logged in */}
            {mounted && user && (
              <motion.li
                custom={menuItems.length}
                initial={{ x: -30, opacity: 0 }}
                animate={isOpen ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                transition={{
                  delay: isOpen ? 0.2 + menuItems.length * 0.1 : 0,
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-950 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <LogOut size={20} />
                  </div>
                  <span className="text-base font-medium group-hover:text-red-600 dark:group-hover:text-red-400">Logout</span>
                </button>
              </motion.li>
            )}
          </ul>
        </div>

      </motion.nav>
    </>
  );
}
