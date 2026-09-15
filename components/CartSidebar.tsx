'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CartItem, Order, CheckoutFormData } from '@/types/timber';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { getStoredGoogleScriptUrl, getStoredOrders, saveStoredOrders, deductProductStock } from '@/lib/initial-products';
import { validatePakistaniPhone, formatPakistaniInput } from '@/lib/phone-validation';
import { normalizeOrdersList } from '@/lib/order-utils';
import { useCart } from '@/components/CartProvider';

export const CartSidebar = () => {
  const {
    isCartOpen: isOpen,
    setIsCartOpen,
    cartItems,
    handleUpdateQuantity: onUpdateQuantity,
    handleRemoveItem: onRemoveItem,
    handleClearCart: onClearCart,
    setSuccessfulOrder,
    isCheckoutDirect,
    setIsCheckoutDirect,
  } = useCart();
  
  const onClose = () => {
    setIsCartOpen(false);
    setIsCheckoutDirect(false);
  };

  const [view, setView] = useState<'cart' | 'checkout'>('cart');
  
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isOpen && isCheckoutDirect) {
      timer = setTimeout(() => setView('checkout'), 0);
    } else if (!isOpen) {
      timer = setTimeout(() => setView('cart'), 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, isCheckoutDirect]);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    notes: '',
    paymentMethod: 'Cash on Delivery',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-calculate subtotal, discounts, and shipping
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const regularTotal = cartItems.reduce(
    (acc, item) => acc + (item.product.originalPrice || item.product.price) * item.quantity,
    0
  );
  const totalDiscountSavings = Math.max(0, regularTotal - subtotal);
  // Free Shipping nationwide
  const shippingFee = 0;
  const totalPrice = subtotal + shippingFee;

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name';
    }

    const phoneValidation = validatePakistaniPhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error || 'Only Pakistani mobile numbers are supported (e.g. 0300 1234567)';
    }

    if (!formData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery Address is required';
    } else if (formData.deliveryAddress.trim().length < 6) {
      errors.deliveryAddress = 'Please provide complete house/street and city address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const phoneValidation = validatePakistaniPhone(formData.phone);
    const formattedPhone = phoneValidation.formatted || formData.phone.trim();

    const generatedOrderId = `ASH-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: generatedOrderId,
      createdAt: new Date().toISOString(),
      customerName: formData.fullName.trim(),
      phone: formattedPhone,
      email: formData.email?.trim() || undefined,
      address: formData.deliveryAddress.trim(),
      notes: formData.notes?.trim() || undefined,
      paymentMethod: 'Cash on Delivery',
      shippingFee: 0,
      items: cartItems.map((ci) => ({
        id: ci.product.id,
        title: ci.product.title,
        price: ci.product.price,
        quantity: ci.quantity,
      })),
      totalPrice: Number(totalPrice),
      status: 'Pending',
      syncedToGoogleSheet: false,
    };

    const webAppUrl = getStoredGoogleScriptUrl();

    try {
      const response = await fetch('/api/sheet-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: webAppUrl,
          orderData: {
            id: newOrder.id,
            orderId: newOrder.id,
            customerName: newOrder.customerName,
            fullName: newOrder.customerName,
            name: newOrder.customerName,
            phone: newOrder.phone,
            email: newOrder.email || '',
            deliveryAddress: newOrder.address,
            address: newOrder.address,
            notes: newOrder.notes || '',
            totalPrice: newOrder.totalPrice,
            displayPrice: `PKR ${newOrder.totalPrice.toLocaleString()}`,
            paymentMethod: 'Cash on Delivery',
            items: newOrder.items,
            status: 'Pending COD',
          },
        }),
      });

      const resJson = await response.json();
      if (resJson.forwardedToSheet) {
        newOrder.syncedToGoogleSheet = true;
      }
    } catch (err) {
      console.warn('Google Sheet forward warning, saving order locally:', err);
    }

    // Persist order locally with normalization
    const existingOrders = normalizeOrdersList(getStoredOrders());
    const updatedOrders = [newOrder, ...existingOrders];
    saveStoredOrders(updatedOrders);

    // Deduct stock in real time so inventory is authentic
    deductProductStock(cartItems.map((ci) => ({ id: ci.product.id, quantity: ci.quantity })));

    setIsSubmitting(false);
    onClearCart();
    setView('cart');
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      deliveryAddress: '',
      notes: '',
      paymentMethod: 'Cash on Delivery',
    });
    setFormErrors({});
    onClose();
    setSuccessfulOrder(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-emerald-800" />
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                {view === 'cart' ? 'Your Wellness Cart' : 'Checkout & Delivery Details'}
              </h2>
            </div>
            <button
              onClick={onClose}
              id="close-cart-btn"
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900 font-serif">Your cart is empty</h3>
                  <p className="text-sm text-stone-500 max-w-xs">
                    Explore our pure Himalayan Shilajit resins, herbal powders, and wellness supplements.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  Explore Products
                </button>
              </div>
            ) : view === 'cart' ? (
              /* CART VIEW: Items */
              <div className="space-y-4">
                <div className="divide-y divide-stone-100">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="py-4 flex gap-4 items-start first:pt-0">
                      <div className="relative w-20 h-20 shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          referrerPolicy="no-referrer"
                          className="object-cover rounded-lg bg-stone-100 border border-stone-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-stone-900 leading-snug line-clamp-2 font-serif">
                            {product.title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(product.id)}
                            id={`remove-item-${product.id}`}
                            className="p-1 text-stone-400 hover:text-red-600 transition-colors ml-2 cursor-pointer"
                            aria-label={`Remove ${product.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-baseline gap-1.5 flex-wrap text-xs mt-0.5">
                          <span className="font-bold text-stone-900">
                            PKR {product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-stone-400 line-through text-[11px]">
                              PKR {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          {product.unit && <span className="text-stone-500">/ {product.unit}</span>}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-xs">
                            <button
                              onClick={() => onUpdateQuantity(product.id, -1)}
                              id={`decrement-${product.id}`}
                              className="p-1.5 text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span
                              id={`qty-${product.id}`}
                              className="px-3 py-1 text-xs font-bold text-stone-800 min-w-8 text-center"
                            >
                              {quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(product.id, 1)}
                              id={`increment-${product.id}`}
                              className="p-1.5 text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-stone-900 font-mono">
                            PKR {(product.price * quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty Cart */}
                <div className="pt-2 text-right">
                  <button
                    onClick={onClearCart}
                    className="text-xs text-stone-400 hover:text-red-600 underline cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            ) : (
              /* CHECKOUT VIEW */
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setView('cart')}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 mb-2 cursor-pointer"
                >
                  ← Back to cart items
                </button>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Free Nationwide Express Delivery</span>
                  </div>
                  <p>
                    Shipping is 100% free (PKR 0). Pay securely in cash when your parcel is handed to you by the courier.
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="e.g. Tariq Mehmood"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                      formErrors.fullName
                        ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                        : 'border-stone-300 focus:ring-emerald-700 bg-white'
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                    >
                      Phone / WhatsApp Number *
                    </label>
                    <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                      🇵🇰 Pakistani Numbers Only
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs">
                      <span className="text-base leading-none">🇵🇰</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="0300 1234567 or +92 300 1234567"
                      value={formData.phone}
                      onChange={(e) => {
                        const formatted = formatPakistaniInput(e.target.value);
                        setFormData({ ...formData, phone: formatted });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                      }}
                      className={`w-full pl-9 pr-24 py-2.5 rounded-lg border text-sm font-mono transition-colors focus:outline-none focus:ring-2 ${
                        formErrors.phone
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
                  {formErrors.phone ? (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.phone}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-500 mt-1">
                      Supported: <span className="font-mono text-stone-700">0300 1234567</span> or <span className="font-mono text-stone-700">+92 300 1234567</span> (Jazz, Zong, Warid, Ufone, Telenor, SCOM)
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                  >
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="tariq@gmail.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <label
                    htmlFor="deliveryAddress"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                  >
                    Complete Delivery Address *
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    rows={3}
                    placeholder="House/Plot number, street, sector/colony, and city (e.g. Islamabad, Lahore, Karachi)"
                    value={formData.deliveryAddress}
                    onChange={(e) => {
                      setFormData({ ...formData, deliveryAddress: e.target.value });
                      if (formErrors.deliveryAddress)
                        setFormErrors({ ...formErrors, deliveryAddress: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                      formErrors.deliveryAddress
                        ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                        : 'border-stone-300 focus:ring-emerald-700 bg-white'
                    }`}
                  />
                  {formErrors.deliveryAddress && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.deliveryAddress}
                    </p>
                  )}
                </div>

                {/* Order Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                  >
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    id="notes"
                    name="notes"
                    placeholder="e.g. Call before arrival, leave at reception..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                  >
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50 text-stone-900 font-semibold focus:outline-none"
                  >
                    <option value="Cash on Delivery">Cash on Delivery (Pay upon parcel receipt)</option>
                  </select>
                </div>
              </form>
            )}
          </div>

          {/* Footer with Totals & Action */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              {/* Cost Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-stone-900">PKR {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span>Nationwide Shipping</span>
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                    Free (PKR 0)
                  </span>
                </div>

                {totalDiscountSavings > 0 && (
                  <div className="flex justify-between items-center text-xs font-semibold text-emerald-900 bg-emerald-100/90 border border-emerald-300/80 px-2.5 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      Total Product Discount Savings
                    </span>
                    <span className="font-bold">- PKR {totalDiscountSavings.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-stone-900 font-serif">Total Due (COD)</span>
                  <span className="text-2xl font-black text-stone-900 font-mono">
                    PKR {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {view === 'cart' ? (
                <button
                  type="button"
                  onClick={() => setView('checkout')}
                  id="proceed-to-checkout-btn"
                  className="w-full py-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  id="place-order-btn"
                  className="w-full py-4 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white rounded-lg font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Order (Cash on Delivery)</span>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

