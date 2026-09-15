import { Order, OrderItem } from '@/types/timber';

/**
 * Safely normalizes any raw order object from localStorage, Google Sheets,
 * or Server Storage to prevent any runtime client-side exceptions.
 */
export function normalizeOrder(raw: any, fallbackIndex = 0): Order {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `ASH-GEN-${fallbackIndex + 1}`,
      createdAt: new Date().toISOString(),
      customerName: 'Customer',
      phone: 'N/A',
      email: '',
      address: 'Delivery address',
      notes: '',
      paymentMethod: 'Cash on Delivery',
      shippingFee: 0,
      items: [
        {
          id: 'item-1',
          title: 'Himalayan Herbal Product',
          price: 0,
          quantity: 1,
        },
      ],
      totalPrice: 0,
      status: 'Pending',
      syncedToGoogleSheet: false,
    };
  }

  // ID resolution
  const id =
    (typeof raw.id === 'string' && raw.id.trim()) ||
    (typeof raw.orderId === 'string' && raw.orderId.trim()) ||
    (typeof raw.ID === 'string' && raw.ID.trim()) ||
    `ASH-${Math.floor(10000 + Math.random() * 90000)}`;

  // Customer Name resolution
  const customerName =
    (typeof raw.customerName === 'string' && raw.customerName.trim()) ||
    (typeof raw.fullName === 'string' && raw.fullName.trim()) ||
    (typeof raw.name === 'string' && raw.name.trim()) ||
    'Valued Customer';

  // Phone resolution
  const phone =
    (typeof raw.phone === 'string' && raw.phone.trim()) ||
    (typeof raw.phoneNumber === 'string' && raw.phoneNumber.trim()) ||
    (typeof raw.contact === 'string' && raw.contact.trim()) ||
    'N/A';

  // Email resolution
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';

  // Address resolution
  const address =
    (typeof raw.address === 'string' && raw.address.trim()) ||
    (typeof raw.deliveryAddress === 'string' && raw.deliveryAddress.trim()) ||
    'Address not specified';

  // Notes resolution
  const notes = typeof raw.notes === 'string' ? raw.notes.trim() : '';

  // CreatedAt resolution
  let createdAt = new Date().toISOString();
  if (raw.createdAt && typeof raw.createdAt === 'string') {
    const d = new Date(raw.createdAt);
    if (!isNaN(d.getTime())) createdAt = d.toISOString();
  } else if (raw.timestamp && typeof raw.timestamp === 'string') {
    const d = new Date(raw.timestamp);
    if (!isNaN(d.getTime())) createdAt = d.toISOString();
  }

  // Total price resolution
  let totalPrice = 0;
  if (typeof raw.totalPrice === 'number' && !isNaN(raw.totalPrice)) {
    totalPrice = raw.totalPrice;
  } else if (typeof raw.totalPrice === 'string') {
    const clean = raw.totalPrice.replace(/[^0-9.]/g, '');
    totalPrice = parseFloat(clean) || 0;
  } else if (typeof raw.amount === 'number') {
    totalPrice = raw.amount;
  }

  // Items resolution
  let items: OrderItem[] = [];
  if (Array.isArray(raw.items) && raw.items.length > 0) {
    items = raw.items.map((it: any, i: number) => ({
      id: (it && typeof it.id === 'string' && it.id) || `item-${i}`,
      title:
        (it && typeof it.title === 'string' && it.title) ||
        (it && typeof it.name === 'string' && it.name) ||
        'Himalayan Product',
      price: Number(it?.price) || 0,
      quantity: Number(it?.quantity) || 1,
    }));
  } else if (typeof raw.itemsSummary === 'string' && raw.itemsSummary.trim()) {
    items = [
      {
        id: `item-sum-${fallbackIndex}`,
        title: raw.itemsSummary.trim(),
        price: totalPrice,
        quantity: 1,
      },
    ];
  } else {
    items = [
      {
        id: `item-${fallbackIndex}`,
        title: 'Himalayan Shilajit Resin',
        price: totalPrice,
        quantity: 1,
      },
    ];
  }

  // Status resolution
  let status: Order['status'] = 'Pending';
  const rawStatus = typeof raw.status === 'string' ? raw.status.toLowerCase() : '';
  if (rawStatus.includes('deliver')) {
    status = 'Delivered';
  } else if (rawStatus.includes('dispatch') || rawStatus.includes('transit')) {
    status = 'Dispatched';
  } else if (rawStatus.includes('confirm')) {
    status = 'Confirmed';
  } else {
    status = 'Pending';
  }

  return {
    id,
    createdAt,
    customerName,
    phone,
    email,
    address,
    notes,
    paymentMethod: 'Cash on Delivery',
    shippingFee: Number(raw.shippingFee) || 0,
    items,
    totalPrice,
    status,
    syncedToGoogleSheet: Boolean(raw.syncedToGoogleSheet),
  };
}

export function normalizeOrdersList(rawList: any): Order[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item, idx) => normalizeOrder(item, idx));
}
