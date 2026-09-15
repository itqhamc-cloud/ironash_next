

import React from 'react';
import Image from 'next/image';
import { Mountain, CheckCircle, ShieldCheck, Heart } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 sm:py-28 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 scroll-mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800">
              <Image
                src="https://cdn.b12.io/client_media/DGYgvmni/5778c5c9-a6d6-11f1-8c76-0242ac110002-kTsFtlr21JjCAeuM4rXHm_Ix9Lm2Iy.jpg"
                alt="Traditional preparation of Himalayan herbs"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Floating Stat card */}
            <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:right-8 bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-xl shadow-lg border border-stone-200/80 dark:border-stone-800 max-w-[220px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
                  <Mountain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-stone-900 dark:text-white font-serif">16,000+ ft</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">Himalayan Altitude</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Our Heritage & Purpose</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-950 dark:text-white font-serif">
              Our Story: Ancient Wisdom, Handcrafted For Today
            </h2>

            <p className="text-stone-600 dark:text-stone-400 text-base sm:text-lg leading-relaxed">
              At <strong className="text-stone-900 dark:text-white font-semibold">IronAsh</strong>, we believe that true vitality is rooted in the natural world. Our journey began high in the Karakoram and Himalayan mountain ranges, where pristine glaciers meet mineral-rich rock formations.
            </p>

            <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
              We work directly with traditional highland gatherers who have harvested Shilajit (Salajeet) for generations. By combining indigenous purification techniques with rigorous contemporary laboratory testing, we bring you gold-grade resins, organic herbs, and wellness tonics that are 100% pure, unadulterated, and biologically active.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-stone-800 dark:text-stone-300 text-sm font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                <span>Ethically Wild-Harvested</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-800 dark:text-stone-300 text-sm font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                <span>70%+ Bioactive Fulvic Acid</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-800 dark:text-stone-300 text-sm font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                <span>Zero Fillers, Binders or Sugar</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-800 dark:text-stone-300 text-sm font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                <span>Cash on Delivery Nationwide</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200 dark:border-stone-800">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-400 font-serif">100%</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">Pure & Natural</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-400 font-serif">5,000+</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">Happy Clients</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-400 font-serif">85+</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">Trace Minerals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
