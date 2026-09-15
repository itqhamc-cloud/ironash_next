'use client';

import React, { useState } from 'react';
import { Order } from '@/types/timber';
import { CheckCircle2, Copy, Check, Truck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

export const OrderSuccessModal = () => {
  const { successfulOrder: order, setSuccessfulOrder } = useCart();
  const [copied, setCopied] = useState(false);
  
  const onClose = () => setSuccessfulOrder(null);

  if (!order) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Order Confirmed • Cash on Delivery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 mt-1 font-serif">
              Thank You for Your Order!
            </h2>
          </div>

          <p className="text-sm text-stone-600">
            Your pure Himalayan herbal order has been placed. Our fulfillment team will dispatch your parcel via express courier.
          </p>
        </div>

        {/* Order ID Pill Box */}
        <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Reference Order Number
            </span>
            <span className="text-xl font-mono font-black text-stone-900 tracking-wider">
              {order.id}
            </span>
          </div>
          <button
            onClick={handleCopyId}
            id="copy-order-id-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer shadow-xs active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Order Details Breakdown */}
        <div className="mt-5 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200/80">
            <div>
              <span className="text-stone-500 font-medium block">Customer</span>
              <span className="font-bold text-stone-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium block">Contact Number</span>
              <span className="font-bold text-stone-900">{order.phone}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-stone-200">
              <span className="text-stone-500 font-medium block">Delivery Address</span>
              <span className="font-bold text-stone-900">{order.address}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 space-y-1.5">
            <span className="text-stone-500 font-bold uppercase tracking-wider text-[10px] block">
              Items Ordered
            </span>
            <div className="divide-y divide-stone-200">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                  <span className="text-stone-800 font-medium truncate max-w-[240px]">
                    {item.title} <span className="text-stone-500 font-normal">× {item.quantity}</span>
                  </span>
                  <span className="font-bold text-stone-900 font-mono">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold text-sm">
              <span className="text-stone-700 font-serif">Total COD Amount:</span>
              <span className="text-base text-emerald-900 font-black font-mono">
                PKR {order.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Policy */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-emerald-900">
            <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">Payment Method: </span> Cash on Delivery (COD) with 100% Free Shipping. Pay in cash directly to the courier rider upon delivery.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <button
            onClick={onClose}
            id="success-continue-shopping-btn"
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold tracking-wide transition-colors cursor-pointer shadow-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

