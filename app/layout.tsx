import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IronAsh - Himalayan Shilajit & Pure Herbal Store',
  description:
    'IronAsh - Premium Himalayan herbal products, Shilajit resin, and wellness store with slide-out cart, Cash on Delivery across Pakistan, admin portal, and Google Sheets order syncing.',
  openGraph: {
    title: 'IronAsh - Himalayan Shilajit & Pure Herbal Store',
    description:
      'IronAsh - Premium Himalayan herbal products, Shilajit resin, and wellness store with slide-out cart, Cash on Delivery across Pakistan, admin portal, and Google Sheets order syncing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IronAsh - Himalayan Shilajit & Pure Herbal Store',
    description:
      'IronAsh - Premium Himalayan herbal products, Shilajit resin, and wellness store with slide-out cart, Cash on Delivery across Pakistan, admin portal, and Google Sheets order syncing.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${inter.className}`}>
      <body
        className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 font-sans antialiased selection:bg-emerald-800 selection:text-white transition-colors duration-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
