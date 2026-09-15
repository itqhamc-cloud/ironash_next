

import React from 'react';
import { ShieldCheck, Leaf, Truck, Award, Sparkles, HeartHandshake } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: ShieldCheck,
      title: '100% Pure & Authentic',
      description:
        'Sourced directly from pristine high-altitude Himalayan cliffs above 16,000 ft, ensuring uncompromised mineral density, fulvic acid potency, and zero fillers.',
    },
    {
      icon: Leaf,
      title: 'Natural & Organic',
      description:
        'Free from synthetic additives, heavy metal contaminants, or artificial binders. Purified using time-tested spring-water purification methods.',
    },
    {
      icon: Truck,
      title: 'Cash on Delivery',
      description:
        'Shop with absolute confidence. Inspect your parcel and pay securely upon arrival at your doorstep in any city across Pakistan.',
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description:
        'Every batch is third-party lab analyzed for purity, microbial safety, and active bio-compounds, delivering verifiable gold-grade vitality.',
    },
  ];

  return (
    <section id="benefits" className="py-20 sm:py-28 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 scroll-mt-16 border-b border-stone-100 dark:border-stone-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>The IronAsh Difference</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-950 dark:text-white font-serif">
            Why Choose IronAsh?
          </h2>
          <p className="mt-4 text-stone-600 dark:text-stone-400 text-base sm:text-lg leading-relaxed">
            Experience the transformative benefits of our carefully curated Himalayan herbal remedies, crafted for maximum absorption and daily vitality.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-stone-50 dark:bg-stone-950/50 rounded-2xl p-7 border border-stone-200/80 dark:border-stone-800 hover:border-emerald-700/50 dark:hover:border-emerald-600/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-all duration-300 hover:shadow-md group flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 group-hover:bg-emerald-700 transition-transform">
                  <Icon className="w-6 h-6 text-emerald-100" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2 font-serif group-hover:text-emerald-950 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed flex-grow">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 rounded-2xl bg-emerald-900 text-emerald-50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white font-serif">
                100% Satisfaction Guarantee
              </h4>
              <p className="text-sm text-emerald-200">
                If you are not completely satisfied with the purity and potency of your purchase, our team is here to assist.
              </p>
            </div>
          </div>
          <a
            href="#products"
            className="shrink-0 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm rounded-lg transition-colors shadow-sm"
          >
            Order Pure Wellness
          </a>
        </div>
      </div>
    </section>
  );
};
