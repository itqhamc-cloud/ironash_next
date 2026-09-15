

import React from 'react';
import { ShieldCheck, Mountain, Droplets, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const SpecsSection: React.FC = () => {
  return (
    <section id="specs" className="py-20 bg-stone-100 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 border-t border-stone-200 dark:border-stone-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
            Purity Standards & Lab Certification
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-950 dark:text-white mt-2 font-serif">
            Why Discerning Customers Trust IronAsh
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-4 text-base sm:text-lg">
            Commercial shilajit often contains maltodextrin fillers, heavy metals, or low-altitude pitch. IronAsh enforces uncompromising artisanal extraction standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-6">
              <Mountain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3 font-serif">16,000+ ft Altitude Harvest</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              Harvested exclusively by indigenous mountain foragers along the towering rock faces of Skardu and the Karakoram range. Extreme sub-zero temperatures and high UV exposure naturally concentrate vital fulvic acid compounds.
            </p>
            <div className="mt-auto pt-6 text-xs font-semibold text-emerald-800 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
              <span>Location: Karakoram & Gilgit-Baltistan</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-6">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3 font-serif">Traditional Spring Water Filtration</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              Purified using ancient low-temperature glacial spring-water decanting over multiple cycles. We never use chemical solvents, boiling heat, or high-pressure steam, preserving the delicate bio-enzymes intact.
            </p>
            <div className="mt-auto pt-6 text-xs font-semibold text-amber-800 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-500" />
              <span>Purification: 100% Solvent-Free Decanting</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3 font-serif">75%+ Fulvic Acid Lab Certified</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              Every batch undergoes independent laboratory gas-chromatography analysis to guarantee over 75% bio-available fulvic acid and complete absence of heavy metals (lead, mercury, arsenic).
            </p>
            <div className="mt-auto pt-6 text-xs font-semibold text-emerald-800 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
              <span>Standard: Gold Grade Certified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
