'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Check,
  ShieldCheck,
  Sparkles,
  MapPin,
  Truck,
  RotateCcw,
  Star,
  Plus,
  Minus,
  MessageCircle,
  Award,
  CheckCircle2,
  Maximize2,
  Tag,
} from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';

export const ProductDetailModal = () => {
  const {
    selectedProduct: product,
    isDetailModalOpen: isOpen,
    setIsDetailModalOpen,
    handleAddToCart: onAddToCart,
    handleBuyNow: onBuyNow,
  } = useCart();
  
  const onClose = useCallback(() => setIsDetailModalOpen(false), [setIsDetailModalOpen]);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'benefits' | 'usage' | 'purity'>('benefits');

  // Zoom pan coordinates
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mobile Touch Swipe States & Refs for Quick View Gallery
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);
  const touchCurrentYRef = useRef<number | null>(null);
  const isSwipingRef = useRef<boolean>(false);
  const [touchTranslateX, setTouchTranslateX] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Lightbox Mobile Touch Refs
  const lightboxTouchStartXRef = useRef<number | null>(null);
  const lightboxTouchStartYRef = useRef<number | null>(null);
  const lightboxTouchCurrentXRef = useRef<number | null>(null);
  const lightboxTouchCurrentYRef = useRef<number | null>(null);

  const { cartItems, setIsCartOpen } = useCart();
  const isInCart = product ? cartItems.some(item => item.product.id === product.id) : false;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal or zoom lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomOpen) {
          setIsZoomOpen(false);
          setZoomLevel(1);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isZoomOpen, onClose]);

  if (!isOpen || !product) return null;

  // Calculate discount percentage and original price
  const discountPercent = (product.originalPrice && product.originalPrice > product.price)
    ? Math.round((((product.originalPrice - product.price) / product.originalPrice) * 100))
    : (product.discountPercent || 0);
  const hasDiscount = discountPercent > 0;
  const effectiveOriginalPrice = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice
    : (hasDiscount ? Math.round(product.price / (1 - discountPercent / 100)) : undefined);
  const savingsAmount = effectiveOriginalPrice ? effectiveOriginalPrice - product.price : 0;

  // Build 4 guaranteed gallery images
  const galleryImages: string[] =
    product.images && product.images.length >= 4
      ? product.images.slice(0, 4)
      : [
          product.imageUrl,
          product.images?.[1] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
          product.images?.[2] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
          product.images?.[3] || 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=1200&q=85',
        ];

  const currentImage = galleryImages[selectedImageIndex] || product.imageUrl;

  const handlePrevImage = (e?: React.MouseEvent | React.TouchEvent | React.SyntheticEvent) => {
    e?.stopPropagation();
    setSlideDirection('right');
    setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    setIsImageLoaded(false);
  };

  const handleNextImage = (e?: React.MouseEvent | React.TouchEvent | React.SyntheticEvent) => {
    e?.stopPropagation();
    setSlideDirection('left');
    setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    setIsImageLoaded(false);
  };

  const handleSelectImageIndex = (idx: number) => {
    if (idx !== selectedImageIndex) {
      setSlideDirection(idx > selectedImageIndex ? 'left' : 'right');
      setSelectedImageIndex(idx);
      setIsImageLoaded(false);
    }
  };

  // Mobile Touch Swipe Handlers for Quick View Gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchCurrentXRef.current = e.touches[0].clientX;
    touchCurrentYRef.current = e.touches[0].clientY;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    touchCurrentXRef.current = currentX;
    touchCurrentYRef.current = currentY;

    const diffX = currentX - touchStartXRef.current;
    const diffY = currentY - touchStartYRef.current;

    // Detect if movement is primarily horizontal to allow vertical page scrolling
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
      isSwipingRef.current = true;
      // Provide smooth dampened drag feedback up to +/- 45px
      const dampened = Math.sign(diffX) * Math.min(Math.abs(diffX) * 0.35, 45);
      setTouchTranslateX(dampened);
    }
  };

  const handleTouchEnd = () => {
    if (
      touchStartXRef.current !== null &&
      touchCurrentXRef.current !== null &&
      isSwipingRef.current
    ) {
      const diffX = touchCurrentXRef.current - touchStartXRef.current;
      const swipeThreshold = 35; // minimum px to trigger image slide

      if (diffX < -swipeThreshold) {
        // Swiped left -> show next image
        handleNextImage();
      } else if (diffX > swipeThreshold) {
        // Swiped right -> show previous image
        handlePrevImage();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchCurrentXRef.current = null;
    touchCurrentYRef.current = null;
    isSwipingRef.current = false;
    setTouchTranslateX(0);
  };

  // Lightbox touch handlers for mobile zoom & swipe
  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      lightboxTouchStartXRef.current = touch.clientX;
      lightboxTouchStartYRef.current = touch.clientY;
      lightboxTouchCurrentXRef.current = touch.clientX;
      lightboxTouchCurrentYRef.current = touch.clientY;

      if (zoomLevel > 1) {
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX - panPosition.x, y: touch.clientY - panPosition.y };
      }
    }
  };

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      lightboxTouchCurrentXRef.current = touch.clientX;
      lightboxTouchCurrentYRef.current = touch.clientY;

      if (zoomLevel > 1 && isDragging) {
        setPanPosition({
          x: touch.clientX - dragStartRef.current.x,
          y: touch.clientY - dragStartRef.current.y,
        });
      }
    }
  };

  const handleLightboxTouchEnd = () => {
    if (zoomLevel <= 1 && lightboxTouchStartXRef.current !== null && lightboxTouchCurrentXRef.current !== null) {
      const diffX = lightboxTouchCurrentXRef.current - lightboxTouchStartXRef.current;
      const diffY = (lightboxTouchCurrentYRef.current ?? 0) - (lightboxTouchStartYRef.current ?? 0);

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) >= 35) {
        if (diffX < 0) {
          handleNextImage();
        } else {
          handlePrevImage();
        }
      }
    }
    setIsDragging(false);
    lightboxTouchStartXRef.current = null;
    lightboxTouchStartYRef.current = null;
    lightboxTouchCurrentXRef.current = null;
    lightboxTouchCurrentYRef.current = null;
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product.stock && next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isInCart) {
      setIsDetailModalOpen(false);
      setIsCartOpen(true);
    } else {
      onAddToCart(product, quantity);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    }
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
  };

  const handleOpenZoom = () => {
    setIsZoomOpen(true);
    setZoomLevel(1.5);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panPosition.x, y: e.clientY - panPosition.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const subtotal = Number(product.price) * quantity;

  return (
    <>
      {/* Primary Product Detail Modal Backdrop */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all duration-200">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          className="relative bg-white dark:bg-stone-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar / Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Himalayan Certified Pure Botanicals</span>
            </div>

            <button
              onClick={onClose}
              id="close-product-detail-modal"
              aria-label="Close modal"
              className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content - Two Column Layout */}
          <div className="overflow-y-auto p-4 sm:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 4-Image Gallery with Zoom Button */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Main Image Container with Mobile Touch Swipe */}
              <div
                className="relative aspect-[4/3] w-full bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-xs group select-none touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                {/* Progressive Loading Skeleton Placeholder */}
                {!isImageLoaded && (
                  <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse flex items-center justify-center">
                    <span className="text-xs text-stone-400 font-medium">Loading high-res image...</span>
                  </div>
                )}

                {/* Animated Image Wrapper responding to touch swipe with transition */}
                <div
                  key={selectedImageIndex}
                  className={`w-full h-full relative will-change-transform ${
                    slideDirection === 'left'
                      ? 'animate-in fade-in slide-in-from-right-10 duration-300'
                      : slideDirection === 'right'
                      ? 'animate-in fade-in slide-in-from-left-10 duration-300'
                      : 'animate-in fade-in duration-200'
                  }`}
                  style={{
                    transform: touchTranslateX ? `translateX(${touchTranslateX}px)` : undefined,
                    transition: touchTranslateX ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <Image
                    src={currentImage}
                    alt={`${product.title} - View ${selectedImageIndex + 1}`}
                    onLoad={() => setIsImageLoaded(true)}
                    fill
                    referrerPolicy="no-referrer"
                    className={`object-cover object-center transition-all duration-300 pointer-events-none ${
                      isImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                {/* Zoom Button Overlay */}
                <button
                  onClick={handleOpenZoom}
                  id="open-image-zoom-btn"
                  aria-label="Zoom in product image"
                  className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950/80 hover:bg-emerald-900/90 text-white text-xs font-semibold backdrop-blur-md shadow-md transition-all duration-150 cursor-pointer group-hover:scale-105 active:scale-95"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zoom</span>
                </button>

                {/* Category, Discount & Purity Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none z-10">
                  {hasDiscount && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md shadow-md border border-white/20 animate-pulse">
                      <Tag className="w-3.5 h-3.5 fill-white/20" />
                      {discountPercent}% OFF
                    </span>
                  )}
                  <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-900/90 backdrop-blur-md text-emerald-100 rounded shadow-xs">
                    {product.category}
                  </span>
                  {product.tags && product.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-amber-500/95 backdrop-blur-md text-stone-950 rounded shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Gallery Navigation Arrows on Main Image (Touch & Click) */}
                <button
                  onClick={handlePrevImage}
                  aria-label="Previous gallery image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  aria-label="Next gallery image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Mobile Pagination Dot Indicators */}
                <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md z-10">
                  {galleryImages.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectImageIndex(dotIdx);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        selectedImageIndex === dotIdx ? 'w-4 bg-emerald-400' : 'w-1.5 bg-white/60'
                      }`}
                      aria-label={`Go to image ${dotIdx + 1}`}
                    />
                  ))}
                </div>

                {/* Image counter indicator */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white z-10">
                  {selectedImageIndex + 1} / {galleryImages.length}
                </div>
              </div>

              {/* 4 Thumbnails Gallery Grid */}
              <div className="grid grid-cols-4 gap-2.5">
                {galleryImages.map((imgUrl, idx) => {
                  const isSelected = selectedImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectImageIndex(idx)}
                      id={`thumbnail-${idx}`}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-stone-100 dark:bg-stone-800 ${
                        isSelected
                          ? 'border-emerald-700 dark:border-emerald-500 ring-2 ring-emerald-600/30 scale-102 shadow-sm'
                          : 'border-stone-200 dark:border-stone-700 opacity-70 hover:opacity-100 hover:border-stone-400'
                      }`}
                      aria-label={`View image ${idx + 1} of 4`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        referrerPolicy="no-referrer"
                        className="object-cover object-center"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Gallery helper hint */}
              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-1">
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Click Zoom for high-definition inspect</span>
                  <span className="sm:hidden">Swipe image to view angles</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="sm:hidden text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Swipeable
                  </span>
                  <span>4 Multi-Angle Views</span>
                </span>
              </div>
            </div>

            {/* Right Column: Product Details & Purchase Form */}
            <div className="lg:col-span-6 flex flex-col">
              {/* Origin & Rating Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                {product.origin && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <MapPin className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                    <span>Harvest Origin: {product.origin}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-stone-900 dark:text-white">
                    {product.rating || 4.9}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400">
                    ({product.reviewsCount || 120} reviews)
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2
                id="modal-product-title"
                className="text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-stone-100 font-serif tracking-tight leading-snug"
              >
                {product.title}
              </h2>

              {/* Price & Unit Box */}
              {(() => {
                const isLowStock = typeof product.stock === 'number' && product.stock <= 10;

                return (
                  <>
                    <div className="mt-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block">
                            Cash on Delivery Price
                          </span>
                          {hasDiscount && (
                            <span className="px-2 py-0.5 text-[11px] font-black uppercase tracking-wider bg-red-600 text-white rounded shadow-xs animate-pulse">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                          <span className="text-3xl font-black text-emerald-900 dark:text-emerald-400">
                            PKR {Number(product.price).toLocaleString()}
                          </span>
                          {hasDiscount && effectiveOriginalPrice && (
                            <span className="text-sm sm:text-base font-semibold text-stone-400 dark:text-stone-500 line-through">
                              PKR {Number(effectiveOriginalPrice).toLocaleString()}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">
                            {product.unit ? `/ ${product.unit}` : ''}
                          </span>
                        </div>
                        {hasDiscount && (
                          <span className="block mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            Direct Order Saving: PKR {savingsAmount.toLocaleString()} ({discountPercent}% promotional reduction)
                          </span>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-2.5 py-1 rounded">
                          <Truck className="w-3.5 h-3.5" />
                          Free Nationwide Courier
                        </span>
                        <span className="block text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                          Inspect & Pay upon arrival
                        </span>
                      </div>
                    </div>

                    {/* Stock Status & Authentic Batch Details */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold ${
                          isLowStock
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isLowStock ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-ping'
                          }`}
                        />
                        {isLowStock
                          ? `Limited Harvest: Only ${product.stock} units left in current batch`
                          : `In Stock: ${product.stock ?? 18} units verified & ready for same-day dispatch`}
                      </span>
                      <div className="flex items-center gap-2">
                        {product.batchNumber && (
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 font-semibold">
                            {product.batchNumber}
                          </span>
                        )}
                        {product.harvestAltitude && (
                          <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                            Altitude: {product.harvestAltitude}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Description */}
              <p className="mt-4 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {product.description}
              </p>

              {/* Details Tabs (Benefits / Usage / Purity) */}
              <div className="mt-5 border-t border-stone-200 dark:border-stone-700 pt-4">
                <div className="flex gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <button
                    onClick={() => setActiveTab('benefits')}
                    className={`text-xs font-bold uppercase tracking-wider pb-1 px-1 transition-colors cursor-pointer ${
                      activeTab === 'benefits'
                        ? 'border-b-2 border-emerald-700 text-emerald-800 dark:text-emerald-400'
                        : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    Key Benefits
                  </button>
                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`text-xs font-bold uppercase tracking-wider pb-1 px-1 transition-colors cursor-pointer ${
                      activeTab === 'usage'
                        ? 'border-b-2 border-emerald-700 text-emerald-800 dark:text-emerald-400'
                        : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    Usage Directions
                  </button>
                  <button
                    onClick={() => setActiveTab('purity')}
                    className={`text-xs font-bold uppercase tracking-wider pb-1 px-1 transition-colors cursor-pointer ${
                      activeTab === 'purity'
                        ? 'border-b-2 border-emerald-700 text-emerald-800 dark:text-emerald-400'
                        : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    Laboratory Certificate
                  </button>
                </div>

                <div className="py-3 text-xs leading-relaxed text-stone-700 dark:text-stone-300 min-h-[85px]">
                  {activeTab === 'benefits' && (
                    <ul className="space-y-1.5">
                      {(product.benefits || [
                        'Supports cellular ATP energy & steady daily stamina',
                        'Fulvic acid enhances absorption of 85+ natural minerals',
                        'Cognitive mental focus and memory support',
                        'Supports natural recovery and physical endurance',
                      ]).map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeTab === 'usage' && (
                    <p>
                      {product.usageInstructions ||
                        'Dissolve a pea-sized portion (300-500mg) in warm water, herbal tea, or milk every morning. Best taken on an empty stomach for maximum cellular uptake.'}
                    </p>
                  )}

                  {activeTab === 'purity' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold">
                        <Award className="w-4 h-4" />
                        <span>ISO & PCSIR Heavy Metals Laboratory Certified</span>
                      </div>
                      <p>
                        Every batch of IronAsh Shilajit and herbs undergoes rigorous testing for microbiological purity and zero heavy metals (Lead, Mercury, Cadmium, Arsenic). Full Certificate of Analysis (COA) included in every package.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Selection Section */}
              <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label
                      htmlFor="product-quantity-selector"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1"
                    >
                      Quantity (Number of Units)
                    </label>
                    <div className="inline-flex items-center rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 p-1">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        id="decrease-quantity-btn"
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 shadow-xs hover:bg-stone-200 dark:hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        id="product-quantity-selector"
                        min="1"
                        max={product.stock || 50}
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1) {
                            setQuantity(product.stock ? Math.min(val, product.stock) : val);
                          }
                        }}
                        className="w-14 text-center text-sm font-bold text-stone-900 dark:text-white bg-transparent focus:outline-none"
                      />

                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={product.stock ? quantity >= product.stock : false}
                        id="increase-quantity-btn"
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 shadow-xs hover:bg-stone-200 dark:hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal Calculation */}
                  <div className="text-right sm:text-right">
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold block">
                      Total for {quantity} {quantity === 1 ? 'unit' : 'units'}
                    </span>
                    <span className="text-xl font-black text-stone-900 dark:text-white">
                      PKR {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  id="modal-add-to-cart-btn"
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    addedFeedback || isInCart
                      ? 'bg-emerald-700 text-white scale-98'
                      : 'bg-emerald-800 hover:bg-emerald-700 text-white active:scale-98'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added {quantity} to Cart!</span>
                    </>
                  ) : isInCart ? (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>View Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add {quantity} to Cart • PKR {subtotal.toLocaleString()}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  id="modal-buy-now-btn"
                  className="py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide bg-stone-900 hover:bg-black text-white dark:bg-stone-800 dark:hover:bg-stone-700 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Buy Now (COD)</span>
                </button>
              </div>

              {/* Assurance Guarantee Footer */}
              <div className="mt-5 grid grid-cols-3 gap-2 pt-4 border-t border-stone-200 dark:border-stone-800 text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">
                    100% Authentic
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">
                    Free Nationwide COD
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">
                    7-Day Purity Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Zoom Lightbox */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none"
          onClick={() => {
            setIsZoomOpen(false);
            setZoomLevel(1);
          }}
        >
          {/* Zoom Lightbox Header Bar */}
          <div
            className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tracking-wide text-stone-300">
                {product.title}
              </span>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Image {selectedImageIndex + 1} of {galleryImages.length}
              </span>
            </div>

            {/* Lightbox Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                aria-label="Zoom out"
                className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-stone-300 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                aria-label="Zoom in"
                className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsZoomOpen(false);
                  setZoomLevel(1);
                }}
                id="close-zoom-lightbox"
                aria-label="Close zoom preview"
                className="p-2 ml-2 rounded-lg bg-stone-800 hover:bg-red-900 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Zoomable Stage */}
          <div
            className="relative max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
            onTouchCancel={handleLightboxTouchEnd}
          >
            <div className="relative w-[78vh] h-[78vh] max-w-full shadow-2xl rounded-lg">
              <Image
                src={currentImage}
                alt="High definition zoom inspection"
                draggable={false}
                fill
                referrerPolicy="no-referrer"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${
                    panPosition.y / zoomLevel
                  }px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
                className="object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Lightbox Navigation Buttons */}
          <button
            onClick={handlePrevImage}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-900/80 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextImage}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-900/80 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Bottom Thumbnail Bar */}
          <div
            className="absolute bottom-4 flex items-center gap-3 bg-stone-900/80 p-2 rounded-xl backdrop-blur-md z-10 border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setPanPosition({ x: 0, y: 0 });
                }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedImageIndex === idx
                    ? 'border-emerald-500 scale-105 ring-2 ring-emerald-400/40'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`View ${idx + 1}`} fill referrerPolicy="no-referrer" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
