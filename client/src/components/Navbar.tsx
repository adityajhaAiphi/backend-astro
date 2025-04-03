"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from 'next/navigation'
import Link from "next/link"
import { Bell, ChevronDown, Menu, Phone, User, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { UserMenu } from './UserMenu'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Menu as HeadlessUIMenu, Transition } from '@headlessui/react'
import { UserCircle, LogOut, LayoutDashboard } from 'lucide-react'

interface NavItem {
  title: string;
  url: string;
  isNew?: boolean;
  isMore?: boolean;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const navItems: NavItem[] = [
    { title: "Home", url: "/" },
    { title: "Consult Astrologers", url: "/consult-astro" },
    { title: "Horoscope", url: "/horoscope",isNew: true },
    { title: "Panchang", url: "/panchang" },
    { title: "Kundli", url: "/kundli" },
    { title: "Match Making", url: "/match-making" , isNew: true },
    { title: "Shop", url: "/shop" },
    { title: "Blog", url: "/blog" },
    { title: "More", url: "#", isMore: true },
  ]
  const moreItems: NavItem[] = [
    { title: "About Us", url: "/about" },
    { title: "Careers", url: "/careers" },
    { title: "Contact", url: "/contact" },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle dropdown hover with delay
  const handleDropdownEnter = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current)
    }
    setShowMoreDropdown(true)
  }

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setShowMoreDropdown(false)
    }, 100) // Small delay to prevent accidental closures
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimerRef.current) {
        clearTimeout(dropdownTimerRef.current)
      }
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const linkStyles = (url: string) => {
    const isActive = pathname === url
    return `relative text-gray-700 hover:text-[#ffc53a] text-[15px] font-medium transition-colors duration-300 h-[40px] flex items-center px-4
      ${isActive ? 'border-2 border-[#ffc53a] text-[#ffc53a] rounded-full hover:bg-[#fff9e6]' : ''}`
  }

  const handleSignOut = async () => {
    try {
      signOut();
      toast.success('Logged out successfully');
      router.push('/sign-in');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full shadow-sm sticky top-0 z-50 bg-white"
    >
      {/* Top Bar */}
      <div className="bg-white h-[70px] flex items-center">
        <div className="max-w-[1300px] mx-auto px-4 w-full">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-3xl font-bold bg-gradient-to-r from-[#2c3e50] to-[#ffc53a] bg-clip-text text-transparent">
                ASTRO
              </span>
            </Link>

            {/* Right Section - Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Customer Care */}
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500">Customer Care</span>
                <span className="text-xl font-medium text-gray-700">9999 091 091</span>
              </div>

              {/* Sign In Button or User Avatar */}
              <div className="flex items-center relative">
                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                ) : user ? (
                  <HeadlessUIMenu as="div" className="relative">
                    <HeadlessUIMenu.Button className="flex items-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#ffc53a] flex items-center justify-center text-black font-medium">
                        {getInitials(user.name)}
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </HeadlessUIMenu.Button>

                    <Transition
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <HeadlessUIMenu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[60]">
                        <div className="relative bg-white rounded-md shadow-xl border border-gray-100">
                          <HeadlessUIMenu.Item>
                            {({ active }) => (
                              <Link
                                href="/dashboard"
                                className={`${
                                  active ? 'bg-gray-50' : ''
                                } flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:text-[#ffc53a] transition-colors`}
                              >
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                              </Link>
                            )}
                          </HeadlessUIMenu.Item>
                          <HeadlessUIMenu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleSignOut}
                                className={`${
                                  active ? 'bg-gray-50' : ''
                                } flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:text-red-600 transition-colors border-t border-gray-100`}
                              >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                              </button>
                            )}
                          </HeadlessUIMenu.Item>
                        </div>
                      </HeadlessUIMenu.Items>
                    </Transition>
                  </HeadlessUIMenu>
                ) : (
                  <Link
                    href="/sign-in"
                    className="bg-[#ffc53a] text-gray-900 px-4 py-2 rounded-md hover:bg-[#ffb700] transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Notification */}
              <button className="text-gray-700 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </button>

              {/* Language Selector */}
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                <span>ENG</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-t h-[50px] flex items-center">
        <div className="max-w-[1300px] mx-auto px-4 w-full">
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.url} className="relative" ref={item.isMore ? dropdownRef : null}>
                <Link
                  href={item.url}
                  className={linkStyles(item.url)}
                  onMouseEnter={() => item.isMore && handleDropdownEnter()}
                  onMouseLeave={() => item.isMore && handleDropdownLeave()}
                  onClick={(e) => item.isMore && e.preventDefault()}
                  aria-expanded={item.isMore ? showMoreDropdown : undefined}
                  role={item.isMore ? 'button' : undefined}
                >
                  <motion.span 
                    className="flex items-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.title}
                    {item.isMore && <ChevronDown className="h-4 w-4 ml-1" />}
                  </motion.span>
                  {item.isNew && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-3 -right-6 bg-[#ffc53a] text-xs text-gray-900 px-1.5 py-0.5 rounded"
                    >
                      NEW
                    </motion.span>
                  )}
                </Link>
                {item.isMore && showMoreDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-lg py-2 mt-1"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {moreItems.map((moreItem) => (
                      <Link
                        key={moreItem.url}
                        href={moreItem.url}
                        className="block px-4 py-2 text-gray-700 hover:bg-[#fff9e6] hover:text-[#ffc53a] transition-colors"
                      >
                        {moreItem.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu with improved animations */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="max-w-[1300px] mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {/* User Section - Mobile */}
                {loading ? (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                ) : user ? (
                  <div className="flex flex-col items-center space-y-2 pb-4 border-b">
                    <div className="w-12 h-12 rounded-full bg-[#ffc53a] flex items-center justify-center text-gray-900 font-semibold text-lg">
                      {getInitials(user.name)}
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{user.name || user.email?.split('@')[0]}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-red-600 text-sm hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}

                {/* Customer Care - Mobile */}
                <div className="flex items-center justify-center text-gray-700">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-lg">9999 091 091</span>
                </div>

                {/* Navigation Items - Mobile */}
                {navItems.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={`text-gray-700 hover:text-[#ffc53a] py-2 text-center
                      ${pathname === item.url ? 'border border-[#ffc53a] rounded-full px-4' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                    {item.isNew && <span className="ml-2 bg-[#ffc53a] text-white text-xs px-1.5 py-0.5 rounded">NEW</span>}
                  </Link>
                ))}

                {/* Mobile Sign In Button - Only show when not logged in */}
                {!user && !loading && (
                  <div className="flex flex-col space-y-3 pt-4 border-t">
                    <Link
                      href="/sign-in"
                      onClick={() => setIsMenuOpen(false)}
                      className="bg-[#ffc53a] text-gray-900 px-4 py-2 rounded-md hover:bg-[#ffb700] transition-colors text-center"
                    >
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Add More items to mobile menu */}
                <div className="border-t pt-2">
                  {moreItems.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      className="block py-2 px-4 text-gray-700 hover:text-[#ffc53a] text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Navbar

