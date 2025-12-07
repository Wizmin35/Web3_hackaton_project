'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { WalletButton } from '../ui/WalletButton'
import { useWallet } from '@solana/wallet-adapter-react'
import { Menu, X, Sparkles, Calendar, Store, User } from 'lucide-react'
import clsx from 'clsx'

const navLinks = [
  { href: '/services', label: 'Usluge', icon: Sparkles },
  { href: '/salons', label: 'Saloni', icon: Store },
  { href: '/reservations', label: 'Moje rezervacije', icon: Calendar },
]

export function Header() {
  const pathname = usePathname()
  const { connected } = useWallet()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-soft' 
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold gradient-text">
              GlamBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                    isActive
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-neutral-900 hover:text-neutral-900 hover:bg-neutral-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side - Wallet & Menu */}
          <div className="flex items-center gap-3">
            {/* Dashboard link for connected users */}
            {connected && (
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-neutral-900 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
            )}

            {/* Wallet Button */}
            <div className="hidden sm:block">
              <WalletButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-neutral-100 overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all',
                      isActive
                        ? 'bg-pink-50 text-pink-600'
                        : 'text-neutral-900 hover:bg-neutral-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                )
              })}
              
              {connected && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-neutral-900 hover:bg-neutral-50 transition-all"
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </Link>
              )}

              <div className="pt-2">
                <WalletButton />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
