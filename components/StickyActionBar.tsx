'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getStoredContactInfo } from '@/lib/site-config';

export function StickyActionBar() {
  const { products, handleSelectProduct } = useCart();
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      const contact = getStoredContactInfo();
      if (contact?.whatsappNumber) {
        return contact.whatsappNumber.replace(/\D/g, '');
      }
    }
    return '923000000000';
  });

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past hero fold (approx 500px)
      if (window.scrollY > 500) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use the primary product (first one) as the default for the sticky bar
  const primaryProduct = products?.[0];

  if (!primaryProduct || !show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-3 shadow-2xl md:hidden animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded overflow-hidden">
            <Image 
              src={primaryProduct.imageUrl} 
              alt="Product" 
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-900 dark:text-white truncate max-w-[120px]">{primaryProduct.title}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">PKR {Number(primaryProduct.price).toLocaleString()}</span>
              {primaryProduct.originalPrice && primaryProduct.originalPrice > primaryProduct.price && (
                <span className="text-[10px] text-stone-400 line-through font-mono">
                  PKR {Number(primaryProduct.originalPrice).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleSelectProduct(primaryProduct)}
          className="flex-1 bg-stone-900 dark:bg-stone-800 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" /> Add
        </button>
        <div className="flex-[2]">
          <WhatsAppButton
            productName={primaryProduct.title}
            variant={primaryProduct.unit || 'Standard'}
            pricePKR={primaryProduct.price}
            phone={phone}
          />
        </div>
      </div>
    </div>
  );
}
