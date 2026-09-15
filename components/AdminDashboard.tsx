'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Product, Order } from '@/types/timber';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredOrders,
  saveStoredOrders,
  getStoredGoogleScriptUrl,
  saveStoredGoogleScriptUrl,
  getStoredAdminPassword,
  saveStoredAdminPassword,
  verifyAdminPassword,
  DEFAULT_ADMIN_PASSWORD,
  INITIAL_PRODUCTS,
} from '@/lib/initial-products';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '@/lib/google-apps-script-code';
import { normalizeOrder, normalizeOrdersList } from '@/lib/order-utils';
import {
  Lock,
  Key,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  RefreshCw,
  Copy,
  Check,
  Search,
  Package,
  FileSpreadsheet,
  Settings,
  AlertCircle,
  X,
  Send,
  Leaf,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Loader2,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  ExternalLink,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  Mountain,
  Tag,
} from 'lucide-react';
import {
  SiteContactInfo,
  DEFAULT_CONTACT_INFO,
  EmailNotificationConfig,
  DEFAULT_EMAIL_CONFIG,
  formatWhatsAppUrlDigits,
  getStoredContactInfo,
  saveStoredContactInfo,
  getStoredAdminToken,
  saveStoredAdminToken,
  clearStoredAdminToken,
  SiteTaxonomy,
  DEFAULT_TAXONOMY,
  getStoredTaxonomy,
  saveStoredTaxonomy,
  SiteBrandingConfig,
  DEFAULT_BRANDING_CONFIG,
  getStoredBrandingConfig,
  saveStoredBrandingConfig,
} from '@/lib/site-config';

interface AdminDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onProductsUpdated?: (products: Product[]) => void;
  isInline?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen = true,
  onClose,
  onProductsUpdated,
  isInline = false,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'taxonomy' | 'contact' | 'branding' | 'email' | 'sheets' | 'security'>('products');

  // Site Branding state (Hero & Logo)
  const [brandingData, setBrandingData] = useState<SiteBrandingConfig>(DEFAULT_BRANDING_CONFIG);
  const [isSavingBranding, setIsSavingBranding] = useState<boolean>(false);
  const [brandingSaveMessage, setBrandingSaveMessage] = useState<string>('');
  const [brandingSaveError, setBrandingSaveError] = useState<string>('');
  const [isUploadingHero, setIsUploadingHero] = useState<boolean>(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

  // Contact Information state
  const [contactData, setContactData] = useState<SiteContactInfo>(DEFAULT_CONTACT_INFO);
  const [isSavingContact, setIsSavingContact] = useState<boolean>(false);
  const [contactSaveMessage, setContactSaveMessage] = useState<string>('');
  const [contactSaveError, setContactSaveError] = useState<string>('');

  // Taxonomy State
  const [taxonomyData, setTaxonomyData] = useState<SiteTaxonomy>(DEFAULT_TAXONOMY);
  const [isSavingTaxonomy, setIsSavingTaxonomy] = useState<boolean>(false);
  const [taxonomySaveMessage, setTaxonomySaveMessage] = useState<string>('');
  const [taxonomySaveError, setTaxonomySaveError] = useState<string>('');

  // Email Notification Configuration state
  const [emailConfig, setEmailConfig] = useState<EmailNotificationConfig>(DEFAULT_EMAIL_CONFIG);
  const [isSavingEmail, setIsSavingEmail] = useState<boolean>(false);
  const [emailSaveMessage, setEmailSaveMessage] = useState<string>('');
  const [emailSaveError, setEmailSaveError] = useState<string>('');
  const [showSmtpPassword, setShowSmtpPassword] = useState<boolean>(false);
  const [testEmailAddress, setTestEmailAddress] = useState<string>('it.qhamc@gmail.com');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordChangeError, setPasswordChangeError] = useState<string>('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Product Form state for Himalayan Herbal products
  interface UploadingFile {
    id: string;
    name: string;
    previewUrl: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    errorMessage?: string;
  }

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    actualPrice: string; // Original regular retail price in PKR
    discountedPrice: string; // Discounted selling price in PKR (optional)
    stock: string;
    unit: string;
    category: string;
    imageUrl: string;
    galleryImages: string[];
    origin: string;
    tags: string[];
  }>({
    title: '',
    description: '',
    actualPrice: '',
    discountedPrice: '',
    stock: '15',
    unit: '20g Glass Jar',
    category: 'Shilajit',
    imageUrl: '',
    galleryImages: [],
    origin: 'Skardu, Gilgit-Baltistan (16,000+ ft)',
    tags: [],
  });
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [formError, setFormError] = useState<string>('');
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Live calculation for product discount in Add/Edit product form
  const numActualInput = parseFloat(formData.actualPrice);
  const numDiscountedInput = parseFloat(formData.discountedPrice);
  const isValidActual = !isNaN(numActualInput) && numActualInput > 0;
  const isValidDiscounted = !isNaN(numDiscountedInput) && numDiscountedInput > 0;

  let liveDiscountPercent = 0;
  let liveSavings = 0;
  let priceWarning = '';

  if (isValidActual && isValidDiscounted) {
    if (numDiscountedInput < numActualInput) {
      liveDiscountPercent = Math.round(((numActualInput - numDiscountedInput) / numActualInput) * 100);
      liveSavings = numActualInput - numDiscountedInput;
    } else if (numDiscountedInput > numActualInput) {
      priceWarning = 'Discounted price cannot be higher than actual regular price.';
    }
  }

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string>('');

  // Google Script URL state
  const [googleScriptUrl, setGoogleScriptUrl] = useState<string>('');
  const [urlSavedFeedback, setUrlSavedFeedback] = useState<boolean>(false);
  const [isSavingUrl, setIsSavingUrl] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [testingWebhook, setTestingWebhook] = useState<boolean>(false);

  // Re-authentication state for seamless recovery when 401 Unauthorized occurs
  const [showReauthModal, setShowReauthModal] = useState<boolean>(false);
  const [reauthPassword, setReauthPassword] = useState<string>('');
  const [reauthError, setReauthError] = useState<string>('');
  const [isReauthorizing, setIsReauthorizing] = useState<boolean>(false);
  const [pendingRetryAction, setPendingRetryAction] = useState<(() => Promise<void>) | null>(null);

  // Authenticated fetch wrapper that attaches Bearer token, custom header, and credentials
  const adminFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getStoredAdminToken();
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('Cache-Control')) {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      headers.set('x-admin-token', token);
    }
    return fetch(url, {
      cache: 'no-store',
      ...options,
      headers,
      credentials: 'include',
    });
  }, []);

  const handleInlineReauth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reauthPassword.trim()) return;

    setIsReauthorizing(true);
    setReauthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: reauthPassword.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          saveStoredAdminToken(data.token);
        }
        setIsAuthenticated(true);
        setShowReauthModal(false);
        setReauthPassword('');
        setContactSaveError('');
        setEmailSaveError('');

        // If there was an action waiting to retry, execute it now!
        if (pendingRetryAction) {
          const action = pendingRetryAction;
          setPendingRetryAction(null);
          setTimeout(() => {
            action().catch(() => {});
          }, 100);
        }
      } else {
        setReauthError(data.error || 'Incorrect admin password. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setReauthError(`Error: ${msg}`);
    } finally {
      setIsReauthorizing(false);
    }
  };

  // Synchronize client storage and check existing session on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const storedToken = getStoredAdminToken();
        const storedAuth = sessionStorage.getItem('ironash_admin_auth');
        if (storedToken || storedAuth === 'true') {
          setIsAuthenticated(true);
        }
        setProducts(getStoredProducts());
        setOrders(normalizeOrdersList(getStoredOrders()));
        setGoogleScriptUrl(getStoredGoogleScriptUrl());
        setContactData(getStoredContactInfo());
        setTaxonomyData(getStoredTaxonomy());
        setBrandingData(getStoredBrandingConfig());
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Check existing session with server on mount
  useEffect(() => {
    const token = getStoredAdminToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-admin-token'] = token;
    }
    fetch('/api/admin/auth', {
      headers,
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          sessionStorage.setItem('ironash_admin_auth', 'true');
        } else {
          // If server rejects and no token exists, reset to require login
          if (!token) {
            setIsAuthenticated(false);
            sessionStorage.removeItem('ironash_admin_auth');
          }
        }
      })
      .catch(() => {});
  }, []);

  // When authenticated, load server config, settings, and server-persisted orders
  useEffect(() => {
    if (isAuthenticated) {
      // 1. Fetch server-persisted Google Apps Script URL
      adminFetch('/api/admin/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.googleScriptUrl) {
            setGoogleScriptUrl(data.googleScriptUrl);
            saveStoredGoogleScriptUrl(data.googleScriptUrl);
          }
        })
        .catch(() => {});

      // 2. Fetch server-persisted Site Settings (Contact info + Email config)
      adminFetch('/api/admin/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.contactInfo) {
            setContactData(data.contactInfo);
            saveStoredContactInfo(data.contactInfo);
          }
          if (data.emailConfig) {
            setEmailConfig(data.emailConfig);
            if (data.emailConfig.adminNotificationEmail) {
              setTestEmailAddress(data.emailConfig.adminNotificationEmail);
            }
          }
          if (data.brandingConfig) {
            setBrandingData(data.brandingConfig);
            saveStoredBrandingConfig(data.brandingConfig);
          }
        })
        .catch(() => {});

      // 3. Fetch server-persisted customer orders
      adminFetch('/api/admin/orders')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.orders) && data.orders.length > 0) {
            const serverOrders = normalizeOrdersList(data.orders);
            const local = normalizeOrdersList(getStoredOrders());
            const orderMap = new Map<string, Order>();
            serverOrders.forEach((o: Order) => {
              if (o && o.id) orderMap.set(o.id, o);
            });
            local.forEach((o: Order) => {
              if (o && o.id && !orderMap.has(o.id)) orderMap.set(o.id, o);
            });
            const merged = Array.from(orderMap.values());
            setOrders(merged);
            saveStoredOrders(merged);
          }
        })
        .catch(() => {});

      // 4. Fetch server-persisted products catalog
      fetch('/api/products', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            saveStoredProducts(data.products);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, adminFetch]);

  // Subscribe to storage update events
  useEffect(() => {
    const handleProductsUpdated = () => {
      setProducts(getStoredProducts());
    };
    const handleOrdersUpdated = () => {
      setOrders(getStoredOrders());
    };

    window.addEventListener('ironash_products_updated', handleProductsUpdated);
    window.addEventListener('ironash_orders_updated', handleOrdersUpdated);

    return () => {
      window.removeEventListener('ironash_products_updated', handleProductsUpdated);
      window.removeEventListener('ironash_orders_updated', handleOrdersUpdated);
    };
  }, []);

  if (!isInline && !isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setAuthError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          saveStoredAdminToken(data.token);
        }
        setIsAuthenticated(true);
        sessionStorage.setItem('ironash_admin_auth', 'true');
        setAuthError('');
        setPasswordInput('');
      } else {
        setAuthError(data.error || 'Incorrect password. Please enter your valid admin password.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      // Fallback verification if offline
      if (verifyAdminPassword(passwordInput.trim())) {
        setIsAuthenticated(true);
        sessionStorage.setItem('ironash_admin_auth', 'true');
        setAuthError('');
        setPasswordInput('');
      } else {
        setAuthError(`Connection error: ${msg}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminFetch('/api/admin/auth', { method: 'DELETE' });
    } catch {}
    clearStoredAdminToken();
    setIsAuthenticated(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!currentPassword.trim()) {
      setPasswordChangeError('Please enter your current password.');
      return;
    }

    if (!newPassword.trim()) {
      setPasswordChangeError('New password cannot be empty.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setPasswordChangeError('New password must be at least 6 characters long for enhanced security.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordChangeError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await adminFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        saveStoredAdminPassword(newPassword.trim());
        setPasswordChangeSuccess(
          data.message || 'Admin password updated and permanently secured on the server! Your new password is now active.'
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordChangeError(data.error || 'Failed to update password.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setPasswordChangeError(`Failed to reach server: ${msg}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetPasswordToDefault = async () => {
    if (
      window.confirm(
        `Are you sure you want to reset the admin password to factory default (${DEFAULT_ADMIN_PASSWORD})?`
      )
    ) {
      try {
        await adminFetch('/api/admin/change-password', {
          method: 'POST',
          body: JSON.stringify({
            currentPassword: currentPassword.trim() || DEFAULT_ADMIN_PASSWORD,
            newPassword: DEFAULT_ADMIN_PASSWORD,
          }),
        });
      } catch {}
      saveStoredAdminPassword(DEFAULT_ADMIN_PASSWORD);
      setPasswordChangeSuccess(`Password has been reset to default (${DEFAULT_ADMIN_PASSWORD}).`);
      setPasswordChangeError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Taxonomy Handlers
  const handleSaveTaxonomy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingTaxonomy(true);
    setTaxonomySaveMessage('');
    setTaxonomySaveError('');

    try {
      saveStoredTaxonomy(taxonomyData);
      setTaxonomySaveMessage('Taxonomy updated locally successfully.');
    } catch (error) {
      setTaxonomySaveError('Failed to save taxonomy.');
    } finally {
      setIsSavingTaxonomy(false);
    }
  };

  // Branding Handlers (Hero & Site Logo)
  const handleSaveBranding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingBranding(true);
    setBrandingSaveMessage('');
    setBrandingSaveError('');

    try {
      // 1. Immediately save locally and broadcast to site components
      saveStoredBrandingConfig(brandingData);

      // 2. Also persist to server settings
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ brandingConfig: brandingData }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.brandingConfig) {
          setBrandingData(data.brandingConfig);
          saveStoredBrandingConfig(data.brandingConfig);
        }
        setBrandingSaveMessage('Branding settings saved successfully! The new Hero image and site logo are now active site-wide.');
      } else {
        if (res.status === 401 || (data.error && data.error.toLowerCase().includes('unauthorized'))) {
          setPendingRetryAction(() => () => handleSaveBranding());
          setShowReauthModal(true);
          setBrandingSaveError('Admin session authorization required. Please authorize below.');
        } else {
          setBrandingSaveMessage('Branding updated in local session successfully.');
        }
      }
    } catch (err: unknown) {
      setBrandingSaveMessage('Branding updated in local session successfully (offline mode).');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a compressed JPG or WebP image (< 2MB) for optimal site loading.');
      return;
    }

    setIsUploadingHero(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBrandingData((prev) => ({
        ...prev,
        heroImageUrl: result,
      }));
      setIsUploadingHero(false);
    };
    reader.onerror = () => {
      alert('Failed to read selected image file.');
      setIsUploadingHero(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB. Please choose a smaller logo image (< 500KB recommended).');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBrandingData((prev) => ({
        ...prev,
        siteLogoUrl: result,
      }));
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      alert('Failed to read selected logo file.');
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  // Contact Information Handlers
  const handleSaveContact = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingContact(true);
    setContactSaveMessage('');
    setContactSaveError('');

    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ contactInfo: contactData }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setContactData(data.contactInfo);
        saveStoredContactInfo(data.contactInfo);
        setContactSaveMessage(
          'Contact information successfully saved! The WhatsApp number, Chat Us button, contact form, and footer are now updated site-wide.'
        );
      } else {
        if (res.status === 401 || (data.error && data.error.toLowerCase().includes('unauthorized'))) {
          setPendingRetryAction(() => () => handleSaveContact());
          setShowReauthModal(true);
          setContactSaveError('Admin session authorization required. Please authorize below.');
        } else {
          setContactSaveError(data.error || 'Failed to save contact settings.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      setContactSaveError(`Failed to reach server: ${msg}`);
    } finally {
      setIsSavingContact(false);
    }
  };

  // Email Notification & SMTP Handlers
  const handleSaveEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingEmail(true);
    setEmailSaveMessage('');
    setEmailSaveError('');

    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ emailConfig }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailConfig(data.emailConfig);
        setEmailSaveMessage(
          'Email notification settings successfully saved! Automatic customer receipts and store owner alerts are active.'
        );
      } else {
        if (res.status === 401 || (data.error && data.error.toLowerCase().includes('unauthorized'))) {
          setPendingRetryAction(() => () => handleSaveEmail());
          setShowReauthModal(true);
          setEmailSaveError('Admin session authorization required. Please authorize below.');
        } else {
          setEmailSaveError(data.error || 'Failed to save email configuration.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      setEmailSaveError(`Failed to reach server: ${msg}`);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      setTestEmailResult({
        success: false,
        message: 'Please enter a valid recipient email address (e.g. it.qhamc@gmail.com).',
      });
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const res = await adminFetch('/api/admin/send-test-email', {
        method: 'POST',
        body: JSON.stringify({
          targetEmail: testEmailAddress.trim(),
          customConfig: emailConfig,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({
          success: true,
          message: data.message || `Test email successfully dispatched to ${testEmailAddress}! Check your inbox (and spam folder).`,
        });
      } else {
        if (res.status === 401 || (data.error && data.error.toLowerCase().includes('unauthorized'))) {
          setPendingRetryAction(() => () => handleSendTestEmail());
          setShowReauthModal(true);
          setTestEmailResult({
            success: false,
            message: 'Admin authorization required. Please authorize below to send test email.',
          });
        } else {
          setTestEmailResult({
            success: false,
            message: data.error || 'SMTP delivery failed. Check your SMTP host, port, username, or App Password.',
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      setTestEmailResult({
        success: false,
        message: `Network error connecting to email dispatch endpoint: ${msg}`,
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Local File Upload, Compression & Server Storage Handler with live progress
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentCount = formData.galleryImages.length;
    const availableSlots = 4 - currentCount;
    if (availableSlots <= 0) {
      alert('The gallery is already full (maximum 4 images). Please remove an image first if you want to upload a new one.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);

    // Immediately generate preview URLs so user sees each image right away!
    const newItems: UploadingFile[] = filesToUpload.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      progress: 15,
      status: 'uploading',
    }));

    setUploadingFiles((prev) => [...prev, ...newItems]);
    setIsProcessingImages(true);

    for (const item of newItems) {
      const file = filesToUpload.find((f) => f.name === item.name);
      if (!file) continue;

      try {
        // Step 1: Local compression & progress update to 40%
        setUploadingFiles((prev) =>
          prev.map((u) => (u.id === item.id ? { ...u, progress: 40 } : u))
        );

        const compressedBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let { width, height } = img;
              const maxDim = 1200;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
              } else {
                resolve(e.target?.result as string);
              }
            };
            img.onerror = () => resolve(e.target?.result as string);
            img.src = e.target?.result as string;
          };
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });

        // Step 2: Uploading to server & progress update to 75%
        setUploadingFiles((prev) =>
          prev.map((u) => (u.id === item.id ? { ...u, progress: 75 } : u))
        );

        let finalUrl = item.previewUrl;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64: compressedBase64,
              filename: file.name,
            }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            finalUrl = data.url;
          } else {
            finalUrl = compressedBase64;
          }
        } catch (uploadErr) {
          console.warn('Server upload fallback to base64:', uploadErr);
          finalUrl = compressedBase64;
        }

        // Step 3: Complete progress to 100%
        setUploadingFiles((prev) =>
          prev.map((u) => (u.id === item.id ? { ...u, progress: 100, status: 'completed' } : u))
        );

        // Add to gallery
        setFormData((prev) => {
          if (prev.galleryImages.length >= 4) return prev;
          const combined = [...prev.galleryImages, finalUrl];
          return {
            ...prev,
            galleryImages: combined,
            imageUrl: combined[0] || '',
          };
        });

        // Brief delay so user sees "100% Uploaded"
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((u) => u.id !== item.id));
        }, 500);
      } catch (err) {
        console.error('Upload error for image:', err);
        setUploadingFiles((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? { ...u, progress: 100, status: 'error', errorMessage: 'Upload failed' }
              : u
          )
        );
      }
    }

    setIsProcessingImages(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const updated = prev.galleryImages.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        galleryImages: updated,
        imageUrl: updated.length > 0 ? updated[0] : '',
      };
    });
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setFormData((prev) => {
      const target = prev.galleryImages[indexToPrimary];
      const rest = prev.galleryImages.filter((_, idx) => idx !== indexToPrimary);
      const reordered = [target, ...rest];
      return {
        ...prev,
        galleryImages: reordered,
        imageUrl: target,
      };
    });
  };

  // Product CRUD Handlers
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      actualPrice: '',
      discountedPrice: '',
      stock: '15',
      unit: '20g Glass Jar',
      category: taxonomyData.categories[0] || 'Shilajit',
      imageUrl: '',
      galleryImages: [],
      origin: 'Skardu, Gilgit-Baltistan (16,000+ ft)',
      tags: [],
    });
    setUploadingFiles([]);
    setFormError('');
    setIsCreatingProduct(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const existingGallery = prod.images && prod.images.length > 0
      ? prod.images
      : (prod.imageUrl ? [prod.imageUrl] : []);

    // Determine actual regular price and discounted selling price
    let actualPriceStr = '';
    let discountedPriceStr = '';

    if (prod.originalPrice && prod.originalPrice > prod.price) {
      actualPriceStr = prod.originalPrice.toString();
      discountedPriceStr = prod.price.toString();
    } else if (prod.discountPercent && prod.discountPercent > 0) {
      const calculatedOriginal = Math.round(prod.price / (1 - prod.discountPercent / 100));
      actualPriceStr = (prod.originalPrice || calculatedOriginal).toString();
      discountedPriceStr = prod.price.toString();
    } else {
      actualPriceStr = prod.price.toString();
      discountedPriceStr = '';
    }

    setFormData({
      title: prod.title,
      description: prod.description,
      actualPrice: actualPriceStr,
      discountedPrice: discountedPriceStr,
      stock: (prod.stock !== undefined ? prod.stock : 15).toString(),
      unit: prod.unit || '20g Glass Jar',
      category: prod.category || taxonomyData.categories[0] || 'Shilajit',
      imageUrl: prod.imageUrl || existingGallery[0] || '',
      galleryImages: existingGallery,
      origin: prod.origin || 'Himalayan Altitude',
      tags: prod.tags || (prod.purity ? [prod.purity] : []),
    });
    setUploadingFiles([]);
    setFormError('');
    setIsCreatingProduct(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.actualPrice.trim()) {
      setFormError('Title, Description, and Actual / Regular Price in PKR are required.');
      return;
    }

    if (formData.galleryImages.length === 0) {
      setFormError('Please upload at least 1 image for the product gallery.');
      return;
    }

    const numActual = parseFloat(formData.actualPrice);
    if (isNaN(numActual) || numActual <= 0) {
      setFormError('Please provide a valid positive Actual Price in PKR.');
      return;
    }

    let finalSellingPrice = numActual;
    let originalRetailPrice: number | undefined = undefined;
    let calculatedDiscountPercent: number | undefined = undefined;

    const trimmedDiscounted = formData.discountedPrice.trim();
    if (trimmedDiscounted) {
      const numDiscounted = parseFloat(trimmedDiscounted);
      if (isNaN(numDiscounted) || numDiscounted <= 0) {
        setFormError('Please provide a valid positive Discounted Price, or leave it blank if no discount.');
        return;
      }
      if (numDiscounted > numActual) {
        setFormError('Discounted price cannot be higher than the actual regular price.');
        return;
      }
      if (numDiscounted < numActual) {
        finalSellingPrice = numDiscounted;
        originalRetailPrice = numActual;
        calculatedDiscountPercent = Math.round(((numActual - numDiscounted) / numActual) * 100);
      } else {
        // Equal prices -> no discount
        finalSellingPrice = numActual;
        originalRetailPrice = undefined;
        calculatedDiscountPercent = undefined;
      }
    }

    const numStock = parseInt(formData.stock, 10);
    const validStock = !isNaN(numStock) && numStock >= 0 ? numStock : 15;

    // Build 4 gallery images from uploaded images (repeating if fewer than 4)
    let fullGallery = [...formData.galleryImages];
    while (fullGallery.length < 4) {
      fullGallery.push(fullGallery[0]);
    }
    const finalGallery = fullGallery.slice(0, 4);
    const primaryImg = finalGallery[0];

    let updatedList: Product[];
    if (editingProduct) {
      updatedList = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              title: formData.title.trim(),
              description: formData.description.trim(),
              price: finalSellingPrice,
              originalPrice: originalRetailPrice,
              discountPercent: calculatedDiscountPercent,
              stock: validStock,
              inStock: validStock > 0,
              unit: formData.unit.trim(),
              category: formData.category,
              imageUrl: primaryImg,
              images: finalGallery,
              origin: formData.origin.trim(),
              tags: formData.tags,
            }
          : p
      );
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: finalSellingPrice,
        originalPrice: originalRetailPrice,
        discountPercent: calculatedDiscountPercent,
        stock: validStock,
        inStock: validStock > 0,
        unit: formData.unit.trim(),
        category: formData.category,
        imageUrl: primaryImg,
        images: finalGallery,
        origin: formData.origin.trim(),
        tags: formData.tags,
        rating: 4.9,
        reviewsCount: 1,
        benefits: [
          'Authentic pure Himalayan source',
          'Lab tested for optimal purity & potency',
          '100% natural, free from artificial additives',
        ],
        usageInstructions:
          'Take daily with warm water or milk as directed on the label.',
      };
      updatedList = [newProduct, ...products];
    }

    setProducts(updatedList);
    saveStoredProducts(updatedList);
    if (onProductsUpdated) onProductsUpdated(updatedList);

    // Persist to server so changes sync across all browsers and devices
    fetch('/api/products', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify({ products: updatedList }),
    }).catch((err) => console.error('Failed to sync products to server:', err));

    setIsCreatingProduct(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedList = products.filter((p) => p.id !== productId);
      setProducts(updatedList);
      saveStoredProducts(updatedList);
      if (onProductsUpdated) onProductsUpdated(updatedList);

      fetch('/api/products', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify({ products: updatedList }),
      }).catch((err) => console.error('Failed to sync products to server:', err));
    }
  };

  const handleResetDefaultProducts = () => {
    if (window.confirm('Reset all products to factory IronAsh Himalayan Herbal catalog?')) {
      setProducts(INITIAL_PRODUCTS);
      saveStoredProducts(INITIAL_PRODUCTS);
      if (onProductsUpdated) onProductsUpdated(INITIAL_PRODUCTS);

      fetch('/api/products', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify({ products: INITIAL_PRODUCTS }),
      }).catch((err) => console.error('Failed to sync products to server:', err));
    }
  };

  // Google Sheet Webhook Handlers
  const handleSaveGoogleUrl = async () => {
    saveStoredGoogleScriptUrl(googleScriptUrl);
    setIsSavingUrl(true);
    try {
      const res = await adminFetch('/api/admin/config', {
        method: 'POST',
        body: JSON.stringify({ googleScriptUrl: googleScriptUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUrlSavedFeedback(true);
        setTimeout(() => setUrlSavedFeedback(false), 3000);
      } else {
        if (res.status === 401 || (data.error && data.error.toLowerCase().includes('unauthorized'))) {
          setPendingRetryAction(() => () => handleSaveGoogleUrl());
          setShowReauthModal(true);
        } else {
          alert(data.error || 'Failed to save URL to server.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error saving URL: ${msg}`);
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSyncOrdersFromSheet = async () => {
    const url = googleScriptUrl.trim() || getStoredGoogleScriptUrl();
    if (!url) {
      setSyncFeedback('No Google Apps Script Web App URL configured. Please enter one in the Google Sheets tab.');
      return;
    }

    setIsSyncingSheet(true);
    setSyncFeedback('');

    try {
      const res = await fetch(`/api/sheet-order?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (data.status === 'success' && Array.isArray(data.orders)) {
        const sheetOrders: Order[] = data.orders.map((o: any, idx: number) => normalizeOrder(o, idx));

        const existingLocal = normalizeOrdersList(getStoredOrders());
        const mergedMap = new Map<string, Order>();
        sheetOrders.forEach((o) => {
          if (o && o.id) mergedMap.set(o.id, o);
        });
        existingLocal.forEach((o) => {
          if (o && o.id && !mergedMap.has(o.id)) mergedMap.set(o.id, o);
        });

        const finalOrders = Array.from(mergedMap.values());
        setOrders(finalOrders);
        saveStoredOrders(finalOrders);
        setSyncFeedback(`Successfully synchronized ${sheetOrders.length} orders from Google Sheets!`);
      } else {
        setSyncFeedback(data.message || 'Received unexpected response from Web App.');
      }
    } catch (err: any) {
      setSyncFeedback(`Sync note: ${err.message}. Displaying cached orders.`);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handleSendTestWebhook = async () => {
    if (!googleScriptUrl.trim()) {
      alert('Please enter a Google Apps Script Web App URL first.');
      return;
    }
    setTestingWebhook(true);
    try {
      const testData = {
        orderId: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: 'Tariq Mehmood',
        name: 'Tariq Mehmood',
        phone: '0300 1234567',
        email: 'tariq@gmail.com',
        deliveryAddress: 'House 14, Street 25, F-7/2, Islamabad',
        address: 'House 14, Street 25, F-7/2, Islamabad',
        totalPrice: 3450,
        displayPrice: 'PKR 3,450',
        paymentMethod: 'Cash on Delivery',
        items: [{ title: 'Pure Himalayan Shilajit Resin (Gold Grade) - 20g', price: 3450, quantity: 1 }],
        status: 'Test COD Ping',
      };

      const res = await fetch('/api/sheet-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: googleScriptUrl.trim(),
          orderData: testData,
        }),
      });

      const data = await res.json();
      if (data.forwardedToSheet) {
        alert('Success! Test row was appended to your Google Sheet.');
        handleSyncOrdersFromSheet();
      } else {
        alert('Response received: ' + (data.warning || data.message || 'Saved locally.'));
      }
    } catch (err: any) {
      alert('Test failed: ' + err.message);
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    saveStoredOrders(updated);
  };

  return (
    <div
      className={
        isInline
          ? 'w-full max-w-7xl mx-auto p-2 sm:p-6 flex-1 flex flex-col'
          : 'fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6'
      }
    >
      <div
        className={`bg-white w-full rounded-2xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col ${
          isInline ? 'flex-1 min-h-[85vh]' : 'max-w-6xl max-h-[92vh] animate-in zoom-in-95 duration-200'
        }`}
      >
        {/* Top bar */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs font-serif">
              IA
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight font-serif">
                IronAsh Store Admin Portal
              </h2>
              <p className="text-xs text-stone-400">
                Himalayan Herbal Catalog & Google Sheets Order Logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-stone-400 hover:text-white px-3 py-1.5 rounded-lg border border-stone-700 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                id="close-admin-btn"
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Close Admin Dashboard"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* AUTHENTICATION GATE */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-16 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6 flex-1">
            <div className="w-16 h-16 bg-stone-100 text-stone-800 rounded-2xl flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8 text-stone-700" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-stone-900 font-serif">Store Management Access</h3>
              <p className="text-sm text-stone-600">
                Please enter your administrator password to manage products, view customer orders, and configure Google Sheets synchronization.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter admin password (hint: ironash2025)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-red-600 mt-2 font-medium flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                id="admin-login-submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggingIn ? 'Verifying Credentials...' : 'Access Dashboard'}
              </button>

              <div className="text-xs text-stone-500 bg-stone-50 p-2.5 rounded border border-stone-200">
                Default password: <strong className="text-stone-800 font-mono">ironash2025</strong> or <strong className="text-stone-800 font-mono">admin</strong>
              </div>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN INTERFACE */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tab navigation */}
            <div className="flex border-b border-stone-200 px-6 bg-stone-50 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('products')}
                id="tab-products-btn"
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'products'
                    ? 'border-emerald-700 text-stone-950 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Package className="w-4 h-4 text-emerald-700" />
                <span>Products Catalog ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                id="tab-orders-btn"
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-emerald-700 text-stone-950 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Orders Log ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('taxonomy')}
                id="tab-taxonomy-btn"
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'taxonomy'
                    ? 'border-emerald-700 text-stone-950 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <AtSign className="w-4 h-4 text-emerald-700" />
                <span>Categories & Tags</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                id="tab-contact-btn"
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'contact'
                    ? 'border-emerald-700 text-stone-950 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>Contact & WhatsApp</span>
              </button>

              <button
                onClick={() => setActiveTab('branding')}
                id="tab-branding-btn"
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'branding'
                    ? 'border-emerald-700 text-stone-950 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Hero & Site Logo</span>
              </button>

              <button
                onClick={() => setActiveTab('email')}
                id="tab-email-btn"
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'email'
                    ? 'border-emerald-700 text-stone-950 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>Order Email Alerts & SMTP</span>
              </button>

              <button
                onClick={() => setActiveTab('sheets')}
                id="tab-sheets-btn"
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'sheets'
                    ? 'border-emerald-700 text-stone-950 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Settings className="w-4 h-4 text-emerald-700" />
                <span>Google Sheets Integration</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                id="tab-security-btn"
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-emerald-700 text-stone-950 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Key className="w-4 h-4 text-emerald-700" />
                <span>Password & Security</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TAB 1: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search products by title, herb, or category..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetDefaultProducts}
                        title="Reset to factory herbal catalog"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>

                      <button
                        onClick={handleOpenCreateProduct}
                        id="add-product-btn"
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-amber-300" />
                        <span>Add New Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Add / Edit Product Modal or Inline Panel */}
                  {isCreatingProduct && (
                    <div className="p-6 bg-stone-50 border border-stone-300 rounded-xl space-y-4 animate-in fade-in-50">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                        <h4 className="text-sm font-bold text-stone-900 font-serif">
                          {editingProduct ? 'Edit Herbal Product' : 'Add New Herbal Product'}
                        </h4>
                        <button
                          onClick={() => setIsCreatingProduct(false)}
                          className="text-stone-400 hover:text-stone-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {formError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Product Title *
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Pure Himalayan Shilajit Resin (Gold Grade)"
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        {/* Pricing & Discount Section */}
                        <div className="md:col-span-2 p-4 bg-stone-100/70 border border-stone-200 rounded-xl space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                              Product Pricing & Discount
                            </label>
                            <span className="text-[11px] text-stone-500 font-medium">
                              Discount % is calculated automatically and displayed directly on product images
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Actual / Regular Price */}
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                                Actual / Regular Price (PKR) *
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">PKR</span>
                                <input
                                  type="number"
                                  step="1"
                                  min="1"
                                  value={formData.actualPrice}
                                  onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })}
                                  placeholder="e.g. 5000"
                                  className="w-full pl-12 pr-3 py-2 text-xs font-semibold border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                                />
                              </div>
                              <p className="text-[10px] text-stone-500 mt-1">Pre-discount original retail price</p>
                            </div>

                            {/* Discounted / Selling Price */}
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                                Discounted / Selling Price (PKR)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">PKR</span>
                                <input
                                  type="number"
                                  step="1"
                                  min="1"
                                  value={formData.discountedPrice}
                                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                                  placeholder="e.g. 3950 (or leave empty if no discount)"
                                  className="w-full pl-12 pr-3 py-2 text-xs font-semibold border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                                />
                              </div>
                              <p className="text-[10px] text-stone-500 mt-1">Selling price customer pays on checkout</p>
                            </div>
                          </div>

                          {/* Live Calculated Discount Callout */}
                          {liveDiscountPercent > 0 ? (
                            <div className="p-3 bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 text-white rounded shadow-xs animate-pulse">
                                  <Tag className="w-3 h-3" />
                                  {liveDiscountPercent}% OFF
                                </span>
                                <span className="text-xs text-stone-800">
                                  Customer saves <strong className="text-red-700 font-bold font-mono">PKR {liveSavings.toLocaleString()}</strong>.
                                  Final Price: <strong className="text-emerald-800 font-bold font-mono">PKR {numDiscountedInput.toLocaleString()}</strong>
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-red-700 bg-white/80 border border-red-200 px-2 py-0.5 rounded shadow-2xs self-start sm:self-auto">
                                🏷️ Mentioned on Product Image
                              </span>
                            </div>
                          ) : (
                            formData.actualPrice && !formData.discountedPrice && (
                              <div className="p-2 bg-stone-200/50 rounded-lg text-[11px] text-stone-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                                <span>No discount applied. Customer pays standard price of <strong className="font-mono text-stone-800">PKR {Number(formData.actualPrice).toLocaleString()}</strong>.</span>
                              </div>
                            )
                          )}

                          {priceWarning && (
                            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                              <span>{priceWarning}</span>
                            </div>
                          )}
                        </div>

                        {/* Unit / Weight */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Unit / Packaging
                          </label>
                          <input
                            type="text"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            placeholder="e.g. 20g Glass Jar or 60 Veg Capsules"
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        {/* Stock Inventory */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Available Stock (Units)
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="15"
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Category
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          >
                            {taxonomyData.categories.map((cat, i) => (
                              <option key={i} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Origin */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Harvest Origin
                          </label>
                          <input
                            type="text"
                            value={formData.origin}
                            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                            placeholder="e.g. Skardu, Gilgit-Baltistan (16,000+ ft)"
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        {/* Tags (Multiple Select via Checkboxes) */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                            Product Tags (Displayed in orange on images)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {taxonomyData.tags.map((tag, i) => {
                              const isSelected = formData.tags.includes(tag);
                              return (
                                <label
                                  key={i}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                                    isSelected 
                                      ? 'bg-amber-100 border-amber-300 text-amber-900' 
                                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormData({ ...formData, tags: [...formData.tags, tag] });
                                      } else {
                                        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
                                      }
                                    }}
                                  />
                                  {isSelected && <Check className="w-3 h-3 text-amber-600" />}
                                  {tag}
                                </label>
                              );
                            })}
                            {taxonomyData.tags.length === 0 && (
                              <span className="text-xs text-stone-500 italic">No tags defined in Taxonomy settings.</span>
                            )}
                          </div>
                        </div>

                        {/* Product Gallery & Local Image Upload */}
                        <div className="md:col-span-2 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                                Product Gallery (Up to 4 Images) *
                              </label>
                              <p className="text-[11px] text-stone-500">
                                Upload product photos directly from your device. Slot 1 is the primary storefront image.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                                {formData.galleryImages.length} / 4 Images
                              </span>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={formData.galleryImages.length + uploadingFiles.length >= 4}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                                id="btn-add-to-gallery"
                              >
                                <Plus className="w-4 h-4" />
                                Add to Gallery
                              </button>
                            </div>
                          </div>

                          {/* Hidden File Input */}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFilesSelected(e.target.files)}
                            multiple
                            accept="image/*"
                            className="hidden"
                            id="local-image-file-input"
                          />

                          {/* Upload Dropzone shown when no images uploaded and nothing uploading */}
                          {formData.galleryImages.length === 0 && uploadingFiles.length === 0 && (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                handleFilesSelected(e.dataTransfer.files);
                              }}
                              className="border-2 border-dashed border-emerald-700/40 hover:border-emerald-700 bg-white hover:bg-emerald-50/30 rounded-xl p-8 text-center cursor-pointer transition-colors group mb-2"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-stone-900 group-hover:text-emerald-800">
                                  Click to upload product images or drag & drop files here
                                </span>
                                <span className="text-[11px] text-stone-500 max-w-sm">
                                  Supports JPG, PNG, and WEBP. High-resolution images are automatically optimized for fast loading.
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                  }}
                                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add to Gallery
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Gallery Slots (Uploaded + Currently Uploading + Empty Slots) */}
                          {(formData.galleryImages.length > 0 || uploadingFiles.length > 0) && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                              {/* Uploaded Images */}
                              {formData.galleryImages.map((imgUrl, idx) => {
                                const isPrimary = idx === 0;
                                return (
                                  <div
                                    key={`uploaded-${idx}`}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-stone-100 shadow-xs group ${
                                      isPrimary
                                        ? 'border-emerald-700 ring-2 ring-emerald-600/30'
                                        : 'border-stone-200'
                                    }`}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Gallery image ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Graceful fallback
                                        e.currentTarget.src =
                                          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80';
                                      }}
                                    />
                                    <span
                                      className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                                        isPrimary
                                          ? 'bg-emerald-800 text-white'
                                          : 'bg-black/70 text-white'
                                      }`}
                                    >
                                      {isPrimary ? 'Primary (Main)' : `Slot ${idx + 1}`}
                                    </span>

                                    {/* Live discount badge on Primary product image */}
                                    {isPrimary && liveDiscountPercent > 0 && (
                                      <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded shadow-sm border border-white/30 animate-pulse">
                                        <Tag className="w-2.5 h-2.5" />
                                        {liveDiscountPercent}% OFF
                                      </span>
                                    )}

                                    {/* Action Buttons on Hover */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                                      {!isPrimary && (
                                        <button
                                          type="button"
                                          onClick={() => handleSetPrimaryImage(idx)}
                                          className="w-full py-1 px-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer shadow-xs"
                                        >
                                          Set Primary
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveGalleryImage(idx)}
                                        className="w-full py-1 px-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer shadow-xs"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Uploading Images with live progress indicator */}
                              {uploadingFiles.map((uploadItem) => (
                                <div
                                  key={uploadItem.id}
                                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-emerald-500 bg-stone-900 shadow-md flex flex-col items-center justify-center text-center p-2"
                                >
                                  {uploadItem.previewUrl && (
                                    <img
                                      src={uploadItem.previewUrl}
                                      alt={uploadItem.name}
                                      className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[1px]"
                                    />
                                  )}
                                  <div className="relative z-10 w-full flex flex-col items-center gap-1.5 px-2">
                                    {uploadItem.status === 'error' ? (
                                      <AlertCircle className="w-6 h-6 text-red-400" />
                                    ) : uploadItem.progress >= 100 ? (
                                      <Check className="w-6 h-6 text-emerald-400 animate-bounce" />
                                    ) : (
                                      <Loader2 className="w-6 h-6 text-emerald-300 animate-spin" />
                                    )}

                                    <span className="text-[11px] font-bold text-white tracking-wide truncate max-w-full">
                                      {uploadItem.status === 'completed'
                                        ? 'Uploaded 100%'
                                        : uploadItem.status === 'error'
                                        ? 'Upload Failed'
                                        : `Uploading ${uploadItem.progress}%`}
                                    </span>

                                    {/* Animated Progress Bar */}
                                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/20">
                                      <div
                                        className={`h-full transition-all duration-300 rounded-full ${
                                          uploadItem.status === 'error'
                                            ? 'bg-red-500'
                                            : uploadItem.progress >= 100
                                            ? 'bg-emerald-400'
                                            : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${uploadItem.progress}%` }}
                                      />
                                    </div>

                                    <span className="text-[9px] text-white/80 truncate max-w-[90%]">
                                      {uploadItem.name}
                                    </span>
                                  </div>
                                </div>
                              ))}

                              {/* Clickable Empty Slot tiles to add more photos */}
                              {Array.from({
                                length: Math.max(
                                  0,
                                  4 - (formData.galleryImages.length + uploadingFiles.length)
                                ),
                              }).map((_, i) => {
                                const slotNum =
                                  formData.galleryImages.length + uploadingFiles.length + i + 1;
                                return (
                                  <button
                                    key={`empty-slot-${i}`}
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-stone-300 hover:border-emerald-700 bg-white hover:bg-emerald-50/30 rounded-xl flex flex-col items-center justify-center gap-1.5 text-stone-500 hover:text-emerald-800 transition-all cursor-pointer p-2 group"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                      <Plus className="w-4 h-4 text-stone-600 group-hover:text-emerald-800" />
                                    </div>
                                    <span className="text-[11px] font-bold text-stone-700 group-hover:text-emerald-800">
                                      + Add to Gallery
                                    </span>
                                    <span className="text-[9px] text-stone-400">Slot {slotNum}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <p className="text-[11px] text-stone-500 italic">
                            Tip: Drag & drop images or click &quot;+ Add to Gallery&quot;. Photos are automatically saved and instantly visible on the customer storefront.
                          </p>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Description *
                          </label>
                          <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter herbal details, active fulvic acid potency, recommended dosage..."
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsCreatingProduct(false)}
                            className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            id="save-product-btn"
                            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            {editingProduct ? 'Update Product' : 'Create Product'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Products Table */}
                  <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 uppercase font-bold tracking-wider">
                          <tr>
                            <th className="p-3.5">Product</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Price (PKR)</th>
                            <th className="p-3.5">Origin & Tags</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {products
                            .filter(
                              (p) =>
                                p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                                p.description.toLowerCase().includes(productSearch.toLowerCase()) ||
                                (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()))
                            )
                            .map((product) => {
                              const calculatedDiscount = (product.originalPrice && product.originalPrice > product.price)
                                ? Math.round((((product.originalPrice - product.price) / product.originalPrice) * 100))
                                : (product.discountPercent || 0);
                              const hasDiscount = calculatedDiscount > 0;

                              return (
                                <tr key={product.id} className="hover:bg-stone-50/80 transition-colors">
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-3">
                                      <div className="relative shrink-0">
                                        <img
                                          src={product.imageUrl}
                                          alt={product.title}
                                          className="w-12 h-12 rounded object-cover border border-stone-200 bg-stone-100 shrink-0"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=200&q=80';
                                          }}
                                        />
                                        {hasDiscount && (
                                          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-red-600 text-white text-[8px] font-black rounded uppercase shadow-xs">
                                            {calculatedDiscount}%
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-bold text-stone-900 font-serif">{product.title}</div>
                                        <div className="text-stone-500 text-[11px]">{product.unit || 'Standard packaging'}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-semibold text-[11px]">
                                      {product.category || 'Herbal'}
                                    </span>
                                  </td>
                                  <td className="p-3.5">
                                    <div className="font-bold text-stone-900 font-mono">
                                      PKR {Number(product.price).toLocaleString()}
                                    </div>
                                    {hasDiscount && (
                                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                        <span className="text-stone-400 line-through text-[11px] font-mono">
                                          PKR {Number(product.originalPrice || Math.round(product.price / (1 - calculatedDiscount / 100))).toLocaleString()}
                                        </span>
                                        <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1 py-0.2 rounded">
                                          {calculatedDiscount}% OFF
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                <td className="p-3.5 max-w-xs text-stone-600">
                                  <div className="text-[11px] font-medium text-stone-800">{product.origin || 'Himalayan'}</div>
                                  <div className="text-[10px] text-stone-500 mt-1 flex flex-wrap gap-1">
                                    {(product.tags || []).map((tag, i) => (
                                      <span key={i} className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                        {tag}
                                      </span>
                                    ))}
                                    {(!product.tags || product.tags.length === 0) && (
                                      <span className="italic">No tags</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditProduct(product)}
                                      id={`edit-product-${product.id}`}
                                      className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                      title="Edit details"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(product.id)}
                                      id={`delete-product-${product.id}`}
                                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                      title="Delete product"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {/* Top Stats Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">
                        Total Orders
                      </span>
                      <span className="text-2xl font-black text-stone-900 mt-1 block font-mono">{orders.length}</span>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">
                        Gross COD Revenue
                      </span>
                      <span className="text-2xl font-black text-emerald-800 mt-1 block font-mono">
                        PKR {orders.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">
                        Payment Terms
                      </span>
                      <span className="text-sm font-bold text-emerald-900 mt-2 block">
                        100% Cash on Delivery (COD)
                      </span>
                    </div>
                  </div>

                  {/* Actions & Sync Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search orders by customer, phone, or address..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSyncOrdersFromSheet}
                        disabled={isSyncingSheet}
                        id="sync-sheet-orders-btn"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                        <span>{isSyncingSheet ? 'Syncing...' : 'Sync from Google Sheet'}</span>
                      </button>
                    </div>
                  </div>

                  {syncFeedback && (
                    <div className="p-3 bg-stone-100 border border-stone-300 rounded-lg text-xs text-stone-800 flex items-center justify-between">
                      <span>{syncFeedback}</span>
                      <button onClick={() => setSyncFeedback('')} className="text-stone-500 hover:text-stone-900">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Orders Table */}
                  <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 uppercase font-bold tracking-wider">
                          <tr>
                            <th className="p-3.5">Order ID</th>
                            <th className="p-3.5">Customer & Contact</th>
                            <th className="p-3.5">Delivery Address</th>
                            <th className="p-3.5">Items</th>
                            <th className="p-3.5">Total COD</th>
                            <th className="p-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-stone-500">
                                No orders logged yet. Place an order on the landing page to test.
                              </td>
                            </tr>
                          ) : (
                            orders
                              .filter((o) => {
                                if (!o) return false;
                                const term = (orderSearch || '').toLowerCase().trim();
                                if (!term) return true;
                                const cName = String(o.customerName || (o as any).fullName || (o as any).name || '').toLowerCase();
                                const cPhone = String(o.phone || '').toLowerCase();
                                const cAddr = String(o.address || (o as any).deliveryAddress || '').toLowerCase();
                                const cId = String(o.id || (o as any).orderId || '').toLowerCase();
                                return cName.includes(term) || cPhone.includes(term) || cAddr.includes(term) || cId.includes(term);
                              })
                              .map((order, oIdx) => {
                                const orderId = order.id || (order as any).orderId || `ASH-ORD-${oIdx + 1}`;
                                const custName = order.customerName || (order as any).fullName || (order as any).name || 'Valued Customer';
                                const phone = order.phone || 'N/A';
                                const address = order.address || (order as any).deliveryAddress || 'Address not provided';
                                const notes = order.notes || '';
                                const safePrice = Number(order.totalPrice) || 0;
                                const safeItems = Array.isArray(order.items) && order.items.length > 0
                                  ? order.items
                                  : [{ id: `it-${oIdx}`, title: (order as any).itemsSummary || 'Himalayan Herbal Product', price: safePrice, quantity: 1 }];
                                const safeDate = (() => {
                                  const rawDate = order.createdAt || (order as any).timestamp;
                                  if (!rawDate) return 'Recent';
                                  try {
                                    const d = new Date(rawDate);
                                    return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString();
                                  } catch {
                                    return 'Recent';
                                  }
                                })();
                                const safeStatus = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'].includes(order.status)
                                  ? order.status
                                  : 'Pending';

                                return (
                                  <tr key={orderId} className="hover:bg-stone-50/80 transition-colors">
                                    <td className="p-3.5 font-mono font-bold text-stone-900">
                                      {orderId}
                                      <span className="block text-[10px] text-stone-400 font-sans font-normal">
                                        {safeDate}
                                      </span>
                                    </td>
                                    <td className="p-3.5">
                                      <div className="font-bold text-stone-900">{custName}</div>
                                      <div className="text-stone-500 text-[11px] font-mono">{phone}</div>
                                      {order.email && (
                                        <div className="text-[10px] text-stone-400">{order.email}</div>
                                      )}
                                    </td>
                                    <td className="p-3.5 max-w-xs text-stone-700 leading-snug">
                                      <div>{address}</div>
                                      {notes && (
                                        <div className="text-[10px] text-amber-800 italic mt-0.5">
                                          Note: {notes}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3.5 max-w-xs text-stone-600">
                                      <div className="space-y-0.5">
                                        {safeItems.map((it, idx) => (
                                          <div key={idx} className="truncate">
                                            {(it && (it.title || (it as any).name)) || 'Product'} × {(it && it.quantity) || 1}
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="p-3.5 font-extrabold text-stone-900 text-sm font-mono">
                                      PKR {safePrice.toLocaleString()}
                                      <span className="block text-[10px] text-emerald-700 font-sans font-normal">
                                        COD Free Delivery
                                      </span>
                                    </td>
                                    <td className="p-3.5">
                                      <select
                                        value={safeStatus}
                                        onChange={(e) =>
                                          handleUpdateOrderStatus(orderId, e.target.value as any)
                                        }
                                        className={`px-2 py-1 rounded text-[11px] font-bold border focus:outline-none ${
                                          safeStatus === 'Delivered'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                            : safeStatus === 'Dispatched'
                                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                                            : 'bg-amber-50 text-amber-800 border-amber-300'
                                        }`}
                                      >
                                        <option value="Pending">Pending COD</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Dispatched">Dispatched</option>
                                        <option value="Delivered">Delivered</option>
                                      </select>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: TAXONOMY */}
              {activeTab === 'taxonomy' && (
                <div className="space-y-6">
                  {/* Title Banner */}
                  <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-xl space-y-2 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-stone-700/60 rounded-lg text-emerald-400">
                        <AtSign className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold font-serif tracking-wide">Categories & Tags</h2>
                    </div>
                    <p className="text-sm text-stone-300">
                      Manage product categories and promotional tags. These will appear as options when adding new products.
                    </p>
                  </div>

                  {taxonomySaveMessage && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{taxonomySaveMessage}</span>
                    </div>
                  )}

                  {taxonomySaveError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{taxonomySaveError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveTaxonomy} className="space-y-6">
                    {/* Categories Card */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Manage Categories</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {taxonomyData.categories.map((cat, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700">
                            <span>{cat}</span>
                            <button
                              type="button"
                              onClick={() => setTaxonomyData({ ...taxonomyData, categories: taxonomyData.categories.filter(c => c !== cat) })}
                              className="text-stone-400 hover:text-red-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="New category name"
                          id="new-category-input"
                          className="flex-1 px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white max-w-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val && !taxonomyData.categories.includes(val)) {
                                setTaxonomyData({ ...taxonomyData, categories: [...taxonomyData.categories, val] });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('new-category-input') as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val && !taxonomyData.categories.includes(val)) {
                              setTaxonomyData({ ...taxonomyData, categories: [...taxonomyData.categories, val] });
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Add Category
                        </button>
                      </div>
                    </div>

                    {/* Tags Card */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                        <AtSign className="w-4 h-4 text-amber-600" />
                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Manage Product Tags</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {taxonomyData.tags.map((tag, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800">
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => setTaxonomyData({ ...taxonomyData, tags: taxonomyData.tags.filter(t => t !== tag) })}
                              className="text-amber-500 hover:text-red-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="New tag name (e.g. Best Seller)"
                          id="new-tag-input"
                          className="flex-1 px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white max-w-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val && !taxonomyData.tags.includes(val)) {
                                setTaxonomyData({ ...taxonomyData, tags: [...taxonomyData.tags, val] });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('new-tag-input') as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val && !taxonomyData.tags.includes(val)) {
                              setTaxonomyData({ ...taxonomyData, tags: [...taxonomyData.tags, val] });
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSavingTaxonomy}
                        className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSavingTaxonomy ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Save Taxonomy Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: CONTACT & WHATSAPP SETTINGS */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  {/* Title Banner */}
                  <div className="p-6 bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 text-white rounded-xl space-y-2 border border-emerald-900/40 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-800/60 rounded-lg text-emerald-300">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold font-serif">Site Contact Information & WhatsApp</h3>
                    </div>
                    <p className="text-stone-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                      Update your store contact information. When you change the WhatsApp number below, it immediately updates across your entire storefront: the floating <strong className="text-emerald-400">Chat Us</strong> button, the <strong className="text-emerald-400">Contact & Consultation</strong> section, and the <strong className="text-emerald-400">Footer</strong>.
                    </p>
                  </div>

                  {/* Feedback alerts */}
                  {contactSaveMessage && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{contactSaveMessage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setContactSaveMessage('')}
                        className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {contactSaveError && (
                    <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-medium">{contactSaveError}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(contactSaveError.toLowerCase().includes('authoriz') || contactSaveError.toLowerCase().includes('unauthorized')) && (
                          <button
                            type="button"
                            onClick={() => {
                              setPendingRetryAction(() => () => handleSaveContact());
                              setShowReauthModal(true);
                            }}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
                          >
                            Authorize Session
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setContactSaveError('')}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveContact} className="space-y-6">
                    {/* WhatsApp Primary Card */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-sm font-bold text-stone-900 font-serif">
                            WhatsApp Chat Us Configuration
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded uppercase">
                          Live Sync Active
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            WhatsApp Number *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={contactData.whatsappNumber}
                              onChange={(e) =>
                                setContactData({ ...contactData, whatsappNumber: e.target.value })
                              }
                              placeholder="+92 310 9415571 or 0310 9415571"
                              className="w-full px-3.5 py-2.5 text-xs font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                              required
                            />
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1">
                            Accepts Pakistani mobile numbers (e.g. <span className="font-mono text-stone-700">+92 310 9415571</span> or <span className="font-mono text-stone-700">03109415571</span>).
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Click-to-Chat Test & Link Preview
                          </label>
                          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-stone-700 truncate">
                              wa.me/{formatWhatsAppUrlDigits(contactData.whatsappNumber)}
                            </span>
                            <a
                              href={`https://wa.me/${formatWhatsAppUrlDigits(
                                contactData.whatsappNumber
                              )}?text=${encodeURIComponent(
                                contactData.quickWhatsAppMessage || DEFAULT_CONTACT_INFO.quickWhatsAppMessage
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                            >
                              <span>Test Chat</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1">
                            Opens WhatsApp directly with the pre-filled inquiry greeting below.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                          Default WhatsApp Greeting / Inquiry Message
                        </label>
                        <textarea
                          rows={2}
                          value={contactData.quickWhatsAppMessage}
                          onChange={(e) =>
                            setContactData({ ...contactData, quickWhatsAppMessage: e.target.value })
                          }
                          placeholder="Salam IronAsh! I have an inquiry about your Himalayan Shilajit products."
                          className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                        />
                        <p className="text-[11px] text-stone-500 mt-1">
                          This text is automatically pre-filled in the customer&apos;s WhatsApp input when they click the Chat Us button.
                        </p>
                      </div>
                    </div>

                    {/* Support & Storefront Details Card */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-stone-900 font-serif">
                          Storefront Support & Location Information
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Customer Support Phone
                          </label>
                          <input
                            type="text"
                            value={contactData.supportPhone}
                            onChange={(e) =>
                              setContactData({ ...contactData, supportPhone: e.target.value })
                            }
                            placeholder="+92 310 9415571"
                            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Support Email
                          </label>
                          <input
                            type="email"
                            value={contactData.supportEmail}
                            onChange={(e) =>
                              setContactData({ ...contactData, supportEmail: e.target.value })
                            }
                            placeholder="support@ironash.pk"
                            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Distribution Hub / Location
                          </label>
                          <input
                            type="text"
                            value={contactData.hubLocation}
                            onChange={(e) =>
                              setContactData({ ...contactData, hubLocation: e.target.value })
                            }
                            placeholder="Skardu & Islamabad Distribution Hub"
                            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Working Hours
                          </label>
                          <input
                            type="text"
                            value={contactData.workingHours}
                            onChange={(e) =>
                              setContactData({ ...contactData, workingHours: e.target.value })
                            }
                            placeholder="Mon - Sat: 9:00 AM - 8:00 PM PKT"
                            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Reset contact information to default values?')) {
                            setContactData(DEFAULT_CONTACT_INFO);
                          }
                        }}
                        className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                      >
                        Reset to default IronAsh contact details
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingContact}
                        id="save-contact-settings-btn"
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSavingContact ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating Site...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Save Contact Details</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: HERO & SITE LOGO BRANDING */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  {/* Title Banner */}
                  <div className="p-6 bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white rounded-xl space-y-2 border border-emerald-900/40 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-800/60 rounded-lg text-emerald-300">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold font-serif">Hero Banner Image & Site Logo</h3>
                    </div>
                    <p className="text-stone-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                      Customize your store&apos;s storefront visual identity. Upload or change the high-resolution Himalayan Hero background image, headlines, and header site logo with immediate site-wide synchronization.
                    </p>
                  </div>

                  {/* Feedback alerts */}
                  {brandingSaveMessage && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{brandingSaveMessage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBrandingSaveMessage('')}
                        className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {brandingSaveError && (
                    <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-medium">{brandingSaveError}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(brandingSaveError.toLowerCase().includes('authoriz') ||
                          brandingSaveError.toLowerCase().includes('unauthorized')) && (
                          <button
                            type="button"
                            onClick={() => {
                              setPendingRetryAction(() => () => handleSaveBranding());
                              setShowReauthModal(true);
                            }}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
                          >
                            Authorize Session
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setBrandingSaveError('')}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveBranding} className="space-y-6">
                    {/* SECTION 1: SITE LOGO & BRAND NAME */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Mountain className="w-4 h-4 text-emerald-700" />
                          <h4 className="text-sm font-bold text-stone-900 font-serif">
                            Store Logo & Brand Name
                          </h4>
                        </div>
                        <span className="text-[11px] text-stone-500">
                          Appears in header, mobile menu, and order receipts
                        </span>
                      </div>

                      {/* Live Logo Preview */}
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                            Current Header Preview:
                          </span>
                          <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-lg border border-stone-200 shadow-xs">
                            {brandingData.siteLogoUrl ? (
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center">
                                <img
                                  src={brandingData.siteLogoUrl}
                                  alt={brandingData.siteLogoText || 'Site Logo'}
                                  className="w-full h-full object-contain p-1"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                                <Mountain className="h-5 w-5 text-emerald-100" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-base font-extrabold text-emerald-950 font-serif tracking-tight">
                                {brandingData.siteLogoText || 'IronAsh'}
                              </span>
                              <span className="text-[9px] uppercase font-semibold text-emerald-700 tracking-wider">
                                Himalayan Herbs
                              </span>
                            </div>
                          </div>
                        </div>

                        {brandingData.siteLogoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setBrandingData({ ...brandingData, siteLogoUrl: '' })
                            }
                            className="text-xs text-stone-500 hover:text-red-600 font-medium underline cursor-pointer"
                          >
                            Remove custom logo (Restore Mountain emblem)
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Brand Name */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Brand Display Title
                          </label>
                          <input
                            type="text"
                            value={brandingData.siteLogoText || ''}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, siteLogoText: e.target.value })
                            }
                            placeholder="e.g. IronAsh"
                            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                          <p className="text-[11px] text-stone-500 mt-1">
                            Displayed beside the logo icon in the website header.
                          </p>
                        </div>

                        {/* Logo Image File / URL */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Upload Logo File or Enter URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={brandingData.siteLogoUrl || ''}
                              onChange={(e) =>
                                setBrandingData({ ...brandingData, siteLogoUrl: e.target.value })
                              }
                              placeholder="https://... or click Upload"
                              className="flex-1 px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white font-mono"
                            />
                            <label className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
                              {isUploadingLogo ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                onChange={handleLogoFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1">
                            Paste an image URL or choose a file from your device.
                          </p>
                        </div>
                      </div>

                      {/* Explicit Image Dimensions & Format Hints for Logo */}
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-emerald-700" />
                          <span>Logo Upload Dimensions & Best Practices</span>
                        </div>
                        <ul className="text-[11px] text-stone-600 space-y-1 list-disc list-inside">
                          <li>
                            <strong>Recommended Dimensions:</strong> <span className="font-mono text-emerald-900 font-semibold">200 × 200 px</span> (1:1 square icon) or <span className="font-mono text-emerald-900 font-semibold">240 × 60 px</span> (horizontal emblem).
                          </li>
                          <li>
                            <strong>Recommended File Format:</strong> Transparent PNG (<code className="font-mono">.png</code>) or SVG (<code className="font-mono">.svg</code>) for crispness on high-DPI and mobile displays.
                          </li>
                          <li>
                            <strong>Max File Size:</strong> Under <span className="font-semibold text-emerald-900">500 KB</span> ensures instantaneous header rendering and zero layout shift.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* SECTION 2: HERO BANNER IMAGE & HEADINGS */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-700" />
                          <h4 className="text-sm font-bold text-stone-900 font-serif">
                            Hero Banner Image & Content
                          </h4>
                        </div>
                        <span className="text-[11px] text-stone-500">
                          Main homepage banner above the fold
                        </span>
                      </div>

                      {/* Live Hero Banner Preview Box */}
                      <div className="relative rounded-xl overflow-hidden min-h-[200px] sm:min-h-[240px] bg-emerald-950 text-white flex flex-col justify-end p-6 border border-emerald-900/60 shadow-inner">
                        {/* Background preview image */}
                        <div className="absolute inset-0 z-0">
                          <img
                            src={
                              brandingData.heroImageUrl?.trim() ||
                              DEFAULT_BRANDING_CONFIG.heroImageUrl!
                            }
                            alt="Hero Banner Preview"
                            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/80 to-emerald-900/60" />
                        </div>

                        {/* Foreground Preview Text */}
                        <div className="relative z-10 space-y-2 max-w-xl">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-[10px] font-semibold tracking-wider">
                            LIVE HERO PREVIEW
                          </span>
                          <h3 className="text-xl sm:text-2xl font-extrabold font-serif text-white leading-tight">
                            {brandingData.heroTitle || DEFAULT_BRANDING_CONFIG.heroTitle}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-200 line-clamp-2">
                            {brandingData.heroSubtitle || DEFAULT_BRANDING_CONFIG.heroSubtitle}
                          </p>
                        </div>
                      </div>

                      {/* Hero Image File or URL */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                          Hero Image File or CDN URL *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={brandingData.heroImageUrl || ''}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, heroImageUrl: e.target.value })
                            }
                            placeholder="https://images.unsplash.com/... or click Upload"
                            className="flex-1 px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white font-mono"
                          />
                          <label className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs">
                            {isUploadingHero ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>Upload Hero Image</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/webp,image/png"
                              onChange={handleHeroFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          You can upload any local high-res image or paste an external URL (Unsplash, Cloudinary, CDN).
                        </p>
                      </div>

                      {/* Curated Himalayan Landscape Presets */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                          One-Click High-Res Mountain Presets:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            {
                              name: 'Karakoram & Skardu',
                              desc: 'Pristine mountain peaks (Original)',
                              url: 'https://cdn.b12.io/client_media/DGYgvmni/5c0902fe-a6d6-11f1-9c9e-0242ac110002-FcA6R4ZesbwT38oRfKKm0_HbbcI48D.jpg',
                            },
                            {
                              name: 'K2 Sunset Glow',
                              desc: 'Golden alpine ridges',
                              url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
                            },
                            {
                              name: 'Misty Gilgit Valley',
                              desc: 'Moody lush mountain range',
                              url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
                            },
                            {
                              name: 'Alpine High Ridge',
                              desc: 'Crisp snow peaks',
                              url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80',
                            },
                          ].map((preset, idx) => {
                            const isSelected = brandingData.heroImageUrl === preset.url;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setBrandingData({
                                    ...brandingData,
                                    heroImageUrl: preset.url,
                                  })
                                }
                                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-600/30'
                                    : 'border-stone-200 hover:border-stone-400 bg-stone-50'
                                }`}
                              >
                                <div className="text-xs font-bold text-stone-900 truncate">
                                  {preset.name}
                                </div>
                                <div className="text-[10px] text-stone-500 truncate mt-0.5">
                                  {preset.desc}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Headings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Hero Main Headline
                          </label>
                          <input
                            type="text"
                            value={brandingData.heroTitle || ''}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, heroTitle: e.target.value })
                            }
                            placeholder="Ancient Wisdom, Modern Wellness"
                            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white font-serif font-bold text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Hero Subtitle / Description
                          </label>
                          <input
                            type="text"
                            value={brandingData.heroSubtitle || ''}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, heroSubtitle: e.target.value })
                            }
                            placeholder="Discover the power of pure Himalayan herbs..."
                            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>
                      </div>

                      {/* Explicit Image Dimensions & Format Hints for Hero */}
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-emerald-700" />
                          <span>Hero Image Upload Dimensions & Technical Guidelines</span>
                        </div>
                        <ul className="text-[11px] text-stone-600 space-y-1 list-disc list-inside">
                          <li>
                            <strong>Recommended Dimensions:</strong> <span className="font-mono text-emerald-900 font-semibold">1920 × 800 px</span> or <span className="font-mono text-emerald-900 font-semibold">1920 × 1080 px</span> (minimum <span className="font-mono text-emerald-900 font-semibold">1440 × 600 px</span> for mobile/tablet responsive scaling).
                          </li>
                          <li>
                            <strong>Recommended Aspect Ratio:</strong> <span className="font-semibold text-emerald-900">16:9 widescreen or 2.4:1 cinematic banner</span>.
                          </li>
                          <li>
                            <strong>Recommended Format:</strong> <code className="font-mono">WebP</code> or high-quality <code className="font-mono">JPG</code>.
                          </li>
                          <li>
                            <strong>Automatic Contrast Vignette:</strong> The storefront automatically places a deep emerald vignette gradient over the image, ensuring headline text and CTA buttons remain fully readable and WCAG AA compliant regardless of image brightness.
                          </li>
                          <li>
                            <strong>Optimization Tip:</strong> Keep the file size under <span className="font-semibold text-emerald-900">2.5 MB</span> to ensure instantaneous First Contentful Paint (FCP) across Pakistan 4G/mobile networks.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              'Reset Hero image, headlines, and site logo to original default branding?'
                            )
                          ) {
                            setBrandingData(DEFAULT_BRANDING_CONFIG);
                          }
                        }}
                        className="text-xs text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer"
                      >
                        Reset to Original Defaults
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingBranding}
                        id="save-branding-settings-btn"
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSavingBranding ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating Branding...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Save Hero & Logo Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: ORDER EMAIL ALERTS & SMTP */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  {/* Title Banner */}
                  <div className="p-6 bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white rounded-xl space-y-2 border border-emerald-900/40 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-800/60 rounded-lg text-emerald-300">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold font-serif">Order Email Notifications & SMTP</h3>
                    </div>
                    <p className="text-stone-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                      Configure automated transactional emails for your store. When an order is placed, an HTML order invoice receipt is sent to the customer, and a notification alert is sent to you.
                    </p>
                  </div>

                  {/* Feedback alerts */}
                  {emailSaveMessage && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{emailSaveMessage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailSaveMessage('')}
                        className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {emailSaveError && (
                    <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-medium">{emailSaveError}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(emailSaveError.toLowerCase().includes('authoriz') || emailSaveError.toLowerCase().includes('unauthorized')) && (
                          <button
                            type="button"
                            onClick={() => {
                              setPendingRetryAction(() => () => handleSaveEmail());
                              setShowReauthModal(true);
                            }}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
                          >
                            Authorize Session
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEmailSaveError('')}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveEmail} className="space-y-6">
                    {/* SECTION 1: NOTIFICATION RULES */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                        <Send className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-stone-900 font-serif">
                          Automated Order Notifications
                        </h4>
                      </div>

                      <div className="space-y-4">
                        {/* Store Owner Alert */}
                        <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailConfig.notifyAdminOnNewOrder}
                              onChange={(e) =>
                                setEmailConfig({
                                  ...emailConfig,
                                  notifyAdminOnNewOrder: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-700 mt-0.5 cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-stone-900 block">
                                Receive an email for each order received (Store Owner Notification)
                              </span>
                              <span className="text-[11px] text-stone-600 block mt-0.5">
                                Dispatches an instant alert with customer name, phone, address, item details, and total amount to your inbox.
                              </span>
                            </div>
                          </label>

                          <div className="pl-7 pt-2 border-t border-emerald-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                                Your Notification Email Address *
                              </label>
                              <input
                                type="email"
                                value={emailConfig.adminNotificationEmail}
                                onChange={(e) => {
                                  setEmailConfig({
                                    ...emailConfig,
                                    adminNotificationEmail: e.target.value,
                                  });
                                  setTestEmailAddress(e.target.value);
                                }}
                                placeholder="it.qhamc@gmail.com"
                                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                                required
                              />
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center">
                              Order alerts will be immediately routed to this email address.
                            </div>
                          </div>
                        </div>

                        {/* Customer Order Receipt */}
                        <div className="p-4 rounded-lg border border-stone-200 bg-stone-50/70 space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailConfig.notifyCustomerOnNewOrder}
                              onChange={(e) =>
                                setEmailConfig({
                                  ...emailConfig,
                                  notifyCustomerOnNewOrder: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-700 mt-0.5 cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-stone-900 block">
                                Send an email to the customer after order is placed (Customer Invoice / Receipt)
                              </span>
                              <span className="text-[11px] text-stone-600 block mt-0.5">
                                Automatically emails an order confirmation receipt to the customer whenever they enter their email address during COD checkout.
                              </span>
                            </div>
                          </label>

                          <div className="pl-7 pt-2 border-t border-stone-200">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                              Custom Note to Customer in Receipt
                            </label>
                            <input
                              type="text"
                              value={emailConfig.customerEmailNote || ''}
                              onChange={(e) =>
                                setEmailConfig({
                                  ...emailConfig,
                                  customerEmailNote: e.target.value,
                                })
                              }
                              placeholder="Thank you for ordering with IronAsh Himalayan Herbs. Our courier will call you before delivery."
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sender Identity */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Sender Display Name
                          </label>
                          <input
                            type="text"
                            value={emailConfig.senderName}
                            onChange={(e) =>
                              setEmailConfig({ ...emailConfig, senderName: e.target.value })
                            }
                            placeholder="IronAsh Himalayan Shilajit"
                            className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            From Email Address
                          </label>
                          <input
                            type="email"
                            value={emailConfig.fromEmail}
                            onChange={(e) =>
                              setEmailConfig({ ...emailConfig, fromEmail: e.target.value })
                            }
                            placeholder="orders@ironash.pk or it.qhamc@gmail.com"
                            className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SMTP SERVER CONFIGURATION */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <AtSign className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-sm font-bold text-stone-900 font-serif">
                            Outgoing SMTP Mail Server Settings
                          </h4>
                        </div>
                        {/* Preset Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEmailConfig({
                                ...emailConfig,
                                smtpHost: 'smtp.gmail.com',
                                smtpPort: 587,
                                smtpSecure: false,
                              });
                            }}
                            className="text-[11px] font-semibold px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors"
                          >
                            Use Gmail Preset (Port 587)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEmailConfig({
                                ...emailConfig,
                                smtpHost: 'smtp.gmail.com',
                                smtpPort: 465,
                                smtpSecure: true,
                              });
                            }}
                            className="text-[11px] font-semibold px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors"
                          >
                            SSL Port 465
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            SMTP Host
                          </label>
                          <input
                            type="text"
                            value={emailConfig.smtpHost}
                            onChange={(e) =>
                              setEmailConfig({ ...emailConfig, smtpHost: e.target.value })
                            }
                            placeholder="smtp.gmail.com"
                            className="w-full px-3.5 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            Port
                          </label>
                          <input
                            type="number"
                            value={emailConfig.smtpPort}
                            onChange={(e) =>
                              setEmailConfig({
                                ...emailConfig,
                                smtpPort: parseInt(e.target.value) || 587,
                              })
                            }
                            placeholder="587"
                            className="w-full px-3.5 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            SMTP Username / Email
                          </label>
                          <input
                            type="text"
                            value={emailConfig.smtpUser}
                            onChange={(e) =>
                              setEmailConfig({ ...emailConfig, smtpUser: e.target.value })
                            }
                            placeholder="e.g. it.qhamc@gmail.com"
                            className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                            SMTP Password / App Password
                          </label>
                          <div className="relative">
                            <input
                              type={showSmtpPassword ? 'text' : 'password'}
                              value={emailConfig.smtpPass}
                              onChange={(e) =>
                                setEmailConfig({ ...emailConfig, smtpPass: e.target.value })
                              }
                              placeholder="16-character App Password"
                              className="w-full pl-3.5 pr-10 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                            >
                              {showSmtpPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1">
                            For Gmail: generate a 16-character <span className="font-semibold text-stone-700">App Password</span> under your Google Account Security settings.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailConfig.smtpSecure}
                            onChange={(e) =>
                              setEmailConfig({ ...emailConfig, smtpSecure: e.target.checked })
                            }
                            className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-700 cursor-pointer"
                          />
                          <span className="text-xs text-stone-700">
                            Use SSL/TLS secure connection (Enable if using port 465; leave unchecked for port 587 STARTTLS)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* SECTION 3: INSTANT TEST DISPATCH */}
                    <div className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-emerald-700" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                            Send Instant Test Email
                          </h4>
                        </div>
                        <span className="text-[11px] text-stone-500">
                          Verify credentials before saving
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          placeholder="Recipient email address (e.g. it.qhamc@gmail.com)"
                          className="flex-1 px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleSendTestEmail}
                          disabled={isSendingTestEmail}
                          className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                        >
                          {isSendingTestEmail ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending Test...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Test Email</span>
                            </>
                          )}
                        </button>
                      </div>

                      {testEmailResult && (
                        <div
                          className={`p-3 rounded-lg text-xs flex items-center justify-between gap-2 ${
                            testEmailResult.success
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-red-100 text-red-900 border border-red-300'
                          }`}
                        >
                          <div className="flex items-start gap-2 flex-1">
                            {testEmailResult.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                            )}
                            <div className="font-medium">{testEmailResult.message}</div>
                          </div>
                          {!testEmailResult.success &&
                            testEmailResult.message &&
                            (testEmailResult.message.toLowerCase().includes('authoriz') ||
                              testEmailResult.message.toLowerCase().includes('unauthorized')) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPendingRetryAction(() => () => handleSendTestEmail());
                                  setShowReauthModal(true);
                                }}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition shrink-0"
                              >
                                Authorize Session
                              </button>
                            )}
                        </div>
                      )}
                    </div>

                    {/* SECTION 4: GOOGLE APPS SCRIPT AUTOMATED NOTIFICATIONS (ZERO SETUP) */}
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-stone-700 space-y-1.5">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                        <span>Built-in Google Apps Script Fallback Delivery</span>
                      </div>
                      <p className="leading-relaxed text-[11px] text-stone-600">
                        When you connect your Google Sheet in the <strong>Google Sheets Integration</strong> tab, our updated Google Apps Script template also includes automated native <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-950">MailApp.sendEmail()</code> logic. This means order notifications can also be sent directly from your Google account with zero SMTP setup!
                      </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Reset email configuration to default values?')) {
                            setEmailConfig(DEFAULT_EMAIL_CONFIG);
                          }
                        }}
                        className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                      >
                        Reset to default email settings
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingEmail}
                        id="save-email-settings-btn"
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSavingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving Settings...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Save Email Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: GOOGLE SHEETS */}
              {activeTab === 'sheets' && (
                <div className="space-y-8">
                  {/* Intro Banner */}
                  <div className="p-6 bg-emerald-900 text-white rounded-xl space-y-3 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
                      <h3 className="text-lg font-bold font-serif">Google Sheets Checkout Integration</h3>
                    </div>
                    <p className="text-emerald-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
                      Whenever a customer clicks <strong className="text-white">Confirm Order</strong> on the site, our frontend triggers a JSON POST request containing the Customer Name, Phone, Address, Notes, Items, and Total Price to append a new row directly into your Google Spreadsheet.
                    </p>
                  </div>

                  {/* Web App URL Input & Test */}
                  <div className="p-6 bg-white border border-stone-300 rounded-xl space-y-4 shadow-xs">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1">
                        Google Apps Script Web App URL
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                          value={googleScriptUrl}
                          onChange={(e) => setGoogleScriptUrl(e.target.value)}
                          className="flex-1 px-4 py-2.5 text-xs font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleSaveGoogleUrl}
                          id="save-google-url-btn"
                          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          {urlSavedFeedback ? 'Saved ✓' : 'Save URL'}
                        </button>
                        <button
                          type="button"
                          onClick={handleSendTestWebhook}
                          disabled={testingWebhook}
                          id="test-webhook-btn"
                          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{testingWebhook ? 'Sending...' : 'Send Test Row'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1.5">
                        Orders are safely stored in browser storage and mirrored to your spreadsheet whenever configured.
                      </p>
                    </div>
                  </div>

                  {/* 4-Step Walkthrough */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-[11px]">
                        1
                      </span>
                      <h4 className="font-bold text-stone-900 font-serif">Create Spreadsheet</h4>
                      <p className="text-stone-600 leading-relaxed">
                        Open Google Sheets, create a blank spreadsheet, then open <span className="font-semibold text-stone-800">Extensions &gt; Apps Script</span>.
                      </p>
                    </div>

                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-[11px]">
                        2
                      </span>
                      <h4 className="font-bold text-stone-900 font-serif">Paste Script Code</h4>
                      <p className="text-stone-600 leading-relaxed">
                        Copy the script code below, paste into <code className="font-mono text-stone-800">Code.gs</code>, and save.
                      </p>
                    </div>

                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-[11px]">
                        3
                      </span>
                      <h4 className="font-bold text-stone-900 font-serif">Deploy as Web App</h4>
                      <p className="text-stone-600 leading-relaxed">
                        Click <span className="font-semibold text-stone-800">Deploy &gt; New deployment</span>. Select <span className="font-semibold">Web app</span>, Execute as <span className="font-semibold">&quot;Me&quot;</span>, and Access to <span className="font-semibold text-emerald-800">&quot;Anyone&quot;</span>.
                      </p>
                    </div>

                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-[11px]">
                        4
                      </span>
                      <h4 className="font-bold text-stone-900 font-serif">Paste URL Above</h4>
                      <p className="text-stone-600 leading-relaxed">
                        Copy your Web App deployment URL and paste it into the field above to activate instant Google Sheets syncing.
                      </p>
                    </div>
                  </div>

                  {/* Ready-to-copy Google Apps Script Code block */}
                  <div className="border border-stone-300 rounded-xl overflow-hidden bg-stone-900 text-stone-100">
                    <div className="px-5 py-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-stone-300">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="ml-2 font-semibold">Google Apps Script (Code.gs)</span>
                      </div>
                      <button
                        onClick={handleCopyScriptCode}
                        id="copy-apps-script-btn"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Code Copied!' : 'Copy Script Code'}</span>
                      </button>
                    </div>

                    <pre className="p-5 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                      {GOOGLE_APPS_SCRIPT_TEMPLATE}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 4: PASSWORD & SECURITY */}
              {activeTab === 'security' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Header info */}
                  <div className="p-6 bg-stone-900 text-white rounded-xl space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <Key className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold font-serif">Admin Portal Password</h3>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Update your administrator password to secure access to product prices, stock, Google Sheets webhooks, and customer orders.
                    </p>
                  </div>

                  {/* Feedback Messages */}
                  {passwordChangeSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{passwordChangeSuccess}</span>
                      </div>
                      <button
                        onClick={() => setPasswordChangeSuccess('')}
                        className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {passwordChangeError && (
                    <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-medium">{passwordChangeError}</span>
                      </div>
                      <button
                        onClick={() => setPasswordChangeError('')}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Change Password Form */}
                  <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
                    <h4 className="text-sm font-bold text-stone-900 font-serif border-b border-stone-100 pb-3">
                      Change Admin Password
                    </h4>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                          New Password * (Min. 6 characters)
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min. 6 characters)"
                          className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          required
                          minLength={6}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                          required
                          minLength={6}
                        />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleResetPasswordToDefault}
                          className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                        >
                          Reset to factory default ({DEFAULT_ADMIN_PASSWORD})
                        </button>

                        <button
                          type="submit"
                          id="change-password-submit-btn"
                          disabled={isChangingPassword}
                          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>{isChangingPassword ? 'Saving on Server...' : 'Update Password'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security Details */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 space-y-2">
                    <div className="font-bold text-stone-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Server-Side Salted PBKDF2 Password Protection</span>
                    </div>
                    <p className="leading-relaxed">
                      Your updated administrator password is cryptographically protected on the server using 100,000 rounds of PBKDF2 with SHA-512 and a random 16-byte cryptographic salt. Rate-limiting is enforced to prevent brute-force attacks.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inline Admin Session Authorization Modal */}
        {showReauthModal && (
          <div id="admin-session-reauth-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-serif">Admin Session Authorization</h3>
                    <p className="text-xs text-stone-500">Authorize your session to execute server updates.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReauthModal(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                Your browser may have restricted third-party cookies or your previous session timed out. Please enter your admin password below to authorize:
              </p>

              <form onSubmit={handleInlineReauth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      placeholder="Enter admin password (default: ironash2025)"
                      value={reauthPassword}
                      onChange={(e) => setReauthPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                      required
                    />
                  </div>
                </div>

                {reauthError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reauthError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowReauthModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReauthorizing || !reauthPassword.trim()}
                    className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    {isReauthorizing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Authorizing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
