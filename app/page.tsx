import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { BenefitsSection } from '@/components/BenefitsSection';
import { AboutSection } from '@/components/AboutSection';
import { SpecsSection } from '@/components/SpecsSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { ContactSection } from '@/components/ContactSection';
import { CartSidebar } from '@/components/CartSidebar';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { WhatsAppFAB } from '@/components/WhatsAppFAB';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/components/CartProvider';
import { DisableDevTools } from '@/components/DisableDevTools';
import {
  getServerProducts,
  getServerBrandingConfig,
  getServerContactInfo,
} from '@/lib/server-admin';
import { INITIAL_PRODUCTS } from '@/lib/initial-products';
import { DEFAULT_BRANDING_CONFIG, DEFAULT_CONTACT_INFO } from '@/lib/site-config';

// Ensure no stale HTML is cached across visitor sessions
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  const serverProducts = getServerProducts();
  const initialProducts = serverProducts !== null ? serverProducts : INITIAL_PRODUCTS;
  const initialBranding = getServerBrandingConfig() || DEFAULT_BRANDING_CONFIG;
  const initialContact = getServerContactInfo() || DEFAULT_CONTACT_INFO;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200">
      <DisableDevTools />
      <CartProvider initialProducts={initialProducts}>
        {/* Sticky Navbar with Light/Dark theme toggle */}
        <Navbar initialBranding={initialBranding} />

        {/* Main Content Area */}
        <main className="flex-grow">
          {/* Himalayan Herbal Hero Section */}
          <Hero initialBranding={initialBranding} />

          {/* Products Grid with Layout-First Loading, Categories & Click for Details */}
          <ProductGrid />

          {/* Benefits & Purity Highlights */}
          <BenefitsSection />

          {/* Brand Heritage & Story */}
          <AboutSection />

          {/* Lab Testing & Purity Standards */}
          <SpecsSection />

          {/* Verified Customer Reviews */}
          <TestimonialsSection />

          {/* Contact & Consultation Form */}
          <ContactSection contactInfo={initialContact} />
        </main>

        {/* Footer */}
        <Footer contactInfo={initialContact} />

        {/* Product Detail Modal (4 Images Gallery, Zoom In, Quantity Selection, COD Buy Now) */}
        <ProductDetailModal />

        {/* Slide-out Cart Sidebar with COD Checkout & Google Sheets Sync */}
        <CartSidebar />

        {/* Order Success Confirmation Modal */}
        <OrderSuccessModal />

        {/* Floating Action Button (FAB) for Pre-Filled WhatsApp Customer Inquiry */}
        <WhatsAppFAB />
      </CartProvider>
    </div>
  );
}
