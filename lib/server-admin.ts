import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { normalizeOrder, normalizeOrdersList } from './order-utils';
import {
  SiteContactInfo,
  DEFAULT_CONTACT_INFO,
  EmailNotificationConfig,
  DEFAULT_EMAIL_CONFIG,
  SiteBrandingConfig,
  DEFAULT_BRANDING_CONFIG,
} from './site-config';

interface AdminConfig {
  googleScriptUrl: string;
  passwordHash: string;
  salt: string;
  updatedAt: string;
  contactInfo?: SiteContactInfo;
  emailConfig?: EmailNotificationConfig;
  brandingConfig?: SiteBrandingConfig;
}

interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
}

interface ServerStore {
  config: AdminConfig;
  sessions: Record<string, AdminSession>;
  failedAttempts: { count: number; lockedUntil: number };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

// Default initial password if not yet configured
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'ironash2025';

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, generatedSalt, 100000, 64, 'sha512').toString('hex');
  return { hash: derivedKey, salt: generatedSalt };
}

function getInitialStore(): ServerStore {
  const { hash, salt } = hashPassword(DEFAULT_PASSWORD);
  return {
    config: {
      googleScriptUrl: process.env.GOOGLE_SCRIPT_URL || '',
      passwordHash: hash,
      salt: salt,
      updatedAt: new Date().toISOString(),
      contactInfo: { ...DEFAULT_CONTACT_INFO },
      emailConfig: { ...DEFAULT_EMAIL_CONFIG },
    },
    sessions: {},
    failedAttempts: { count: 0, lockedUntil: 0 },
  };
}

export function readServerStore(): ServerStore {
  ensureDataDir();
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure all fields exist
      if (!parsed.config) parsed.config = getInitialStore().config;
      if (!parsed.config.contactInfo) parsed.config.contactInfo = { ...DEFAULT_CONTACT_INFO };
      if (!parsed.config.emailConfig) parsed.config.emailConfig = { ...DEFAULT_EMAIL_CONFIG };
      if (!parsed.sessions) parsed.sessions = {};
      if (!parsed.failedAttempts) parsed.failedAttempts = { count: 0, lockedUntil: 0 };
      return parsed;
    }
  } catch (err) {
    console.error('Failed reading admin config file, initializing fallback:', err);
  }

  const initial = getInitialStore();
  writeServerStore(initial);
  return initial;
}

export function writeServerStore(store: ServerStore): void {
  ensureDataDir();
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing admin config file:', err);
  }
}

// Check if login is currently rate-limited
export function isRateLimited(): { limited: boolean; retryAfterSeconds: number } {
  const store = readServerStore();
  const now = Date.now();
  if (store.failedAttempts && store.failedAttempts.lockedUntil > now) {
    const remaining = Math.ceil((store.failedAttempts.lockedUntil - now) / 1000);
    return { limited: true, retryAfterSeconds: remaining };
  }
  return { limited: false, retryAfterSeconds: 0 };
}

// Record login attempt
export function recordLoginAttempt(success: boolean): void {
  const store = readServerStore();
  const now = Date.now();

  if (success) {
    store.failedAttempts = { count: 0, lockedUntil: 0 };
  } else {
    const currentCount = (store.failedAttempts?.count || 0) + 1;
    let lockUntil = 0;
    if (currentCount >= 5) {
      // Lock for 5 minutes after 5 failed attempts
      lockUntil = now + 5 * 60 * 1000;
    }
    store.failedAttempts = { count: currentCount, lockedUntil: lockUntil };
  }
  writeServerStore(store);
}

// Verify password
export function verifyPassword(password: string): boolean {
  const store = readServerStore();
  const { passwordHash, salt } = store.config;

  if (!passwordHash || !salt) {
    // Fallback comparison with default password
    return password === DEFAULT_PASSWORD;
  }

  try {
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const bufA = Buffer.from(testHash, 'hex');
    const bufB = Buffer.from(passwordHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

// Set new password
export function updateAdminPassword(newPassword: string): void {
  const store = readServerStore();
  const { hash, salt } = hashPassword(newPassword);
  store.config.passwordHash = hash;
  store.config.salt = salt;
  store.config.updatedAt = new Date().toISOString();
  writeServerStore(store);
}

// Create a session token
export function createSession(): string {
  const store = readServerStore();
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  // Session valid for 7 days
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000;

  // Clean old sessions
  const cleaned: Record<string, AdminSession> = {};
  for (const [key, sess] of Object.entries(store.sessions || {})) {
    if (sess.expiresAt > now) {
      cleaned[key] = sess;
    }
  }

  cleaned[token] = { token, createdAt: now, expiresAt };
  store.sessions = cleaned;
  writeServerStore(store);

  return token;
}

// Validate session token
export function isValidSession(token: string | null | undefined): boolean {
  if (!token) return false;
  const store = readServerStore();
  const session = store.sessions?.[token];
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    return false;
  }
  return true;
}

// Invalidate session
export function invalidateSession(token: string): void {
  const store = readServerStore();
  if (store.sessions && store.sessions[token]) {
    delete store.sessions[token];
    writeServerStore(store);
  }
}

// Unified validator for admin requests: checks Bearer header, X-Admin-Token, cookies, and X-Admin-Password fallback
export function validateAdminRequest(req: NextRequest): boolean {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const bearerToken = authHeader.replace(/^[Bb]earer\s+/, '').trim();
    const customToken = req.headers.get('x-admin-token')?.trim();
    const cookieToken = req.cookies.get('ironash_admin_session')?.value?.trim();
    const passwordHeader = req.headers.get('x-admin-password')?.trim();

    const token = bearerToken || customToken || cookieToken;

    if (token && isValidSession(token)) {
      return true;
    }

    // Direct password verification in header fallback (useful for cross-origin iframe environments)
    if (passwordHeader && verifyPassword(passwordHeader)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// Get Google Script URL from server store
export function getServerGoogleScriptUrl(): string {
  const store = readServerStore();
  return store.config?.googleScriptUrl || process.env.GOOGLE_SCRIPT_URL || '';
}

// Save Google Script URL to server store
export function setServerGoogleScriptUrl(url: string): void {
  const store = readServerStore();
  if (!store.config) {
    store.config = getInitialStore().config;
  }
  store.config.googleScriptUrl = url.trim();
  store.config.updatedAt = new Date().toISOString();
  writeServerStore(store);
}

// Contact Information getters and setters
export function getServerContactInfo(): SiteContactInfo {
  const store = readServerStore();
  return store.config?.contactInfo || { ...DEFAULT_CONTACT_INFO };
}

export function setServerContactInfo(info: Partial<SiteContactInfo>): SiteContactInfo {
  const store = readServerStore();
  if (!store.config) {
    store.config = getInitialStore().config;
  }
  const merged: SiteContactInfo = {
    ...DEFAULT_CONTACT_INFO,
    ...(store.config.contactInfo || {}),
    ...info,
  };
  store.config.contactInfo = merged;
  store.config.updatedAt = new Date().toISOString();
  writeServerStore(store);
  return merged;
}

// Email Notification Settings getters and setters
export function getServerEmailConfig(): EmailNotificationConfig {
  const store = readServerStore();
  return store.config?.emailConfig || { ...DEFAULT_EMAIL_CONFIG };
}

export function setServerEmailConfig(config: Partial<EmailNotificationConfig>): EmailNotificationConfig {
  const store = readServerStore();
  if (!store.config) {
    store.config = getInitialStore().config;
  }
  const merged: EmailNotificationConfig = {
    ...DEFAULT_EMAIL_CONFIG,
    ...(store.config.emailConfig || {}),
    ...config,
  };
  store.config.emailConfig = merged;
  store.config.updatedAt = new Date().toISOString();
  writeServerStore(store);
  return merged;
}

// Site Branding Configuration getters and setters (Hero image, Site Logo)
export function getServerBrandingConfig(): SiteBrandingConfig {
  const store = readServerStore();
  return store.config?.brandingConfig || { ...DEFAULT_BRANDING_CONFIG };
}

export function setServerBrandingConfig(config: Partial<SiteBrandingConfig>): SiteBrandingConfig {
  const store = readServerStore();
  if (!store.config) {
    store.config = getInitialStore().config;
  }
  const merged: SiteBrandingConfig = {
    ...DEFAULT_BRANDING_CONFIG,
    ...(store.config.brandingConfig || {}),
    ...config,
  };
  store.config.brandingConfig = merged;
  store.config.updatedAt = new Date().toISOString();
  writeServerStore(store);
  return merged;
}

const ORDERS_FILE = path.join(DATA_DIR, 'server-orders.json');

export function getServerOrders(): any[] {
  ensureDataDir();
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return normalizeOrdersList(parsed);
    }
  } catch (err) {
    console.error('Failed reading server orders:', err);
  }
  return [];
}

export function addServerOrder(order: any): void {
  ensureDataDir();
  try {
    const orders = getServerOrders();
    const normalized = normalizeOrder(order);
    // Prepend new order
    orders.unshift(normalized);
    // Keep last 500 orders
    const trimmed = orders.slice(0, 500);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving server order:', err);
  }
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'server-products.json');

export function getServerProducts(): any[] | null {
  ensureDataDir();
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading server products:', err);
  }
  return null;
}

export function saveServerProducts(products: any[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving server products:', err);
  }
}

