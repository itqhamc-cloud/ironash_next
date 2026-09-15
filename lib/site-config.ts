export interface SiteContactInfo {
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  hubLocation: string;
  workingHours: string;
  quickWhatsAppMessage: string;
}

export interface EmailNotificationConfig {
  adminNotificationEmail: string;
  notifyAdminOnNewOrder: boolean;
  notifyCustomerOnNewOrder: boolean;
  senderName: string;
  fromEmail: string;
  customerEmailNote: string;
  emailProvider: 'smtp' | 'google_script';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
}

export const DEFAULT_CONTACT_INFO: SiteContactInfo = {
  whatsappNumber: '+92 310 9415571',
  supportPhone: '+92 310 9415571',
  supportEmail: 'info@ironash.pk',
  hubLocation: 'Blue Area, Islamabad, Pakistan',
  workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM PKT',
  quickWhatsAppMessage: 'Salam IronAsh! I have an inquiry about your Himalayan Shilajit products.',
};

export const DEFAULT_EMAIL_CONFIG: EmailNotificationConfig = {
  adminNotificationEmail: 'it.qhamc@gmail.com',
  notifyAdminOnNewOrder: true,
  notifyCustomerOnNewOrder: true,
  senderName: 'IronAsh Himalayan Shilajit',
  fromEmail: 'orders@ironash.pk',
  customerEmailNote: 'Thank you for your order! Your 100% natural Gold-Grade Shilajit order is being processed for prompt dispatch with Cash on Delivery nationwide.',
  emailProvider: 'smtp',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpSecure: false,
};

/**
 * Clean and format any phone number into international digits for wa.me URLs.
 * Handles:
 * - "+92 310 9415571" -> "923109415571"
 * - "0310 9415571" -> "923109415571"
 * - "0092 310 9415571" -> "923109415571"
 * - "310 9415571" -> "923109415571"
 */
export function formatWhatsAppUrlDigits(phone: string): string {
  if (!phone) return '923109415571';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0092')) {
    return '92' + digits.slice(4);
  }
  if (digits.startsWith('92')) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return '92' + digits.slice(1);
  }
  if (digits.length === 10 && digits.startsWith('3')) {
    return '92' + digits;
  }
  return digits || '923109415571';
}

export interface SiteTaxonomy {
  categories: string[];
  tags: string[];
}

export const DEFAULT_TAXONOMY: SiteTaxonomy = {
  categories: ['Shilajit', 'Herbs', 'Capsules', 'Honey', 'Tonics'],
  tags: ['100% Pure Natural', 'Premium Quality', 'Lab Tested', 'Best Seller', 'Gold Grade', '100% Pure Gold Grade (75%+ Fulvic Acid)'],
};

export const CONTACT_STORAGE_KEY = 'ironash_contact_info_v1';
export const EMAIL_CONFIG_STORAGE_KEY = 'ironash_email_config_v1';
export const TAXONOMY_STORAGE_KEY = 'ironash_taxonomy_v1';
export const ADMIN_TOKEN_KEY = 'ironash_admin_token';
export const ADMIN_AUTH_KEY = 'ironash_admin_auth';

export function getStoredTaxonomy(): SiteTaxonomy {
  if (typeof window === 'undefined') return DEFAULT_TAXONOMY;
  try {
    const raw = localStorage.getItem(TAXONOMY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_TAXONOMY, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse taxonomy from storage', e);
  }
  return DEFAULT_TAXONOMY;
}

export function saveStoredTaxonomy(taxonomy: SiteTaxonomy): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TAXONOMY_STORAGE_KEY, JSON.stringify(taxonomy));
    window.dispatchEvent(new CustomEvent('ironash_taxonomy_updated', { detail: taxonomy }));
  } catch (e) {
    console.error('Failed to save taxonomy to localStorage', e);
  }
}

export function getStoredAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    sessionStorage.getItem(ADMIN_TOKEN_KEY) ||
    ''
  );
}

export function saveStoredAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } catch {}
}

export function clearStoredAdminToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  } catch {}
}

export function getStoredContactInfo(): SiteContactInfo {
  if (typeof window === 'undefined') return DEFAULT_CONTACT_INFO;
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONTACT_INFO, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse contact info from storage', e);
  }
  return DEFAULT_CONTACT_INFO;
}

export function saveStoredContactInfo(info: SiteContactInfo): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent('ironash_contact_updated', { detail: info }));
  } catch (e) {
    console.error('Failed to save contact info to localStorage', e);
  }
}

export interface SiteBrandingConfig {
  siteLogoUrl?: string; // Custom image URL or Base64 data for site logo
  siteLogoText?: string;
  heroImageUrl?: string; // Custom Hero background banner image URL or Base64 data
  heroTitle?: string;
  heroSubtitle?: string;
}

export const DEFAULT_BRANDING_CONFIG: SiteBrandingConfig = {
  siteLogoUrl: '',
  siteLogoText: 'IronAsh',
  heroImageUrl: 'https://cdn.b12.io/client_media/DGYgvmni/5c0902fe-a6d6-11f1-9c9e-0242ac110002-FcA6R4ZesbwT38oRfKKm0_HbbcI48D.jpg',
  heroTitle: 'Ancient Wisdom, Modern Wellness',
  heroSubtitle: 'Discover the power of pure Himalayan herbs. Premium Shilajit and natural supplements for your journey to optimal health.',
};

export const BRANDING_STORAGE_KEY = 'ironash_branding_config_v1';

export function getStoredBrandingConfig(): SiteBrandingConfig {
  if (typeof window === 'undefined') return DEFAULT_BRANDING_CONFIG;
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_BRANDING_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse branding config from storage', e);
  }
  return DEFAULT_BRANDING_CONFIG;
}

export function saveStoredBrandingConfig(branding: SiteBrandingConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
    window.dispatchEvent(new CustomEvent('ironash_branding_updated', { detail: branding }));
  } catch (e) {
    console.error('Failed to save branding to localStorage', e);
  }
}

