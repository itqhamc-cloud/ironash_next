import { Product, Order } from '@/types/timber';
import { normalizeOrdersList } from './order-utils';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Pure Himalayan Shilajit Resin (Gold Grade)',
    name: 'Pure Himalayan Shilajit Resin (Gold Grade)',
    description: 'Authentic high-altitude Shilajit resin harvested at 16,000+ ft in Gilgit-Baltistan. Lab-tested with 70%+ fulvic acid and 85+ ionic trace minerals for natural stamina, mental clarity, and vitality.',
    price: 3500,
    originalPrice: 4500,
    discountPercent: 22,
    unit: '20g Glass Jar',
    category: 'Shilajit',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=1200&q=85',
    ],
    origin: 'Gilgit-Baltistan (16,000+ ft)',
    tags: ['70%+ Fulvic Acid'],
    stock: 14,
    batchNumber: 'Batch #SK-841 (Karakoram Harvest)',
    inStock: true,
    rating: 4.9,
    reviewsCount: 184,
    harvestAltitude: '16,200 ft (Karakoram Range)',
    labTested: true,
    benefits: [
      'Natural stamina & cellular ATP energy production',
      'Supports healthy testosterone & physical endurance',
      'Cognitive clarity, focus & brain function',
      '85+ essential ionic minerals for deep revitalization',
    ],
    usageInstructions:
      'Dissolve a pea-sized portion (300-500mg) using the included wooden spatula into warm water, raw milk, or green tea once daily on an empty stomach in the morning.',
  },
  {
    id: 'prod-2',
    title: 'Organic Himalayan Ashwagandha Root Powder',
    name: 'Organic Himalayan Ashwagandha Root Powder',
    description: 'Pure full-spectrum Himalayan Withania Somnifera root powder. Helps naturally reduce cortisol, relieve everyday stress, enhance deep restorative sleep, and strengthen vitality.',
    price: 2200,
    originalPrice: 2800,
    discountPercent: 21,
    unit: '100g Resealable Pouch',
    category: 'Herbs',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=1200&q=85',
    ],
    origin: 'Himalayan Foothills',
    tags: ['100% Certified Organic'],
    stock: 19,
    batchNumber: 'Batch #ASH-2409',
    inStock: true,
    rating: 4.8,
    reviewsCount: 96,
    harvestAltitude: '5,500 ft (Sub-Himalayan belt)',
    labTested: true,
    benefits: [
      'Clinically proven adaptogen that balances cortisol levels',
      'Promotes calm nervous system & deep restorative sleep',
      'Aids muscle recovery and athletic resilience',
      'Non-GMO, vegan, cold-milled to retain full active withanolides',
    ],
    usageInstructions:
      'Mix 1/2 teaspoon (approx. 2-3g) with warm milk, honey, or your favorite smoothie 30 minutes before bedtime.',
  },
  {
    id: 'prod-3',
    title: 'Himalayan Shilajit Veg Capsules (500mg)',
    name: 'Himalayan Shilajit Veg Capsules (500mg)',
    description: 'Purified Himalayan Shilajit standardized with 60% Fulvic Acid in 100% plant-based vegetarian capsules. Portable daily energy and endurance with zero bitter taste.',
    price: 2900,
    originalPrice: 3600,
    discountPercent: 19,
    unit: '60 Veg Capsules',
    category: 'Capsules',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1200&q=85',
    ],
    origin: 'High Altitude Himalayas',
    tags: ['Standardized 60% Fulvic'],
    stock: 8,
    batchNumber: 'Batch #CAP-552',
    inStock: true,
    rating: 4.9,
    reviewsCount: 112,
    harvestAltitude: '15,500 ft',
    labTested: true,
    benefits: [
      'Mess-free convenient dosage for active lifestyles & travel',
      'Zero strong earthy taste or measuring required',
      '100% vegetarian cellulose capsules',
      'Rapid absorption for all-day steady physical vitality',
    ],
    usageInstructions:
      'Take 1 capsule twice daily with meals or a full glass of water. Store in a cool, dry place away from direct sunlight.',
  },
  {
    id: 'prod-4',
    title: 'Pure Kashmiri Mongra Saffron (Grade A1+)',
    name: 'Pure Kashmiri Mongra Saffron (Grade A1+)',
    description: 'Hand-picked Grade 1 pure all-red stigma filaments of Himalayan Crocus Sativus. Renowned for natural antioxidant mood support, radiant complexion, and aromatic wellness teas.',
    price: 4200,
    originalPrice: 5200,
    discountPercent: 19,
    unit: '5g Sealed Crystal Jar',
    category: 'Herbs',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=1200&q=85',
    ],
    origin: 'Kashmir Valley',
    tags: ['ISO 3632 Grade 1'],
    stock: 6,
    batchNumber: 'Batch #KSH-102',
    inStock: true,
    rating: 5.0,
    reviewsCount: 67,
    harvestAltitude: '6,200 ft (Pampore Plateau)',
    labTested: true,
    benefits: [
      'All-red Mongra stigmas with zero yellow styles or filler',
      'Potent Crocin content for luminous skin & mood elevation',
      'Culinary Grade A+ for ceremonial Kashmiri Kahwa & dishes',
      'Sealed in airtight ultraviolet-protected crystal glass',
    ],
    usageInstructions:
      'Infuse 4-6 saffron threads in 2 tablespoons of warm milk or water for 15 minutes before adding to teas, desserts, or dishes.',
  },
  {
    id: 'prod-5',
    title: 'Wild Himalayan Mountain Honey with Shilajit',
    name: 'Wild Himalayan Mountain Honey with Shilajit',
    description: 'Raw unprocessed high-altitude mountain bee honey smoothly infused with pure Himalayan Shilajit extract. A delicious daily longevity tonic for natural immunity and sustained energy.',
    price: 2800,
    originalPrice: 3500,
    discountPercent: 20,
    unit: '250g Glass Jar',
    category: 'Honey',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=85',
    ],
    origin: 'Himalayan Forest Flora',
    tags: ['100% Raw Unpasteurized'],
    stock: 11,
    batchNumber: 'Batch #HNY-770',
    inStock: true,
    rating: 4.9,
    reviewsCount: 142,
    harvestAltitude: '8,000 ft (Wild pine forest)',
    labTested: true,
    benefits: [
      'Wild forest blossom nectar infused with active fulvic acid',
      'Naturally unpasteurized, retaining raw enzymes and pollen',
      'Smooth, sweet, slightly malty herbal taste',
      'Immune defense booster for all family members',
    ],
    usageInstructions:
      'Enjoy 1 tablespoon straight off the spoon or stirred into warm (not boiling) tea or breakfast bowls.',
  },
  {
    id: 'prod-6',
    title: 'Himalayan Salajeet Liquid Ionic Drops',
    name: 'Himalayan Salajeet Liquid Ionic Drops',
    description: 'Bioactive sublingual liquid drops loaded with ionic minerals and water-soluble fulvic complexes for rapid cellular uptake, cognitive focus, and immune resilience.',
    price: 3200,
    originalPrice: 4000,
    discountPercent: 20,
    unit: '30ml Dropper Bottle',
    category: 'Tonics',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=1200&q=85',
    ],
    origin: 'Karakoram Mountain Range',
    tags: ['100% Bioavailable Ionic'],
    stock: 9,
    batchNumber: 'Batch #DRP-314',
    inStock: true,
    rating: 4.8,
    reviewsCount: 88,
    harvestAltitude: '14,000 ft',
    labTested: true,
    benefits: [
      'Micro-filtered ionic mineral solution for maximum bioavailability',
      'Calibrated glass dropper for precise micro-dosing',
      'Instant dissolution in water, coffee, or post-workout shakes',
      'Packed with natural electrolytes and fulvic humic fraction',
    ],
    usageInstructions:
      'Take 5-10 drops in a glass of pure spring water or fruit juice every morning. Shake gently before each use.',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ASH-84102',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    customerName: 'Ahmed Khan',
    phone: '+92 300 8594120',
    email: 'ahmed.khan@gmail.com',
    address: 'House 14, Street 22, Sector F-7/2, Islamabad',
    notes: 'Please call before delivery. Cash on Delivery.',
    paymentMethod: 'Cash on Delivery',
    shippingFee: 0,
    items: [
      {
        id: 'prod-1',
        title: 'Pure Himalayan Shilajit Resin (Gold Grade)',
        price: 3500,
        quantity: 1,
      },
    ],
    totalPrice: 3500,
    status: 'Confirmed',
    syncedToGoogleSheet: true,
  },
  {
    id: 'ASH-84091',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    customerName: 'Sarah Malik',
    phone: '+92 321 4489312',
    email: 'sarah.m@yahoo.com',
    address: 'B-48, Sector Y, Phase 3, DHA, Lahore',
    notes: 'Gate code 4491. COD payment.',
    paymentMethod: 'Cash on Delivery',
    shippingFee: 0,
    items: [
      {
        id: 'prod-2',
        title: 'Organic Himalayan Ashwagandha Root Powder',
        price: 2200,
        quantity: 1,
      },
      {
        id: 'prod-5',
        title: 'Wild Himalayan Mountain Honey with Shilajit',
        price: 2800,
        quantity: 1,
      },
    ],
    totalPrice: 5000,
    status: 'Dispatched',
    syncedToGoogleSheet: true,
  },
];

const PRODUCTS_STORAGE_KEY = 'ironash_herbal_products_v2';
const ORDERS_STORAGE_KEY = 'ironash_herbal_orders_v2';
const GOOGLE_SCRIPT_URL_KEY = 'ironash_google_script_url_v1';
export const ADMIN_PASSWORD_KEY = 'ironash_admin_password_v1';
export const DEFAULT_ADMIN_PASSWORD = 'ironash2025';

export function getStoredAdminPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSWORD;
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

export function saveStoredAdminPassword(password: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PASSWORD_KEY, password.trim());
  window.dispatchEvent(new Event('ironash_password_updated'));
}

export function verifyAdminPassword(input: string): boolean {
  const current = getStoredAdminPassword();
  if (input === current) return true;
  // Also support admin/admin123 if custom password hasn't been changed
  if (current === DEFAULT_ADMIN_PASSWORD && (input === 'admin' || input === 'admin123')) {
    return true;
  }
  return false;
}

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    // Check if previous data was timber rather than herbal
    if (parsed.some((p: Product) => p.title && p.title.toLowerCase().includes('timber') || p.title.toLowerCase().includes('cladding'))) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return parsed.map((p: Product) => {
      const initMatch = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
      const baseImages = p.images && p.images.length > 0
        ? p.images
        : initMatch?.images || [
            p.imageUrl,
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=1200&q=85',
          ];

      return {
        rating: initMatch?.rating || 4.9,
        reviewsCount: initMatch?.reviewsCount || 85,
        benefits: initMatch?.benefits || [
          'Authentic pure Himalayan sourced',
          'Lab tested for optimal purity & potency',
          '100% natural, free from artificial additives',
          'Preserved in glass for maximum freshness',
        ],
        usageInstructions:
          initMatch?.usageInstructions ||
          'Use as recommended daily with warm water or milk. Store in a cool, dry place away from heat.',
        harvestAltitude: initMatch?.harvestAltitude || 'High Karakoram Range',
        labTested: true,
        ...p,
        originalPrice: p.originalPrice || initMatch?.originalPrice,
        discountPercent: p.discountPercent || initMatch?.discountPercent,
        batchNumber: p.batchNumber || initMatch?.batchNumber,
        stock: typeof p.stock === 'number' && p.stock !== 45 && p.stock !== 60 ? p.stock : (initMatch?.stock ?? 12),
        images: baseImages,
      };
    });
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('ironash_products_updated'));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

/**
 * Deduct ordered quantity from live stock in real time so stock counts behave authentically
 */
export function deductProductStock(orderItems: { id: string; quantity: number }[]): void {
  if (typeof window === 'undefined') return;
  try {
    const products = getStoredProducts();
    const updated = products.map((prod) => {
      const match = orderItems.find((item) => item.id === prod.id);
      if (match && typeof prod.stock === 'number') {
        const remaining = Math.max(0, prod.stock - match.quantity);
        return {
          ...prod,
          stock: remaining,
          inStock: remaining > 0,
        };
      }
      return prod;
    });
    saveStoredProducts(updated);
  } catch (err) {
    console.warn('Failed to deduct product stock', err);
  }
}


export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    // Check if previous orders were timber
    if (parsed.some((o: Order) => o.items && o.items.some(i => i.title && (i.title.includes('Cladding') || i.title.includes('Decking'))))) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return normalizeOrdersList(parsed);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('ironash_orders_updated'));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
}

export function getStoredGoogleScriptUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GOOGLE_SCRIPT_URL_KEY) || '';
}

export function saveStoredGoogleScriptUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOOGLE_SCRIPT_URL_KEY, url.trim());
}

