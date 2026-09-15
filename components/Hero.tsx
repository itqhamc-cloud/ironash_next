'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mountain, ShieldCheck, Sparkles, Truck, Award } from 'lucide-react';
import {
  SiteBrandingConfig,
  DEFAULT_BRANDING_CONFIG,
  getStoredBrandingConfig,
} from '@/lib/site-config';

export const Hero: React.FC<{ initialBranding?: SiteBrandingConfig }> = ({
  initialBranding,
}) => {
  const [branding, setBranding] = useState<SiteBrandingConfig>(
    initialBranding || DEFAULT_BRANDING_CONFIG
  );

  useEffect(() => {
    // Immediately fetch latest server branding with no-store
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
          setBranding((prev) => ({
            ...prev,
            ...data.branding,
          }));
        }
      })
      .catch(() => {});

    const handleBrandingUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<SiteBrandingConfig>;
      if (customEvt.detail) {
        setBranding(customEvt.detail);
      } else {
        setBranding(getStoredBrandingConfig());
      }
    };

    window.addEventListener('ironash_branding_updated', handleBrandingUpdate);
    return () => {
      window.removeEventListener('ironash_branding_updated', handleBrandingUpdate);
    };
  }, []);

  const heroImageSrc = branding.heroImageUrl?.trim() || DEFAULT_BRANDING_CONFIG.heroImageUrl!;
  const heroTitle = branding.heroTitle?.trim() || DEFAULT_BRANDING_CONFIG.heroTitle!;
  const heroSubtitle = branding.heroSubtitle?.trim() || DEFAULT_BRANDING_CONFIG.heroSubtitle!;

  return (
    <section id="hero" className="relative overflow-hidden bg-emerald-950 text-white min-h-[580px] flex items-center">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImageSrc}
          alt="Himalayan mountains and landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-all duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Deep emerald vignette overlay to guarantee WCAG AA contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/85 to-emerald-900/60" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 w-full">
        <div className="max-w-3xl space-y-6 sm:space-y-8">
          {/* Micro-badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold tracking-wider">
            <Mountain className="w-3.5 h-3.5 text-emerald-300" />
            <span>Pristine Himalayan Harvest • Authentic Shilajit & Herbal Supplements</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] font-serif">
            {heroTitle}
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-stone-200 leading-relaxed font-normal max-w-2xl">
            {heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="#products"
              id="hero-shop-now-btn"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:-translate-y-0.5 shadow-lg shadow-emerald-950/50 active:translate-y-0 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-emerald-950"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="#about"
              id="hero-learn-more-btn"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/15 text-stone-100 font-medium rounded-lg border border-white/20 transition-colors text-base backdrop-blur-sm"
            >
              <span>Learn More</span>
            </Link>
          </div>

          {/* Trust Highlights Grid */}
          <div className="pt-8 border-t border-emerald-800/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-stone-300 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">100% Pure</div>
                <div className="text-stone-400 text-[11px]">Lab-Tested Authenticity</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Himalayan Source</div>
                <div className="text-stone-400 text-[11px]">16,000+ ft High Altitude</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Cash on Delivery</div>
                <div className="text-stone-400 text-[11px]">Across All Pakistan Cities</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Free Shipping</div>
                <div className="text-stone-400 text-[11px]">PKR 0 Delivery Cost</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
