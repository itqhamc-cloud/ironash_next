'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Phone } from 'lucide-react';
import {
  SiteContactInfo,
  DEFAULT_CONTACT_INFO,
  formatWhatsAppUrlDigits,
  getStoredContactInfo,
} from '@/lib/site-config';

interface WhatsAppFABProps {
  phoneNumber?: string;
  contactInfo?: SiteContactInfo;
}

export const WhatsAppFAB: React.FC<WhatsAppFABProps> = ({
  phoneNumber,
  contactInfo: propContactInfo,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [localContact, setLocalContact] = useState<SiteContactInfo>(
    propContactInfo || DEFAULT_CONTACT_INFO
  );
  const contactInfo = propContactInfo || localContact;

  // Sync contact info on mount and listen for real-time updates from Admin
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = getStoredContactInfo();
      setLocalContact(stored);
    }, 0);

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
      clearTimeout(timer);
      window.removeEventListener('ironash_contact_updated', handleUpdate);
    };
  }, []);

  // Priority: contactInfo.whatsappNumber > explicit prop > default
  const activeNumber = contactInfo.whatsappNumber || phoneNumber || DEFAULT_CONTACT_INFO.whatsappNumber;
  const cleanPhone = formatWhatsAppUrlDigits(activeNumber);

  const defaultMessage =
    contactInfo.quickWhatsAppMessage ||
    DEFAULT_CONTACT_INFO.quickWhatsAppMessage;

  const quickInquiries = [
    {
      label: 'Pure Shilajit Resin Inquiry',
      text: 'Salam! I would like to ask about the purity, gold-grade certification, and dosage of your Pure Himalayan Shilajit Resin.',
    },
    {
      label: 'Cash on Delivery & Shipping Time',
      text: 'Hi! Can you tell me how many days delivery takes to my city and how Cash on Delivery (COD) works?',
    },
    {
      label: 'Which product is best for me?',
      text: 'Salam! I want a herbal consultation on whether Shilajit resin, capsules, or ashwagandha is best for my daily wellness.',
    },
  ];

  const getWhatsAppUrl = (msg: string) => {
    const textToSend = msg.trim() || defaultMessage;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
  };

  const handleSendQuickInquiry = (text: string) => {
    const url = getWhatsAppUrl(text);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleSendCustomInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const url = getWhatsAppUrl(customMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
    setCustomMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end print:hidden">
      {/* Popover Card */}
      {isOpen && (
        <div
          id="whatsapp-inquiry-popover"
          className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white border border-emerald-500">
                  <MessageCircle className="w-5 h-5" />
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-800 rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm font-serif leading-tight">IronAsh Herbal Support</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online • Quick Product Inquiry</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              aria-label="Close WhatsApp card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-stone-50 space-y-3.5">
            <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs text-stone-700 shadow-xs">
              <p className="font-medium text-stone-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Need advice before ordering?</span>
              </p>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Have questions about our 16,000+ ft Himalayan harvest, fulvic acid purity, dosage, or nationwide Cash on Delivery? Chat directly with our herbal team on WhatsApp.
              </p>
            </div>

            {/* Quick Inquiry Options */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Quick questions:
              </span>
              {quickInquiries.map((inquiry, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuickInquiry(inquiry.text)}
                  className="w-full text-left p-2.5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-lg text-xs text-stone-800 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-medium text-[11px] group-hover:text-emerald-900">
                    {inquiry.label}
                  </span>
                  <Send className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 shrink-0" />
                </button>
              ))}
            </div>

            {/* Custom message input */}
            <form onSubmit={handleSendCustomInquiry} className="pt-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your inquiry..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 text-stone-900"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer"
                  title="Send via WhatsApp"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200">
              <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                <Phone className="w-3 h-3 text-emerald-700" />
                <span>{activeNumber}</span>
              </div>
              <a
                href={getWhatsAppUrl(defaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>Direct Chat</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Action Button */}
      <div className="flex items-center gap-2">
        {/* Tooltip badge visible on larger screens when popover is closed */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-stone-900/90 backdrop-blur-xs text-white text-xs font-semibold py-2 px-3.5 rounded-full shadow-lg border border-stone-700 hover:bg-stone-800 transition-all cursor-pointer animate-in fade-in slide-in-from-right-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Inquire on WhatsApp</span>
          </button>
        )}

        <button
          id="whatsapp-fab-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Inquire on WhatsApp"
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 text-white fill-white/10" />
              {/* Notification ping badge */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
