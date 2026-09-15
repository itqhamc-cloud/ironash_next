

import React from 'react';
import { Star, Quote, CheckCircle, MapPin } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Tariq Mehmood',
      location: 'Islamabad',
      rating: 5,
      date: '2 weeks ago',
      product: 'Pure Himalayan Shilajit Resin (Gold Grade)',
      comment:
        "The quality of Shilajit from IronAsh is unmatched. I've noticed a significant increase in my everyday stamina and mental clarity within just two weeks. Highly recommended to anyone looking for genuine, uncut Salajeet!",
    },
    {
      name: 'Kamran Ashraf',
      location: 'Lahore',
      rating: 5,
      date: '1 month ago',
      product: 'Himalayan Shilajit Veg Capsules',
      comment:
        'Fast delivery with Cash on Delivery in Lahore! The resin dissolved completely in warm milk with that signature earthy aroma. No sediment or chemical aftertaste. Excellent customer service as well.',
    },
    {
      name: 'Dr. Zainab Rauf',
      location: 'Karachi',
      rating: 5,
      date: '3 weeks ago',
      product: 'Organic Himalayan Ashwagandha + Saffron',
      comment:
        'IronAsh is now my go-to brand for authentic Himalayan herbs. The packaging is airtight and glass-sealed, and the purity is evident from day one. Great sleep quality and sustained natural energy.',
    },
  ];

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 scroll-mt-16 border-b border-stone-100 dark:border-stone-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Customer Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-950 dark:text-white font-serif">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-stone-600 dark:text-stone-400 text-base sm:text-lg">
            Real experiences from people across Pakistan who rely on IronAsh for their daily wellness.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-stone-50 dark:bg-stone-950/50 rounded-2xl p-7 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-stone-600 dark:text-stone-400 ml-2">5.0 / 5.0</span>
                </div>

                <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed italic mb-6">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 dark:text-white text-sm flex items-center gap-1.5 font-serif">
                    <span>{review.name}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                    <span>{review.location}</span>
                    <span className="mx-1">•</span>
                    <span>Verified Buyer</span>
                  </div>
                </div>
                <Quote className="w-6 h-6 text-stone-300 dark:text-stone-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
