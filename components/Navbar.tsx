'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Mountain, ShoppingBag, Menu, X, Sun, Moon } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import {
  SiteBrandingConfig,
  DEFAULT_BRANDING_CONFIG,
  getStoredBrandingConfig,
} from '@/lib/site-config';

export const Navbar: React.FC<{ initialBranding?: SiteBrandingConfig }> = ({
  initialBranding,
}) => {
  const { totalCartCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [branding, setBranding] = useState<SiteBrandingConfig>(
    initialBranding || DEFAULT_BRANDING_CONFIG
  );

  // Initialize theme and branding from server
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const savedTheme = localStorage.getItem('ironash_theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
      }
    }, 0);

    fetch('/api/branding', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.branding) {
          setBranding((prev) => ({ ...prev, ...data.branding }));
        }
      })
      .catch(() => {});

    const handleBranding = (e: Event) => {
      const customEvt = e as CustomEvent<SiteBrandingConfig>;
      if (customEvt.detail) {
        setBranding(customEvt.detail);
      } else {
        setBranding(getStoredBrandingConfig());
      }
    };

    window.addEventListener('ironash_branding_updated', handleBranding);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('ironash_branding_updated', handleBranding);
    };
  }, []);

  // Synchronize document class when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      localStorage.setItem('ironash_theme', 'dark');
    } else {
      localStorage.setItem('ironash_theme', 'light');
    }
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 dark:border-stone-850 bg-white/95 dark:bg-stone-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-stone-950/80 transition-colors duration-200">
      {/* Micro announcement bar with seamless infinite scroll */}
      <div className="relative overflow-hidden bg-emerald-950 dark:bg-stone-900 text-emerald-100 dark:text-emerald-300 text-xs py-1.5 border-b border-emerald-900/50 dark:border-stone-800 select-none">
        <div className="animate-marquee flex items-center whitespace-nowrap font-medium tracking-wide">
          <div className="flex items-center gap-10 px-5 shrink-0">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span>Cash on Delivery Available Across Pakistan • Free Nationwide Shipping on All Orders</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span>100% Pure Himalayan Gold-Grade Shilajit • 3rd Party Lab Certified Potency</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span>Order via WhatsApp or Easy Online Checkout with Instant Confirmation</span>
            </span>
          </div>
          {/* Exact duplicate clone to achieve seamless continuous -50% loop */}
          <div className="flex items-center gap-10 px-5 shrink-0" aria-hidden="true">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span>Cash on Delivery Available Across Pakistan • Free Nationwide Shipping on All Orders</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span>100% Pure Himalayan Gold-Grade Shilajit • 3rd Party Lab Certified Potency</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span>Order via WhatsApp or Easy Online Checkout with Instant Confirmation</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with Mountain Icon or Custom Image Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('hero');
            }}
            className="flex items-center gap-2.5 font-heading text-xl font-bold text-emerald-900 dark:text-emerald-400 group"
            id="brand-logo"
          >
            {branding.siteLogoUrl ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-emerald-800/20 dark:border-emerald-700/40 bg-white dark:bg-stone-900 flex items-center justify-center shadow-xs">
                <Image
                  src={branding.siteLogoUrl}
                  alt={branding.siteLogoText || 'IronAsh'}
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
                <Mountain className="h-5 w-5 text-emerald-100" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-stone-100 font-serif">
                {branding.siteLogoText || 'IronAsh'}
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400 tracking-wider hidden sm:block">
                Himalayan Herbs
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700 dark:text-stone-300">
            <button
              onClick={() => scrollTo('hero')}
              className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors cursor-pointer py-1"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('products')}
              className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors cursor-pointer py-1"
            >
              Products
            </button>
            <button
              onClick={() => scrollTo('benefits')}
              className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors cursor-pointer py-1"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors cursor-pointer py-1"
            >
              About
            </button>
            <button
              onClick={() => scrollTo('testimonials')}
              className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors cursor-pointer py-1"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors cursor-pointer py-1"
            >
              Contact
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Light / Dark Theme Button on Top */}
            <button
              onClick={toggleTheme}
              id="theme-toggle-button"
              aria-label={!mounted ? 'Switch theme' : isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={!mounted ? 'Switch theme' : isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              {!mounted ? (
                // Hydration placeholder
                <>
                  <Moon className="w-4 h-4 text-stone-700 opacity-50" />
                  <span className="text-xs font-semibold hidden lg:inline opacity-50">Theme</span>
                </>
              ) : isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="text-xs font-semibold hidden lg:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-semibold hidden lg:inline">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={() => scrollTo('products')}
              className="hidden sm:inline-flex items-center justify-center rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
            >
              Shop Now
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="open-cart-button"
              className="relative flex items-center gap-2 px-3.5 py-2 bg-stone-900 dark:bg-stone-800 text-white rounded-md hover:bg-stone-800 dark:hover:bg-stone-700 active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:ring-offset-2 cursor-pointer"
              aria-label={`Shopping cart with ${totalCartCount} items`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">Cart</span>
              <span
                id="cart-badge"
                className={`inline-flex items-center justify-center text-xs font-bold px-2 py-0.5 rounded-full transition-all ${
                  totalCartCount > 0
                    ? 'bg-amber-500 text-stone-950 font-bold scale-100'
                    : 'bg-stone-800 dark:bg-stone-700 text-stone-300 scale-90'
                }`}
              >
                {totalCartCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-btn"
              className="md:hidden p-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <button
            onClick={() => scrollTo('hero')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-stone-800 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md"
          >
            Home
          </button>
          <button
            onClick={() => scrollTo('products')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-stone-800 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md"
          >
            Products
          </button>
          <button
            onClick={() => scrollTo('benefits')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-stone-800 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md"
          >
            Why Choose IronAsh
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-stone-800 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md"
          >
            About Us
          </button>
          <button
            onClick={() => scrollTo('testimonials')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-stone-800 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md"
          >
            Customer Reviews
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-stone-800 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md"
          >
            Contact
          </button>

          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Theme</span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-750 flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800"
            >
              {!mounted ? (
                <>
                  <Moon className="w-3.5 h-3.5 opacity-50" />
                  <span className="opacity-50">Theme</span>
                </>
              ) : isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => scrollTo('products')}
              className="w-full text-center py-2.5 bg-emerald-800 dark:bg-emerald-700 text-white rounded-md font-semibold text-sm hover:bg-emerald-900"
            >
              Shop Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
