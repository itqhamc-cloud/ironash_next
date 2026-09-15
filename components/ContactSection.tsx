'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { validatePakistaniPhone, formatPakistaniInput } from '@/lib/phone-validation';
import {
  SiteContactInfo,
  DEFAULT_CONTACT_INFO,
  formatWhatsAppUrlDigits,
  getStoredContactInfo,
} from '@/lib/site-config';

interface ContactSectionProps {
  contactInfo?: SiteContactInfo;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contactInfo: propContactInfo,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [phoneError, setPhoneError] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneCheck = validatePakistaniPhone(formData.phone);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.error || 'Only Pakistani mobile numbers are supported (e.g. 0300 1234567)');
      return;
    }
    setPhoneError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const cleanWaDigits = formatWhatsAppUrlDigits(contactInfo.whatsappNumber);
  const waUrl = `https://wa.me/${cleanWaDigits}?text=${encodeURIComponent(
    contactInfo.quickWhatsAppMessage || DEFAULT_CONTACT_INFO.quickWhatsAppMessage
  )}`;

  return (
    <section id="contact" className="py-20 sm:py-28 bg-stone-50 text-stone-900 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details (Left) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                Direct Support
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-950 mt-2 font-serif">
                Get in Touch
              </h2>
              <p className="text-stone-600 mt-3 text-base leading-relaxed">
                Have questions regarding our Shilajit grades, optimal dosage, or order delivery? Our wellness specialists are available to assist you.
              </p>
            </div>

            <div className="space-y-4">
              {/* Phone / WhatsApp */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-stone-500 font-medium">Phone & WhatsApp Inquiries</div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-stone-900 hover:text-emerald-800 transition-colors"
                  >
                    {contactInfo.whatsappNumber}
                  </a>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    Instant WhatsApp Response • {contactInfo.workingHours}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-stone-500 font-medium">Email Inquiries</div>
                  <a
                    href={`mailto:${contactInfo.supportEmail}`}
                    className="text-base font-bold text-stone-900 hover:text-emerald-800 transition-colors"
                  >
                    {contactInfo.supportEmail}
                  </a>
                  <div className="text-xs text-stone-500 mt-0.5">Replies within 4-6 hours</div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-stone-500 font-medium">Distribution Hub</div>
                  <div className="text-base font-bold text-stone-900">
                    {contactInfo.hubLocation}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">Nationwide Express Dispatch via TCS & Leopards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form (Right) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 sm:p-10 border border-stone-200 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 font-serif">Message Received</h3>
                <p className="text-stone-600 max-w-md mx-auto text-sm">
                  Thank you, <strong>{formData.name}</strong>. Our herbal specialist will contact you shortly at{' '}
                  <span className="font-semibold text-stone-800">{formData.phone || formData.email}</span>.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', email: '', message: '' });
                  }}
                  className="mt-4 px-6 py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 font-serif mb-1">
                    Send Us a Message
                  </h3>
                  <p className="text-xs text-stone-500">
                    Fill out your details below and we will respond as soon as possible.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Tariq Mehmood"
                      className="w-full px-4 py-3 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                        Phone / WhatsApp *
                      </label>
                      <span className="text-[10px] text-emerald-800 font-semibold">
                        🇵🇰 PK Only
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs">
                        <span className="text-base leading-none">🇵🇰</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatPakistaniInput(e.target.value);
                          setFormData({ ...formData, phone: formatted });
                          if (phoneError) setPhoneError('');
                        }}
                        placeholder="0300 1234567 or +92 300 1234567"
                        className={`w-full pl-9 pr-24 py-3 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                          phoneError
                            ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                            : 'border-stone-300 focus:ring-emerald-700 bg-white'
                        }`}
                      />
                      {formData.phone && validatePakistaniPhone(formData.phone).isValid && (
                        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            ✓ {validatePakistaniPhone(formData.phone).carrier}
                          </span>
                        </div>
                      )}
                    </div>
                    {phoneError ? (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {phoneError}
                      </p>
                    ) : (
                      <p className="text-[11px] text-stone-500 mt-1">
                        Supported: <span className="font-mono text-stone-700">0300 1234567</span> or <span className="font-mono text-stone-700">+92 300 1234567</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tariq@gmail.com"
                    className="w-full px-4 py-3 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Your Message or Product Inquiry *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ask about purity certificates, bulk wholesale, dosage recommendations, or Cash on Delivery..."
                    className="w-full px-4 py-3 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-lg text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
