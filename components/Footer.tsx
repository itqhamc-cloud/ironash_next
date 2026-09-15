'use client';

import React, { useState, useEffect } from 'react';
import { Mountain, Phone, Mail, MapPin, ArrowUp, ShieldCheck, Truck, Check } from 'lucide-react';
import {
  SiteContactInfo,
  DEFAULT_CONTACT_INFO,
  formatWhatsAppUrlDigits,
  getStoredContactInfo,
} from '@/lib/site-config';
import { useCart } from '@/components/CartProvider';

interface FooterProps {
  contactInfo?: SiteContactInfo;
}

export const Footer: React.FC<FooterProps> = ({ contactInfo: propContactInfo }) => {
  const { setIsCartOpen } = useCart();
  const onOpenCart = () => setIsCartOpen(true);
  
  const [localContact, setLocalContact] = useState<SiteContactInfo>(
    propContactInfo || DEFAULT_CONTACT_INFO
  );
  const contactInfo = propContactInfo || localContact;

  useEffect(() => {
    fetch('/api/site-settings', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.contactInfo) {
          setLocalContact(data.contactInfo);
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteContactInfo>;
      if (customEvent.detail) {
        setLocalContact(customEvent.detail);
      } else {
        setLocalContact(getStoredContactInfo());
      }
    };

    window.addEventListener('ironash_contact_updated', handleUpdate);
    return () => {
      window.removeEventListener('ironash_contact_updated', handleUpdate);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cleanWaDigits = formatWhatsAppUrlDigits(contactInfo.whatsappNumber);
  const waUrl = `https://wa.me/${cleanWaDigits}?text=${encodeURIComponent(
    contactInfo.quickWhatsAppMessage || DEFAULT_CONTACT_INFO.quickWhatsAppMessage
  )}`;

  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center shadow-xs">
                <Mountain className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-serif">
                Iron<span className="text-emerald-400">Ash</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              100% Pure Himalayan Shilajit and authentic wellness remedies. Sourced from 16,000+ ft altitudes in Skardu, Gilgit-Baltistan, purified with spring water, and delivered nationwide.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gold Grade • 75%+ Fulvic Acid • Lab Tested</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Explore Store</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollTo('hero')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('products')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Herbal Catalog & Shilajit
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('benefits')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Health Benefits & Purity
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('about')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Our Himalayan Heritage
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('testimonials')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Customer Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('contact')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Contact & Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Nationwide COD Delivery Terms */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Delivery & Payment</h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-stone-200">Free Nationwide Shipping:</strong> Delivered in 2-4 business days to Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, and all districts.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-stone-200">Cash on Delivery (COD):</strong> Pay only when the courier hands you the sealed parcel.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-stone-200">Airtight Glass Packaging:</strong> UV-protective glass jars with stainless steel dosing spoons included.
                </p>
              </div>
            </div>
          </div>

          {/* Trade Inquiries & Admin Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Support & Store Admin</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: {contactInfo.whatsappNumber}
                </a>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <a
                  href={`mailto:${contactInfo.supportEmail}`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {contactInfo.supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{contactInfo.hubLocation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} IronAsh Himalayan Herbs. All Rights Reserved. 100% Natural Organic Certified.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenCart}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Open Shopping Cart
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="hover:text-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
