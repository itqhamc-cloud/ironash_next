'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/timber';
import { ShoppingCart, Check, Sparkles, MapPin, Star, Eye, Tag } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

export const ProductGrid = () => {
  const { products, handleAddToCart, handleSelectProduct, cartItems, setIsCartOpen } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter(
          (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const handleAddOrViewCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const isInCart = cartItems.some(item => item.product.id === product.id);
    if (isInCart) {
      setIsCartOpen(true);
    } else {
      handleAddToCart(product);
      setAddedProductId(product.id);
      setTimeout(() => {
        setAddedProductId((current) => (current === product.id ? null : current));
      }, 1200);
    }
  };

  const handleImageLoaded = (productId: string) => {
    setLoadedImages((prev) => ({ ...prev, [productId]: true }));
  };

  return (
    <section id="products" className="py-20 sm:py-28 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 scroll-mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-stone-200 dark:border-stone-800 pb-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
              100% Authentic Himalayan Source
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-950 dark:text-white mt-2 font-serif">
              Our Premium Products
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mt-3 text-base sm:text-lg">
              Carefully harvested from the Himalayas, lab-tested for purity and potency. Click any product to explore 4-view gallery, zoom in, and select quantity.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                id={`filter-${cat.toLowerCase()}`}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-sm dark:bg-emerald-700'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-850'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Grid with Layout-First Loading */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <p className="text-stone-500 dark:text-stone-400 font-medium">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const isJustAdded = addedProductId === product.id;
              const isImgReady = !!loadedImages[product.id];
              const discountPercent = (product.originalPrice && product.originalPrice > product.price)
                ? Math.round((((product.originalPrice - product.price) / product.originalPrice) * 100))
                : (product.discountPercent || 0);
              const hasDiscount = discountPercent > 0;
              const effectiveOriginalPrice = product.originalPrice && product.originalPrice > product.price
                ? product.originalPrice
                : (hasDiscount ? Math.round(product.price / (1 - discountPercent / 100)) : undefined);
              const savingsAmount = effectiveOriginalPrice ? effectiveOriginalPrice - product.price : 0;
              const isLowStock = typeof product.stock === 'number' && product.stock <= 10;

              return (
                <article
                  key={product.id}
                  id={`product-card-${product.id}`}
                  onClick={() => handleSelectProduct(product)}
                  className="group flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-700/60 dark:hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl cursor-pointer"
                >
                  {/* Product Image Container with Skeleton Placeholder */}
                  <div className="relative aspect-[4/3] w-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    {/* Animated Shimmer Skeleton for progressive load */}
                    {!isImgReady && (
                      <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 animate-pulse flex items-center justify-center">
                        <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                          Loading preview...
                        </span>
                      </div>
                    )}

                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onLoad={() => handleImageLoaded(product.id)}
                      className={`object-cover object-center group-hover:scale-105 transition-all duration-500 ${
                        isImgReady ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Category & Purity Overlay */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                      <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-emerald-900/90 backdrop-blur-md text-emerald-100 rounded shadow-xs">
                        {product.category || 'Herbal'}
                      </span>
                      {product.tags && product.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-amber-500/95 backdrop-blur-md text-stone-950 rounded shadow-xs">
                          <Sparkles className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stock status & Discount Badges on Top Right */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
                      {hasDiscount && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-red-600/95 text-white rounded backdrop-blur-md shadow-md animate-pulse">
                          <Tag className="w-3 h-3" />
                          {discountPercent}% OFF
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded backdrop-blur-md shadow-xs ${
                          isLowStock
                            ? 'bg-amber-500/95 text-stone-950'
                            : 'bg-emerald-700/90 text-white'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isLowStock ? 'bg-amber-900 animate-ping' : 'bg-emerald-300 animate-ping'
                          }`}
                        />
                        {isLowStock
                          ? `Only ${product.stock} Left`
                          : product.stock
                          ? `${product.stock} In Stock`
                          : 'In Stock'}
                      </span>
                    </div>

                    {/* Hover Quick View Button */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Quick View
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-grow p-6">
                    {/* Origin / Harvest Spec & Star Rating */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {product.origin ? (
                        <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{product.origin}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-stone-900 dark:text-white">
                          {product.rating || 4.9}
                        </span>
                        <span className="text-stone-400 text-[11px]">
                          ({product.reviewsCount || 100})
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors font-serif">
                      {product.title}
                    </h3>

                    {/* Authentic Batch Tracking */}
                    {product.batchNumber && (
                      <p className="mt-1 text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400/80 font-mono">
                        {product.batchNumber}
                      </p>
                    )}

                    <p className="text-stone-600 dark:text-stone-400 text-sm mt-2 leading-relaxed line-clamp-3 flex-grow">
                      {product.description}
                    </p>

                    {/* Bottom Pricing & Add to Cart Section */}
                    <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 flex items-end justify-between gap-4">
                      <div>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-wider block">
                          Price (COD)
                        </span>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-2xl font-black text-stone-900 dark:text-white">
                            PKR {Number(product.price).toLocaleString()}
                          </span>
                          {hasDiscount && effectiveOriginalPrice && (
                            <span className="text-xs sm:text-sm font-semibold text-stone-400 dark:text-stone-500 line-through">
                              PKR {Number(effectiveOriginalPrice).toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                            {product.unit ? `/ ${product.unit}` : ''}
                          </span>
                        </div>
                        {hasDiscount && (
                          <span className="block mt-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            Save PKR {savingsAmount.toLocaleString()} ({discountPercent}% off)
                          </span>
                        )}
                      </div>

                      {(() => {
                        const isInCart = cartItems.some(item => item.product.id === product.id);
                        return (
                          <button
                            onClick={(e) => handleAddOrViewCart(e, product)}
                            id={`add-to-cart-${product.id}`}
                            aria-label={isInCart ? `View Cart` : `Add ${product.title} to Cart`}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs ${
                              isJustAdded || isInCart
                                ? 'bg-emerald-800 dark:bg-emerald-700 text-white scale-95'
                                : 'bg-stone-900 hover:bg-emerald-800 dark:bg-stone-800 dark:hover:bg-emerald-700 text-white active:scale-95'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Added!</span>
                              </>
                            ) : isInCart ? (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                <span>View Cart</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
